-- Drop existing database so we can re-create it
DROP DATABASE IF EXISTS dealership;

CREATE DATABASE dealership
ENCODING 'UTF8'
LC_COLLATE = 'en_US.utf8'
LC_CTYPE = 'en_US.utf8';

-- Connect to database
\c dealership;


-- this enforces YYYY-MM-DD style
SET datestyle = 'ISO, YMD';
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

CREATE TABLE inventory_clerk (
    username VARCHAR(120) NOT NULL UNIQUE,
    FOREIGN KEY (username) REFERENCES app_user (username) ON DELETE CASCADE
);

CREATE TABLE manager (
    username VARCHAR(120) NOT NULL UNIQUE,
    FOREIGN KEY (username) REFERENCES app_user (username) ON DELETE CASCADE
);

CREATE TABLE salesperson (
    username VARCHAR(120) NOT NULL UNIQUE,
    FOREIGN KEY (username) REFERENCES app_user (username) ON DELETE CASCADE
);

--Customer
CREATE TABLE customer (
    tax_id VARCHAR(9) PRIMARY KEY,
    customer_type CHAR(1) NOT NULL DEFAULT 'i'
    CHECK (customer_type IN ('i', 'b')),
    -- This unique constraint that keeps the individual
    -- and business tables disjoint
    -- target the tax_id *and* the type in a foreign key constraint.
    email VARCHAR(120) NULL,
    phone_number VARCHAR(10) NOT NULL,
    street VARCHAR(120) NOT NULL,
    city VARCHAR(120) NOT NULL,
    state VARCHAR(120) NOT NULL,
    postal_code VARCHAR(5) NOT NULL,
    UNIQUE (tax_id, customer_type),
    CONSTRAINT tax_id_regexp CHECK (tax_id ~ '^\d{9}$'),
    CONSTRAINT phone_regexp CHECK (phone_number ~ '^\d{10}$')
);

--Individual
CREATE TABLE individual (
    ssn VARCHAR(9) NOT NULL UNIQUE,
    customer_type CHAR(1) DEFAULT 'i',
    CHECK (customer_type = 'i'),
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    FOREIGN KEY (ssn, customer_type) REFERENCES customer (
        tax_id, customer_type
    ) ON DELETE CASCADE,
    UNIQUE (ssn, customer_type)
);

--Business
CREATE TABLE business (
    tin VARCHAR(9) NOT NULL UNIQUE,
    customer_type CHAR(1) DEFAULT 'b',
    CHECK (customer_type = 'b'),
    business_name VARCHAR(120) NOT NULL,
    title VARCHAR(120) NOT NULL,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    FOREIGN KEY (tin, customer_type) REFERENCES customer (
        tax_id, customer_type
    ) ON DELETE CASCADE,
    UNIQUE (tin, customer_type)
);

-- Vehicle table
CREATE TABLE vehicle (
    vin VARCHAR(17) PRIMARY KEY,
    description VARCHAR(280) NULL,
    horsepower SMALLINT NOT NULL,
    -- YEAR is a function in postgresql, so make different to be clear
    model_year INT NOT NULL,
    model VARCHAR(120) NOT NULL,
    manufacturer VARCHAR(120) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    purchase_price DECIMAL(19, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    condition VARCHAR(10) NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    inventory_clerk VARCHAR(50) NOT NULL,
    customer_seller VARCHAR(9) NOT NULL,
    total_parts_price DECIMAL(19, 2) DEFAULT 0.0,
    salesperson VARCHAR(50) NULL,
    customer_buyer VARCHAR(9) NULL,
    sale_date DATE NULL,

    -- calculate sale_price when we query the vehicle table
    FOREIGN KEY (customer_seller) REFERENCES customer (
        tax_id
    ) ON DELETE CASCADE,
    FOREIGN KEY (customer_buyer) REFERENCES customer (
        tax_id
    ) ON DELETE CASCADE,
    FOREIGN KEY (salesperson) REFERENCES salesperson (
        username
    ) ON DELETE CASCADE,
    FOREIGN KEY (inventory_clerk) REFERENCES inventory_clerk (
        username
    ) ON DELETE CASCADE,
    CONSTRAINT chk_condition CHECK (
        condition IN ('Excellent', 'Very Good', 'Good', 'Fair')
    ),
    CONSTRAINT chk_model_year CHECK (
        model_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1
        AND model_year >= 1000 AND model_year <= 9999
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
    )),
    CONSTRAINT vin_length CHECK (LENGTH(vin) = 17)

);

-- VehicleColors
CREATE TABLE vehicle_color (
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
    FOREIGN KEY (vin) REFERENCES vehicle (vin) ON DELETE CASCADE,
    UNIQUE (vin, color)

);

-- Parts Order
CREATE TABLE parts_order (
    -- Generate ordinal when we insert into table by looking at current count with same VIN
    ordinal INTEGER,
    vin VARCHAR(17) NOT NULL,
    parts_order_number VARCHAR(21) GENERATED ALWAYS AS (
        vin || '-' || LPAD(CAST(ordinal AS VARCHAR), 3, CAST(0 AS VARCHAR))
    ) STORED,
    vendor_name VARCHAR(120) NOT NULL,
    PRIMARY KEY (vin, ordinal),
    UNIQUE (parts_order_number),
    FOREIGN KEY (vendor_name) REFERENCES vendor (name) ON DELETE RESTRICT,
    FOREIGN KEY (vin) REFERENCES vehicle (vin) ON DELETE CASCADE
);

-- Part
CREATE TABLE part (
    part_number VARCHAR(120) NOT NULL,
    unit_price DECIMAL(19, 2) NOT NULL,
    description VARCHAR(280) NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(120) NOT NULL DEFAULT 'ordered',
    parts_order_number VARCHAR(120),
    FOREIGN KEY (parts_order_number) REFERENCES parts_order (
        parts_order_number
    ) ON DELETE CASCADE,
    CONSTRAINT chk_status CHECK (
        status IN ('ordered', 'received', 'installed')
    ),
    UNIQUE (parts_order_number, part_number)
    -- use application logic to prevent changing back to previous state
);
