-- Connect to database
\c dealership;
-- 1. Create the staging table
CREATE TABLE staging_customer_data (
    customer_type CHAR(1),
    email VARCHAR(120),
    phone_number VARCHAR(10),
    street VARCHAR(120),
    city VARCHAR(120),
    state VARCHAR(120),
    postal_code VARCHAR(5),
    b_tax_id VARCHAR(9),
    business_name VARCHAR(120),
    b_first_name VARCHAR(120),
    b_last_name VARCHAR(120),
    title VARCHAR(120),
    i_tax_id VARCHAR(9),
    i_first_name VARCHAR(120),
    i_last_name VARCHAR(120)
);

-- 2. Load data from the TSV file into the staging table
-- COPY staging_customer_data
-- FROM '/Users/MacBook/Documents/Serhat/2024/Georgia Tech/24_Fall/DB/team_project/cs6400-2024-03-Team006/Phase_3/Demo_Data/customer.tsv'
-- DELIMITER E'\t'
-- CSV HEADER;

\copy staging_customer_data FROM 'Phase_3/Demo_Data/customer.tsv' DELIMITER E'\t' CSV HEADER;



-- 3. Insert data into the customer table
INSERT INTO customer (
    tax_id, customer_type, email, phone_number, street, city, state, postal_code
)
SELECT
    CASE
        WHEN customer_type = 'b' THEN b_tax_id
        ELSE i_tax_id
    END AS tax_id,
    customer_type,
    email,
    phone_number,
    street,
    city,
    state,
    postal_code
FROM staging_customer_data;

-- 4. Insert into the business table for business customers
INSERT INTO business (
    tin, business_name, title, first_name, last_name, customer_type
)
SELECT
    b_tax_id AS tin,
    business_name,
    title,
    b_first_name AS first_name,
    b_last_name AS last_name,
    customer_type
FROM staging_customer_data
WHERE customer_type = 'b';

-- 5. Insert into the individual table for individual customers
INSERT INTO individual (
    ssn, first_name, last_name, customer_type
)
SELECT
    i_tax_id AS ssn,
    i_first_name AS first_name,
    i_last_name AS last_name,
    customer_type
FROM staging_customer_data
WHERE customer_type = 'i';

-- 6. Clean up by dropping the staging table
DROP TABLE IF EXISTS staging_customer_data;
 