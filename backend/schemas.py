from pydantic import BaseModel

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
