"""
Integration tests for API routers: /api/health, /api/me, /api/config.

These tests use FastAPI TestClient (ASGI, no real HTTP) and mock services.
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_no_auth():
    """GET /api/health не требует авторизации (API-03)"""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_me_missing_header():
    """GET /api/me без заголовка → 422 (FastAPI missing required header)"""
    resp = client.get("/api/me")
    assert resp.status_code == 422


def test_me_invalid_init_data():
    """GET /api/me с мусором в заголовке → 401"""
    resp = client.get("/api/me", headers={"X-Telegram-Init-Data": "garbage=data&hash=fakehash"})
    assert resp.status_code == 401


def test_config_invalid_init_data():
    """GET /api/config с невалидным initData → 401"""
    resp = client.get("/api/config", headers={"X-Telegram-Init-Data": "garbage=data&hash=fakehash"})
    assert resp.status_code == 401


def test_docs_available():
    """GET /docs возвращает 200 (Swagger UI, API-05)"""
    resp = client.get("/docs")
    assert resp.status_code == 200


def test_openapi_schema():
    """GET /openapi.json содержит все три endpoints"""
    resp = client.get("/openapi.json")
    assert resp.status_code == 200
    schema = resp.json()
    paths = schema.get("paths", {})
    assert "/api/health" in paths
    assert "/api/me" in paths
    assert "/api/config" in paths
