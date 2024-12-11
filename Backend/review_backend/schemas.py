from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


### Store Schemas
class StoreCreate(BaseModel):
    store_name: str
    store_location: str


class Store(BaseModel):
    store_id: int
    store_name: str
    store_location: str

    class Config:
        from_attributes = True  # Replaces orm_mode for Pydantic v2


### Product Schemas
class ProductCreate(BaseModel):
    product_brand: str
    product_name: str
    product_quantity: float
    product_packaging: str
    unit_quantity: float
    unit_of_measurement: str


class Product(BaseModel):
    product_id: int
    product_brand: str
    product_name: str
    product_quantity: float
    product_packaging: str
    unit_quantity: float
    unit_of_measurement: str

    class Config:
        from_attributes = True


### Cart Schemas
class CartCreate(BaseModel):
    purchase_date: date
    cart_total: float
    user_id: str
    store_id: int


class Cart(BaseModel):
    cart_id: int
    purchase_date: date
    cart_total: float
    user_id: str
    store_id: int

    class Config:
        from_attributes = True


class CartUpdate(BaseModel):
    cart_total: float


class CartResponse(BaseModel):
    cart_id: int
    cart_total: float

    class Config:
        from_attributes = True


### Purchase Schemas
class PurchaseCreate(BaseModel):
    product_id: int
    cart_id: int
    product_price: float
    product_quantity: int
    on_sale: bool
    store_id: int
    product_category: str
    purchased: bool
    input_date: datetime


class Purchase(BaseModel):
    purchase_id: int
    product_id: int
    cart_id: int
    product_price: float
    product_quantity: int
    on_sale: bool
    store_id: int
    product_category: str
    purchased: bool
    input_date: datetime

    class Config:
        from_attributes = True


class PurchaseUpdate(BaseModel):
    product_price: Optional[float]
    product_quantity: Optional[int]
    on_sale: Optional[bool]
    product_category: Optional[str]
    purchased: Optional[bool]
    input_date: Optional[datetime]

    class Config:
        from_attributes = True


### User Schemas
class UserCreate(BaseModel):
    user_id: str


class User(BaseModel):
    user_id: str

    class Config:
        from_attributes = True


### Grocery List Schemas
class GroceryListCreate(BaseModel):
    name: str
    user_id: str


class GroceryListUpdate(BaseModel):
    name: str


class GroceryList(BaseModel):
    list_id: int
    name: str
    user_id: str

    class Config:
        from_attributes = True


### Grocery List Item Schemas
class GroceryListItemCreate(BaseModel):
    grocery_list_id: int
    product_id: int
    product_quantity: Optional[float] = 1.0
    unit_quantity: Optional[float] = 1.0
    unit_of_measurement: Optional[str] = None
    packaging: Optional[str] = None
    unit_price: Optional[float] = None
    total: Optional[float] = None
    notes: Optional[str] = None


class GroceryListItem(BaseModel):
    item_id: int
    grocery_list_id: int
    product_id: int
    product_quantity: Optional[float] = 1.0
    unit_quantity: Optional[float] = 1.0
    unit_of_measurement: Optional[str] = None
    packaging: Optional[str] = None
    unit_price: Optional[float] = None
    total: Optional[float] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


### Packaging Option Schemas
class PackagingOptionCreate(BaseModel):
    packaging_type: str


class PackagingOption(BaseModel):
    id: int
    packaging_type: str

    class Config:
        from_attributes = True


### Unit of Measurement Schemas
class UnitOfMeasurementCreate(BaseModel):
    unit_name: str


class UnitOfMeasurement(BaseModel):
    id: int
    unit_name: str

    class Config:
        from_attributes = True
