import os
import json
import re
from typing import TypedDict, List, Optional, Dict

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

from .github import GitHubClient


class ReviewState(TypedDict):
    pr_url: str
    pr_data: Optional[Dict]
    security_issues: List[Dict]
    quality_issues: List[Dict]
    performance_issues: List[Dict]
    positive_aspects: List[str]
    summary: str
    verdict: str
    overall_score: float
    error: Optional[str]
    current_node: str


_llm_instance: Optional[ChatGroq] = None

def _get_llm() -> Optional[ChatGroq]:
    global _llm_instance
    if _llm_instance is not None:
        return _llm_instance
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    _llm_instance = ChatGroq(
        model="llama-3.3-70b-versatile",
        groq_api_key=api_key,
        temperature=0.1,
        max_tokens=4096,
    )
    return _llm_instance


def _extract_json(text: str) -> Dict:
    text = re.sub(r"```(?:json)?\s*", "", text)
    text = re.sub(r"```\s*", "", text)

    brace_count = 0
    start = -1
    for i, ch in enumerate(text):
        if ch == "{":
            if start == -1:
                start = i
            brace_count += 1
        elif ch == "}":
            brace_count -= 1
            if brace_count == 0 and start != -1:
                try:
                    return json.loads(text[start : i + 1])
                except json.JSONDecodeError:
                    start = -1

    try:
        return json.loads(text.strip())
    except Exception:
        return {}


def _calculate_score(
    sec: List, qual: List, perf: List
) -> float:
    deductions = {"critical": 2.0, "high": 1.0, "medium": 0.5, "low": 0.2}
    score = 10.0
    for issue in sec + qual + perf:
        score -= deductions.get(issue.get("severity", "low").lower(), 0.2)
    return max(0.0, round(score, 1))


def _determine_verdict(score: float, security_issues: List) -> str:
    has_critical = any(
        i.get("severity", "").lower() == "critical" for i in security_issues
    )
    if has_critical or score < 5.0:
        return "REQUEST_CHANGES"
    if score >= 8.0:
        return "APPROVE"
    return "COMMENT"


# ── Nodes ────────────────────────────────────────────────────────────────────

async def fetch_node(state: ReviewState) -> ReviewState:
    try:
        client = GitHubClient()
        pr_data = await client.fetch_pr_data(state["pr_url"])
        return {
            **state,
            "pr_data": pr_data,
            "security_issues": [],
            "quality_issues": [],
            "performance_issues": [],
            "positive_aspects": [],
            "current_node": "fetch",
        }
    except Exception as exc:
        return {**state, "error": str(exc), "current_node": "fetch"}


async def security_node(state: ReviewState) -> ReviewState:
    pr_data = state.get("pr_data") or {}
    diff = (pr_data.get("diff_content") or "No diff available")[:25000]
    llm = _get_llm()

    if not llm:
        return {**state, "security_issues": [], "current_node": "security"}

    prompt = f"""Analyze this code diff for security vulnerabilities.
Return ONLY a valid JSON object — no markdown, no explanation.

JSON structure:
{{
  "issues": [
    {{
      "severity": "critical|high|medium|low",
      "category": "security",
      "title": "Short title",
      "description": "Detailed description of the vulnerability",
      "file": "path/to/file",
      "line": "line number or range",
      "suggestion": "How to fix this issue"
    }}
  ],
  "positive_aspects": ["strength1", "strength2"]
}}

Check for: hardcoded secrets/credentials, SQL injection, XSS, CSRF,
authentication bypasses, path traversal, insecure deserialization,
sensitive data exposure, insecure dependencies.

PR Title: {pr_data.get("title", "N/A")}
Description: {(pr_data.get("description") or "")[:500]}

Diff:
{diff}"""

    try:
        resp = await llm.ainvoke([HumanMessage(content=prompt)])
        result = _extract_json(resp.content)
        return {
            **state,
            "security_issues": result.get("issues", []),
            "positive_aspects": state.get("positive_aspects", [])
            + result.get("positive_aspects", []),
            "current_node": "security",
        }
    except Exception:
        return {**state, "security_issues": [], "current_node": "security"}


async def quality_node(state: ReviewState) -> ReviewState:
    pr_data = state.get("pr_data") or {}
    diff = (pr_data.get("diff_content") or "No diff available")[:25000]
    llm = _get_llm()

    if not llm:
        return {**state, "quality_issues": [], "current_node": "quality"}

    prompt = f"""Analyze this code diff for code quality issues.
Return ONLY a valid JSON object — no markdown, no explanation.

JSON structure:
{{
  "issues": [
    {{
      "severity": "critical|high|medium|low",
      "category": "quality",
      "title": "Short title",
      "description": "Detailed description",
      "file": "path/to/file",
      "line": "line number or range",
      "suggestion": "How to improve"
    }}
  ],
  "positive_aspects": ["strength1", "strength2"]
}}

Check for: poor naming, high cyclomatic complexity, code duplication,
missing error handling, dead code, missing tests, SOLID violations,
overly long functions, magic numbers, inconsistent style.

PR Title: {pr_data.get("title", "N/A")}

Diff:
{diff}"""

    try:
        resp = await llm.ainvoke([HumanMessage(content=prompt)])
        result = _extract_json(resp.content)
        return {
            **state,
            "quality_issues": result.get("issues", []),
            "positive_aspects": state.get("positive_aspects", [])
            + result.get("positive_aspects", []),
            "current_node": "quality",
        }
    except Exception:
        return {**state, "quality_issues": [], "current_node": "quality"}


async def performance_node(state: ReviewState) -> ReviewState:
    pr_data = state.get("pr_data") or {}
    diff = (pr_data.get("diff_content") or "No diff available")[:25000]
    llm = _get_llm()

    if not llm:
        return {**state, "performance_issues": [], "current_node": "performance"}

    prompt = f"""Analyze this code diff for performance issues.
Return ONLY a valid JSON object — no markdown, no explanation.

JSON structure:
{{
  "issues": [
    {{
      "severity": "critical|high|medium|low",
      "category": "performance",
      "title": "Short title",
      "description": "Detailed description",
      "file": "path/to/file",
      "line": "line number or range",
      "suggestion": "How to optimize"
    }}
  ],
  "positive_aspects": ["strength1", "strength2"]
}}

Check for: N+1 database queries, missing indexes, O(n²)+ algorithms,
unnecessary loops, redundant computations, memory leaks, blocking I/O,
missing caching, unoptimized database queries, large payload transfers.

PR Title: {pr_data.get("title", "N/A")}

Diff:
{diff}"""

    try:
        resp = await llm.ainvoke([HumanMessage(content=prompt)])
        result = _extract_json(resp.content)
        return {
            **state,
            "performance_issues": result.get("issues", []),
            "positive_aspects": state.get("positive_aspects", [])
            + result.get("positive_aspects", []),
            "current_node": "performance",
        }
    except Exception:
        return {**state, "performance_issues": [], "current_node": "performance"}


async def summary_node(state: ReviewState) -> ReviewState:
    pr_data = state.get("pr_data") or {}
    sec = state.get("security_issues", [])
    qual = state.get("quality_issues", [])
    perf = state.get("performance_issues", [])
    positives = state.get("positive_aspects", [])

    score = _calculate_score(sec, qual, perf)
    verdict = _determine_verdict(score, sec)

    llm = _get_llm()

    if not llm:
        return {
            **state,
            "summary": (
                f"Review complete. Found {len(sec)} security, "
                f"{len(qual)} quality, and {len(perf)} performance issues."
            ),
            "verdict": verdict,
            "overall_score": score,
            "current_node": "summary",
        }

    prompt = f"""Generate a comprehensive code review summary.
Return ONLY a valid JSON object — no markdown, no explanation.

JSON structure:
{{
  "summary": "2-3 paragraph comprehensive summary of the PR review"
}}

PR Details:
- Title: {pr_data.get("title", "N/A")}
- Author: {pr_data.get("author", "N/A")}
- Files Changed: {pr_data.get("files_changed", 0)}
- +{pr_data.get("additions", 0)} / -{pr_data.get("deletions", 0)} lines

Analysis Results:
- Overall Score: {score}/10  |  Verdict: {verdict}
- Security issues: {len(sec)}  |  Quality issues: {len(qual)}  |  Performance issues: {len(perf)}

Top Security Issues: {json.dumps(sec[:3])}
Top Quality Issues: {json.dumps(qual[:3])}
Top Performance Issues: {json.dumps(perf[:3])}
Positive Aspects: {json.dumps(positives[:8])}"""

    try:
        resp = await llm.ainvoke([HumanMessage(content=prompt)])
        result = _extract_json(resp.content)
        summary = result.get(
            "summary",
            f"Review complete. Score: {score}/10. Verdict: {verdict}.",
        )
    except Exception:
        summary = (
            f"Review complete. Found {len(sec)} security, "
            f"{len(qual)} quality, and {len(perf)} performance issues. "
            f"Overall score: {score}/10."
        )

    return {
        **state,
        "summary": summary,
        "verdict": verdict,
        "overall_score": score,
        "current_node": "summary",
    }
