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
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(250) NOT NULL,
    user_type VARCHAR(60) NOT NULL,
    password VARCHAR(120) NOT NULL,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    UNIQUE (email)
);
-- created vendor table 
CREATE TABLE vendor (
    name VARCHAR(100) PRIMARY KEY,
    postal_code VARCHAR(250) NOT NULL,
    street VARCHAR(250) NOT NULL,
    city VARCHAR(120) NOT NULL,
    phone_number VARCHAR(10) NOT NULL,
    state VARCHAR(120) NOT NULL
);
