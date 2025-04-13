# server/app/controllers/expense_controller.py

from app.services.expense_service import (
    create_link_token,
    exchange_public_token,
    fetch_transactions
)

async def get_plaid_link_token(user_id: str = "default-user"):
    user_id = "default-user"
    return create_link_token(user_id)

async def post_exchange_token(public_token: str, user_id: str = "default-user"):
    user_id = "default-user"
    return exchange_public_token(public_token, user_id)

async def get_user_expenses(user_id: str = "default-user"):
    return fetch_transactions(user_id)
