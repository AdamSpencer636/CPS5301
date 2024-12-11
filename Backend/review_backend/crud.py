from sqlalchemy.orm import Session
from fastapi import HTTPException
from review_backend import schemas, models
import logging

logger = logging.getLogger(__name__)

# ------------------------------------
# STORE FUNCTIONS
# ------------------------------------
def get_store(db: Session, store_id: int):
    return db.query(models.Store).filter(models.Store.store_id == store_id).first()


def get_store_by_name(db: Session, store_name: str):
    return db.query(models.Store).filter(models.Store.store_name == store_name).first()


def get_stores(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Store).offset(skip).limit(limit).all()


def create_store(db: Session, store: schemas.StoreCreate):
    db_store = models.Store(
        store_name=store.store_name,
        store_location=store.store_location
    )
    db.add(db_store)
    try:
        db.commit()
        db.refresh(db_store)
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating store: {e}")
        raise e
    return db_store

# ------------------------------------
# PRODUCT FUNCTIONS
# ------------------------------------
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.product_id == product_id).first()


def get_products(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Product).offset(skip).limit(limit).all()


def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(
        product_brand=product.product_brand,
        product_name=product.product_name,
        product_quantity=product.product_quantity,
        product_packaging=product.product_packaging,
        unit_quantity=product.unit_quantity,
        unit_of_measurement=product.unit_of_measurement
    )
    db.add(db_product)
    try:
        db.commit()
        db.refresh(db_product)
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating product: {e}")
        raise e
    return db_product


def get_unique_products(db: Session):
    return db.query(models.Product).distinct(
        models.Product.product_brand,
        models.Product.product_name,
        models.Product.product_quantity,
        models.Product.product_packaging,
        models.Product.unit_quantity,
        models.Product.unit_of_measurement
    ).all()


def search_products(db: Session, search: str = None, skip: int = 0, limit: int = 10):
    query = db.query(models.Product)
    if search:
        search = f"%{search}%"
        query = query.filter(
            models.Product.product_name.ilike(search) |
            models.Product.product_brand.ilike(search)
        )
    return query.offset(skip).limit(limit).all()

# ------------------------------------
# CART FUNCTIONS
# ------------------------------------
def get_cart(db: Session, cart_id: int):
    return db.query(models.Cart).filter(models.Cart.cart_id == cart_id).first()


def get_carts(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Cart).offset(skip).limit(limit).all()


def create_cart(db: Session, cart: schemas.CartCreate):
    db_cart = models.Cart(
        user_id=cart.user_id,
        cart_name=cart.cart_name,
        purchase_date=cart.purchase_date,
        store_id=cart.store_id,
        cart_total=cart.cart_total
    )
    db.add(db_cart)
    try:
        db.commit()
        db.refresh(db_cart)
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating cart: {e}")
        raise e
    return db_cart


def get_all_carts(db: Session):
    return db.query(models.Cart).all()


def update_cart_total(db: Session, cart_id: int, cart_total: float):
    cart = db.query(models.Cart).filter(models.Cart.cart_id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    cart.cart_total = cart_total
    db.commit()
    db.refresh(cart)
    return cart

# ------------------------------------
# PURCHASE FUNCTIONS
# ------------------------------------
def create_purchase(db: Session, purchase: schemas.PurchaseCreate):
    db_purchase = models.Purchase(
        cart_id=purchase.cart_id,
        product_id=purchase.product_id,
        product_quantity=purchase.product_quantity,
        product_price=purchase.product_price,
        on_sale=purchase.on_sale,
        purchased=purchase.purchased,
        input_date=purchase.input_date
    )
    db.add(db_purchase)
    try:
        db.commit()
        db.refresh(db_purchase)
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating purchase: {e}")
        raise e
    return db_purchase


def get_purchase_by_id(db: Session, purchase_id: int):
    return db.query(models.Purchase).filter(models.Purchase.purchase_id == purchase_id).first()


def get_purchases(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Purchase).offset(skip).limit(limit).all()


def get_purchases_by_cart_id(db: Session, cart_id: int):
    return db.query(models.Purchase).filter(models.Purchase.cart_id == cart_id).all()


def read_purchases_for_product(db: Session, product_id: int):

    # Retrieve all purchases for a specific product (analytics use case)
    return db.query(models.Purchase).filter(models.Purchase.product_id == product_id).all()

def delete_purchase(db: Session, purchase_id: int):

    purchase = db.query(models.Purchase).filter(models.Purchase.purchase_id == purchase_id).first()
    if purchase:
        db.delete(purchase)
        db.commit()
        return purchase
    return None

def update_purchase(db: Session, purchase_id: int, purchase: schemas.PurchaseUpdate):
    db_purchase = db.query(models.Purchase).filter(models.Purchase.purchase_id == purchase_id).first()
    if not db_purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    update_data = purchase.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_purchase, key, value)
    db.commit()
    db.refresh(db_purchase)
    return db_purchase

# ------------------------------------
# USER FUNCTIONS
# ------------------------------------
def create_user(db: Session, user: schemas.UserCreate):
    existing_user = db.query(models.User).filter(models.User.user_id == user.user_id).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User ID already exists.")
    db_user = models.User(user_id=user.user_id)
    db.add(db_user)
    try:
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user: {e}")
        raise e
    return db_user


def get_user_by_id(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.user_id == user_id).first()

# ------------------------------------
# GROCERY LIST FUNCTIONS
# ------------------------------------
def create_grocery_list(db: Session, grocery_list: schemas.GroceryListCreate):
    db_list = models.GroceryList(name=grocery_list.name, user_id=grocery_list.user_id)
    db.add(db_list)
    try:
        db.commit()
        db.refresh(db_list)
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating grocery list: {e}")
        raise e
    return db_list


def get_grocery_lists(db: Session, user_id: str):
    return db.query(models.GroceryList).filter(models.GroceryList.user_id == user_id).all()


def get_grocery_list_items(db: Session, list_id: int):
    return db.query(models.GroceryListItem).filter(models.GroceryListItem.grocery_list_id == list_id).all()


def update_grocery_list(db: Session, list_id: int, list_update: schemas.GroceryListUpdate):
    db_list = db.query(models.GroceryList).filter(models.GroceryList.list_id == list_id).first()
    if db_list is None:
        raise HTTPException(status_code=404, detail="Grocery list not found")
    db_list.name = list_update.name
    db.commit()
    db.refresh(db_list)
    return db_list


def delete_grocery_list(db: Session, list_id: int):
    db_list = db.query(models.GroceryList).filter(models.GroceryList.list_id == list_id).first()
    if db_list is None:
        return None
    db.delete(db_list)
    db.commit()
    return db_list

# ------------------------------------
# PACKAGING AND UNIT FUNCTIONS
# ------------------------------------
def create_packaging_option(db: Session, packaging_option: schemas.PackagingOptionCreate):
    db_packaging_option = models.PackagingOption(packaging_type=packaging_option.packaging_type)
    db.add(db_packaging_option)
    try:
        db.commit()
        db.refresh(db_packaging_option)
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating packaging option: {e}")
        raise e
    return db_packaging_option


def create_unit_of_measurement(db: Session, unit_of_measurement: schemas.UnitOfMeasurementCreate):
    db_unit_of_measurement = models.UnitOfMeasurement(unit_name=unit_of_measurement.unit_name)
    db.add(db_unit_of_measurement)
    try:
        db.commit()
        db.refresh(db_unit_of_measurement)
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating unit of measurement: {e}")
        raise e
    return db_unit_of_measurement

def get_packaging_options(db: Session):

    return db.query(models.PackagingOption).all()