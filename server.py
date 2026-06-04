"""
server.py — 塞尔达三试炼 排行榜后端
运行方式: python server.py
依赖: pip install fastapi uvicorn
"""

import sqlite3
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="塞尔达三试炼 排行榜")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Railway 的文件系统只有 /tmp 可写；本地开发则放在脚本同目录
_base = "/tmp" if os.environ.get("RAILWAY_ENVIRONMENT") else os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(_base, "scores.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                name       TEXT    NOT NULL,
                score      INTEGER NOT NULL,
                created_at TEXT    NOT NULL
            )
        """)
        conn.commit()


init_db()  # 启动时立即初始化（uvicorn 直接调用也生效）


class ScoreIn(BaseModel):
    name: str
    score: int


@app.post("/scores", status_code=201)
def create_score(data: ScoreIn):
    if not data.name.strip():
        raise HTTPException(status_code=400, detail="名字不能为空")
    if data.score < 0:
        raise HTTPException(status_code=400, detail="分数无效")
    now = datetime.utcnow().isoformat()
    with get_db() as conn:
        conn.execute(
            "INSERT INTO scores (name, score, created_at) VALUES (?, ?, ?)",
            (data.name.strip()[:16], data.score, now)
        )
        conn.commit()
    return {"ok": True}


@app.get("/scores")
def get_scores():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT name, score, created_at FROM scores ORDER BY score DESC LIMIT 10"
        ).fetchall()
    return [dict(r) for r in rows]


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 8000))
    print("=" * 50)
    print("  塞尔达三试炼 排行榜服务器已启动")
    print(f"  地址: http://localhost:{port}")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=port)
