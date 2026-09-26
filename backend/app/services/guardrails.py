import re
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

# Out-of-scope math patterns (arithmetic, equations, calculus)
OFF_TOPIC_MATH = [
    # Pure arithmetic like 2+2, 15*3, 100/5, 45-12, 25% of 100
    r'^\s*[-+]?\d+(\.\d+)?\s*[\+\-\*\/\^%xX]\s*[-+]?\d+(\.\d+)?(\s*[\+\-\*\/\^%xX]\s*[-+]?\d+(\.\d+)?)*\s*$',
    r'\b\d+(\.\d+)?\s*[\+\-\*\/\^%]\s*\d+(\.\d+)?\b',
    r'\b(solve|calculate|compute|evaluate)\b.*(\d+|equation|algebra|integral|derivative|x\^|formula|\+|\-|\*|\/)',
    r'\b(what is|how much is|calculate|find)\s+\d+\s*(plus|\+|\-|minus|\*|times|x|divided by|\/)\s*\d+',
    r'\b(square root|cube root|logarithm|factorial|percentage of|quadratic equation)\b',
    r'\b\d+\s*%\s*(of\s+\d+)?\b',
    r'\b(कैलकुलेट|गणना|जोड़|गुणा|भाग|हल करो|हिसाब|गणित)\b',
]

MATH_KEYWORDS = {
    "math", "maths", "algebra", "calculus", "derivative", "derivatives", "integral", "integrals",
    "integration", "differentiation", "trigonometry", "sin(", "cos(", "tan(", "pythagoras",
    "pythagorean", "quadratic", "square root", "cube root", "logarithm", "matrix", "matrices",
    "factorial", "gcd", "lcm", "polynomial", "eigenvalue", "arithmetic", "percentage of",
    "ganit", "hisaab", "multiply", "divide", "multiplication", "division", "addition", "subtraction"
}

CODING_KEYWORDS = [
    "write code", "write python", "python script", "python program", "python function",
    "write javascript", "write java", "write c++", "write c#", "write html", "write css", "sql query",
    "write a function", "write a script", "write a program", "debug my code", "debug this code",
    "fix my code", "binary search", "bubble sort", "linked list", "binary tree", "leetcode",
    "react component", "npm install", "pip install", "git commit", "for loop", "while loop",
    "create an app", "build an app", "create a website", "build a website", "html code", "css code",
    "machine learning model", "neural network", "deep learning"
]

GENERAL_OFFTOPIC_PHRASES = [
    "prime minister", "president of", "chief minister", "who is elon musk", "who is narendra modi",
    "who is donald trump", "elections", "political party", "capital of", "weather in", "weather today",
    "forecast", "tallest mountain", "longest river", "speed of light", "why is the sky blue",
    "quantum physics", "cricket score", "ipl match", "football match", "fifa", "world cup",
    "virat kohli", "messi", "ronaldo", "latest movie", "box office", "write a poem", "write a story",
    "tell a joke", "tell me a joke", "song lyrics", "recommend a movie", "netflix", "hollywood",
    "bollywood", "recipe for cake", "how to bake", "how to make pizza", "how to cook pasta",
    "biryani recipe", "chicken recipe", "horoscope", "astrology", "dating advice",
    "relationship advice", "gym workout", "bicep workout", "bitcoin", "cryptocurrency",
    "stock market", "कविता लिखो", "कविता सुनाओ", "चुटकुला सुनाओ", "शायरी सुनाओ", "कहानी सुनाओ",
    "मौसम कैसा है", "राजधानी क्या है", "प्रधानमंत्री कौन है", "पिज्जा कैसे बनाएं", "क्रिकेट स्कोर"
]

IDENTITY_PATTERNS = [
    "who are you", "who are u", "who r u", "who ru", "who r you", "what are you", "what are u", "what r u",
    "who made you", "who made u", "who created you", "who created u", "who built you", "who built u",
    "who developed you", "who developed u", "who trained you", "who trained u", "who is your developer",
    "who designed you", "who is this", "who am i talking to", "who am i chatting with",
    "how are you built", "how u r built", "how were you built", "how are you made", "how were you made",
    "how do you work", "how does this work", "how does it work", "how are you working",
    "what is your architecture", "what architecture", "what technology do you use", "what tech stack",
    "what model are you", "which model are you", "what llm are you", "are you gpt", "are you openai",
    "are you chatgpt", "are you an llm", "what is ip sakti", "what is ipsakti", "what is ip-sakti",
    "what can you do", "what do you do", "what is your name", "whats your name", "what's your name",
    "your name", "tell me about yourself", "introduce yourself", "introduce urself", "help", "help me",
    "how can you help", "tum kaun ho", "aap kaun hain", "aap kaun ho", "kaun ho tum", "kaun hain aap",
    "koun ho tum", "tumhe kisne banaya", "aapko kisne banaya", "tum kaise bane ho", "aap kaise bane hain",
    "aap kaise bane ho", "aap kya kar sakte hain", "tum kya kar sakte ho", "aap kya karte hain",
    "tum kya karte ho", "yeh kaise kaam karta hai", "kaise kaam karta hai", "aap kaise kaam karte hain",
    "ip sakti kya hai", "sahayak kya hai", "apna parichay do", "apna parichay",
    "तुम कौन हो", "आप कौन हैं", "तुम्हारा नाम क्या है", "आपका नाम क्या है", "तुम्हें किसने बनाया",
    "आपको किसने बनाया", "तुम कैसे बने हो", "आप कैसे बने हैं", "आप क्या कर सकते हैं",
    "तुम क्या कर सकते हो", "आप क्या करते हैं", "यह कैसे काम करता है", "आप कैसे काम करते हैं",
    "आईपी शक्ति क्या है", "सहायक क्या है", "अपना परिचय दें"
]

IDENTITY_REGEXES = [
    r'\bwho\s+(are|r)\s+(u|you|ya)\b',
    r'\bwho\s+r\s+u\b',
    r'\bwho\s+ru\b',
    r'\bwho\s+is\s+this\b',
    r'\bwho\s+am\s+i\s+(talking|chatting|speaking)\s+(to|with)\b',
    r'\bwhat\s+(are|r)\s+(u|you)\b',
    r'\b(what|whats|what\'s)\s+your\s+name\b',
    r'\bwho\s+(made|created|built|developed|designed|trained|programmed)\s+(you|u)\b',
    r'\bintroduce\s+(your|ur)self\b',
    r'\btell\s+me\s+about\s+(your|ur)self\b',
    r'\bwhat\s+(is|are)\s+your\s+(capabilities|purpose|role|function)\b',
    r'\bwhat\s+can\s+(you|u)\s+do\b',
    r'\bwhat\s+do\s+(you|u)\s+do\b',
    r'\b(tum|aap)\s+kaun\s+(ho|hain)?\b',
    r'\bkaun\s+(ho|hain)\s+(tum|aap)\b',
    r'\b(tumhe|aapko)\s+kisne\s+banaya\b',
    r'\bapna\s+parichay\b',
]

GREETING_WORDS = {
    "hello", "hi", "hii", "hiii", "hey", "heyy", "namaste", "namaskar", "pranam", "hola",
    "greetings", "good morning", "good afternoon", "good evening", "kem cho", "vanakkam",
    "hlo", "helo", "yo", "sup", "hey there", "hello there",
    "नमस्ते", "नमस्कार", "प्रणाम", "सुप्रभात", "शुभ संध्या", "शुभ दोपहर"
}

LEGAL_AND_DOMAIN_TERMS = {
    # Patent & IP Law
    "patent", "patents", "patenting", "patentable", "patentability", "ipr", "ip", "intellectual",
    "property", "trademark", "trademarks", "copyright", "copyrights", "design", "designs",
    "geographical", "gi", "trade", "secret", "secrets", "prior", "art", "tkdl", "traditional",
    "knowledge", "novelty", "inventive", "step", "nonobvious", "obviousness", "specification",
    "provisional", "complete", "claim", "claims", "section", "act", "rule", "rules", "form",
    "forms", "ipo", "cgpdtm", "wipo", "pct", "trips", "madrid", "budapest", "paris",
    "infringement", "revocation", "opposition", "pregrant", "postgrant", "examination",
    "fer", "rfe", "hearing", "controller", "compulsory", "license", "licensing", "bda",
    "nba", "sbb", "bmc", "abs", "benefit", "sharing", "biodiversity", "biological", "resource",
    "resources", "dossier", "search", "database", "examiner", "grant", "granted", "applicant",
    "inventor", "royalty", "royalties", "commercialization", "export", "import", "filing",
    "file", "fees", "fee", "penalty", "appeal", "tribunal", "law", "legal", "lawsuit", "court",
    "statutory", "statute", "compliance",

    # Ayurveda core concepts & systems
    "ayurveda", "ayurvedic", "ayush", "unani", "siddha", "homeopathy", "yoga", "sowarigpa",
    "vaidya", "vaidyas", "dosha", "doshas", "vata", "pitta", "kapha", "tridosha", "prakriti",
    "vikriti", "dhatu", "dhatus", "mala", "ama", "agni", "ojas", "srotas", "panchakarma",
    "snehana", "swedana", "vamana", "virechana", "basti", "nasya", "shirodhara", "rasayana",
    "vajikarana", "dravyaguna", "kayachikitsa", "shalya", "shalakya", "kaumarabhritya",
    "agada", "rasashastra", "bhaishajya", "kalpana", "dinacharya", "ritucharya",

    # Classical Treatises & Institutions
    "charaka", "sushruta", "vagbhata", "ashtanga", "hridaya", "sangraha", "bhavaprakasha",
    "sharngadhara", "madhava", "nidana", "samhita", "samhitas", "api", "ccras", "ccrh",
    "ccrum", "aiia", "cdsco", "phytopharmaceutical",

    # Formulation Types & Preparations
    "herb", "herbs", "herbal", "plant", "plants", "botanical", "flora", "extract", "extracts",
    "fraction", "fractions", "concoction", "decoction", "kadha", "churna", "churnam", "taila",
    "tailam", "kwath", "kwatha", "kashayam", "arishta", "asava", "avaleha", "vati", "gutika",
    "bhasma", "pishti", "lepa", "guggulu", "modaka", "paka", "ras", "rasa", "admixture",
    "synergy", "synergistic", "combination", "formulation", "formulations", "syrup", "tablet",
    "tablets", "capsule", "capsules", "oil", "oils", "ointment", "cream", "gummies", "tincture",
    "medicine", "medicinal", "therapeutic", "efficacy", "bioassay", "toxicity", "clinical",
    "trial", "pharmacology", "pharmacopeia",

    # Herbs, Plants & Ingredients
    "ashwagandha", "turmeric", "curcumin", "neem", "tulsi", "brahmi", "amla", "amalaki",
    "triphala", "guggul", "ginger", "garlic", "honey", "pepper", "cinnamon", "clove",
    "aloe", "aloevera", "mentha", "eucalyptus", "shilajit", "boswellia", "shallaki", "sallaki",
    "shatavari", "giloy", "guduchi", "licorice", "liquorice", "mulethi", "yashtimadhu",
    "haritaki", "bibhitaki", "baheda", "arjuna", "shankhpushpi", "manjistha", "kutki",
    "bhringraj", "punarnava", "kalmegh", "vasaka", "chirata", "cardamom", "elaichi",
    "cumin", "jeera", "fennel", "saunf", "fenugreek", "methi", "saffron", "kesar",
    "moringa", "spirulina", "cannabis", "vijaya", "bhang", "gotukola", "bala", "ativisha",
    "vacha", "vidanga", "nagkesar", "lodhra", "sariva", "kantakari", "gokhru", "musta",
    "haldi", "adrak", "lehsun", "madhu", "maricha", "pippali", "dalchini", "laung"
}

HINDI_DOMAIN_WORDS = {
    # Legal & Patent
    "पेटेंट", "कॉपीराइट", "ट्रेडमार्क", "अधिनियम", "धारा", "नियम", "फॉर्म", "आवेदन",
    "पारंपरिक", "ज्ञान", "टीकेडीएल", "जैव", "विविधता", "एनबीए", "एसबीबी", "अधिकार",
    "शुल्क", "रॉयल्टी", "अनुपालन", "लाइसेंस", "विरोध", "दाखिल",

    # Ayush & Ayurveda concepts
    "आयुष", "आयुर्वेद", "आयुर्वेदिक", "वैद्य", "दोष", "वात", "पित्त", "कफ", "त्रिदोष",
    "पंचकर्म", "रसायन", "वाजीकरण", "संहिता", "चरक", "सुश्रुत", "वाग्भट",

    # Formulation & herbs
    "जड़ी", "बूटी", "औषधि", "दवा", "अर्क", "चूर्ण", "क्वाथ", "घृत", "तेल", "भस्म",
    "वटी", "गुटिका", "काढ़ा", "लेप", "अवलेह", "आसव", "अरिष्ट", "मिश्रण", "सहक्रिया",
    "अश्वगंधा", "हल्दी", "नीम", "तुलसी", "त्रिफला", "आंवला", "अदरक", "शहद", "मुलेठी",
    "ब्राह्मी", "शतावरी", "अर्जुन", "शिलाजीत", "भृंगराज", "पुनर्नवा", "दालचीनी", "लौंग",
    "गिलोय", "गुग्गुल", "पिप्पली", "काली मिर्च", "इलायची", "जीरा", "सौंफ", "मेथी", "केसर"
}


class NeMoGuardrails:
    """
    Production-grade Guardrails & Domain Enforcement Engine.
    Restricts IP-SAKTI Sahayak exclusively to Ayurveda, AYUSH, Traditional Knowledge (CSIR-TKDL),
    and Indian Patent Law (The Patents Act, 1970 & BDA 2023).
    Rejects generic math, coding, trivia, and off-topic requests.
    Handles 'who are u' with an authoritative, professional persona.
    """

    @staticmethod
    def classify_intent(query: str) -> str:
        """
        Classifies query intent into:
        - GREETING: Casual or respectful greetings
        - REACTION_CONFUSION: Confusion or shock reactions
        - IDENTITY_HELP: Questions about bot identity, architecture, or capabilities
        - GRATITUDE_CLOSING: Thank you, bye, ok
        - OUT_OF_SCOPE: Math problems, coding tasks, trivia, recipes, unrelated queries
        - LEGAL_QUERY: Questions within Ayurveda, AYUSH, TKDL, Indian Patent Law, BDA 2023
        """
        if not query or not query.strip():
            return "GREETING"

        cleaned = re.sub(r'[^\w\s\u0900-\u097F]', ' ', query).strip().lower()
        cleaned_compact = " ".join(cleaned.split())
        words = set(cleaned.split())

        # 1. Identity inquiries (Catch 'who are u', 'who r u', etc.)
        for pattern in IDENTITY_PATTERNS:
            if pattern in query.lower() or pattern in cleaned_compact:
                return "IDENTITY_HELP"

        for rx in IDENTITY_REGEXES:
            if re.search(rx, query, re.IGNORECASE) or re.search(rx, cleaned_compact, re.IGNORECASE):
                return "IDENTITY_HELP"

        # 2. Confusion triggers
        confusion_triggers = {
            "wtf", "wth", "what the fuck", "what the hell", "what is this", "huh", "why", "what",
            "are you crazy", "what happened", "wtf is this", "why did you say that", "what are you saying",
            "ye kya hai", "kya bakwas hai", "यह क्या है", "क्या बकवास है"
        }
        if cleaned_compact in confusion_triggers or any(cleaned_compact.startswith(c) for c in ["wtf", "wth"]):
            return "REACTION_CONFUSION"

        # 3. Closings / gratitude
        closing_triggers = {
            "thanks", "thank you", "thank you so much", "thx", "ok", "okay",
            "cool", "got it", "bye", "goodbye", "dhanyawad", "shukriya", "alvida", "theek hai",
            "धन्यवाद", "शुक्रिया", "अलविदा", "ठीक है"
        }
        if cleaned_compact in closing_triggers:
            return "GRATITUDE_CLOSING"

        # 4. Greetings
        if len(words) <= 4 and any(w in GREETING_WORDS for w in words):
            if not words.intersection(LEGAL_AND_DOMAIN_TERMS):
                return "GREETING"

        # 5. Out of scope: Math
        for pattern in OFF_TOPIC_MATH:
            if re.search(pattern, query, re.IGNORECASE):
                # Ensure it's not a legal section reference like "Section 3(p)" or "Rule 158-B" or "Form 1"
                if not re.search(r'\b(section\s+\d+|rule\s+\d+|form\s+\d+|month|months|year|years)\b', query, re.IGNORECASE):
                    return "OUT_OF_SCOPE"

        if any(kw in query.lower() for kw in MATH_KEYWORDS):
            if not words.intersection(LEGAL_AND_DOMAIN_TERMS):
                return "OUT_OF_SCOPE"

        # 6. Out of scope: Coding
        has_software_patent_context = any(term in cleaned_compact for term in ["3(k)", "3 k", "patent", "patentable", "cri", "ip"])
        if any(phrase in query.lower() for phrase in CODING_KEYWORDS):
            if not has_software_patent_context:
                return "OUT_OF_SCOPE"

        # 7. Out of scope: General off-topic phrases
        if any(phrase in query.lower() for phrase in GENERAL_OFFTOPIC_PHRASES):
            if not words.intersection(LEGAL_AND_DOMAIN_TERMS):
                return "OUT_OF_SCOPE"

        # 8. Strict Domain check: Must contain at least one Ayurveda / AYUSH / Plant / Patent / Legal term
        has_domain_term = bool(words.intersection(LEGAL_AND_DOMAIN_TERMS))
        if not has_domain_term:
            for hw in HINDI_DOMAIN_WORDS:
                if hw in query:
                    has_domain_term = True
                    break

        if not has_domain_term:
            return "OUT_OF_SCOPE"

        return "LEGAL_QUERY"

    @staticmethod
    def get_out_of_scope_response(lang: str = "en") -> str:
        """
        Returns a polite, domain-enforcing refusal for off-topic queries in English or Hindi.
        """
        if lang == "hi":
            return (
                "मैं **आईपी-शक्ति सहायक (IP-SAKTI Sahayak)** हूँ — एक समर्पित AI कानूनी सहायक, जिसे **विशेष रूप से "
                "आयुर्वेद, आयुष (AYUSH), वानस्पतिक नवाचारों, पारंपरिक ज्ञान (CSIR-TKDL), और भारतीय पेटेंट कानून "
                "(The Patents Act, 1970 एवं BDA 2023)** के लिए विकसित किया गया है।\n\n"
                "> [!NOTE]\n"
                "> मेरी क्षमताएं केवल आयुर्वेद, औषधीय पौधों, पारंपरिक ज्ञान और वैधानिक बौद्धिक संपदा अनुपालन तक सीमित हैं। "
                "मैं सामान्य गणितीय सवाल हल करने, सामान्य कोडिंग करने या सामान्य ज्ञान / ट्रिविया के प्रश्नों के उत्तर देने के लिए नहीं बना हूँ।\n\n"
                "कृपया अपने आयुर्वेदिक नवाचार या पेटेंट से संबंधित प्रश्न पूछें, जैसे:\n"
                "- **आयुर्वेदिक योग एवं औषधियां:** *अश्वगंधा, त्रिफला या गिलोय के शास्त्रीय संदर्भ, औषधीय गुण और उपयोग क्या हैं?*\n"
                "- **पेटेंट पात्रता ट्राइएज:** *क्या धारा 3(p) या 3(e) के तहत हर्बल योग का पेटेंट कराया जा सकता है?*\n"
                "- **सीएसआईआर-टीकेडीएल एवं सिनर्जी:** *पारंपरिक ज्ञान की आपत्तियों को दूर करने के लिए सहक्रियात्मक प्रभाव (Synergy) कैसे सिद्ध करें?*\n"
                "- **जैव विविधता (BDA 2023) अनुपालन:** *भारतीय जैविक संसाधनों के उपयोग पर NBA फॉर्म III और रॉयल्टी के क्या नियम हैं?*\n"
                "- **पेटेंट फाइलिंग प्रक्रिया:** *भारत में पेटेंट दाखिल करने के लिए कौन-से आधिकारिक फॉर्म (Form 1, 2, 3, 5, 18) आवश्यक हैं?*"
            )
        else:
            return (
                "I am **IP-SAKTI Sahayak**, a specialized AI copilot dedicated **exclusively to Ayurveda, "
                "AYUSH botanical innovations, traditional knowledge (CSIR-TKDL), and Indian Patent Law (The Patents Act, 1970 & BDA 2023)**.\n\n"
                "> [!NOTE]\n"
                "> My scope is strictly limited to Ayurveda, botanical medicine, and statutory intellectual property compliance. "
                "I do not solve general mathematics problems, write non-domain software code, or answer unrelated general knowledge / trivia questions.\n\n"
                "Please feel free to ask me anything within my specialized domain, such as:\n"
                "- **Ayurvedic Formulations & Herbs:** *What are the classical references, medicinal properties, and indications of Ashwagandha, Triphala, or Tulsi?*\n"
                "- **Patentability Triage:** *Can I patent an Ayurvedic formulation under Section 3(p) or Section 3(e)?*\n"
                "- **TKDL Prior-Art & Synergy:** *How do I prove synergistic efficacy (Combination Index CI < 1.0) to overcome traditional knowledge bars?*\n"
                "- **Biodiversity (BDA 2023) Compliance:** *What are the NBA Form III requirements and ABS royalty rules for Indian biological resources?*\n"
                "- **IPO Forms & Filing Roadmap:** *What statutory forms (Form 1, 2, 3, 5, 18) and fees are required to file an Ayurvedic patent in India?*"
            )

    @staticmethod
    def get_identity_response(lang: str = "en") -> str:
        """
        Returns the authoritative identity and professional architecture of IP-SAKTI Sahayak.
        Guarantees professional representation without generic LLM leakage.
        """
        if lang == "hi":
            return (
                "मैं **आईपी-शक्ति सहायक (IP-SAKTI Sahayak)** हूँ — भारतीय पेटेंट कार्यालय (IPO) और आयुष (AYUSH) नवप्रवर्तकों के लिए "
                "विशेष रूप से निर्मित एक समर्पित **वैधानिक AI कानूनी निर्णय सहायता प्रणाली**।\n\n"
                "### उद्देश्य एवं विशेषज्ञता:\n"
                "मेरा विकास वैद्यों, हर्बल शोधकर्ताओं, आयुष स्टार्टअप्स और पेटेंट अधिवक्ताओं की सहायता के लिए किया गया है:\n\n"
                "- **पेटेंट पात्रता ट्राइएज (धारा 3):** वानस्पतिक योगों का **धारा 3(p)** (पारंपरिक ज्ञान रोक) और **धारा 3(e)** (साधारण मिश्रण बनाम अप्रत्याशित सहक्रियात्मक प्रभाव / Synergy) के तहत त्वरित वैधानिक परीक्षण।\n"
                "- **सीएसआईआर-टीकेडीएल पूर्व-कला जांच:** शास्त्रीय संहिताओं (*चरक संहिता*, *सुश्रुत संहिता*, *अष्टांग हृदय*) और एपीआई मोनोग्राफ के आधार पर पूर्व-कला आपत्तियों का विश्लेषण।\n"
                "- **जैविक विविधता अधिनियम (BDA 2023) अनुपालन:** भारतीय जैविक संसाधनों के उपयोग पर **राष्ट्रीय जैव विविधता प्राधिकरण (NBA) फॉर्म III** और धारा 6 के तहत पूर्व-अनुमोदन मार्गदर्शन।\n"
                "- **विनियामक अनुपालन मार्ग:** औषधि एवं प्रसाधन सामग्री नियमों के तहत **नियम 158-B** (एएसयू लाइसेंसिंग) और **नियम 122-E** (फाइटोफार्मास्युटिकल) विनियामक रोडमैप।\n\n"
                "> [!NOTE]\n"
                "> मैं केवल **आयुर्वेद, आयुष नवाचारों, पारंपरिक ज्ञान और पेटेंट कानून** के लिए समर्पित हूँ। मैं सामान्य चैट, गणितीय सवाल हल करने या गैर-डोमेन कोडिंग के लिए उपलब्ध नहीं हूँ।\n\n"
                "आज मैं आपके आयुर्वेदिक नवाचार या पेटेंट फाइलिंग में क्या सहायता कर सकता हूँ?"
            )
        else:
            return (
                "I am **IP-SAKTI Sahayak** (Intellectual Property Statutory AI Knowledge & Triage Interface) — a dedicated, professional "
                "legal decision-support AI copilot engineered exclusively for **Ayurveda, AYUSH innovations, traditional knowledge (CSIR-TKDL), "
                "and Indian Patent Law (The Patents Act, 1970 & BDA 2023)**.\n\n"
                "### Purpose & Specialization:\n"
                "I am designed to assist Ayurvedic practitioners (Vaidyas), researchers, herbal innovators, and IP attorneys in evaluating patentability, "
                "overcoming traditional knowledge objections, and complying with statutory biological diversity mandates:\n\n"
                "- **Patentability Triage under Section 3:** Instant analysis of botanical formulations under **Section 3(p)** (traditional knowledge bar) and **Section 3(e)** (mere admixture vs. synergy).\n"
                "- **CSIR-TKDL & Prior-Art Scrutiny:** Cross-referencing formulations against classical treatises (*Charaka Samhita*, *Sushruta Samhita*, *Ashtanga Hridaya*, and API monographs) to anticipate pre-grant oppositions.\n"
                "- **Biodiversity Act (BDA 2023) Compliance:** Guidance on mandatory **NBA Form III** approvals and Access & Benefit Sharing (ABS) obligations under Section 6 & 7.\n"
                "- **Statutory Regulatory Pathways:** Licensing roadmap under **Rule 158-B** (Ayush ASU drugs) and **Rule 122-E** (Phytopharmaceutical drugs).\n\n"
                "> [!NOTE]\n"
                "> As an enterprise statutory assistant, I operate strictly within the domain of **Ayurveda, herbal innovation, and IP compliance**. "
                "I do not provide general conversational chat, solve unrelated math problems, or write non-domain software code.\n\n"
                "How may I assist your Ayurvedic research or patent filing today?"
            )

    @staticmethod
    def validate_answer(answer: str, context_chunks: List[str]) -> bool:
        """
        Validates LLM generation against retrieved context.
        """
        if not answer or len(answer.strip()) == 0:
            logger.warning("Guardrail Failed: Answer is empty.")
            return False
        return True

    @staticmethod
    def enforce_domain_restrictions(query: str) -> bool:
        """
        Returns True if the query is in domain, False if off-topic.
        """
        intent = NeMoGuardrails.classify_intent(query)
        return intent in ("LEGAL_QUERY", "GREETING", "IDENTITY_HELP", "REACTION_CONFUSION", "GRATITUDE_CLOSING")

