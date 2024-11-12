-- Connect to database
\c dealership;

-- Step 1: Create the staging table
CREATE TABLE staging_vehicle_data (
    vin VARCHAR(17),
    model VARCHAR(120),
    model_year INT,
    description VARCHAR(280),
    manufacturer VARCHAR(120),
    condition VARCHAR(10),
    vehicle_type VARCHAR(50),
    horsepower SMALLINT,
    fuel_type VARCHAR(20),
    colors VARCHAR(50),  -- This field will store multiple colors as a comma-separated list
    purchase_date DATE,
    purchase_price DECIMAL(19, 2),
    customer_seller VARCHAR(9),
    inventory_clerk VARCHAR(50),
    sale_date DATE,
    customer_buyer VARCHAR(9),
    salesperson VARCHAR(50)
);

-- Step 2: Load data from the TSV file into the staging table
-- Update the path with the actual location of your file
\copy staging_vehicle_data FROM 'Phase_3/Demo_Data/vehicles.tsv' DELIMITER E'\t' CSV HEADER;


-- Step 3: Insert data into the vehicle table
INSERT INTO vehicle (
    vin, model, model_year, description, manufacturer, condition, vehicle_type,
    horsepower, fuel_type, purchase_date, purchase_price, customer_seller,
    inventory_clerk, sale_date, customer_buyer, salesperson
)
SELECT 
    vin, model, model_year, description, manufacturer, condition, vehicle_type,
    horsepower, fuel_type, purchase_date, purchase_price, customer_seller,
    inventory_clerk, sale_date, customer_buyer, salesperson
FROM staging_vehicle_data;

-- Step 4: Insert data into the vehicle_color table for each color
-- This query uses UNNEST and STRING_TO_ARRAY to handle multiple colors
INSERT INTO vehicle_color (vin, color)
SELECT vin, TRIM(color) AS color
FROM staging_vehicle_data,
LATERAL UNNEST(STRING_TO_ARRAY(colors, ',')) AS color;

-- Step 5: Clean up by dropping the staging table
DROP TABLE IF EXISTS staging_vehicle_data;
