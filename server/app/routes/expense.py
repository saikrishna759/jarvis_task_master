# server/app/routes/expense.py

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from app.services.expense_service import create_link_token, exchange_public_token, fetch_transactions, get_access_token_for_user


router = APIRouter()

class ExchangeTokenRequest(BaseModel):
    public_token: str
    user_id: int
    
class TransactionsRequest(BaseModel):
    access_token: str

    

@router.get("/link-token")
def get_link_token(user_id: str = "default-user"):
    try:
        return create_link_token(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/exchange-token")
async def exchange_token(request: Request):
    try:
        body = await request.json()
        public_token = body.get("public_token")
        print("📨 Received Public Token:", public_token)

        if not public_token:
            return {"status": "error", "message": "Missing public_token"}

        exchange_response = exchange_public_token(public_token,body.get("user_id"))
        access_token = exchange_response.get("access_token")
        print("✅ Access Token:", access_token)

        # # Store the token in your in-memory store or DB
        # # For now, use default user
        # from app.services.expense_service import access_token_store
        # access_token_store["default-user"] = access_token

        return {"status": "success", "access_token": access_token}

    except Exception as e:
        print("❌ Error in exchange_token:", str(e))
        return {"status": "error", "message": str(e)}

@router.post("/transactions")
def get_transactions(body: TransactionsRequest):
    try:
        access_token = body.access_token
        if not access_token:
            raise HTTPException(status_code=400, detail="Missing access token")
        return fetch_transactions(access_token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
