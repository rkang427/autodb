-- Connect to the dealership database
\c dealership;

-- Step 1: Drop existing staging tables (if any) before creating new ones
DROP TABLE IF EXISTS staging_parts_order;
DROP TABLE IF EXISTS staging_part;

-- Step 2: Create staging tables with extra columns to match the TSV structure

-- Create staging table for parts orders
CREATE TABLE staging_parts_order (
    vin VARCHAR(17),
    ordinal INTEGER,
    vendor_name VARCHAR(120),
    extra_column_1 VARCHAR(255),
    extra_column_2 VARCHAR(255),
    extra_column_3 VARCHAR(255),
    extra_column_4 VARCHAR(255),
    extra_column_5 VARCHAR(255)
);

-- Create staging table for parts
CREATE TABLE staging_part (
    vin VARCHAR(17),
    ordinal INTEGER,
    extra_column_1 VARCHAR(255),
    part_number VARCHAR(120),
    description VARCHAR(280),
    unit_price DECIMAL(19, 2),
    status VARCHAR(120),
    quantity INT
);

-- Step 3: Use \copy command to load data from the TSV file into the staging tables

-- Load data into staging_parts_order table
-- We match the columns to load data and capture any extra columns into the extra placeholders
\copy staging_parts_order(vin, ordinal, vendor_name, extra_column_1, extra_column_2, extra_column_3, extra_column_4, extra_column_5) FROM 'Phase_3/Demo_Data/parts.tsv' DELIMITER E'\t' CSV HEADER;

-- Load data into staging_part table
-- We capture any extra columns into the extra placeholders
\copy staging_part(vin, ordinal,extra_column_1, part_number, description, unit_price, status, quantity) FROM 'Phase_3/Demo_Data/parts.tsv' DELIMITER E'\t' CSV HEADER;

-- Step 4: Insert data into parts_order table (only the necessary columns)
-- We only need vin, ordinal, and vendor_name from the staging_parts_order table
INSERT INTO parts_order (vin, ordinal, vendor_name)
SELECT vin, ordinal, vendor_name
FROM staging_parts_order
ON CONFLICT (vin, ordinal) DO NOTHING;;

-- Step 5: Insert data into part table
-- The parts_order_number is created by concatenating vin and ordinal (vin-ordinal format)
INSERT INTO part (part_number, unit_price, description, quantity, status, parts_order_number)
SELECT
    sp.part_number,
    sp.unit_price,
    sp.description,
    sp.quantity,
    sp.status,
    sp.vin || '-' || LPAD(CAST(sp.ordinal AS VARCHAR), 3, '0') AS parts_order_number
FROM staging_part sp;

-- Step 6: Drop the staging tables after the data is successfully inserted
DROP TABLE IF EXISTS staging_parts_order;
DROP TABLE IF EXISTS staging_part;

