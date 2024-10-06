import datetime
import logging
import os
from decimal import Decimal

import mimesis as fakedata
import psycopg
import pytest

logger = logging.getLogger(__name__)

TWOPLACES = Decimal(10) ** -2


@pytest.fixture(scope="session")
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


@pytest.mark.parametrize(
    "user_type", ["owner", "inventory_clerk", "sales_person", "manager"]
)
def test_valid_app_user(dbconn, user_type):
    person = fakedata.Person()
    user = {
        "username": person.email(),
        "user_type": user_type,
        # hashed password doesnt have any scary characters
        "password": person.password(hashed=True),
        "first_name": person.first_name(),
        "last_name": person.last_name(),
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


def test_valid_vehicle(dbconn):
    person1 = fakedata.Person()
    vehicle_seller_user = {
        "username": person1.email(),
        "user_type": "sales_person",
        # hashed password doesnt have any scary characters
        "password": person1.password(hashed=True),
        "first_name": person1.first_name(),
        "last_name": person1.last_name(),
    }
    # Create the user
    insert = format_insert_query(
        table="app_user",
        keys=vehicle_seller_user.keys(),
        values=vehicle_seller_user.values(),
    )
    result_tuple = dbconn.execute(insert).fetchone()

    person2 = fakedata.Person()
    vehicle_buyer_user = {
        "username": person2.email(),
        "user_type": "inventory_clerk",
        # hashed password doesnt have any scary characters
        "password": person2.password(hashed=True),
        "first_name": person2.first_name(),
        "last_name": person2.last_name(),
    }

    # Create the user
    insert = format_insert_query(
        table="app_user",
        keys=vehicle_buyer_user.keys(),
        values=vehicle_buyer_user.values(),
    )

    result_tuple = dbconn.execute(insert).fetchone()

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
        "purchase_price": Decimal(40000.32).quantize(TWOPLACES),
        "purchase_date": datetime.date(2023, 1, 1),
        "condition": "Very Good",
        "fuel_type": "Natural Gas",
        "buyer_username": vehicle_buyer_user["username"],
        "seller_username": vehicle_seller_user["username"],
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

    # now delete the users
    for user in [vehicle_seller_user, vehicle_buyer_user]:
        delete = format_delete_query(
            table="app_user", key="username", value=user["username"]
        )
        result_tuple = dbconn.execute(delete).fetchone()
        assert_expected(user, result_tuple)


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
