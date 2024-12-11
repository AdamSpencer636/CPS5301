import pandas as pd
import random
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, Boolean, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import faker

# Faker initialization
fake = faker.Faker('en_US')

# Constants
categories = ['Beverages', 'Snacks', 'Dairy', 'Bakery', 'Meat', 'Frozen', 'Produce', 'Pantry', 'Cleaning Supplies']
brands = ['BrandA', 'BrandB', 'BrandC', 'BrandD', 'BrandE']
unit_of_measurements = ['oz', 'g', 'ml', 'lb', 'kg']
packaging_options = ['Bottle', 'Box', 'Can', 'Bag', 'Carton', 'Pack', 'Jar']
new_jersey_cities = {
    "Elizabeth": {"07201": ["Broad St", "Garden St"], "07202": ["Jefferson Ave", "Elmora Ave"]},
    "Newark": {"07102": ["Market St", "Springfield Ave"]},
    "Jersey City": {"07302": ["Montgomery St", "Pavonia Ave"]},
}

# Database configuration
Base = declarative_base()
DATABASE_URL = "mysql+mysqlconnector://Eric:Password123$@154.38.185.253:3306/grocery_tracker"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Models
class Product(Base):
    __tablename__ = 'products'
    product_id = Column(Integer, primary_key=True)
    product_brand = Column(String(255))
    product_name = Column(String(255))
    category = Column(String(255))
    product_quantity = Column(Integer)
    unit_quantity = Column(Float)
    unit_of_measurement = Column(String(50))
    packaging = Column(String(100))

class Store(Base):
    __tablename__ = 'stores'
    store_id = Column(Integer, primary_key=True)
    store_name = Column(String(255))
    store_location = Column(String(255))

class User(Base):
    __tablename__ = 'users'
    user_id = Column(String(100), primary_key=True)

class Cart(Base):
    __tablename__ = 'carts'
    cart_id = Column(Integer, primary_key=True)
    cart_name = Column(String(100))
    purchase_date = Column(Date)
    store_id = Column(Integer)
    cart_total = Column(Float)
    user_id = Column(String(100))

class Purchase(Base):
    __tablename__ = 'purchases'
    purchase_id = Column(Integer, primary_key=True)
    product_id = Column(Integer)
    cart_id = Column(Integer)
    product_price = Column(Float)
    product_quantity = Column(Integer)
    on_sale = Column(Boolean)
    store_id = Column(Integer)
    product_category = Column(String(100))
    purchased = Column(Boolean)
    input_date = Column(DateTime)

class PackagingOption(Base):
    __tablename__ = "packaging_options"
    id = Column(Integer, primary_key=True)
    packaging_type = Column(String(50), nullable=False, unique=True)

class UnitOfMeasurement(Base):
    __tablename__ = "units_of_measurement"
    id = Column(Integer, primary_key=True)
    unit_name = Column(String(50), nullable=False, unique=True)

# Create tables
Base.metadata.create_all(engine)

# Hard-coded user_id
HARD_CODED_USER_ID = "user_2p2dKxI8KfoDU7CMN0UG5GL1nYd"

# Data generation functions
def generate_products(num_products=1000):
    products = []
    for _ in range(num_products):
        product_entry = {
            'product_id': fake.unique.random_int(min=1, max=1000000),
            'product_brand': random.choice(brands),
            'product_name': f"{fake.word()} {random.choice(categories)}",
            'category': random.choice(categories),
            'product_quantity': random.randint(1, 10),
            'unit_quantity': round(random.uniform(1, 5), 2),
            'unit_of_measurement': random.choice(unit_of_measurements),
            'packaging': random.choice(packaging_options),
        }
        products.append(product_entry)
    return pd.DataFrame(products)

def generate_stores(num_stores=100):
    stores = []
    for _ in range(num_stores):
        city = random.choice(list(new_jersey_cities.keys()))
        zip_code = random.choice(list(new_jersey_cities[city].keys()))
        street_address = f"{random.randint(1, 9999)} {random.choice(new_jersey_cities[city][zip_code])}"
        store_entry = {
            'store_id': fake.unique.random_int(min=1, max=1000000),
            'store_name': fake.company(),
            'store_location': f"{street_address}, {city}, NJ {zip_code}",
        }
        stores.append(store_entry)
    return pd.DataFrame(stores)

def generate_carts_and_purchases(products_df, stores_df, num_carts=500):
    carts = []
    purchases = []

    for _ in range(num_carts):
        cart_id = fake.unique.random_int(min=1, max=1000000)
        store = stores_df.sample(1).iloc[0]
        store_id = store['store_id']
        cart_date = fake.date_time_between(start_date="-2y", end_date=datetime.now())
        base_items = random.randint(5, 20)
        cart_total = 0

        for _ in range(base_items):
            product = products_df.sample(1).iloc[0]
            price = round(random.uniform(1.0, 50.0), 2)
            quantity = random.randint(1, 5)
            total_price = price * quantity

            purchase_entry = {
                'purchase_id': fake.unique.random_int(min=1, max=1000000),
                'product_id': product['product_id'],
                'cart_id': cart_id,
                'product_price': price,
                'product_quantity': quantity,
                'on_sale': random.choice([True, False]),
                'store_id': store_id,
                'product_category': product['category'],
                'purchased': True,
                'input_date': cart_date,
            }
            purchases.append(purchase_entry)
            cart_total += total_price

        cart_entry = {
            'cart_id': cart_id,
            'cart_name': f"Cart for {HARD_CODED_USER_ID}",
            'purchase_date': cart_date,
            'store_id': store_id,
            'cart_total': cart_total,
            'user_id': HARD_CODED_USER_ID,
        }
        carts.append(cart_entry)

    return pd.DataFrame(carts), pd.DataFrame(purchases)

def populate_packaging_options():
    for packaging in packaging_options:
        if not session.query(PackagingOption).filter_by(packaging_type=packaging).first():
            session.add(PackagingOption(packaging_type=packaging))
    session.commit()
    print("Packaging options populated successfully.")

def populate_units_of_measurement():
    for unit in unit_of_measurements:
        if not session.query(UnitOfMeasurement).filter_by(unit_name=unit).first():
            session.add(UnitOfMeasurement(unit_name=unit))
    session.commit()
    print("Units of measurement populated successfully.")

def upload_to_database(df, model):
    for _, row in df.iterrows():
        session.add(model(**row.to_dict()))
    session.commit()
    print(f"Uploaded {len(df)} records to {model.__tablename__}")

# Main execution
if __name__ == "__main__":
    # Populate PackagingOption and UnitOfMeasurement tables
    populate_packaging_options()
    populate_units_of_measurement()

    # Generate and upload data
    products_df = generate_products(1000)
    stores_df = generate_stores(100)
    carts_df, purchases_df = generate_carts_and_purchases(products_df, stores_df, 500)

    upload_to_database(products_df, Product)
    upload_to_database(stores_df, Store)
    upload_to_database(carts_df, Cart)
    upload_to_database(purchases_df, Purchase)

    print("Database setup and data generation complete.")
