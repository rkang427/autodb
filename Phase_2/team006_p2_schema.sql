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
    email VARCHAR(250) PRIMARY KEY,
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
    postal_code VARCHAR(250) NOT NULL,
    street VARCHAR(250) NOT NULL,
    city VARCHAR(120) NOT NULL,
    phone_number VARCHAR(12) NOT NULL,
    state VARCHAR(120) NOT NULL
);

-- Vehicle table
CREATE TABLE vehicle (
    VIN VARCHAR(17) PRIMARY KEY,
    sale_date DATE NULL,
    sale_price DECIMAL(19,4) NULL,
    total_parts_price DECIMAL(19,4) NULL,
    description VARCHAR(150) NULL,
    horsepower SMALLINT NOT NULL,
    year YEAR NOT NULL,
    model VARCHAR(50) NOT NULL,
    purchase_price DECIMAL(19,4) NOT NULL,
    purchase_date DATE NOT NULL,
    condition VARCHAR(10) NOT NULL,
    CHECK (condition IN ('Excellent', 'Very Good', 'Good', 'Fair')),
    fuel_type VARCHAR(10) NOT NULL,
    CHECK (fuel_type IN ('Gas', 'Diesel', 'Natural Gas', 'Hybrid', 'Plugin Hybrid', 'Battery',  'Fuel Cell')),
    buyer_username VARCHAR(50) NOT NULL,
    FOREIGN KEY (buyer_username) REFERENCES VehicleBuyer(username),
    seller_username VARCHAR(50) NULL,
    FOREIGN KEY (seller_username) REFERENCES VehicleSeller(username)
);

-- VehicleColors
CREATE TABLE VehicleColors (
    VIN VARCHAR(17) NOT NULL,
    color VARCHAR(10) NOT NULL,
    CHECK (color IN ('Aluminum', 'Beige','Black','Blue','Brown','Bronze','Claret','Copper','Cream','Gold','Gray','Green','Maroon','Metallic','Navy','Orange','Pink','Purple','Red','Rose','Rust','Silver','Tan','Turquoise','White','Yellow')),
    FOREIGN KEY (VIN) REFERENCES Vehicle(VIN)
)
