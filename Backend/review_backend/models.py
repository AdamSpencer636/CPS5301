from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Boolean, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import relationship
from review_backend.database import Base


# Store Table
class Store(Base):
    __tablename__ = "stores"
    store_id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String(100), index=True, nullable=False)
    store_location = Column(String(255), nullable=False)  # Store location field


# Product Table
class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)
    product_brand = Column(String(100), index=True, nullable=False)
    product_name = Column(String(100), index=True, nullable=False)
    product_quantity = Column(Float, index=True, nullable=False)
    product_packaging = Column(String(50), index=True, nullable=False)
    unit_quantity = Column(Float, index=True, nullable=False)
    unit_of_measurement = Column(String(50), index=True, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            'product_brand', 'product_name', 'product_quantity',
            'product_packaging', 'unit_quantity', 'unit_of_measurement',
            name='_product_unique_constraint'
        ),
    )


# Cart Table
class Cart(Base):
    __tablename__ = "carts"

    cart_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), ForeignKey("users.user_id"), nullable=False)  # Linked to users
    cart_name = Column(String(100), nullable=False)
    purchase_date = Column(Date, index=True, nullable=False)
    store_id = Column(Integer, ForeignKey("stores.store_id"), nullable=False)  # Linked to stores
    cart_total = Column(Float, default=0.0, nullable=False)

    purchases = relationship("Purchase", back_populates="cart")
    store = relationship("Store")  # Reference store


# Purchase Table
class Purchase(Base):
    __tablename__ = "purchases"

    purchase_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)  # Linked to products
    cart_id = Column(Integer, ForeignKey("carts.cart_id"), nullable=False)  # Linked to carts
    product_quantity = Column(Integer, nullable=False)
    product_price = Column(Float, nullable=False)
    on_sale = Column(Boolean, default=False)
    purchased = Column(Boolean, default=True)
    input_date = Column(DateTime, nullable=False)

    cart = relationship("Cart", back_populates="purchases")
    product = relationship("Product")  # Reference product


# User Table
class User(Base):
    __tablename__ = "users"

    user_id = Column(String(100), primary_key=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    grocery_lists = relationship("GroceryList", back_populates="user")


# Grocery List Table
class GroceryList(Base):
    __tablename__ = "grocery_lists"

    list_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    user_id = Column(String(100), ForeignKey("users.user_id"), nullable=False)  # Linked to users
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="grocery_lists")
    items = relationship("GroceryListItem", back_populates="grocery_list")


# Grocery List Item Table
class GroceryListItem(Base):
    __tablename__ = "grocery_list_items"

    item_id = Column(Integer, primary_key=True, index=True)
    grocery_list_id = Column(Integer, ForeignKey("grocery_lists.list_id"), nullable=False)  # Linked to grocery lists
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)  # Linked to products
    product_quantity = Column(Float, default=1.0)
    unit_quantity = Column(Float, default=1.0)
    unit_price = Column(Float)
    total = Column(Float)
    notes = Column(String(255))

    grocery_list = relationship("GroceryList", back_populates="items")
    product = relationship("Product")  # Reference product


# Packaging Options Table
class PackagingOption(Base):
    __tablename__ = "packaging_options"

    id = Column(Integer, primary_key=True)
    packaging_type = Column(String(50), nullable=False, unique=True)  # Unique packaging type


# Unit of Measurement Table
class UnitOfMeasurement(Base):
    __tablename__ = "units_of_measurement"

    id = Column(Integer, primary_key=True)
    unit_name = Column(String(50), nullable=False, unique=True)  # Unique unit of measurement
