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

CREATE TABLE employee_buyer (
    username VARCHAR(120) NOT NULL UNIQUE,
    FOREIGN KEY (username) REFERENCES app_user (username) ON DELETE CASCADE
);

CREATE TABLE employee_seller (
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
    phone_number VARCHAR(12) NOT NULL,
    street VARCHAR(120) NOT NULL,
    city VARCHAR(120) NOT NULL,
    state VARCHAR(120) NOT NULL,
    postal_code VARCHAR(5) NOT NULL,
    UNIQUE (tax_id, customer_type)
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
    ) ON DELETE CASCADE
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
    ) ON DELETE CASCADE
);

-- Vehicle table
CREATE TABLE vehicle (
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
    total_parts_price DECIMAL(19, 2) DEFAULT 0.0,
    employee_seller VARCHAR(50) NULL,
    customer_buyer VARCHAR(9) NULL,
    sale_date DATE NULL,
    -- TODO: Generate sale price
    sale_price DECIMAL(19, 2) NULL,
    FOREIGN KEY (customer_seller) REFERENCES customer (
        tax_id
    ) ON DELETE CASCADE,
    FOREIGN KEY (customer_buyer) REFERENCES customer (
        tax_id
    ) ON DELETE CASCADE,
    FOREIGN KEY (employee_seller) REFERENCES employee_seller (
        username
    ) ON DELETE CASCADE,
    FOREIGN KEY (employee_buyer) REFERENCES employee_buyer (
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
    ordinal INTEGER,
    -- TODO: Generate ordinal on insert. We need to know count of parts
    -- order for this vin until then, application will have to do 
    -- SELECT COUNT FROM parts_order WHERE vin = $vin to calculate it
    -- we are at least insisting that combo of vin,ordinal is unique
    vin VARCHAR(17) NOT NULL,
    parts_order_number VARCHAR(21) GENERATED ALWAYS AS (
        vin || '-' || lpad(cast(ordinal AS VARCHAR), 3, cast(0 AS VARCHAR))
    ) STORED,
    total_parts_price DECIMAL(19, 2) DEFAULT 0.00,
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
    )
-- TODO: check when updating that new status is allowed.
-- have to go from ordered to received to installed
);

-- Function to calculate total_parts_price
CREATE OR REPLACE FUNCTION calculate_total_parts_price(
    po_number VARCHAR
)
RETURNS DECIMAL(19, 2) AS $$
DECLARE
    total_price DECIMAL(19, 2);
BEGIN
    SELECT SUM(unit_price * quantity) INTO total_price
    FROM part
    WHERE parts_order_number = po_number;

    RETURN COALESCE(total_price, 0.00);
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update total_parts_price
CREATE OR REPLACE FUNCTION update_total_parts_price()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate and update the total_parts_price for the associated parts order
    UPDATE parts_order
    SET total_parts_price = calculate_total_parts_price(NEW.parts_order_number)
    WHERE parts_order_number = NEW.parts_order_number;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update total_parts_price after inserting or updating a part
CREATE TRIGGER update_parts_order_total_trigger
AFTER INSERT OR UPDATE ON part
FOR EACH ROW
EXECUTE FUNCTION update_total_parts_price();

-- Function to calculate vehicle total_parts_price
CREATE OR REPLACE FUNCTION calculate_vehicle_total_parts_price(
    this_vin VARCHAR
)
RETURNS DECIMAL(19, 2) AS $$
DECLARE
    total_price DECIMAL(19, 2);
BEGIN
    SELECT SUM(total_parts_price) INTO total_price
    FROM parts_order
    WHERE vin = this_vin;

    RETURN COALESCE(total_price, 0.00);
END;
$$ LANGUAGE plpgsql;

-- Function to update vehicle total_parts_price
CREATE OR REPLACE FUNCTION update_vehicle_total_parts_price()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vehicle
    SET total_parts_price = calculate_vehicle_total_parts_price((SELECT vin FROM parts_order WHERE parts_order_number = NEW.parts_order_number))
    WHERE vin = (SELECT vin FROM parts_order WHERE parts_order_number = NEW.parts_order_number);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update total_parts_price after inserting or updating a part
CREATE TRIGGER update_vehicle_total_parts_price_trigger
AFTER INSERT OR UPDATE ON part
FOR EACH ROW
EXECUTE FUNCTION update_vehicle_total_parts_price();
