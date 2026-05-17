from typing import TypedDict

from langgraph.graph import StateGraph, END

from agents.memory_agent.memory_agent import memory_agent
from agents.tool_agent.tool_agent import tool_agent
from agents.retrieval_agent.retrieval_agent import retrieval_agent
from agents.research_agent.research_agent import research_agent
from agents.verification_agent.verification_agent import verification_agent


class AgentState(TypedDict):

    session_id: str
    question: str
    retrieved_chunks: list
    answer: str
    memory: list
    verification: dict
    tool_result: str


graph = StateGraph(AgentState)

# Add agents
graph.add_node("memory_agent", memory_agent)

graph.add_node("tool_agent", tool_agent)

graph.add_node("retrieval_agent", retrieval_agent)

graph.add_node("research_agent", research_agent)

graph.add_node("verification_agent", verification_agent)

# Entry point
graph.set_entry_point("memory_agent")

# Workflow
graph.add_edge("memory_agent", "tool_agent")

graph.add_edge("tool_agent", "retrieval_agent")

graph.add_edge("retrieval_agent", "research_agent")

graph.add_edge("research_agent", "verification_agent")

graph.add_edge("verification_agent", END)

# Compile graph
app_graph = graph.compile()