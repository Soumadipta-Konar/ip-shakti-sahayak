import asyncio
from app.services.agent import process_query_via_langgraph

print("Testing LangGraph integration with Groq...")
try:
    result = process_query_via_langgraph("What are the criteria for a patent?", "IN")
    print(f"Result:\n{result['answer']}")
except Exception as e:
    print(f"Failed: {e}")
