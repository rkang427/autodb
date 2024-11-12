-- Connect to database
\c dealership;
-- Step 5: Drop the staging tables after data is inserted into target tables
DROP TABLE IF EXISTS staging_parts_order;
DROP TABLE IF EXISTS staging_part;

-- Step 1: Create staging tables with extra columns to match the CSV structure
-- We'll add 2 extra columns in the staging tables to match the 8 columns in the CSV (you can adjust this if more columns exist in your actual file).

CREATE TABLE staging_parts_order (
    vin VARCHAR(17),
    ordinal INTEGER,
    vendor_name VARCHAR(120),
    extra_column_1 VARCHAR(255),  -- Extra column 1 (can be NULL or hold extra data)
    extra_column_2 VARCHAR(255),   -- Extra column 2 (can be NULL or hold extra data)
    extra_column_3 VARCHAR(255),  -- Extra column 2 (can be NULL or hold extra data)
    extra_column_4 VARCHAR(255)   -- Extra column 2 (can be NULL or hold extra data)
);

CREATE TABLE staging_part (
    vin VARCHAR(17),
    ordinal INTEGER,
    part_number VARCHAR(120),
    description VARCHAR(280),
    unit_price DECIMAL(19, 2),
    status VARCHAR(120),
    quantity INT
    -- parts_order_number VARCHAR(21) -- Computed based on vin and ordinal
);

-- Step 2: Use \copy command to load data from CSV into staging tables
-- We'll load all columns from the CSV into the staging tables, using extra columns to capture unwanted data.

-- For parts_order data: Map the relevant columns and ignore extra ones
\copy staging_parts_order(vin, ordinal, vendor_name, extra_column_1, extra_column_2, extra_column_3, extra_column_4) FROM 'Phase_3/Demo_Data/parts.tsv' DELIMITER E'\t' CSV HEADER;

-- For part data: Map the relevant columns and ignore extra ones
\copy staging_part(vin, ordinal, part_number, description, unit_price, status, quantity) FROM 'Phase_3/Demo_Data/parts.tsv' DELIMITER E'\t' CSV HEADER;

-- Step 3: Insert data into parts_order table (only the necessary columns)
-- We use the relevant columns and let PostgreSQL compute parts_order_number

INSERT INTO parts_order (vin, ordinal, vendor_name)
SELECT vin, ordinal, vendor_name
FROM staging_parts_order;

-- Step 4: Insert data into part table, using computed parts_order_number (ordinal-vin format)
INSERT INTO part (part_number, unit_price, description, quantity, status, parts_order_number)
SELECT
    sp.part_number,
    sp.unit_price,
    sp.description,
    sp.quantity,
    sp.status,
    sp.vin || '-' || sp.ordinal AS parts_order_number
FROM staging_part sp;

-- Step 5: Drop the staging tables after data is inserted into target tables
DROP TABLE IF EXISTS staging_parts_order;
DROP TABLE IF EXISTS staging_part;
 