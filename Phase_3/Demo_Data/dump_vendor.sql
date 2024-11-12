-- Connect to the dealership database
\c dealership;

-- Step 1: Load data into the vendor table from the TSV file
\copy vendor(name, phone_number, street, city, state, postal_code) FROM 'Phase_3/Demo_Data/vendors.tsv' DELIMITER E'\t' CSV HEADER;
