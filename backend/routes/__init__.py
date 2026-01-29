# Routes package
from .public import router as public_router
from .contacts import router as contacts_router
from .auth import router as auth_router
from .admin import router as admin_router
from .chat import router as chat_router

__all__ = [
    'public_router',
    'contacts_router', 
    'auth_router',
    'admin_router',
    'chat_router'
]
