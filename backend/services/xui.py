"""
x-ui panel API client.

STUB: This file is a placeholder. On the VPS, replace with:
  cp ~/vpn-bot/services/xui.py ~/shine-app/backend/services/xui.py

Expected functions based on vpn-bot architecture:
  - get_client_config(tg_user_id: int) -> str | None  (returns VLESS URL)
  - get_inbound_clients() -> list[dict]

Environment variables used (to be verified from actual xui.py):
  XUI_BASE_URL   - x-ui panel URL, e.g. http://127.0.0.1:21008
  XUI_PASSWORD   - x-ui admin password
  XUI_INBOUND_ID - inbound ID for VPN clients (default: 2)

Deploy command:
  ssh root@205.172.56.163 "cp ~/vpn-bot/services/xui.py ~/shine-app/backend/services/xui.py"
"""
import os
import requests

XUI_BASE_URL = os.environ.get("XUI_BASE_URL", "http://127.0.0.1:21008")
XUI_PASSWORD = os.environ.get("XUI_PASSWORD", "")
XUI_INBOUND_ID = int(os.environ.get("XUI_INBOUND_ID", "2"))

# Session for authenticated requests
_session = None


def _get_session() -> requests.Session:
    """Get or create authenticated session to x-ui panel."""
    global _session
    if _session is None:
        _session = requests.Session()
        resp = _session.post(
            f"{XUI_BASE_URL}/login",
            json={"username": "admin", "password": XUI_PASSWORD},
            timeout=10,
        )
        resp.raise_for_status()
    return _session


def get_inbound_clients() -> list:
    """
    Fetch all clients for the configured inbound.

    STUB: Replace with actual implementation from ~/vpn-bot/services/xui.py
    """
    session = _get_session()
    resp = session.get(
        f"{XUI_BASE_URL}/xui/inbound/list",
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()
    if not data.get("success"):
        return []

    inbounds = data.get("obj", [])
    for inbound in inbounds:
        if inbound.get("id") == XUI_INBOUND_ID:
            import json
            return json.loads(inbound.get("clientStats") or "[]")
    return []


def get_client_config(tg_user_id: int) -> str | None:
    """
    Get VLESS URL for a client by Telegram user ID.
    Returns VLESS URL string or None if not found.

    STUB: Replace with actual implementation from ~/vpn-bot/services/xui.py
    The actual vpn-bot likely stores tg_user_id in client remark/email field.
    """
    session = _get_session()
    resp = session.get(
        f"{XUI_BASE_URL}/xui/inbound/list",
        timeout=10,
    )
    resp.raise_for_status()
    data = resp.json()
    if not data.get("success"):
        return None

    inbounds = data.get("obj", [])
    for inbound in inbounds:
        if inbound.get("id") == XUI_INBOUND_ID:
            import json
            clients = json.loads(inbound.get("settings") or '{"clients":[]}')
            stream_settings = json.loads(inbound.get("streamSettings") or "{}")

            for client in clients.get("clients", []):
                # vpn-bot likely uses tg_user_id as client email or remark
                client_email = str(client.get("email", ""))
                client_remark = str(client.get("remark", ""))
                if str(tg_user_id) in (client_email, client_remark):
                    client_id = client.get("id", "")
                    port = inbound.get("port", 8443)
                    # Build VLESS URL
                    domain = "shineee.space"
                    # STUB: exact URL format depends on actual xui.py
                    vless_url = (
                        f"vless://{client_id}@{domain}:{port}"
                        f"?type=xhttp&security=tls&sni={domain}"
                        f"#{client_email}"
                    )
                    return vless_url
    return None
