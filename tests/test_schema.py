import logging
import os
import random

import mimesis
import psycopg
import pytest
from mimesis.locales import Locale

from .fakedata import FakeVehicle

logger = logging.getLogger(__name__)


def tax_id():
    # Generate a random SSN/TIN in the format XXXYYZZZZ
    area = random.randint(100, 999)
    group = random.randint(10, 99)
    serial = random.randint(1000, 9999)
    return f"{area}{group}{serial}"


@pytest.fixture()
def dbconn():
    pg_host = os.getenv("POSTGRES_HOST", "0.0.0.0")
    pg_pass = os.getenv("POSTGRES_PASSWORD", "password")
    pg_user = os.getenv("POSTGRES_USER", "admin")
    pg_port = os.getenv("POSTGRES_PORT", "5432")
    pg_db = os.getenv("POSTGRES_DB", "dealership")
    conn = psycopg.Connection.connect(
        f"postgresql://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}?connect_timeout=10&application_name=testapp"
    )

    yield conn

    conn.close()


def unpack_keys(keys):
    return ", ".join(item for item in keys)


def unpack_values(values):
    return ", ".join(f"'{item}'" for item in values)


def format_insert_query(table, keys, values):
    """
    INSERT INTO table_name (firstkey, secondkey) VALUE ('quoted', 'values') RETURNING firstkey, secondkey;
    """
    query = f"INSERT INTO {table} ({unpack_keys(keys)}) VALUES ({unpack_values(values)}) RETURNING {unpack_keys(keys)};"
    logger.info(query)
    return query


def format_delete_query(table, keys, values):
    """
    DELETE FROM table_name WHERE key = 'value' RETURNING *;
    """
    if not isinstance(keys, list):
        keys = [keys]
    if not isinstance(values, list):
        values = [values]

    where_clause = "WHERE "

    for i, key in enumerate(keys):
        if i > 0:
            where_clause += " AND "
        where_clause += f"{key} = '{values[i]}'"

    query = f"DELETE FROM {table} {where_clause} RETURNING *;"
    logger.info(query)
    return query


def assert_expected(kv_dict, result_tuple):
    """
    Presumes the keys and values are in the same order as the result tuple.
    """
    for i, value in enumerate(kv_dict.values()):
        assert value == result_tuple[i]


@pytest.fixture
def employee_seller(dbconn):
    person = mimesis.Person(locale=Locale.EN)
    app_user = {
        "username": person.email(),
        "user_type": "sales_person",
        # hashed password doesnt have any scary characters
        "password": person.password(hashed=True),
        "first_name": person.first_name().replace("'", ""),
        "last_name": person.last_name().replace("'", ""),
    }
    employee_seller = {"username": app_user["username"]}

    # Create the user
    insert = format_insert_query(
        table="app_user", keys=app_user.keys(), values=app_user.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(app_user, result_tuple)

    insert = format_insert_query(
        table="employee_seller",
        keys=employee_seller.keys(),
        values=employee_seller.values(),
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(employee_seller, result_tuple)

    return employee_seller


@pytest.fixture
def employee_buyer(dbconn):
    person = mimesis.Person(locale=Locale.EN)
    app_user = {
        "username": person.email(),
        "user_type": "inventory_clerk",
        # hashed password doesnt have any scary characters
        "password": person.password(hashed=True),
        "first_name": person.first_name().replace("'", ""),
        "last_name": person.last_name().replace("'", ""),
    }
    employee_buyer = {"username": app_user["username"]}

    # Create the user
    insert = format_insert_query(
        table="app_user", keys=app_user.keys(), values=app_user.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(app_user, result_tuple)

    insert = format_insert_query(
        table="employee_buyer",
        keys=employee_buyer.keys(),
        values=employee_buyer.values(),
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(employee_buyer, result_tuple)

    return employee_buyer


@pytest.fixture
def individual(dbconn):
    person = mimesis.Person(locale=Locale.EN)
    address = mimesis.Address()

    customer = {
        "tax_id": tax_id(),
        "customer_type": "i",
        "phone_number": person.phone_number()[2:].replace("-", ""),
        "street": address.street_name(),
        "city": address.city(),
        "state": address.state(),
        "postal_code": address.postal_code(),
    }
    individual = {
        "ssn": customer["tax_id"],
        "customer_type": "i",
        "first_name": person.first_name(),
        "last_name": person.last_name(),
    }

    # Create the user
    insert = format_insert_query(
        table="customer", keys=customer.keys(), values=customer.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(customer, result_tuple)

    insert = format_insert_query(
        table="individual", keys=individual.keys(), values=individual.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(individual, result_tuple)

    return individual


@pytest.fixture
def business(dbconn):
    person = mimesis.Person(locale=Locale.EN)
    address = mimesis.Address()

    customer = {
        "tax_id": tax_id(),
        "customer_type": "b",
        "phone_number": person.phone_number()[2:].replace("-", ""),
        "street": address.street_name(),
        "city": address.city(),
        "state": address.state(),
        "postal_code": address.postal_code(),
    }
    business = {
        "tin": customer["tax_id"],
        "customer_type": "b",
        "title": "Manager",
        "business_name": "{person.first_name()} Car Lot",
        "first_name": person.first_name(),
        "last_name": person.last_name(),
    }

    # Create the user
    insert = format_insert_query(
        table="customer", keys=customer.keys(), values=customer.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()

    insert = format_insert_query(
        table="business", keys=business.keys(), values=business.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(business, result_tuple)

    return business


@pytest.fixture
def vehicle(dbconn, employee_buyer, employee_seller, individual, business):
    fv = FakeVehicle()
    """
    vin VARCHAR(17) PRIMARY KEY,
    description VARCHAR(280) NULL,
    horsepower SMALLINT NOT NULL,
    year INT NOT NULL,
    model VARCHAR(120) NOT NULL,
    manufacturer VARCHAR(120) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    purchase_price DECIMAL(19, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    condition VARCHAR(10) NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    employee_buyer VARCHAR(50) NOT NULL,
    customer_seller VARCHAR(9) NOT NULL,
    total_parts_price DECIMAL(19, 2) NULL,
    employee_seller VARCHAR(50) NULL,
    customer_buyer VARCHAR(9) NULL,
    sale_date DATE NULL,
    sale_price DECIMAL(19, 2) NULL,
    """
    vehicle = {
        "vin": fv.vin,
        "description": fv.description,
        "horsepower": fv.horsepower,
        "year": fv.year,
        "model": fv.model,
        "manufacturer": fv.manufacturer,
        "vehicle_type": fv.vehicle_type,
        "purchase_price": fv.purchase_price,
        "purchase_date": fv.purchase_date,
        "condition": fv.condition,
        "fuel_type": fv.fuel_type,
        "employee_buyer": employee_buyer["username"],
        "customer_seller": individual["ssn"],
        "total_parts_price": fv.total_parts_price,
        "employee_seller": employee_seller["username"],
        "customer_buyer": business["tin"],
        "sale_date": fv.sale_date,
        "sale_price": fv.sale_price,
    }
    # Create the vehicle
    insert = format_insert_query(
        table="vehicle", keys=vehicle.keys(), values=vehicle.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(vehicle, result_tuple)

    return vehicle


@pytest.mark.parametrize(
    "user_type", ["owner", "inventory_clerk", "sales_person", "manager"]
)
def test_valid_app_user(dbconn, user_type):
    person = mimesis.Person(locale=Locale.EN)

    user = {
        "username": person.email(),
        "user_type": user_type,
        # hashed password doesnt have any scary characters
        "password": person.password(hashed=True),
        "first_name": person.first_name().replace("'", ""),
        "last_name": person.last_name().replace("'", ""),
    }
    # Create the user
    insert = format_insert_query(
        table="app_user", keys=user.keys(), values=user.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(user, result_tuple)

    # Now delete the user
    delete = format_delete_query(
        table="app_user", keys="username", values=user["username"]
    )
    result_tuple = dbconn.execute(delete).fetchone()
    assert_expected(user, result_tuple)


def test_valid_vendor(dbconn):
    vendor = {
        "name": "Napa Auto Parts",
        "phone_number": "919-123-7654",
        "street": "123 Maple Ave",
        "city": "Charlotte",
        "state": "North Carolina",
        "postal_code": "27344",
    }
    # Create the user
    insert = format_insert_query(
        table="vendor", keys=vendor.keys(), values=vendor.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(vendor, result_tuple)

    # Now delete the user
    delete = format_delete_query(table="vendor", keys="name", values=vendor["name"])
    result_tuple = dbconn.execute(delete).fetchone()
    assert_expected(vendor, result_tuple)


def test_valid_vehicle(dbconn, vehicle):
    db_vehicle = dbconn.execute(
        f"SELECT * FROM vehicle WHERE vin='{vehicle['vin']}';"
    ).fetchone()
    assert_expected(vehicle, db_vehicle)


@pytest.mark.parametrize(
    "colors",
    [
        ("Aluminum", "Beige"),
        ("Black", "Blue", "Brown", "Bronze", "Claret"),
        (
            "Copper",
            "Cream",
            "Gold",
            "Gray",
            "Green",
            "Maroon",
            "Metallic",
            "Navy",
            "Orange",
        ),
        (
            "Pink",
            "Purple",
            "Red",
            "Rose",
            "Rust",
            "Silver",
            "Tan",
            "Turquoise",
            "White",
        ),
        ("Yellow",),
    ],
    ids=lambda x: ",".join(x),
)
def test_valid_vehiclecolor(dbconn, vehicle, colors):

    for color in colors:
        vehiclecolor = {"vin": vehicle["vin"], "color": color}

        # Create the color entries
        insert = format_insert_query(
            table="vehicle_color",
            keys=vehiclecolor.keys(),
            values=vehiclecolor.values(),
        )
        result_tuple = dbconn.execute(insert).fetchone()
        assert_expected(vehiclecolor, result_tuple)

    db_colors = [
        t[0]
        for t in dbconn.execute(
            f"SELECT color FROM vehicle_color WHERE vin='{vehicle['vin']}';"
        ).fetchall()
    ]
    assert set(colors) == set(db_colors)
    # don't deal with deleting for now because SHOULD cascade delete...
    # also, think there is some kind of gotcha for formatting delete query on table with multiple key values
    # and I don't know how to do that yet
