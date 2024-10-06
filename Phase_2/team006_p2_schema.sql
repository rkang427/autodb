-- Drop existing database so we can re-create it
DROP DATABASE IF EXISTS dealership;

CREATE DATABASE dealership
ENCODING 'UTF8'
LC_COLLATE = 'en_US.utf8'
LC_CTYPE = 'en_US.utf8';

-- Connect to database
\c dealership;

-- Create user table -- note postgres wants all tables to be lowercase
-- also, "user" is a protected word, can't call the table that.

CREATE TABLE app_user (
    username VARCHAR(120) PRIMARY KEY,
    user_type VARCHAR(60) NOT NULL,
    password VARCHAR(120) NOT NULL,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    CONSTRAINT chk_user_type CHECK (
        user_type IN ('manager', 'owner', 'sales_person', 'inventory_clerk')
    )
);
-- created vendor table 
CREATE TABLE vendor (
    name VARCHAR(100) PRIMARY KEY,
    phone_number VARCHAR(12) NOT NULL,
    street VARCHAR(120) NOT NULL,
    city VARCHAR(120) NOT NULL,
    state VARCHAR(120) NOT NULL,
    postal_code VARCHAR(5) NOT NULL
);

--VehicleBuyer
CREATE TABLE vehicle_buyer (
    username VARCHAR(120) NOT NULL UNIQUE,
    FOREIGN KEY (username) REFERENCES app_user (username)
);

--VehicleSeller
CREATE TABLE vehicle_seller (
    username VARCHAR(120) NOT NULL UNIQUE,
    FOREIGN KEY (username) REFERENCES app_user (username)
);

-- Vehicle table
CREATE TABLE vehicle (
    vin VARCHAR(17) PRIMARY KEY,
    sale_date DATE NULL,
    sale_price DECIMAL(19, 4) NULL,
    total_parts_price DECIMAL(19, 4) NULL,
    description VARCHAR(280) NULL,
    horsepower SMALLINT NOT NULL,
    year INT NOT NULL,
    model VARCHAR(120) NOT NULL,
    manufacturer VARCHAR(120) NOT NULL,
    CHECK (condition IN (
        'Acura',
        'FIAT',
        'Lamborghini',
        'Nio',
        'Alfa Romeo',
        'Ford',
        'Land Rover',
        'Porsche',
        'Aston Martin',
        'Geeley',
        'Lexus',
        'Ram',
        'Audi',
        'Genesis',
        'Lincoln',
        'Rivian',
        'Bentley',
        'GMC',
        'Lotus',
        'Rolls-Royce',
        'BMW',
        'Honda',
        'Maserati',
        'smart',
        'Buick',
        'Hyundai',
        'MAZDA',
        'Subaru',
        'Cadillac',
        'INFINITI',
        'McLaren',
        'Tesla',
        'Chevrolet',
        'Jaguar',
        'Mercedes-Benz',
        'Toyota',
        'Chrysler',
        'Jeep',
        'MINI',
        'Volkswagen',
        'Dodge',
        'Karma',
        'Mitsubishi',
        'Volvo',
        'Ferrari',
        'Kia',
        'Nissan',
        'XPeng'
    )),
    purchase_price DECIMAL(19, 4) NOT NULL,
    purchase_date DATE NOT NULL,
    condition VARCHAR(10) NOT NULL,
    CHECK (condition IN ('Excellent', 'Very Good', 'Good', 'Fair')),
    fuel_type VARCHAR(10) NOT NULL,
    CHECK (
        fuel_type IN (
            'Gas',
            'Diesel',
            'Natural Gas',
            'Hybrid',
            'Plugin Hybrid',
            'Battery',
            'Fuel Cell'
        )
    ),
    buyer_username VARCHAR(50) NOT NULL,
    FOREIGN KEY (buyer_username) REFERENCES vehicle_buyer (username),
    seller_username VARCHAR(50) NULL,
    FOREIGN KEY (seller_username) REFERENCES vehicle_seller (username)
);

-- VehicleColors
CREATE TABLE vehicle_colors (
    vin VARCHAR(17) NOT NULL,
    color VARCHAR(10) NOT NULL,
    CHECK (
        color IN (
            'Aluminum',
            'Beige',
            'Black',
            'Blue',
            'Brown',
            'Bronze',
            'Claret',
            'Copper',
            'Cream',
            'Gold',
            'Gray',
            'Green',
            'Maroon',
            'Metallic',
            'Navy',
            'Orange',
            'Pink',
            'Purple',
            'Red',
            'Rose',
            'Rust',
            'Silver',
            'Tan',
            'Turquoise',
            'White',
            'Yellow'
        )
    ),
    FOREIGN KEY (vin) REFERENCES vehicle (vin)
);

--PartsOrder
CREATE TABLE parts_order (
    parts_order_number VARCHAR(120) NOT NULL UNIQUE,
    vendor_name VARCHAR(120) NOT NULL,
    FOREIGN KEY (vendor_name) REFERENCES vendor (name)
);

--Part
CREATE TABLE part (
    part_number VARCHAR(120) NOT NULL,
    unit_price VARCHAR(120) NOT NULL,
    description VARCHAR(280) NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(120) NOT NULL,
    parts_order_number VARCHAR(120) NOT NULL,
    FOREIGN KEY (parts_order_number) REFERENCES parts_order (parts_order_number)
);

--Customer
CREATE TABLE customer (
    email VARCHAR(120) PRIMARY KEY,
    phone_number VARCHAR(12) NOT NULL,
    street VARCHAR(120) NOT NULL,
    city VARCHAR(120) NOT NULL,
    state VARCHAR(120) NOT NULL,
    postal_code VARCHAR(5) NOT NULL
);

--Individual
CREATE TABLE individual (
    ssn VARCHAR(9) PRIMARY KEY,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    FOREIGN KEY (email) REFERENCES customer (email)
);

--Business
CREATE TABLE business (
    tin VARCHAR(9) PRIMARY KEY,
    email VARCHAR(120) NOT NULL,
    FOREIGN KEY (email) REFERENCES customer (email),
    business_name VARCHAR(120) NOT NULL,
    title VARCHAR(120) NOT NULL,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL
);
