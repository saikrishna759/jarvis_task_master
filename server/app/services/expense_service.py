# server/app/services/expense_service.py

from plaid.api import plaid_api
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from plaid.configuration import Configuration
from plaid.api_client import ApiClient
from plaid.exceptions import ApiException 
from fastapi import HTTPException
from datetime import date, timedelta
from app.config import PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV

# In-memory store: user_id -> access_token (for demo purposes)
access_token_store = {}

# Setup Plaid client
configuration = Configuration(
    host=f"https://{PLAID_ENV}.plaid.com",
    api_key={
        'clientId': PLAID_CLIENT_ID,
        'secret': PLAID_SECRET
    }
)
api_client = ApiClient(configuration)
plaid_client = plaid_api.PlaidApi(api_client)

def create_link_token(user_id: str):
    request = LinkTokenCreateRequest(
        user=LinkTokenCreateRequestUser(client_user_id=user_id),
        client_name="Jarvis Expense Tracker",
        products=[Products("transactions")],
        country_codes=[CountryCode("US")],
        language="en"
    )
    response = plaid_client.link_token_create(request)
    return response.to_dict()

def exchange_public_token(public_token: str, user_id: str):
    request = ItemPublicTokenExchangeRequest(public_token=public_token)
    response = plaid_client.item_public_token_exchange(request)
    access_token = response.access_token
    access_token_store[user_id] = access_token  # Save token
    print(f"🔐 Stored token for {user_id}: {access_token}")
    return {"access_token": access_token}

def get_access_token_for_user(user_id: str):
    return access_token_store.get(user_id)

def store_access_token(user_id: str, access_token: str):
    print(f"✅ Storing token for user {user_id}: {access_token}")
    access_token_store[user_id] = access_token

def fetch_transactions(access_token: str):
    start_date = date.today() - timedelta(days=30)
    end_date = date.today()

    request = TransactionsGetRequest(
        access_token=access_token,
        start_date=start_date,
        end_date=end_date,
        options=TransactionsGetRequestOptions(count=10, offset=0)
    )

    response = plaid_client.transactions_get(request)
    return response.to_dict()
