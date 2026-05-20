"""
Shared slowapi rate limiter instance.

Defined in a separate module to avoid circular imports between
main.py (which imports routers) and routers (which need the limiter).

Usage:
    from limiter import limiter
"""
from slowapi import Limiter
from auth import get_user_id_for_limiter

limiter = Limiter(key_func=get_user_id_for_limiter)
