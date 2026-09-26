import os
import re
import json
import logging
from typing import TypedDict, List, Dict, Any, Optional
from pathlib import Path

from app.core.config import settings
from app.services.guardrails import NeMoGuardrails

logger = logging.getLogger(__name__)

# --- Qdrant & Embedder Singletons ---
_EMBEDDER = None
_QDRANT_CLIENT = None
_GROQ_CLIENT = None


def get_embedder():
    global _EMBEDDER
    if _EMBEDDER is None:
        import torch
        from sentence_transformers import SentenceTransformer
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL_NAME} on device: {device.upper()}...")
        _EMBEDDER = SentenceTransformer(settings.EMBEDDING_MODEL_NAME, device=device)
    return _EMBEDDER


def get_qdrant_client():
    global _QDRANT_CLIENT
    if _QDRANT_CLIENT is None:
        from qdrant_client import QdrantClient

        # 1. Try remote Qdrant Cloud
        if settings.QDRANT_URL and "cloud.qdrant.io" in settings.QDRANT_URL:
            try:
                client = QdrantClient(
                    url=settings.QDRANT_URL,
                    port=443,
                    api_key=settings.QDRANT_API_KEY,
                    timeout=10.0,
                )
                # Verify collection presence
                client.get_collection(settings.QDRANT_COLLECTION_NAME)
                _QDRANT_CLIENT = client
                logger.info(f"Connected to Qdrant Cloud at {settings.QDRANT_URL}")
                return _QDRANT_CLIENT
            except Exception as e:
                logger.warning(f"Failed to connect to Qdrant Cloud: {e}. Attempting local fallbacks...")

        # 2. Try configured local paths
        candidates = [
            settings.LOCAL_QDRANT_PATH,
            "../SIH (Ishakti RAG Admin)/backend/data/local_qdrant",
            "data/local_qdrant",
            "backend/data/local_qdrant",
        ]
        for c in candidates:
            if c and Path(c).exists():
                try:
                    client = QdrantClient(path=c)
                    collections = [col.name for col in client.get_collections().collections]
                    if settings.QDRANT_COLLECTION_NAME in collections:
                        _QDRANT_CLIENT = client
                        logger.info(f"Connected to embedded local Qdrant at {c}")
                        return _QDRANT_CLIENT
                except Exception as ex:
                    logger.debug(f"Local Qdrant check at {c} failed: {ex}")

        # 3. Default remote URL
        try:
            client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
            _QDRANT_CLIENT = client
            return _QDRANT_CLIENT
        except Exception as e:
            logger.error(f"All Qdrant connection attempts failed: {e}")
            return None

    return _QDRANT_CLIENT


def get_groq_client():
    global _GROQ_CLIENT
    if _GROQ_CLIENT is None and settings.GROQ_API_KEY:
        try:
            from groq import Groq
            _GROQ_CLIENT = Groq(api_key=settings.GROQ_API_KEY)
        except Exception as e:
            logger.warning(f"Failed to initialize Groq client: {e}")
    return _GROQ_CLIENT


# --- Statutory Mapping & Fallback Knowledge ---
CANONICAL_ACT_URLS = {
    "The Patents Act, 1970": "https://www.ipindia.gov.in/patents.htm",
    "Patents Act 1970": "https://www.ipindia.gov.in/patents.htm",
    "Patents Act 2024": "https://www.ipindia.gov.in/patents.htm",
    "Biological Diversity Act 2002": "http://nbaindia.org/",
    "Biological Diversity Act 2023": "http://nbaindia.org/",
    "Biological Diversity Rules 2024": "http://nbaindia.org/",
    "Drugs and Cosmetics Act, 1940": "https://cdsco.gov.in",
    "Drugs and Cosmetics Rules, 1945": "https://cdsco.gov.in",
    "Trade Marks Act 1999": "https://www.ipindia.gov.in/trade-marks.htm",
    "Designs Act 2000": "https://www.ipindia.gov.in/designs.htm",
    "Patent Cooperation Treaty": "https://www.wipo.int/pct/en/",
    "Madrid Agreement": "https://www.wipo.int/madrid/en/",
    "Hague System": "https://www.wipo.int/hague/en/",
    "Budapest Treaty": "https://www.wipo.int/treaties/en/registration/budapest/",
    "AYUSH Examination Guidelines": "https://www.ipindia.gov.in",
}


# --- Agent State Schema ---
class AgentState(TypedDict):
    query: str
    jurisdiction: str
    language: str
    session_id: str
    intent: Optional[str]
    detected_language: Optional[str]
    context: Optional[Dict[str, Any]]
    session_metadata: Optional[Dict[str, Any]]
    decomposed_queries: List[str]
    retrieved_chunks: List[Dict[str, Any]]
    final_answer: str
    citations: List[Dict[str, Any]]
    confidence_score: float
    requires_escalation: bool


def detect_query_language(query: str, requested_lang: Optional[str] = "en") -> str:
    """
    Detects whether user query is in Hindi or English:
    1. If Devanagari characters are present (Unicode \\u0900-\\u097F) -> 'hi'
    2. If common romanized Hindi/Hinglish particles are detected -> 'hi'
    3. If frontend explicitly requested 'hi' -> 'hi'
    4. Otherwise -> 'en'
    """
    if not query or not query.strip():
        return "hi" if requested_lang and requested_lang.lower().startswith("hi") else "en"

    # 1. Any Devanagari script is definitely Hindi
    if re.search(r'[\u0900-\u097F]', query):
        return "hi"

    # 2. Common Hindi / Hinglish particles
    hindi_particles = {
        "kya", "kaise", "karna", "chahiye", "batao", "bataiye", "mera", "meri", "hum",
        "aap", "dawa", "aushadhi", "samjhao", "petent", "karein", "hoga", "hogi", "namaste",
        "dhanyawad", "hai", "hain", "nahi", "kyun", "kripya", "churna", "taila", "main",
        "sakta", "sakti", "hoon", "aur", "bhi", "toh", "karo", "karen", "mujhe", "apna",
        "kitna", "kitni", "kaun", "daakhil", "sambhav"
    }
    cleaned_words = set(re.sub(r'[^\w\s]', '', query).lower().split())
    matched = cleaned_words.intersection(hindi_particles)
    if len(matched) >= 2 or (len(cleaned_words) <= 5 and len(matched) >= 1):
        return "hi"

    # 3. If query has English grammar words, strictly English
    english_markers = {"is", "can", "what", "how", "i", "a", "an", "the", "under", "for", "patent", "my", "to", "in", "does", "are"}
    if len(cleaned_words.intersection(english_markers)) >= 2:
        return "en"

    if requested_lang and requested_lang.lower().startswith("hi"):
        return "hi"

    return "en"


def classify_query_intent(query: str) -> str:
    """
    Classifies user message intent using NeMoGuardrails to prevent generating
    unwanted statutory memos for conversational small-talk, while strictly blocking
    out-of-scope tasks (math, generic coding, general trivia) and professionally
    answering identity queries ('who are u').
    """
    return NeMoGuardrails.classify_intent(query)


# --- LangGraph Nodes ---

def decompose_query_node(state: AgentState) -> Dict[str, Any]:
    """
    Decomposes legal inquiries into targeted statutory search queries.
    If the query is conversational (e.g. greeting or reaction), preserves it directly.
    """
    query = state["query"]
    jurisdiction = state.get("jurisdiction", "IN")
    ctx = state.get("context") or {}

    intent = classify_query_intent(query)
    if intent != "LEGAL_QUERY":
        return {"decomposed_queries": [query], "intent": intent}

    decomposed = [query]

    # Specific perspectives tailored to Ayurveda & IP
    if jurisdiction in ("INTL", "BOTH"):
        decomposed.append(f"Patent Cooperation Treaty PCT genetic resources traditional knowledge disclosure {query}")
        decomposed.append(f"Madrid Agreement trademark international registration botanical herbs {query}")
        decomposed.append(f"WIPO Nagoya Protocol access benefit sharing genetic resources {query}")
    else:
        decomposed.append(f"Patents Act Section 3(p) Section 3(e) traditional knowledge mere admixture synergy {query}")
        decomposed.append(f"Biological Diversity Act 2023 Section 6 NBA approval Form III Section 7 SBB {query}")
        decomposed.append(f"Ayush Invention Examination Guidelines 2025 unexpected technical effect {query}")
        decomposed.append(f"Drugs and Cosmetics Rules Rule 158-B Rule 122-E phytopharmaceutical {query}")

    # If context has category or triage information, inject into search
    if ctx.get("category"):
        decomposed.append(f"{ctx.get('category')} {ctx.get('statute', '')} {query}")

    return {"decomposed_queries": decomposed, "intent": intent}


def retrieve_vectors_node(state: AgentState) -> Dict[str, Any]:
    """
    Executes dense semantic retrieval across legal chunks in Qdrant Cloud.
    Skips retrieval for conversational greetings or small-talk.
    """
    intent = state.get("intent", "LEGAL_QUERY")
    if intent != "LEGAL_QUERY":
        return {"retrieved_chunks": []}

    decomposed = state.get("decomposed_queries", [state["query"]])
    jurisdiction = state.get("jurisdiction", "IN")
    client = get_qdrant_client()
    embedder = get_embedder()

    if client is None or embedder is None:
        logger.warning("Vector DB or Embedder unavailable. Using fallback statutory corpus.")
        return {"retrieved_chunks": []}

    all_hits: List[Dict[str, Any]] = []
    rrf_scores: Dict[str, float] = {}
    chunk_data_map: Dict[str, Dict[str, Any]] = {}

    k_constant = 60.0

    for q_idx, sub_q in enumerate(decomposed):
        try:
            # Apply BGE instruction prefix if BGE model is active, and normalize
            query_text = (
                f"Represent this sentence for searching relevant passages: {sub_q}"
                if "bge" in settings.EMBEDDING_MODEL_NAME.lower()
                else sub_q
            )
            vec = embedder.encode(query_text, normalize_embeddings=True).tolist()
            search_kwargs: Dict[str, Any] = {
                "collection_name": settings.QDRANT_COLLECTION_NAME,
                "query_vector": vec,
                "limit": 6,
                "with_payload": True,
            }

            hits = client.search(**search_kwargs)

            for rank, hit in enumerate(hits):
                cid = str(hit.id)
                score = 1.0 / (k_constant + (rank + 1))
                rrf_scores[cid] = rrf_scores.get(cid, 0.0) + score

                if cid not in chunk_data_map:
                    payload = hit.payload or {}
                    chunk_data_map[cid] = {
                        "id": cid,
                        "score": hit.score,
                        "text": payload.get("text", ""),
                        "doc_id": payload.get("doc_id", ""),
                        "act_name": payload.get("act_name", "Statutory Act"),
                        "section_name": payload.get("section_name", "General"),
                        "section_title": payload.get("section_title", ""),
                        "document_type": payload.get("document_type", "statute"),
                        "source_file": payload.get("source_file", ""),
                        "source_url": payload.get("source_url", ""),
                        "jurisdiction": payload.get("jurisdiction", "IN"),
                    }
        except Exception as e:
            logger.warning(f"Error executing vector search for sub-query '{sub_q[:40]}': {e}")

    # Sort chunks by fused RRF score
    sorted_chunk_ids = sorted(rrf_scores.keys(), key=lambda cid: rrf_scores[cid], reverse=True)
    top_chunks = [chunk_data_map[cid] for cid in sorted_chunk_ids[:8]]

    # If international jurisdiction requested, ensure treaties are represented if present
    if jurisdiction == "INTL":
        intl_chunks = [c for c in top_chunks if any(k in c["act_name"].lower() for k in ("intl", "pct", "madrid", "hague", "wipo", "trips", "budapest"))]
        if intl_chunks:
            top_chunks = intl_chunks + [c for c in top_chunks if c not in intl_chunks]

    return {"retrieved_chunks": top_chunks}


def generate_answer_node(state: AgentState) -> Dict[str, Any]:
    """
    Synthesizes authoritative legal response using Groq LLM grounded strictly in Qdrant legal chunks.
    Injects precise interactive citations: [Section 3(p)], [Section 3(e)], [Section 3(d)], [Rule 158-B], [Rule 122-E], [1], [2].
    For conversational inputs (greetings, confusion reactions, help requests), routes to friendly conversational synthesis.
    """
    query = state["query"]
    jurisdiction = state.get("jurisdiction", "IN")
    language = state.get("language", "en")
    chunks = state.get("retrieved_chunks", [])
    ctx = state.get("context")
    intent = state.get("intent") or NeMoGuardrails.classify_intent(query)
    lang = state.get("detected_language") or detect_query_language(query, language)

    # 1. Out of Scope: math, generic coding, trivia, unrelated generic queries
    if intent == "OUT_OF_SCOPE":
        return {
            "final_answer": NeMoGuardrails.get_out_of_scope_response(lang),
            "citations": [],
            "confidence_score": 1.0,
            "requires_escalation": False,
            "detected_language": lang,
        }

    # 2. Identity inquiries: 'who are u', 'who are you', 'what can you do'
    if intent == "IDENTITY_HELP":
        return {
            "final_answer": NeMoGuardrails.get_identity_response(lang),
            "citations": [],
            "confidence_score": 1.0,
            "requires_escalation": False,
            "detected_language": lang,
        }

    # 3. Conversational routing for greetings, reactions (WTF), or gratitude
    if intent != "LEGAL_QUERY":
        groq_client = get_groq_client()
        if lang == "hi":
            conv_system = (
                "You are IP-SAKTI Sahayak, an intelligent AI Copilot and statutory advisor specializing exclusively in "
                "Indian Patent Law (Patents Act 1970), Ayurvedic & Botanical Intellectual Property, CSIR-TKDL prior-art scrutiny, "
                "and Biological Diversity Act (BDA 2023) compliance.\n\n"
                "The user sent a conversational message, greeting, reaction, or small talk in Hindi (or Hinglish):\n"
                "- Respond warmly, naturally, and clearly in Hindi (Devanagari script) in 1-2 concise paragraphs.\n"
                "- DO NOT generate an unprompted statutory evaluation, executive verdict, or patent analysis table.\n"
                "- If the user greeted you (e.g. 'नमस्ते', 'hello', 'hi'): Welcome them warmly to आईपी-शक्ति सहायक, introduce yourself briefly as a dedicated assistant for Ayurveda & patent law, and offer 3 clear bullet points in Hindi of Ayurvedic/patent questions they can ask you.\n"
                "- If the user expressed confusion or shock: Acknowledge it gently in Hindi, explain that you are ready to answer in simple terms, and ask how you can help with Ayurveda or patents.\n"
                "- If they said thanks or okay: Reply politely in Hindi (e.g., 'आपका स्वागत है! यदि आपके पास आयुर्वेद या पेटेंट संबंधी कोई अन्य प्रश्न हैं, तो अवश्य पूछें।').\n"
                "Tone: Professional, warm, respectful, and clear in Hindi (Devanagari script). Format cleanly in markdown."
            )
        else:
            conv_system = (
                "You are IP-SAKTI Sahayak, an intelligent AI Copilot and statutory advisor specializing exclusively in "
                "Indian Patent Law (Patents Act 1970), Ayurvedic & Botanical Intellectual Property, CSIR-TKDL prior-art scrutiny, "
                "and Biological Diversity Act (BDA 2023) compliance.\n\n"
                "The user sent a conversational message, greeting, reaction, or small talk:\n"
                "- Respond naturally, conversationally, and warmly in 1-2 concise paragraphs.\n"
                "- DO NOT generate an unprompted statutory evaluation, executive verdict, or patent analysis table.\n"
                "- If the user greeted you: Welcome them warmly to IP-SAKTI Sahayak, introduce yourself briefly as a specialized copilot for Ayurveda, AYUSH, and Indian patent compliance, and offer 3 clear bullet points of questions they can ask you.\n"
                "- If the user expressed confusion or shock: Acknowledge it with a friendly tone, explain that you're ready to answer any specific question on Ayurveda or patents in plain language, and ask what they would like to know.\n"
                "- If they said thanks or okay: Reply politely and let them know you're here to help anytime.\n"
                "Tone: Professional, warm, approachable, and clear. Format cleanly in markdown."
            )

        conv_answer = ""
        if groq_client:
            try:
                comp = groq_client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": conv_system},
                        {"role": "user", "content": query},
                    ],
                    temperature=0.3,
                    max_tokens=500,
                )
                conv_answer = comp.choices[0].message.content or ""
            except Exception as e:
                logger.warning(f"Conversational synthesis via primary model failed: {e}")
                try:
                    comp = groq_client.chat.completions.create(
                        model=settings.GROQ_FAST_MODEL,
                        messages=[
                            {"role": "system", "content": conv_system},
                            {"role": "user", "content": query},
                        ],
                        temperature=0.3,
                        max_tokens=500,
                    )
                    conv_answer = comp.choices[0].message.content or ""
                except Exception as ex:
                    logger.error(f"Conversational synthesis via fast model failed: {ex}")

        if not conv_answer:
            if lang == "hi":
                if intent == "REACTION_CONFUSION":
                    conv_answer = (
                        "यदि मेरी पिछली प्रतिक्रिया अत्यधिक जटिल थी, तो क्षमा करें! मैं एक वैधानिक कानूनी सहायक के रूप में संरचित हूँ, इसलिए मैंने औपचारिक कानूनी विश्लेषण प्रस्तुत किया था।\n\n"
                        "कृपया बेझिझक अपना प्रश्न सरल शब्दों में पूछें — चाहे वह किसी जड़ी-बूटी, पेटेंट अस्वीकृति या लाइसेंस के बारे में हो — मैं आपको स्पष्ट और सीधा उत्तर दूँगा।"
                    )
                elif intent == "IDENTITY_HELP":
                    conv_answer = (
                        "मैं **आईपी-शक्ति सहायक (IP-SAKTI Sahayak)** हूँ — भारतीय हर्बल नवप्रवर्तकों, वैद्यों, शोधकर्ताओं और पेटेंट अधिवक्ताओं के लिए "
                        "निर्मित एक उन्नत कानूनी निर्णय सहायता मंच।\n\n"
                        "मैं **भारतीय पेटेंट अधिनियम 1970**, **जैविक विविधता अधिनियम 2023**, "
                        "**औषधि एवं प्रसाधन सामग्री नियम (नियम 158-B एवं 122-E)**, और **सीएसआईआर-टीकेडीएल** के 8,900 से अधिक वैधानिक कानूनी खंडों पर आधारित हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?"
                    )
                elif intent == "GRATITUDE_CLOSING":
                    conv_answer = (
                        "आपका बहुत-बहुत स्वागत है! यदि आपके पास पेटेंट फाइलिंग, जैव-विविधता मंजूरी या कानूनी रणनीतियों के बारे में "
                        "कोई अन्य प्रश्न हों, तो कभी भी पूछ सकते हैं। आपके नवाचार की सफलता की शुभकामनाएँ!"
                    )
                else:
                    conv_answer = (
                        "**आईपी-शक्ति सहायक में आपका स्वागत है!** मैं आपका वैधानिक AI कानूनी सहायक हूँ, जो भारतीय पेटेंट कानून, "
                        "वानस्पतिक बौद्धिक संपदा, और जैविक विविधता अधिनियम (BDA 2023) अनुपालन में विशेषज्ञता रखता हूँ।\n\n"
                        "आप मुझसे इस प्रकार के प्रश्न पूछ सकते हैं:\n"
                        "- **पेटेंट पात्रता:** *क्या मैं धारा 3(p) या 3(e) के तहत अश्वगंधा और हल्दी के योग का पेटेंट करा सकता हूँ?*\n"
                        "- **जैव विविधता (BDA 2023) अनुपालन:** *भारतीय औषधीय पौधों के लिए रॉयल्टी और NBA फॉर्म III की क्या आवश्यकताएँ हैं?*\n"
                        "- **फाइलिंग प्रक्रिया:** *भारत में पेटेंट दाखिल करने के लिए कौन-से आधिकारिक फॉर्म (Form 1, 2, 3, 5, 18) आवश्यक हैं?*\n"
                        "- **पूर्व-कला एवं टीकेडीएल:** *पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL) आपत्तियों को कैसे दूर करें?*"
                    )
            else:
                if intent == "REACTION_CONFUSION":
                    conv_answer = (
                        "Apologies if my previous response was overwhelmingly dense! Because I am configured as an authoritative "
                        "legal co-counsel, I jumped straight into a formal statutory evaluation.\n\n"
                        "Please feel free to ask me your question in simple terms — whether you're inquiring about an herbal ingredient, "
                        "a patent rejection, or licensing permissions — and I'll give you a clear, direct answer."
                    )
                elif intent == "IDENTITY_HELP":
                    conv_answer = (
                        "I am **IP-SAKTI Sahayak**, an AI-powered legal intelligence and decision support platform built specifically "
                        "for Indian herbal innovators, Vaidyas, researchers, and patent attorneys.\n\n"
                        "I am grounded in over 8,900 statutory legal chunks including **The Patents Act, 1970**, the **Biological Diversity Act, 2023**, "
                        "**Drugs & Cosmetics Rules (Rule 158-B & 122-E)**, and **TKDL** guidelines. How can I assist your innovation today?"
                    )
                elif intent == "GRATITUDE_CLOSING":
                    conv_answer = (
                        "You're very welcome! If you have any further questions about patent filing, biodiversity clearances, "
                        "or legal strategies, feel free to ask anytime. Wishing your innovation great success!"
                    )
                else:
                    conv_answer = (
                        "**Welcome to IP-SAKTI Sahayak!** I am your statutory AI copilot specializing in Indian Patent Law, "
                        "Ayurvedic & Botanical Intellectual Property, and Biological Diversity Act (BDA 2023) compliance.\n\n"
                        "Here are a few things you can ask me:\n"
                        "- **Patentability Triage:** *Can I patent an herbal formulation with Ashwagandha and Turmeric under Section 3(p) or Section 3(e)?*\n"
                        "- **Biodiversity (BDA 2023) Compliance:** *What are my Access & Benefit Sharing (ABS) obligations and NBA Form III requirements?*\n"
                        "- **Filing Procedures:** *What official IPO forms (Form 1, 2, 3, 5, 18) and fees are required to file a patent in India?*\n"
                        "- **Prior-Art & TKDL:** *How do I check classical texts to overcome pre-grant patent oppositions?*"
                    )

        return {
            "final_answer": conv_answer,
            "citations": [],
            "confidence_score": 0.99,
            "requires_escalation": False,
            "detected_language": lang,
        }

    # Format structured context from Qdrant chunks
    context_blocks = []
    citations_list: List[Dict[str, Any]] = []

    for i, c in enumerate(chunks, 1):
        act = c.get("act_name", "The Patents Act, 1970")
        raw_sec = c.get("section_name", "General Provision")
        raw_text = c.get("text", "").strip()

        # Sanitize raw chunk headers like "General (Part 2/3)" or "Section 64(1) as well. (Part 2/15)"
        clean_sec = re.sub(r'\(Part\s*\d+/\d+\)', '', raw_sec).strip()
        clean_sec = re.sub(r'as well\.*', '', clean_sec).strip()
        if not clean_sec or clean_sec.lower() in ["general provision", "general", "introduction", "section"]:
            if "Section 3(p)" in raw_text or "3(p)" in raw_text:
                clean_sec = "Section 3(p)"
            elif "Section 3(e)" in raw_text or "3(e)" in raw_text:
                clean_sec = "Section 3(e)"
            elif "Section 3(d)" in raw_text or "3(d)" in raw_text:
                clean_sec = "Section 3(d)"
            elif "Section 6" in raw_text and ("nba" in raw_text.lower() or "biodiversity" in raw_text.lower()):
                clean_sec = "Section 6 (NBA Approval)"
            elif "Section 7" in raw_text and ("sbb" in raw_text.lower() or "biodiversity" in raw_text.lower()):
                clean_sec = "Section 7 (SBB Intimation)"
            elif "Rule 158-B" in raw_text:
                clean_sec = "Rule 158-B (Licensing)"
            elif "Rule 122-E" in raw_text:
                clean_sec = "Rule 122-E (Phytopharmaceutical)"
            elif "Form 1" in raw_text or "Form 2" in raw_text:
                clean_sec = "Statutory Forms (1 & 2)"
            elif "Form 18" in raw_text:
                clean_sec = "Form 18 (RFE)"
            else:
                clean_sec = "Statutory Provision"

        # Extract core Section/Rule/Form if the label contains quotes or long sentences
        sec_match = re.search(r'(Section\s+\d+(\([a-zA-Z0-9]+\))?|Rule\s+\d+[-A-Za-z]*|Form\s+[A-Za-z0-9]+)', clean_sec, re.IGNORECASE)
        if sec_match:
            clean_sec = sec_match.group(0).capitalize()
        elif len(clean_sec) > 28:
            clean_sec = clean_sec[:26] + "..."

        # Clean snippet
        snippet_lines = [line.strip() for line in raw_text.split("\n") if line.strip() and not line.startswith("[Act:")]
        snippet = " ".join(snippet_lines)[:250] if snippet_lines else raw_text[:250]

        # Determine reference URL
        url = c.get("source_url") or CANONICAL_ACT_URLS.get(act, "https://www.ipindia.gov.in")

        context_blocks.append(
            f"--- Statutory Reference [{i}] ---\n"
            f"Act/Document: {act}\n"
            f"Section/Provision: {clean_sec}\n"
            f"Legal Authority Text:\n{raw_text}\n"
        )

        citations_list.append({
            "id": f"cit-{i}",
            "statute_name": act,
            "section": clean_sec,
            "snippet": snippet,
            "url": url,
        })

    context_str = "\n".join(context_blocks) if context_blocks else "General statutory knowledge from Indian Patents Act 1970 and Biological Diversity Act 2023."

    # Contextual triage data from session
    context_note = ""
    if ctx:
        context_note = f"\nUser Session Triage Context:\n- Triage Category: {ctx.get('category')}\n- Patentability Posture: {ctx.get('patentability')}\n- Section 3 Risk: {ctx.get('section_3_risk')}\n- Regulatory Authority: {ctx.get('authority')}\n"

    if lang == "hi":
        language_spec = (
            f"Selected Jurisdiction: {jurisdiction}\n"
            "LANGUAGE MANDATE: You MUST respond strictly in authentic, professional Hindi (Devanagari script).\n"
            "- Synthesize an authoritative, thorough legal evaluation in clear Hindi.\n"
            "- Structure sections clearly with Hindi headings (उदा. ### 1. वैधानिक ट्राइएज एवं निर्णय, ### 2. वैधानिक कानूनी विश्लेषण, ### 3. सीएसआईआर-टीकेडीएल पूर्व-कला जांच, ### 4. जैव विविधता अधिनियम (BDA 2023) एवं एनबीए अनुपालन, ### 5. रणनीतिक कार्ययोजना).\n"
            "- Preserve statutory citations in bracket syntax with section names, e.g., [धारा 3(p) / Section 3(p)], [धारा 3(e)], [धारा 6, BDA 2023], [फॉर्म 1 / Form 1].\n"
            "- Format all matrices and tables as clean standard Markdown tables.\n"
        )
    else:
        language_spec = (
            f"Selected Jurisdiction: {jurisdiction}\n"
            "Language: Respond strictly in professional English.\n"
        )

    system_prompt = (
        "You are IP-SAKTI Sahayak, an elite senior Patent Attorney and statutory advisor specializing in "
        "Indian Patent Law (The Patents Act, 1970 & Patent Rules 2003/2024), Botanical/Ayurvedic Intellectual Property, "
        "CSIR-TKDL prior-art scrutiny, and Biological Diversity Act (BDA 2023) clearance.\n\n"
        "### CRITICAL DOMAIN RESTRICTION:\n"
        "You are strictly and exclusively IP-SAKTI Sahayak, dedicated ONLY to Ayurveda, AYUSH innovations, "
        "medicinal herbs, classical traditional knowledge (TKDL), and Indian patent & biological diversity statutory compliance. "
        "You MUST NOT answer questions about general mathematics, arithmetic, generic software programming, general trivia, "
        "world news, politics, sports, or general entertainment. If any such generic question reaches you, you MUST politely refuse "
        "and instruct the user to ask questions within Ayurveda and patent compliance.\n\n"
        "### CORE INSTRUCTIONS TO PROVIDE MAXIMUM USER VALUE & UNCOMPROMISING QUALITY:\n"
        "1. DIRECT, HIGH-VALUE ANSWER FIRST: Directly answer the user's specific inquiry in the first paragraph. Never pad with generic intros.\n"
        "2. ADAPTIVE STRUCTURE ACCORDING TO USER INTENT:\n"
        "   - IF THE USER ASKS ABOUT PATENT FILING PROCEDURE / STEPS:\n"
        "     Provide a structured, step-by-step procedural roadmap for filing a patent in India:\n"
        "       • Step 1: Prior Art & TKDL Search (checking § 3(p) & § 3(e) barriers)\n"
        "       • Step 2: Drafting the Specification under Form 2 (Provisional vs Complete, Claims, Synergy Evidence)\n"
        "       • Step 3: Mandatory IPO Filing Forms (Form 1 [Application], Form 2 [Specification], Form 3 [Sec 8 Foreign Undertaking], Form 5 [Inventorship Declaration], Form 9 [Early Publication], Form 18/18A [Request for Examination RFE])\n"
        "       • Step 4: Mandatory NBA Form III Clearance (under Section 6 of Biological Diversity Act 2023 before patent grant)\n"
        "       • Step 5: Examination, FER Response, Hearing, and Patent Grant\n"
        "       • Include exact timelines, official IPO fees (individual/startup vs large entity), and practical tips.\n"
        "   - IF THE USER ASKS ABOUT PATENTABILITY OF A FORMULA / RECIPE:\n"
        "     Deliver an executive verdict on whether it is barred under Section 3(p) (traditional knowledge) or Section 3(e) (mere admixture), "
        "     and provide actionable legal strategies to overcome it (e.g. synergistic bio-assays with Combination Index CI < 1.0, standardized phytopharmaceutical fraction under Rule 122-E, or trademark/design protection).\n"
        "   - IF THE USER ASKS A GENERAL STATUTORY/LEGAL QUESTION:\n"
        "     Explain the statutory section clearly, citing exact legal provisions and real-world compliance practices.\n"
        "3. GROUNDING & CITATIONS: Seamlessly embed statutory references like [Section 3(p)], [Section 3(e)], [Section 6, BDA 2023], [Form 1], etc.\n"
        "4. TABLE FORMATTING MANDATE: When providing comparative tables or compliance matrices, always format as clean, standard Markdown tables where each row is on a separate line with a valid header separator row (|---|---|).\n"
        "5. TONE & COMPLETION: Authoritative, executive, commercial, and practical. Complete every section and table fully without cutting off.\n"
        f"{language_spec}"
    )

    user_prompt = (
        f"Statutory Context from Ingested Corpus:\n{context_str}\n"
        f"{context_note}\n"
        f"User Inquiry:\n{query}\n\n"
        "Provide a comprehensive, authoritative statutory evaluation following the mandated structure and citation format."
    )

    groq_client = get_groq_client()
    answer = ""
    confidence = 0.96

    if groq_client:
        try:
            # Try primary model: openai/gpt-oss-120b
            completion = groq_client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.15,
                max_tokens=2500,
            )
            answer = completion.choices[0].message.content or ""
            logger.info("Successfully generated answer via Groq gpt-oss-120b")
        except Exception as e1:
            logger.warning(f"Groq primary model failed: {e1}. Trying fast fallback model: {settings.GROQ_FAST_MODEL}...")
            try:
                completion = groq_client.chat.completions.create(
                    model=settings.GROQ_FAST_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.15,
                    max_tokens=2500,
                )
                answer = completion.choices[0].message.content or ""
                logger.info(f"Successfully generated answer via Groq {settings.GROQ_FAST_MODEL}")
            except Exception as e2:
                logger.error(f"Groq fast model also failed: {e2}")

    # Fallback generator if LLM service is offline or returned empty
    if not answer:
        logger.warning("Generating deterministic statutory response from retrieved legal chunks...")
        answer = generate_statutory_fallback(query, jurisdiction, chunks, ctx, lang=lang)
        confidence = 0.88

    # Determine if query requires expert human escalation
    escalation_indicators = ["penal", "imprisonment", "court", "infringement lawsuit", "revocation petition", "high court"]
    requires_escalation = any(w in query.lower() for w in escalation_indicators)

    # Ensure default canonical citations if vector DB returned few
    if len(citations_list) < 2:
        citations_list.extend([
            {
                "id": "cit-canon-3p",
                "statute_name": "The Patents Act, 1970",
                "section": "Section 3(p)",
                "snippet": "An invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not patentable.",
                "url": "https://www.ipindia.gov.in/patents.htm",
            },
            {
                "id": "cit-canon-3e",
                "statute_name": "The Patents Act, 1970",
                "section": "Section 3(e)",
                "snippet": "A substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance is not patentable.",
                "url": "https://www.ipindia.gov.in/patents.htm",
            },
            {
                "id": "cit-canon-bda6",
                "statute_name": "Biological Diversity Act, 2023",
                "section": "Section 6",
                "snippet": "No person shall apply for any intellectual property right, in or outside India, for any invention based on any research or information on a biological resource obtained from India without previous approval of NBA.",
                "url": "http://nbaindia.org/",
            },
        ])

    return {
        "final_answer": answer,
        "citations": citations_list,
        "confidence_score": confidence,
        "requires_escalation": requires_escalation,
        "detected_language": lang,
    }


def generate_statutory_fallback(query: str, jurisdiction: str, chunks: List[Dict[str, Any]], ctx: Optional[Dict[str, Any]], lang: str = "en") -> str:
    """
    Robust deterministic legal template engine that guarantees comprehensive legal answers
    grounded in Indian Patents Act 1970, Biological Diversity Act 2023, and TKDL guidelines.
    """
    evidence_bullets = []
    for i, c in enumerate(chunks[:4], 1):
        evidence_bullets.append(f"- **[{c.get('act_name')}, {c.get('section_name')}]**: {c.get('text', '')[:160]}...")

    evidence_str = "\n".join(evidence_bullets) if evidence_bullets else "- **[Patents Act, Section 3(p)]**: Absolute statutory bar against patenting codified traditional knowledge."

    if lang == "hi":
        return (
            f"### 1. वैधानिक ट्राइएज एवं पेटेंट पात्रता सारांश (Executive Verdict)\n"
            f"आपके प्रश्न *'{query}'* (क्षेत्राधिकार: **{jurisdiction}**) के वैधानिक परीक्षण के अनुसार, प्रस्तावित आयुर्वेदिक/वानस्पतिक फॉर्मूलेशन को भारतीय पेटेंट अधिनियम 1970 की धारा 3(p) और धारा 3(e) के अंतर्गत कड़ी वैधानिक आपत्तियों का सामना करना पड़ सकता है। "
            f"शास्त्रीय संहिताओं में वर्णित योगों या केवल हर्बल मिश्रणों को कानूनन गैर-पेटेंट योग्य माना गया है।\n\n"
            f"### 2. गहन वैधानिक कानूनी विश्लेषण (Statutory Legal Analysis)\n"
            f"**भारतीय पेटेंट अधिनियम, 1970 के अनुसार:**\n"
            f"- **[धारा 3(p) / Section 3(p)]**: पारंपरिक ज्ञान (Traditional Knowledge) या पारंपरिक घटकों के ज्ञात गुणों के योग पर पूर्ण रोक लगाती है।\n"
            f"- **[धारा 3(e) / Section 3(e)]**: केवल जड़ी-बूटियों के भौतिक मिश्रण (Mere Admixture) पर रोक लगाती है। इसे दूर करने के लिए आपको प्रयोगशाला में सिद्ध सहक्रियात्मक प्रभाव (Synergy Data - Combination Index CI < 1.0) का साक्ष्य देना होगा।\n"
            f"- **[धारा 3(d) / Section 3(d)]**: किसी ज्ञात पदार्थ के नए रूप या अर्क के लिए चिकित्सीय प्रभावकारिता में उल्लेखनीय वृद्धि (Enhanced Therapeutic Efficacy) सिद्ध करनी अनिवार्य है।\n\n"
            f"### 3. सीएसआईआर-टीकेडीएल एवं पारंपरिक साहित्य जांच\n"
            f"सीएसआईआर **पारंपरिक ज्ञान डिजिटल लाइब्रेरी (TKDL)** और चरक संहिता, सुश्रुत संहिता अथवा एपीआई मोनोग्राफ में यदि यह योग दर्ज है, तो पेटेंट कार्यालय द्वारा धारा 25(1) के तहत पूर्व-अनुदान विरोध (Pre-Grant Opposition) दर्ज किया जाएगा।\n\n"
            f"### 4. जैविक विविधता अधिनियम (BDA 2023) एवं एनबीए अनुपालन\n"
            f"- **[धारा 6, जैव विविधता अधिनियम]**: भारतीय जैविक संसाधनों के उपयोग वाले नवाचारों पर पेटेंट प्राप्त करने से पूर्व **राष्ट्रीय जैव विविधता प्राधिकरण (NBA)** से **फॉर्म III** की पूर्व-अनुमति लेना अनिवार्य है।\n"
            f"- **[धारा 7, जैव विविधता अधिनियम]**: वाणिज्यिक संस्थाओं को राज्य जैव विविधता बोर्ड (SBB) को पूर्व सूचना (Intimation) देनी होगी।\n\n"
            f"### 5. रणनीतिक पेटेंट कार्ययोजना (Prosecution Roadmap)\n"
            f"1. **फाइटोफार्मास्युटिकल मार्ग ([नियम 122-E])**: कम से कम 4 मानकीकृत बायो-एक्टिव मार्करों के साथ पेटेंट दाखिल करें।\n"
            f"2. **सहक्रियात्मक प्रभाव (Synergy)**: हर्ब A + हर्ब B का संयुक्त सहक्रियात्मक प्रभाव प्रयोगशाला परीक्षणों द्वारा सिद्ध करें।\n"
            f"3. **ब्रांड एवं डिज़ाइन सुरक्षा**: ट्रेड मार्क्स अधिनियम 1999 और डिज़ाइन अधिनियम 2000 के तहत सुरक्षा सुनिश्चित करें।\n"
            f"4. **अंतर्राष्ट्रीय संरक्षण**: 12 माह के भीतर पीसीटी (PCT) अंतर्राष्ट्रीय आवेदन दाखिल करें।"
        )

    return (
        f"### 1. Executive Statutory Triage & Patentability Assessment\n"
        f"Based on your inquiry regarding *'{query}'* under jurisdiction **{jurisdiction}**, the proposed Ayurvedic formulation faces significant statutory hurdles under the Indian Patents Act, 1970. "
        f"Specifically, raw botanical mixtures and classical First Schedule formulations are statutorily non-patentable under [Section 3(p)] as traditional knowledge and [Section 3(e)] as mere aggregations.\n\n"
        f"### 2. In-Depth Statutory Legal Analysis\n"
        f"Under **The Patents Act, 1970**:\n"
        f"- **[Section 3(p)]**: Bars inventions that are in effect traditional knowledge or aggregations of known properties of traditionally known components.\n"
        f"- **[Section 3(e)]**: Bars substances obtained by a mere admixture resulting only in the aggregation of the properties of individual herbs. To overcome this bar, you must present comparative laboratory synergy data demonstrating a **Combination Index (CI < 1.0)**.\n"
        f"- **[Section 3(d)]**: If claiming a modified or purified extract, you must demonstrate a significant enhancement of known therapeutic efficacy over the crude extract.\n\n"
        f"### 3. TKDL Prior-Art & Classical Literature Scrutiny\n"
        f"The CSIR **Traditional Knowledge Digital Library (TKDL)** continuously monitors global patent offices. "
        f"If the ingredients are documented in classical Ayurvedic treatises (e.g. *Charaka Samhita*, *Sushruta Samhita*, or the *Ayurvedic Pharmacopoeia of India*), a pre-grant opposition under Section 25(1) will inevitably be filed by the Indian Patent Office.\n\n"
        f"### 4. Biodiversity Act & ABS Compliance (NBA / SBB)\n"
        f"Under **The Biological Diversity (Amendment) Act, 2023**:\n"
        f"- **[Section 6, Biological Diversity Act]**: Mandatory prior approval from the **National Biodiversity Authority (NBA)** via **Form III** must be secured prior to the grant of any patent for inventions utilizing Indian biological resources.\n"
        f"- **[Section 7, Biological Diversity Act]**: Commercial entities must submit prior intimation to the State Biodiversity Board (SBB Form I). However, registered local practitioners (Vaidyas) are exempt under the 2023 amendments.\n\n"
        f"### 5. Strategic Prosecution Roadmap & Action Plan\n"
        f"To maximize intellectual property protection for your formulation:\n"
        f"1. **Phytopharmaceutical Route ([Rule 122-E])**: Extract and chemically characterize minimum 4 bioactive markers with standardized chromatographic fingerprinting (HPLC/LC-MS) to pursue a composition-of-matter patent.\n"
        f"2. **Prove Supra-Additive Synergy**: Conduct in-vitro / in-vivo comparative assays testing Herb A alone vs. Herb B alone vs. Combination (A+B) to overcome [Section 3(e)].\n"
        f"3. **Brand & Packaging Exclusivity**: File immediate trademark registration under the **Trade Marks Act 1999** and novel delivery/packaging design under the **Designs Act 2000**.\n"
        f"4. **International Protection**: File an international **Patent Cooperation Treaty (PCT)** application within 12 months of Indian provisional filing.\n\n"
        f"**Relevant Corpus Findings:**\n{evidence_str}"
    )


def translate_legal_text_via_groq(text: str, target_language: str) -> str:
    """
    Translates statutory analysis between English and Hindi using Groq LLM.
    Strictly preserves Markdown syntax, tables, and statutory citations like [Section 3(p)] / [धारा 3(p)].
    """
    if not text or not text.strip():
        return text

    groq_client = get_groq_client()
    if not groq_client:
        logger.warning("Groq client unavailable for translation.")
        return text

    is_to_hindi = target_language.lower().startswith("hi")
    target_lang_str = "Hindi (Devanagari script)" if is_to_hindi else "English"
    source_lang_str = "English" if is_to_hindi else "Hindi"

    system_prompt = (
        f"You are an expert legal translator specializing in Indian Patent Law, AYUSH intellectual property, "
        f"and the Biological Diversity Act 2023.\n"
        f"Translate the provided legal text from {source_lang_str} into high-quality, professional {target_lang_str}.\n\n"
        f"CRITICAL TRANSLATION RULES:\n"
        f"1. PRESERVE ALL MARKDOWN: Keep all headers (###, ##), bold text (**text**), bullet points, and table structures exactly intact.\n"
        f"2. STATUTORY CITATIONS: Preserve statutory citations in bracket syntax, e.g., [Section 3(p)] -> [धारा 3(p) / Section 3(p)], [Section 3(e)] -> [धारा 3(e)], [Rule 158-B] -> [नियम 158-B], [Form 1] -> [फॉर्म 1] so interactive citation buttons keep working.\n"
        f"3. ACCURACY & TONE: Maintain formal, authoritative legal terminology.\n"
        f"4. OUTPUT FORMAT: Output ONLY the translated text. Do NOT add any preamble, intro, conversational filler, or commentary."
    )

    try:
        completion = groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text},
            ],
            temperature=0.1,
            max_tokens=3000,
        )
        translated = completion.choices[0].message.content or ""
        if translated.strip():
            return translated.strip()
    except Exception as e1:
        logger.warning(f"Groq primary model failed for translation: {e1}. Falling back to {settings.GROQ_FAST_MODEL}...")
        try:
            completion = groq_client.chat.completions.create(
                model=settings.GROQ_FAST_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text},
                ],
                temperature=0.1,
                max_tokens=3000,
            )
            translated = completion.choices[0].message.content or ""
            if translated.strip():
                return translated.strip()
        except Exception as e2:
            logger.error(f"Groq fast model translation failed: {e2}")

    return text


# --- Build LangGraph StateGraph ---

from langgraph.graph import StateGraph, END

def create_agent_graph():
    builder = StateGraph(AgentState)

    builder.add_node("decompose", decompose_query_node)
    builder.add_node("retrieve", retrieve_vectors_node)
    builder.add_node("generate", generate_answer_node)

    builder.set_entry_point("decompose")
    builder.add_edge("decompose", "retrieve")
    builder.add_edge("retrieve", "generate")
    builder.add_edge("generate", END)

    return builder.compile()


_GRAPH_APP = None

def get_graph_app():
    global _GRAPH_APP
    if _GRAPH_APP is None:
        _GRAPH_APP = create_agent_graph()
    return _GRAPH_APP


def process_query_via_langgraph(
    query: str,
    jurisdiction: str = "IN",
    language: str = "en",
    session_id: str = "default_session",
    context: Optional[Dict[str, Any]] = None,
    session_metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Executes the production LangGraph RAG multi-agent orchestrator.
    """
    app = get_graph_app()

    # Normalize jurisdiction
    jur = "INTL" if jurisdiction in ("INTL", "INTERNATIONAL") else ("BOTH" if jurisdiction in ("BOTH", "ALL") else "IN")
    detected_lang = detect_query_language(query, language)

    initial_state: AgentState = {
        "query": query,
        "jurisdiction": jur,
        "language": language,
        "detected_language": detected_lang,
        "session_id": session_id,
        "context": context,
        "session_metadata": session_metadata,
        "decomposed_queries": [],
        "retrieved_chunks": [],
        "final_answer": "",
        "citations": [],
        "confidence_score": 0.95,
        "requires_escalation": False,
    }

    try:
        result = app.invoke(initial_state)
        return {
            "answer": result.get("final_answer", ""),
            "citations": result.get("citations", []),
            "confidence_score": result.get("confidence_score", 0.95),
            "requires_escalation": result.get("requires_escalation", False),
            "detected_language": result.get("detected_language", detected_lang),
        }
    except Exception as e:
        logger.error(f"LangGraph execution error: {e}", exc_info=True)
        # Resilient fallback
        fb = generate_statutory_fallback(query, jur, [], context, lang=detected_lang)
        return {
            "answer": fb,
            "citations": [
                {
                    "id": "cit-err-1",
                    "statute_name": "The Patents Act, 1970",
                    "section": "Section 3(p)",
                    "snippet": "Inventions based on traditional knowledge are barred from patentability.",
                    "url": "https://www.ipindia.gov.in",
                }
            ],
            "confidence_score": 0.85,
            "requires_escalation": False,
            "detected_language": detected_lang,
        }
