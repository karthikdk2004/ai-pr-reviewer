from langgraph.graph import StateGraph, END

from .nodes import (
    ReviewState,
    fetch_node,
    security_node,
    quality_node,
    performance_node,
    summary_node,
)


def _route_after_fetch(state: ReviewState) -> str:
    return END if state.get("error") else "security"


def build_graph():
    workflow = StateGraph(ReviewState)

    workflow.add_node("fetch", fetch_node)
    workflow.add_node("security", security_node)
    workflow.add_node("quality", quality_node)
    workflow.add_node("performance", performance_node)
    workflow.add_node("summary", summary_node)

    workflow.set_entry_point("fetch")

    workflow.add_conditional_edges(
        "fetch",
        _route_after_fetch,
        {"security": "security", END: END},
    )
    workflow.add_edge("security", "quality")
    workflow.add_edge("quality", "performance")
    workflow.add_edge("performance", "summary")
    workflow.add_edge("summary", END)

    return workflow.compile()
