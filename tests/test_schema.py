import datetime
import logging
import os
from decimal import Decimal

import mimesis
import psycopg
import pytest

logger = logging.getLogger(__name__)

TWOPLACES = Decimal(10) ** -2


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
    INSERT INTO table_name (firstkey, secondkey) VALUE ('quoted', 'values') RETURNING *;
    """
    query = f"INSERT INTO {table} ({unpack_keys(keys)}) VALUES ({unpack_values(values)}) RETURNING *;"
    logger.info(query)
    return query


def format_delete_query(table, key, value):
    """
    DELETE FROM table_name WHERE key = 'value' RETURNING *;
    """
    query = f"DELETE FROM {table} WHERE {key} = '{value}' RETURNING *;"
    logger.info(query)
    return query


def assert_expected(kv_dict, result_tuple):
    """
    Presumes the keys and values are in the same order as the result tuple.
    """
    for i, value in enumerate(kv_dict.values()):
        assert value == result_tuple[i]


@pytest.fixture
def vehicle_seller(dbconn):
    person = mimesis.Person()
    app_user = {
        "username": person.email(),
        "user_type": "sales_person",
        # hashed password doesnt have any scary characters
        "password": person.password(hashed=True),
        "first_name": person.first_name().replace("'", ""),
        "last_name": person.last_name().replace("'", ""),
    }
    vehicle_seller = {"username": app_user["username"]}

    # Create the user
    insert = format_insert_query(
        table="app_user", keys=app_user.keys(), values=app_user.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(app_user, result_tuple)

    insert = format_insert_query(
        table="vehicle_seller",
        keys=vehicle_seller.keys(),
        values=vehicle_seller.values(),
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(vehicle_seller, result_tuple)

    yield vehicle_seller

    delete = format_delete_query(
        table="vehicle_seller", key="username", value=vehicle_seller["username"]
    )
    result_tuple = dbconn.execute(delete).fetchone()
    delete = format_delete_query(
        table="app_user", key="username", value=app_user["username"]
    )
    result_tuple = dbconn.execute(delete).fetchone()


@pytest.fixture
def vehicle_buyer(dbconn):
    person = mimesis.Person()
    app_user = {
        "username": person.email(),
        "user_type": "inventory_clerk",
        # hashed password doesnt have any scary characters
        "password": person.password(hashed=True),
        "first_name": person.first_name().replace("'", ""),
        "last_name": person.last_name().replace("'", ""),
    }
    vehicle_buyer = {"username": app_user["username"]}

    # Create the user
    insert = format_insert_query(
        table="app_user", keys=app_user.keys(), values=app_user.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(app_user, result_tuple)

    insert = format_insert_query(
        table="vehicle_buyer", keys=vehicle_buyer.keys(), values=vehicle_buyer.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(vehicle_buyer, result_tuple)

    yield vehicle_buyer

    delete = format_delete_query(
        table="vehicle_buyer", key="username", value=vehicle_buyer["username"]
    )
    result_tuple = dbconn.execute(delete).fetchone()
    delete = format_delete_query(
        table="app_user", key="username", value=app_user["username"]
    )
    result_tuple = dbconn.execute(delete).fetchone()


@pytest.mark.parametrize(
    "user_type", ["owner", "inventory_clerk", "sales_person", "manager"]
)
def test_valid_app_user(dbconn, user_type):
    person = mimesis.Person()
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
        table="app_user", key="username", value=user["username"]
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
    delete = format_delete_query(table="vendor", key="name", value=vendor["name"])
    result_tuple = dbconn.execute(delete).fetchone()
    assert_expected(vendor, result_tuple)


def test_valid_vehicle(dbconn, vehicle_buyer, vehicle_seller):
    vehicle = {
        "vin": "4Y1SL65848Z411439",
        "sale_date": datetime.date(2022, 1, 1),
        "sale_price": Decimal(50000.30).quantize(TWOPLACES),
        "total_parts_price": Decimal(100.32).quantize(TWOPLACES),
        "description": "Car is a 4WD.",
        "horsepower": 400,
        "year": 2010,
        "model": "Civic",
        "manufacturer": "Honda",
        "vehicle_type": "Sedan",
        "purchase_price": Decimal(40000.32).quantize(TWOPLACES),
        "purchase_date": datetime.date(2023, 1, 1),
        "condition": "Very Good",
        "fuel_type": "Natural Gas",
        "buyer_username": vehicle_buyer["username"],
        "seller_username": vehicle_seller["username"],
    }
    # Create the vehicle
    insert = format_insert_query(
        table="vehicle", keys=vehicle.keys(), values=vehicle.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(vehicle, result_tuple)

    # Now delete the vehicle
    delete = format_delete_query(table="vehicle", key="vin", value=vehicle["vin"])
    result_tuple = dbconn.execute(delete).fetchone()
    assert_expected(vehicle, result_tuple)


# def test_valid_vehiclecolor(dbconn):
#    vehiclecolor = {
#        "VIN": "4Y1SL69808Z412439",
#        "color": "Metallic"
#    }
#
#    # Create the user
#    insert = format_insert_query(
#        table="vehiclecolor", keys=vehiclecolor.keys(), values=vehiclecolor.values()
#    )
#    result_tuple = dbconn.execute(insert).fetchone()
#    assert_expected(vehiclecolor, result_tuple)
#
#    # Now delete the user
#    delete = format_delete_query(table="vehiclecolor", key="name", value=vehiclecolor["name"])
#    result_tuple = dbconn.execute(delete).fetchone()
#    assert_expected(vehiclecolor, result_tuple)
