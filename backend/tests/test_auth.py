import hashlib
import hmac
import json
import os
import time
import urllib.parse

import pytest
from fastapi import HTTPException
from unittest.mock import patch


def make_init_data(bot_token: str, user_id: int = 123456789, age_seconds: int = 0) -> str:
    """Generate valid initData for testing."""
    auth_date = int(time.time()) - age_seconds
    user = json.dumps({"id": user_id, "first_name": "Test", "is_bot": False})
    params = {
        "auth_date": str(auth_date),
        "user": user,
    }
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(params.items()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    params["hash"] = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()
    return urllib.parse.urlencode(params)


@patch.dict(os.environ, {"BOT_TOKEN": "test_bot_token_123"})
def test_valid_init_data():
    from auth import validate_init_data
    init_data = make_init_data("test_bot_token_123")
    result = validate_init_data(x_telegram_init_data=init_data)
    assert result["id"] == 123456789
    assert result["first_name"] == "Test"


@patch.dict(os.environ, {"BOT_TOKEN": "test_bot_token_123"})
def test_missing_hash():
    from auth import validate_init_data
    with pytest.raises(HTTPException) as exc:
        validate_init_data(x_telegram_init_data="auth_date=1234567890&user=%7B%7D")
    assert exc.value.status_code == 401
    assert "Missing hash" in exc.value.detail


@patch.dict(os.environ, {"BOT_TOKEN": "test_bot_token_123"})
def test_invalid_signature():
    from auth import validate_init_data
    init_data = make_init_data("test_bot_token_123")
    tampered = init_data.replace("hash=", "hash=tampered")
    with pytest.raises(HTTPException) as exc:
        validate_init_data(x_telegram_init_data=tampered)
    assert exc.value.status_code == 401
    assert "Invalid initData signature" in exc.value.detail


@patch.dict(os.environ, {"BOT_TOKEN": "test_bot_token_123"})
def test_expired_init_data():
    from auth import validate_init_data
    # 25 hours ago
    init_data = make_init_data("test_bot_token_123", age_seconds=90000)
    with pytest.raises(HTTPException) as exc:
        validate_init_data(x_telegram_init_data=init_data)
    assert exc.value.status_code == 401
    assert "expired" in exc.value.detail


@patch.dict(os.environ, {"BOT_TOKEN": "test_bot_token_123"})
def test_url_encoded_init_data():
    """initData may be URL-encoded — must decode correctly."""
    from auth import validate_init_data
    init_data = make_init_data("test_bot_token_123")
    double_encoded = urllib.parse.quote(init_data)
    result = validate_init_data(x_telegram_init_data=double_encoded)
    assert result["id"] == 123456789
