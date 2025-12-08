from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import qrcode
import io
import databases
from sqlalchemy import create_engine
from models import metadata, customers
from pydantic import BaseModel

# -----------------------------
# Pydantic model for request
# -----------------------------
class CustomerCreate(BaseModel):
    company_name: str
    first_name: str
    last_name: str
    address: str = ""
    city: str = ""
    state: str = ""
    zip_code: str = ""
    phone_number: str = ""
    qr_url: str

# -----------------------------
# Database setup
# -----------------------------
DATABASE_URL = "sqlite:///./customers.db"

database = databases.Database(DATABASE_URL)
engine = create_engine(DATABASE_URL)
metadata.create_all(engine)

# -----------------------------
# FastAPI app and CORS
# -----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend from any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Startup / shutdown events
# -----------------------------
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# -----------------------------
# Test endpoint
# -----------------------------
@app.get("/")
def read_root():
    return {"message": "QR API is running!"}

# -----------------------------
# QR code generator endpoint
# -----------------------------
@app.get("/api/qrcode")
def generate_qr(text: str):
    qr_img = qrcode.make(text)
    buf = io.BytesIO()
    qr_img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

# -----------------------------
# Create customer endpoint
# -----------------------------
@app.post("/api/customers")
async def create_customer(customer: CustomerCreate):
    query = customers.insert().values(**customer.dict())
    customer_id = await database.execute(query)
    return {"id": customer_id, "message": "Customer saved!"}

# -----------------------------
# Search customers endpoint
# -----------------------------
@app.get("/api/customers/search")
async def search_customers(
    company_name: str = Query(None),
    first_name: str = Query(None),
    last_name: str = Query(None),
    city: str = Query(None),
    state: str = Query(None),
):
    query = customers.select()
    if company_name:
        query = query.where(customers.c.company_name.ilike(f"%{company_name}%"))
    if first_name:
        query = query.where(customers.c.first_name.ilike(f"%{first_name}%"))
    if last_name:
        query = query.where(customers.c.last_name.ilike(f"%{last_name}%"))
    if city:
        query = query.where(customers.c.city.ilike(f"%{city}%"))
    if state:
        query = query.where(customers.c.state.ilike(f"%{state}%"))

    results = await database.fetch_all(query)
    return results
