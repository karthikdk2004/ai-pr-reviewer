import json
import os
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from app.agent.graph import build_graph  # noqa: E402

app = FastAPI(title="PR Reviewer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REVIEWS_FILE = Path(__file__).parent.parent / "data" / "reviews.json"


def _load() -> list:
    try:
        return json.loads(REVIEWS_FILE.read_text())
    except Exception:
        return []


def _save(reviews: list) -> None:
    REVIEWS_FILE.parent.mkdir(parents=True, exist_ok=True)
    REVIEWS_FILE.write_text(json.dumps(reviews, indent=2))


# ── Models ───────────────────────────────────────────────────────────────────

class ReviewRequest(BaseModel):
    pr_url: str


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "1.0.0",
        "groq_configured": bool(os.getenv("GROQ_API_KEY")),
        "github_token": bool(os.getenv("GITHUB_TOKEN")),
    }


@app.post("/review")
async def create_review(req: ReviewRequest):
    start = time.time()
    graph = build_graph()

    initial = {
        "pr_url": req.pr_url,
        "pr_data": None,
        "security_issues": [],
        "quality_issues": [],
        "performance_issues": [],
        "positive_aspects": [],
        "summary": "",
        "verdict": "COMMENT",
        "overall_score": 5.0,
        "error": None,
        "current_node": "start",
    }

    result = await graph.ainvoke(initial)

    if result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])

    pr = result.get("pr_data") or {}
    review = {
        "id": str(uuid.uuid4()),
        "pr_url": req.pr_url,
        "pr_title": pr.get("title", "Unknown PR"),
        "pr_author": pr.get("author", "unknown"),
        "author_avatar": pr.get("author_avatar", ""),
        "repo": pr.get("repo", ""),
        "base_branch": pr.get("base_branch", "main"),
        "head_branch": pr.get("head_branch", "feature"),
        "files_changed": pr.get("files_changed", 0),
        "additions": pr.get("additions", 0),
        "deletions": pr.get("deletions", 0),
        "verdict": result.get("verdict", "COMMENT"),
        "overall_score": result.get("overall_score", 5.0),
        "summary": result.get("summary", ""),
        "security_issues": result.get("security_issues", []),
        "quality_issues": result.get("quality_issues", []),
        "performance_issues": result.get("performance_issues", []),
        "positive_aspects": result.get("positive_aspects", []),
        "review_time_seconds": round(time.time() - start, 1),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    reviews = _load()
    reviews.insert(0, review)
    _save(reviews[:200])  # keep last 200

    return review


@app.get("/reviews")
async def list_reviews():
    return _load()


@app.get("/reviews/{review_id}")
async def get_review(review_id: str):
    for r in _load():
        if r["id"] == review_id:
            return r
    raise HTTPException(status_code=404, detail="Review not found")


@app.delete("/reviews/{review_id}")
async def delete_review(review_id: str):
    reviews = [r for r in _load() if r["id"] != review_id]
    _save(reviews)
    return {"message": "deleted"}
