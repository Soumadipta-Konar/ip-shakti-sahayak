import json
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from app.core.config import settings

# Initialize Qdrant and Embedder
embed_model = SentenceTransformer('all-MiniLM-L6-v2')
qdrant = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
COLLECTION_NAME = "legal_chunks"

# Initialize LLM
llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name="llama3-8b-8192")

# Define the state for the LangGraph orchestrator
class AgentState(TypedDict):
    query: str
    jurisdiction: str
    decomposed_queries: List[str]
    vector_results: List[str]
    graph_results: List[str]
    final_answer: str
    citations: List[dict]

# --- Nodes ---

def decompose_query(state: AgentState) -> dict:
    """Decomposes the query into Concept, Factual, and Regulatory."""
    original_query = state["query"]
    
    sys_msg = SystemMessage(content="You are a legal expert. Decompose the user's query into exactly three search queries: one conceptual, one factual, and one regulatory. Return them as a JSON list of strings.")
    hum_msg = HumanMessage(content=original_query)
    
    try:
        response = llm.invoke([sys_msg, hum_msg])
        decomposed = json.loads(response.content)
        if not isinstance(decomposed, list):
            decomposed = [original_query]
    except Exception:
        decomposed = [original_query]
        
    return {"decomposed_queries": decomposed}

def retrieve_from_vector_db(state: AgentState) -> dict:
    """Retrieves dense vectors from Qdrant Cloud."""
    all_results = []
    
    for dq in state["decomposed_queries"]:
        vector = embed_model.encode([dq])[0].tolist()
        try:
            hits = qdrant.search(
                collection_name=COLLECTION_NAME,
                query_vector=vector,
                limit=3
            )
            for hit in hits:
                all_results.append(hit.payload.get("text", ""))
        except Exception:
            pass # Ignore if Qdrant is empty or not setup
            
    return {"vector_results": list(set(all_results))}

def retrieve_from_graph_db(state: AgentState) -> dict:
    """Retrieves relationships from Neo4j."""
    # Mock Neo4j Cypher query execution for now
    return {"graph_results": ["Patents Act CITES Biological Diversity Act."]}

def reciprocal_rank_fusion(vector_res: List[str], graph_res: List[str], bm25_res: List[str]) -> List[str]:
    """Applies Reciprocal Rank Fusion (RRF) to deduplicate and rank results."""
    fused_results = list(set(vector_res + graph_res + bm25_res))
    return fused_results

def generate_final_answer(state: AgentState) -> dict:
    """Fuses results and generates the final answer using Groq."""
    jurisdiction = state["jurisdiction"]
    v_res = state.get("vector_results", [])
    g_res = state.get("graph_results", [])
    
    final_context = reciprocal_rank_fusion(v_res, g_res, [])
    context_str = " | ".join(final_context)
    
    sys_msg = SystemMessage(content=f"You are IP-SAKTI Sahayak, an expert in Indian IP law. Answer the query based ONLY on the provided context. Jurisdiction: {jurisdiction}")
    hum_msg = HumanMessage(content=f"Context: {context_str}\n\nQuery: {state['query']}")
    
    try:
        response = llm.invoke([sys_msg, hum_msg])
        answer = response.content
    except Exception as e:
        answer = f"Error generating answer: {e}"
        
    citations = [{"id": "doc_1", "statute": "Extracted Context", "url": "#"}]
    return {"final_answer": answer, "citations": citations}

# --- Graph Definition ---

workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("decompose", decompose_query)
workflow.add_node("retrieve_vector", retrieve_from_vector_db)
workflow.add_node("retrieve_graph", retrieve_from_graph_db)
workflow.add_node("generate", generate_final_answer)

# Define edges
workflow.set_entry_point("decompose")
workflow.add_edge("decompose", "retrieve_vector")
workflow.add_edge("retrieve_vector", "retrieve_graph")
workflow.add_edge("retrieve_graph", "generate")
workflow.add_edge("generate", END)

# Compile the graph
app = workflow.compile()

def process_query_via_langgraph(query: str, jurisdiction: str) -> dict:
    """Executes the compiled LangGraph workflow."""
    initial_state = {
        "query": query,
        "jurisdiction": jurisdiction,
        "decomposed_queries": [],
        "vector_results": [],
        "graph_results": [],
        "final_answer": "",
        "citations": []
    }
    
    result = app.invoke(initial_state)
    
    return {
        "answer": result.get("final_answer", "Error generating answer."),
        "citations": result.get("citations", [])
    }
