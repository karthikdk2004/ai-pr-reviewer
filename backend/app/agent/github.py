import re
import httpx
import os
from typing import Dict, Any, List, Tuple


class GitHubClient:
    BASE_URL = "https://api.github.com"

    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN")
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "PR-Reviewer-Agent/1.0",
        }
        if self.token:
            self.headers["Authorization"] = f"token {self.token}"

    def parse_pr_url(self, url: str) -> Tuple[str, str, int]:
        patterns = [
            r"https?://github\.com/([^/]+)/([^/]+)/pull/(\d+)",
            r"github\.com/([^/]+)/([^/]+)/pull/(\d+)",
        ]
        for pattern in patterns:
            match = re.search(pattern, url.strip())
            if match:
                owner, repo, pr_number = match.groups()
                return owner, repo, int(pr_number)
        raise ValueError(
            f"Invalid GitHub PR URL: {url}\n"
            "Expected format: https://github.com/owner/repo/pull/123"
        )

    async def _get(self, url: str) -> Any:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, timeout=30.0)
            if response.status_code == 403:
                raise Exception(
                    "GitHub API rate limit exceeded. "
                    "Set GITHUB_TOKEN in .env for higher limits."
                )
            if response.status_code == 404:
                raise Exception(
                    "PR not found. Ensure the URL is correct and the repo is public."
                )
            response.raise_for_status()
            return response.json()

    async def fetch_pr_data(self, pr_url: str) -> Dict:
        owner, repo, pr_number = self.parse_pr_url(pr_url)

        pr = await self._get(
            f"{self.BASE_URL}/repos/{owner}/{repo}/pulls/{pr_number}"
        )
        files = await self._get(
            f"{self.BASE_URL}/repos/{owner}/{repo}/pulls/{pr_number}/files?per_page=100"
        )

        diff_content = ""
        files_summary: List[Dict] = []

        for f in files[:20]:
            files_summary.append(
                {
                    "filename": f["filename"],
                    "status": f["status"],
                    "additions": f.get("additions", 0),
                    "deletions": f.get("deletions", 0),
                    "changes": f.get("changes", 0),
                }
            )
            if "patch" in f and len(diff_content) < 40000:
                diff_content += f"\n\n### File: {f['filename']}\n{f['patch']}"

        return {
            "title": pr["title"],
            "description": pr.get("body") or "",
            "author": pr["user"]["login"],
            "author_avatar": pr["user"]["avatar_url"],
            "base_branch": pr["base"]["ref"],
            "head_branch": pr["head"]["ref"],
            "files_changed": pr.get("changed_files", len(files)),
            "additions": pr.get("additions", 0),
            "deletions": pr.get("deletions", 0),
            "files_summary": files_summary,
            "diff_content": diff_content,
            "pr_url": pr_url,
            "state": pr["state"],
            "created_at": pr["created_at"],
            "repo": f"{owner}/{repo}",
            "pr_number": pr_number,
        }
