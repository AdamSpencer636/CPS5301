from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
#import crud  # CRUD functions
#import schema  # Pydantic models
#import models  # SQLAlchemy models
from review_backend import models, schema, crud  # Explicit absolute imports
from review_backend.database import SessionLocal, engine
from typing import List
import logging

# Initialize FastAPI and database
models.Base.metadata.create_all(bind=engine)
logger = logging.getLogger(__name__)
app = FastAPI()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------------------------
# STORE ENDPOINTS
# ------------------------------------
@app.post("/stores/", response_model=schema.Store)
def create_store(store: schema.StoreCreate, db: Session = Depends(get_db)):
    return schema.Store.from_orm(crud.create_store(db=db, store=store))


@app.get("/stores/", response_model=List[schema.Store])
def read_stores(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    stores = crud.get_stores(db, skip=skip, limit=limit)
    return [schema.Store.from_orm(store) for store in stores]


@app.get("/stores/{store_id}", response_model=schema.Store)
def read_store(store_id: int, db: Session = Depends(get_db)):
    store = crud.get_store(db, store_id=store_id)
    if store is None:
        raise HTTPException(status_code=404, detail="Store not found")
    return schema.Store.from_orm(store)


# ------------------------------------
# PRODUCT ENDPOINTS
# ------------------------------------
@app.post("/products/", response_model=schema.Product)
def create_product(product: schema.ProductCreate, db: Session = Depends(get_db)):
    return schema.Product.from_orm(crud.create_product(db=db, product=product))


@app.get("/products/", response_model=List[schema.Product])
def read_products(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    products = crud.get_products(db, skip=skip, limit=limit)
    return [schema.Product.from_orm(product) for product in products]


@app.get("/products/{product_id}", response_model=schema.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id=product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return schema.Product.from_orm(product)


@app.get("/products/search/", response_model=List[schema.Product])
def search_products(search: str, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    products = crud.search_products(db, search=search, skip=skip, limit=limit)
    if not products:
        raise HTTPException(status_code=404, detail="No products match your search criteria")
    return [schema.Product.from_orm(product) for product in products]


# ------------------------------------
# CART ENDPOINTS
# ------------------------------------
@app.post("/carts/", response_model=schema.Cart)
def create_cart(cart: schema.CartCreate, db: Session = Depends(get_db)):
    return schema.Cart.from_orm(crud.create_cart(db=db, cart=cart))


@app.get("/carts/", response_model=List[schema.Cart])
def read_carts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    carts = crud.get_carts(db, skip=skip, limit=limit)
    return [schema.Cart.from_orm(cart) for cart in carts]


@app.get("/carts/{cart_id}", response_model=schema.Cart)
def read_cart(cart_id: int, db: Session = Depends(get_db)):
    cart = crud.get_cart(db, cart_id=cart_id)
    if cart is None:
        raise HTTPException(status_code=404, detail="Cart not found")
    return schema.Cart.from_orm(cart)


@app.put("/carts/{cart_id}/", response_model=schema.Cart)
def update_cart(cart_id: int, cart_update: schema.CartUpdate, db: Session = Depends(get_db)):
    updated_cart = crud.update_cart_total(db, cart_id=cart_id, cart_total=cart_update.cart_total)
    if updated_cart is None:
        raise HTTPException(status_code=404, detail="Cart not found")
    return schema.Cart.from_orm(updated_cart)


@app.get("/carts/all/", response_model=List[schema.Cart])
def read_all_carts(db: Session = Depends(get_db)):
    carts = crud.get_all_carts(db)
    return [schema.Cart.from_orm(cart) for cart in carts]


# ------------------------------------
# PURCHASE ENDPOINTS
# ------------------------------------
@app.post("/purchases/", response_model=schema.Purchase)
def create_purchase(purchase: schema.PurchaseCreate, db: Session = Depends(get_db)):
    return schema.Purchase.from_orm(crud.create_purchase(db=db, purchase=purchase))


@app.get("/purchases/", response_model=List[schema.Purchase])
def read_purchases(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    purchases = crud.get_purchases(db, skip=skip, limit=limit)
    return [schema.Purchase.from_orm(purchase) for purchase in purchases]


@app.get("/purchases/{purchase_id}", response_model=schema.Purchase)
def read_purchase(purchase_id: int, db: Session = Depends(get_db)):
    purchase = crud.get_purchase_by_id(db, purchase_id=purchase_id)
    if purchase is None:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return schema.Purchase.from_orm(purchase)


@app.get("/purchases/cart/{cart_id}", response_model=List[schema.Purchase])
def read_purchases_by_cart(cart_id: int, db: Session = Depends(get_db)):
    purchases = crud.get_purchases_by_cart_id(db, cart_id=cart_id)
    if not purchases:
        raise HTTPException(status_code=404, detail="No purchases found for the specified cart")
    return [schema.Purchase.from_orm(purchase) for purchase in purchases]


@app.put("/purchases/{purchase_id}", response_model=schema.Purchase)
def update_purchase(purchase_id: int, purchase: schema.PurchaseUpdate, db: Session = Depends(get_db)):
    updated_purchase = crud.update_purchase(db, purchase_id=purchase_id, purchase=purchase)
    if updated_purchase is None:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return schema.Purchase.from_orm(updated_purchase)


@app.delete("/purchases/{purchase_id}", response_model=schema.Purchase)
def delete_purchase(purchase_id: int, db: Session = Depends(get_db)):
    deleted_purchase = crud.delete_purchase(db, purchase_id=purchase_id)
    if deleted_purchase is None:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return schema.Purchase.from_orm(deleted_purchase)


# ------------------------------------
# USER ENDPOINTS
# ------------------------------------
@app.post("/users/", response_model=schema.User)
def create_user(user: schema.UserCreate, db: Session = Depends(get_db)):
    return schema.User.from_orm(crud.create_user(db=db, user=user))


@app.get("/users/{user_id}", response_model=schema.User)
def read_user(user_id: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_id(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return schema.User.from_orm(user)


# ------------------------------------
# PACKAGING OPTIONS ENDPOINTS
# ------------------------------------
@app.post("/packaging_options/", response_model=schema.PackagingOption)
def create_packaging_option(packaging_option: schema.PackagingOptionCreate, db: Session = Depends(get_db)):
    return schema.PackagingOption.from_orm(crud.create_packaging_option(db=db, packaging_option=packaging_option))


@app.get("/packaging_options/", response_model=List[schema.PackagingOption])
def read_packaging_options(db: Session = Depends(get_db)):
    options = crud.get_packaging_options(db)
    return [schema.PackagingOption.from_orm(option) for option in options]


@app.get("/packaging_options/{packaging_id}", response_model=schema.PackagingOption)
def read_packaging_option(packaging_id: int, db: Session = Depends(get_db)):
    packaging_option = crud.get_packaging_option_by_id(db, packaging_id=packaging_id)
    if packaging_option is None:
        raise HTTPException(status_code=404, detail="Packaging option not found")
    return schema.PackagingOption.from_orm(packaging_option)


# ------------------------------------
# UNITS OF MEASUREMENT ENDPOINTS
# ------------------------------------
@app.post("/units_of_measurement/", response_model=schema.UnitOfMeasurement)
def create_unit_of_measurement(unit_of_measurement: schema.UnitOfMeasurementCreate, db: Session = Depends(get_db)):
    return schema.UnitOfMeasurement.from_orm(crud.create_unit_of_measurement(db=db, unit_of_measurement=unit_of_measurement))


@app.get("/units_of_measurement/", response_model=List[schema.UnitOfMeasurement])
def read_units_of_measurement(db: Session = Depends(get_db)):
    units = crud.get_units_of_measurement(db)
    return [schema.UnitOfMeasurement.from_orm(unit) for unit in units]


@app.get("/units_of_measurement/{unit_id}", response_model=schema.UnitOfMeasurement)
def read_unit_of_measurement(unit_id: int, db: Session = Depends(get_db)):
    unit = crud.get_unit_of_measurement_by_id(db, unit_id=unit_id)
    if unit is None:
        raise HTTPException(status_code=404, detail="Unit of measurement not found")
    return schema.UnitOfMeasurement.from_orm(unit)


# ------------------------------------
# GROCERY LIST ENDPOINTS
# ------------------------------------
@app.post("/grocery_lists/", response_model=schema.GroceryList)
def create_grocery_list(grocery_list: schema.GroceryListCreate, db: Session = Depends(get_db)):
    return schema.GroceryList.from_orm(crud.create_grocery_list(db=db, grocery_list=grocery_list))


@app.get("/grocery_lists/{user_id}", response_model=List[schema.GroceryList])
def read_grocery_lists(user_id: str, db: Session = Depends(get_db)):
    lists = crud.get_grocery_lists(db=db, user_id=user_id)
    return [schema.GroceryList.from_orm(g_list) for g_list in lists]


@app.get("/grocery_lists/{list_id}/items/", response_model=List[schema.GroceryListItem])
def read_grocery_list_items(list_id: int, db: Session = Depends(get_db)):
    items = crud.get_grocery_list_items(db=db, list_id=list_id)
    return [schema.GroceryListItem.from_orm(item) for item in items]


@app.post("/grocery_lists/{list_id}/items/", response_model=schema.GroceryListItem)
def create_grocery_list_item(list_id: int, item: schema.GroceryListItemCreate, db: Session = Depends(get_db)):
    return schema.GroceryListItem.from_orm(crud.add_grocery_list_item(db=db, list_id=list_id, item=item))


@app.put("/grocery_lists/{list_id}/", response_model=schema.GroceryList)
def update_grocery_list(list_id: int, grocery_list: schema.GroceryListUpdate, db: Session = Depends(get_db)):
    updated_list = crud.update_grocery_list(db=db, list_id=list_id, list_update=grocery_list)
    if updated_list is None:
        raise HTTPException(status_code=404, detail="Grocery list not found")
    return schema.GroceryList.from_orm(updated_list)


@app.delete("/grocery_lists/{list_id}/", response_model=schema.GroceryList)
def delete_grocery_list(list_id: int, db: Session = Depends(get_db)):
    deleted_list = crud.delete_grocery_list(db=db, list_id=list_id)
    if deleted_list is None:
        raise HTTPException(status_code=404, detail="Grocery list not found")
    return schema.GroceryList.from_orm(deleted_list)
