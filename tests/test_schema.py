import logging
import os

import mimesis
import psycopg
import pytest

from .fakedata import FakeVehicle

logger = logging.getLogger(__name__)


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
        table="vehicle_seller", keys="username", values=vehicle_seller["username"]
    )
    result_tuple = dbconn.execute(delete).fetchone()
    delete = format_delete_query(
        table="app_user", keys="username", values=app_user["username"]
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
        table="vehicle_buyer", keys="username", values=vehicle_buyer["username"]
    )
    result_tuple = dbconn.execute(delete).fetchone()
    delete = format_delete_query(
        table="app_user", keys="username", values=app_user["username"]
    )
    result_tuple = dbconn.execute(delete).fetchone()


@pytest.fixture
def vehicle(dbconn, vehicle_buyer, vehicle_seller):
    fv = FakeVehicle()
    vehicle = {
        "vin": fv.vin,
        "sale_date": fv.sale_date,
        "sale_price": fv.sale_price,
        "total_parts_price": fv.total_parts_price,
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
        "buyer_username": vehicle_buyer["username"],
        "seller_username": vehicle_seller["username"],
    }
    # Create the vehicle
    insert = format_insert_query(
        table="vehicle", keys=vehicle.keys(), values=vehicle.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(vehicle, result_tuple)

    yield vehicle

    # Now delete the vehicle
    delete = format_delete_query(table="vehicle", keys="vin", values=vehicle["vin"])
    result_tuple = dbconn.execute(delete).fetchone()
    assert_expected(vehicle, result_tuple)


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
