-- connect to db
\c dealership

-- List relations present
\dt

--Create Customers
-- Fred is individual
INSERT INTO customer (
    tax_id, customer_type, phone_number, street, city, state, postal_code
) VALUES (
    '333445555',
    'i',
    '9198675301',
    '123 Maple',
    'Charlotte',
    'North Carolina',
    '27344'
) RETURNING *;

INSERT INTO individual (ssn, customer_type, first_name, last_name) VALUES (
    '333445555', 'i', 'Fred', 'Flintstone'
) RETURNING *;

-- Wilma is business
INSERT INTO customer (
    tax_id, customer_type, phone_number, street, city, state, postal_code
) VALUES (
    '555223333',
    'b',
    '9198675302',
    '124 Maple',
    'Charlotte',
    'North Carolina',
    '27344'
) RETURNING *;
INSERT INTO business (
    tin, business_name, title, first_name, last_name
) VALUES
('555223333', 'Rocky Motors', 'CEO', 'Wilma', 'Flinstone');

-- Alice is individual, widget corp is business
INSERT INTO customer (
    tax_id, customer_type, email, phone_number, street, city, state, postal_code
) VALUES
(
    '111222333',
    'i',
    'alice.jones@example.com',
    '1112223333',
    '123 Elm St',
    'CityX',
    'StateX',
    '11111'
),
(
    '444555666',
    'b',
    'contact@widgetcorp.com',
    '4445556666',
    '456 Oak St',
    'CityY',
    'StateY',
    '22222'
);

INSERT INTO individual (ssn, customer_type, first_name, last_name) VALUES
('111222333', 'i', 'Alice', 'Jones');

INSERT INTO business (
    tin, customer_type, business_name, title, first_name, last_name
) VALUES
('444555666', 'b', 'Widget Corp', 'CEO', 'Bob', 'Smith');



-- create the dealership employee users
INSERT INTO app_user (
    username, user_type, password, first_name, last_name) VALUES (
    'johndoe',
    'inventory_clerk', 'password', 'John', 'Doe'
) RETURNING *;
INSERT INTO inventory_clerk (username) VALUES ('johndoe') RETURNING *;

INSERT INTO app_user (
    username, user_type, password, first_name, last_name) VALUES (
    'janedoe',
    'sales_person', 'password', 'Jane', 'Doe'
) RETURNING *;
INSERT INTO salesperson (username) VALUES ('janedoe') RETURNING *;

INSERT INTO app_user (
    username, user_type, password, first_name, last_name) VALUES (
    'barrydoe',
    'manager', 'password', 'Barry', 'Doe'
) RETURNING *;

INSERT INTO app_user (
    username, user_type, password, first_name, last_name) VALUES (
    'ownerdoe',
    'owner', 'password', 'Owner', 'Doe'
) RETURNING *;
INSERT INTO inventory_clerk (username) VALUES ('ownerdoe') RETURNING *;
INSERT INTO salesperson (username) VALUES ('ownerdoe') RETURNING *;


-- sample "login" query
SELECT
    username,
    user_type
FROM app_user
WHERE username = 'ownerdoe' AND password = 'password';

-- add a vehicle (as an inventory clerk would have to do)
-- with null sale date + associate an inventory clerk
INSERT INTO vehicle (
    vin,
    description,
    horsepower,
    model_year,
    model,
    manufacturer,
    vehicle_type,
    purchase_price,
    purchase_date,
    condition,
    fuel_type,
    inventory_clerk,
    customer_seller
)
VALUES (
    '1119381208312',
    'very nice car',
    '1200',
    '1994',
    'Yukon',
    'Honda',
    'Truck',
    1000.00,
    '12-01-2001',
    'Good',
    'Gas',
    'johndoe',
    '555223333' -- Wilma's TIN
) RETURNING vin, purchase_price, customer_seller;

INSERT INTO vehicle (
    vin,
    description,
    horsepower,
    model_year,
    model,
    manufacturer,
    vehicle_type,
    purchase_price,
    purchase_date,
    condition,
    fuel_type,
    inventory_clerk,
    customer_seller
) VALUES (
    '2229381208312',
    'very nice car 2',
    1200,
    1995,
    'Yukon',
    'Honda',
    'Truck',
    1000.00,
    '12-01-2001',
    'Good',
    'Gas',
    'ownerdoe',
    '555223333' -- Wilma's TIN
) RETURNING vin, purchase_price, customer_seller;

INSERT INTO vehicle (
    vin,
    description,
    horsepower,
    model_year,
    model,
    manufacturer,
    vehicle_type,
    purchase_price,
    purchase_date,
    condition,
    fuel_type,
    inventory_clerk,
    customer_seller
) VALUES (
    '4449381208312',
    'Alice’s NICE Sedan',
    150,
    2018,
    'Civic',
    'Honda',
    'Sedan',
    22000.00,
    '05-15-2021',
    'Excellent',
    'Gas',
    'johndoe',
    '111222333'  -- Alice's tax ID
) RETURNING vin, purchase_price, customer_seller;
INSERT INTO vehicle (
    vin,
    description,
    horsepower,
    model_year,
    model,
    manufacturer,
    vehicle_type,
    purchase_price,
    purchase_date,
    condition,
    fuel_type,
    inventory_clerk,
    customer_seller
) VALUES (
    'WXY9381208312',  -- New VIN
    'Widget Nice Corp Delivery Van',
    200,
    2022,
    'Transit',
    'Ford',
    'Van',
    35000.00,
    '02-01-2022',
    'Fair',
    'Gas',
    'ownerdoe',  -- Owner
    '444555666'  -- Widget Corp's TIN
) RETURNING vin, purchase_price, customer_seller;
INSERT INTO vehicle (
    vin,
    description,
    horsepower,
    model_year,
    model,
    manufacturer,
    vehicle_type,
    purchase_price,
    purchase_date,
    condition,
    fuel_type,
    inventory_clerk,
    customer_seller
) VALUES (
    '3339381208312',
    'NICE sporty sedan',
    1500,
    2020,
    'Civic',
    'Honda',
    'Sedan',
    20000.00,
    '03-01-2024',
    'Excellent',
    'Gas',
    'johndoe',
    '333445555'
);

-- Adding vehicles for Alice Jones (customer_seller: 111222333, salesperson: ownerdoe)
INSERT INTO vehicle (
    vin,
    description,
    horsepower,
    model_year,
    model,
    manufacturer,
    vehicle_type,
    purchase_price,
    purchase_date,
    condition,
    fuel_type,
    inventory_clerk,
    customer_seller
) VALUES (
    'ABC9381208312',
    'compact SUV very NIce',
    1600,
    2021,
    'CR-V',
    'Honda',
    'SUV',
    25000.00,
    '03-02-2024',
    'Very Good',
    'Gas',
    'ownerdoe',
    '111222333'
);

INSERT INTO vehicle (
    vin,
    description,
    horsepower,
    model_year,
    model,
    manufacturer,
    vehicle_type,
    purchase_price,
    purchase_date,
    condition,
    fuel_type,
    inventory_clerk,
    customer_seller
) VALUES (
    '5559381208312',
    'luxury sedan extremely nice',
    2000,
    2022,
    'Accord',
    'Honda',
    'Sedan',
    35000.00,
    '03-03-2024',
    'Excellent',
    'Gas',
    'johndoe',
    '444555666' -- Widget
);

INSERT INTO vehicle (
    vin,
    description,
    horsepower,
    model_year,
    model,
    manufacturer,
    vehicle_type,
    purchase_price,
    purchase_date,
    condition,
    fuel_type,
    inventory_clerk,
    customer_seller
) VALUES (
    '6669381208312',
    'nice full-size truck',
    2500,
    2023,
    'F-150',
    'Ford',
    'Truck',
    30000.00,
    '03-04-2024',
    'Good',
    'Gas',
    'ownerdoe',
    '333445555' -- Fred
);

-- another identical BUT will have parts pending
INSERT INTO vehicle (
    vin,
    description,
    horsepower,
    model_year,
    model,
    manufacturer,
    vehicle_type,
    purchase_price,
    purchase_date,
    condition,
    fuel_type,
    inventory_clerk,
    customer_seller
) VALUES (
    '8889381208312',
    'nice full-size truck',
    2500,
    2023,
    'F-150',
    'Ford',
    'Truck',
    30000.00,
    '03-04-2024',
    'Good',
    'Gas',
    'ownerdoe',
    '333445555' -- Fred
);

-- another one like above 
INSERT INTO vehicle (
    vin,
    description,
    horsepower,
    model_year,
    model,
    manufacturer,
    vehicle_type,
    purchase_price,
    purchase_date,
    condition,
    fuel_type,
    inventory_clerk,
    customer_seller,
    salesperson,
    customer_buyer,
    sale_date
) VALUES (
    '7779381208312',
    'nice full-size truck',
    2500,
    2023,
    'F-150',
    'Ford',
    'Truck',
    30000.00,
    '03-04-2024',
    'Good',
    'Gas',
    'ownerdoe',
    '333445555', -- Fred
    'ownerdoe',
    '333445555', -- Fred
    '04-04-2024'
);

-- Insert colors for VIN WXY9381208312
INSERT INTO vehicle_color (vin, color) VALUES
('WXY9381208312', 'Red'),
('WXY9381208312', 'Blue');

-- Insert colors for VIN 3339381208312
INSERT INTO vehicle_color (vin, color) VALUES
('3339381208312', 'Green'),
('3339381208312', 'Black'),
('3339381208312', 'Gold');

-- Insert colors for VIN ABC9381208312
INSERT INTO vehicle_color (vin, color) VALUES
('ABC9381208312', 'Gray'),
('ABC9381208312', 'Maroon');

-- Insert colors for VIN 5559381208312
INSERT INTO vehicle_color (vin, color) VALUES
('5559381208312', 'Silver'),
('5559381208312', 'Bronze'),
('5559381208312', 'Cream');

-- Insert colors for VIN 6669381208312
INSERT INTO vehicle_color (vin, color) VALUES
('6669381208312', 'Navy'),
('6669381208312', 'Orange');

-- Insert colors for VIN 1119381208312
INSERT INTO vehicle_color (vin, color) VALUES
('1119381208312', 'Turquoise'),
('1119381208312', 'Pink'),
('1119381208312', 'White');

-- Insert colors for VIN 4449381208312
INSERT INTO vehicle_color (vin, color) VALUES
('4449381208312', 'Beige'),
('4449381208312', 'Rust');

-- Insert colors for VIN 2229381208312
INSERT INTO vehicle_color (vin, color) VALUES
('2229381208312', 'Claret'),
('2229381208312', 'Brown'),
('2229381208312', 'Yellow');
