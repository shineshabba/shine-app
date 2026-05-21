import aiohttp
import logging
import os
import json
from typing import Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT = aiohttp.ClientTimeout(total=15)


class XUIClient:
    def __init__(self):
        self.host = os.getenv("XUI_HOST")
        self.base_path = os.getenv("XUI_BASE_PATH", "")
        self.username = os.getenv("XUI_USERNAME")
        self.password = os.getenv("XUI_PASSWORD")
        self.inbound_id = int(os.getenv("XUI_INBOUND_ID", "1"))
        self._session: Optional[aiohttp.ClientSession] = None
        self._cookies = None
        self._ssl = False

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            connector = aiohttp.TCPConnector(ssl=False)
            self._session = aiohttp.ClientSession(connector=connector)
        return self._session

    async def login(self) -> bool:
        session = await self._get_session()
        try:
            resp = await session.post(
                f"{self.host}{self.base_path}/login",
                data={"username": self.username, "password": self.password},
                allow_redirects=False
            )
            if resp.status in (200, 302):
                self._cookies = resp.cookies
                return True
            return False
        except Exception:
            return False

    async def _request(self, method: str, path: str, **kwargs):
        kwargs.setdefault("timeout", DEFAULT_TIMEOUT)
        if not self._cookies:
            ok = await self.login()
            if not ok:
                raise RuntimeError("XUI login failed — check credentials")
        session = await self._get_session()
        resp = await session.request(
            method,
            f"{self.host}{self.base_path}{path}",
            cookies=self._cookies,
            **kwargs
        )
        if resp.status == 401:
            # Session expired — re-auth once
            self._cookies = None
            ok = await self.login()
            if not ok:
                raise RuntimeError("XUI re-login failed")
            resp = await session.request(method, f"{self.host}{self.base_path}{path}", cookies=self._cookies, **kwargs)
        try:
            return await resp.json(content_type=None)
        except Exception:
            logger.error("XUI returned non-JSON response: status=%s", resp.status)
            return None

    async def is_alive(self) -> bool:
        """Check if 3X-UI panel is reachable."""
        session = await self._get_session()
        try:
            resp = await session.get(f"{self.host}{self.base_path}/", timeout=aiohttp.ClientTimeout(total=5))
            return resp.status < 500
        except Exception:
            return False

    async def get_inbound(self) -> Optional[dict]:
        """Get inbound config by ID."""
        data = await self._request("GET", f"/panel/api/inbounds/get/{self.inbound_id}")
        if data.get("success"):
            return data.get("obj")
        return None

    async def add_client(self, user_id: int, username: str) -> Optional[dict]:
        """Create a new client in the inbound and return their config."""
        import uuid
        client_id = str(uuid.uuid4())
        email = f"tg_{user_id}_{username}"

        inbound = await self.get_inbound()
        if not inbound:
            return None

        # Parse existing settings
        settings = json.loads(inbound.get("settings", "{}"))
        clients = settings.get("clients", [])

        new_client = {
            "id": client_id,
            "email": email,
            "enable": True,
            "expiryTime": 0,
            "totalGB": 0,
            "limitIp": 5,
            "tgId": str(user_id),
            "subId": "",
            "comment": f"Telegram user @{username}"
        }
        clients.append(new_client)
        settings["clients"] = clients

        payload = {
            "id": self.inbound_id,
            "settings": json.dumps({"clients": [new_client]})
        }

        result = await self._request("POST", "/panel/api/inbounds/addClient", json=payload)
        if result.get("success"):
            return {"client_id": client_id, "email": email, "inbound": inbound}
        return None

    async def get_client_config(self, user_id: int, username: str) -> Optional[dict]:
        """Get existing client config or create new one."""
        inbound = await self.get_inbound()
        if not inbound:
            return None

        settings = json.loads(inbound.get("settings", "{}"))
        clients = settings.get("clients", [])
        email = f"tg_{user_id}_{username}"

        existing = next((c for c in clients if c.get("email") == email), None)

        if existing:
            return {"client_id": existing["id"], "email": email, "inbound": inbound}

        return await self.add_client(user_id, username)

    def build_vless_link(self, client_id: str, inbound: dict) -> str:
        """Build a VLESS share link from inbound config."""
        from urllib.parse import quote
        stream_settings = json.loads(inbound.get("streamSettings", "{}"))
        network = stream_settings.get("network", "tcp")
        security = stream_settings.get("security", inbound.get("tls", "none"))
        port = inbound.get("port", 443)
        host = os.getenv("XUI_SERVER_HOST") or urlparse(os.getenv("XUI_HOST", "")).hostname or ""

        params = f"type={network}&security={security}"

        if security == "reality":
            reality_settings = stream_settings.get("realitySettings", {})
            server_names = reality_settings.get("serverNames", [""])
            short_ids = reality_settings.get("shortIds", [""])
            public_key = reality_settings.get("settings", {}).get("publicKey", "")
            params += f"&sni={server_names[0]}&pbk={public_key}&sid={short_ids[0]}&fp=chrome"
        elif network == "xhttp":
            xhttp = stream_settings.get("xhttpSettings", {})
            tls = stream_settings.get("tlsSettings", {})
            sni = tls.get("serverName", host)
            path = quote(xhttp.get("path", "/"), safe="")
            xhost = xhttp.get("host", sni)
            params += f"&sni={sni}&host={xhost}&path={path}&fp=chrome&encryption=none"

        remark = "ShineVPN"
        link = f"vless://{client_id}@{host}:{port}?{params}#{remark}"
        return link

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()


xui = XUIClient()
