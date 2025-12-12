from contextvars import ContextVar

transform_user_id = ContextVar("transform_user_id", default="guest")
