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
    name VARCHAR(120) PRIMARY KEY,
    phone_number VARCHAR(12) NOT NULL,
    street VARCHAR(120) NOT NULL,
    city VARCHAR(120) NOT NULL,
    state VARCHAR(120) NOT NULL,
    postal_code VARCHAR(5) NOT NULL
);

--VehicleBuyer
--CREATE TABLE vehicle_buyer (
--    username VARCHAR(120) NOT NULL UNIQUE,
--    FOREIGN KEY (username) REFERENCES app_user (username) ON DELETE CASCADE
--);
--
----VehicleSeller
--CREATE TABLE vehicle_seller (
--    username VARCHAR(120) NOT NULL UNIQUE,
--    FOREIGN KEY (username) REFERENCES app_user (username) ON DELETE CASCADE
--);

-- Vehicle table
CREATE TABLE vehicle (
    vin VARCHAR(17) PRIMARY KEY,
    sale_date DATE NULL,
    sale_price DECIMAL(19, 2) NULL,
    total_parts_price DECIMAL(19, 2) NULL,
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
    buyer_username VARCHAR(50) NOT NULL,
    seller_username VARCHAR(50) NULL,
    FOREIGN KEY (seller_username) REFERENCES app_user (
        username
    ) ON DELETE SET NULL,
    FOREIGN KEY (buyer_username) REFERENCES app_user (
        username
    ) ON DELETE CASCADE,
    CONSTRAINT chk_condition CHECK (
        condition IN ('Excellent', 'Very Good', 'Good', 'Fair')
    ),
    CONSTRAINT chk_fuel_type CHECK (
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
    CONSTRAINT chk_manufacturer CHECK (manufacturer IN (
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
    CONSTRAINT chk_vehicle_type CHECK (vehicle_type IN (
        'Sedan',
        'Coupe',
        'Convertible',
        'CUV',
        'Truck',
        'Van',
        'Minivan',
        'SUV',
        'Other'
    ))
    -- ADD CHECK THAT SELLER IS A SALESPERSON OR OWNER
    -- ADD CHECK THAT BUYER IS A SALESPERSON OR OWNER
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
    FOREIGN KEY (vin) REFERENCES vehicle (vin) ON DELETE CASCADE
);

--PartsOrder
CREATE TABLE parts_order (
    parts_order_number VARCHAR(120) NOT NULL UNIQUE,
    vendor_name VARCHAR(120) NOT NULL,
    FOREIGN KEY (vendor_name) REFERENCES vendor (name) ON DELETE RESTRICT
);

--Part
CREATE TABLE part (
    part_number VARCHAR(120) NOT NULL,
    unit_price DECIMAL(19, 2) NOT NULL,
    description VARCHAR(280) NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(120) NOT NULL,
    parts_order_number VARCHAR(120) NOT NULL,
    FOREIGN KEY (parts_order_number) REFERENCES parts_order (
        parts_order_number
    ) ON DELETE CASCADE
);

--Customer
CREATE TABLE customer (
    tax_id VARCHAR(120) PRIMARY KEY,
    email VARCHAR(120) NULL,
    phone_number VARCHAR(12) NOT NULL,
    street VARCHAR(120) NOT NULL,
    city VARCHAR(120) NOT NULL,
    state VARCHAR(120) NOT NULL,
    postal_code VARCHAR(5) NOT NULL
);

--Individual
CREATE TABLE individual (
    ssn VARCHAR(9) NOT NULL UNIQUE,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    FOREIGN KEY (ssn) REFERENCES customer (tax_id) ON DELETE CASCADE
-- ADD CONSTRAINT that SSN not a TIN in business
);

--Business
CREATE TABLE business (
    tin VARCHAR(9) NOT NULL UNIQUE,
    FOREIGN KEY (tin) REFERENCES customer (tax_id) ON DELETE CASCADE,
    business_name VARCHAR(120) NOT NULL,
    title VARCHAR(120) NOT NULL,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL
-- ADD CONSTRAINT that TIN not a SSN in business
);
