import logging
import os
import random
from decimal import Decimal

import mimesis
import psycopg
import pytest
from mimesis.locales import Locale

from .fakedata import TWOPLACES, FakeVehicle

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
        "street": address.street_name().replace("'", ""),
        "city": address.city(),
        "state": address.state(),
        "postal_code": address.postal_code(),
    }
    individual = {
        "ssn": customer["tax_id"],
        "customer_type": "i",
        "first_name": person.first_name().replace("'", ""),
        "last_name": person.last_name().replace("'", ""),
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
        "street": address.street_name().replace("'", ""),
        "city": address.city(),
        "state": address.state(),
        "postal_code": address.postal_code(),
    }
    first_name = person.first_name().replace("'", "")
    business = {
        "tin": customer["tax_id"],
        "customer_type": "b",
        "title": "Manager",
        "business_name": "Amazing World of {first_name} Car Lot",
        "first_name": first_name,
        "last_name": person.last_name().replace("'", ""),
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


@pytest.fixture
def vendor(dbconn):
    person = mimesis.Person(locale=Locale.EN)
    business_name = " ".join(mimesis.Text().words()).replace("'", "")
    address = mimesis.Address()
    vendor = {
        "name": f"{business_name} Auto Parts",
        "phone_number": person.phone_number()[2:].replace("-", ""),
        "street": address.street_name().replace("'", ""),
        "city": address.city(),
        "state": address.state(),
        "postal_code": address.postal_code(),
    }
    # Create the user
    insert = format_insert_query(
        table="vendor", keys=vendor.keys(), values=vendor.values()
    )
    result_tuple = dbconn.execute(insert).fetchone()
    assert_expected(vendor, result_tuple)
    return vendor


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


@pytest.mark.parametrize(
    "num_parts_orders,num_parts",
    [(1, 3), (0, 0), (3, 3)],
    ids=["one", "none", "several"],
)
def test_total_parts_price(dbconn, vehicle, vendor, num_parts_orders, num_parts):
    parts_cost = 100
    parts_quantity_each = 3
    for i in range(num_parts_orders):
        parts_order = {
            "vin": vehicle["vin"],
            "ordinal": i + 1,
            "vendor_name": vendor["name"],
        }
        parts_order_number = f"{vehicle['vin']}-00{i+1}"
        # Create the color entries
        insert = format_insert_query(
            table="parts_order",
            keys=parts_order.keys(),
            values=parts_order.values(),
        )
        result_tuple = dbconn.execute(insert).fetchone()
        assert_expected(parts_order, result_tuple)
        for i in range(num_parts):
            part = {
                "parts_order_number": parts_order_number,
                "quantity": parts_quantity_each,
                "unit_price": parts_cost,
                "description": "Important thing for vehicle",
                "part_number": "FOOBAR-123",
            }
            # Create the color entries
            insert = format_insert_query(
                table="part",
                keys=part.keys(),
                values=part.values(),
            )
            result_tuple = dbconn.execute(insert).fetchone()
            assert_expected(part, result_tuple)

    vehicle_parts_cost = dbconn.execute(
        f"SELECT total_parts_price FROM vehicle WHERE vin='{vehicle['vin']}';"
    ).fetchone()[0]
    assert (
        Decimal(
            (num_parts_orders * parts_cost * num_parts * parts_quantity_each)
        ).quantize(TWOPLACES)
        == vehicle_parts_cost
    )

    vehicle_sale_price = dbconn.execute(
        f"SELECT sale_price FROM vehicle_with_sale_price WHERE vin='{vehicle['vin']}';"
    ).fetchone()[0]
    expected_sale_price = round(
        (
            Decimal((num_parts_orders * parts_cost * num_parts * parts_quantity_each))
            * Decimal(1.1)
            + Decimal(vehicle["purchase_price"]) * Decimal(1.25)
        ),
        2,
    )
    assert expected_sale_price == vehicle_sale_price
