-- connect to db
\c dealership

-- List relations present
\dt

--Create Customers
-- Fred is an individual
INSERT INTO customer (tax_id, customer_type, phone_number, street, city, state, postal_code) VALUES ('111223333', 'i', '9198675301', '123 Maple', 'Charlotte', 'North Carolina', '27344') RETURNING *;
INSERT INTO individual (ssn, customer_type, first_name, last_name) VALUES ('111223333', 'i', 'Fred', 'Flintstone') RETURNING *;

-- Wilma represents a business
INSERT INTO customer (tax_id, customer_type, phone_number, street, city, state, postal_code) VALUES ('555223333', 'b', '9198675302', '124 Maple', 'Charlotte', 'North Carolina', '27344') RETURNING *;
INSERT INTO business (tin, customer_type, business_name, title, first_name, last_name) VALUES ('555223333', 'b', 'Wilma Motorsports', 'CEO', 'Wilma', 'Flintstone') RETURNING *;


-- create the dealership employee users
INSERT INTO app_user(username, user_type, password, first_name, last_name) VALUES ('johndoe',
'inventory_clerk', 'password', 'John', 'Doe') RETURNING *;
INSERT INTO employee_buyer(username) VALUES ('johndoe') RETURNING *;

INSERT INTO app_user(username, user_type, password, first_name, last_name) VALUES ('janedoe',
'sales_person', 'password', 'Jane', 'Doe') RETURNING *;
INSERT INTO employee_seller(username) VALUES ('janedoe') RETURNING *;

INSERT INTO app_user(username, user_type, password, first_name, last_name) VALUES ('barrydoe',
'manager', 'password', 'Barry', 'Doe') RETURNING *;

INSERT INTO app_user(username, user_type, password, first_name, last_name) VALUES ('ownerdoe',
'owner', 'password', 'Owner', 'Doe') RETURNING *;
INSERT INTO employee_buyer(username) VALUES ('ownerdoe') RETURNING *;
INSERT INTO employee_seller(username) VALUES ('ownerdoe') RETURNING *;

-- sample "login" query
SELECT username, user_type FROM app_user WHERE username = 'ownerdoe' AND password = 'password';

-- add a vehicle (as an inventory clerk would have to do) with null sale date + associate an inventory clerk
INSERT INTO vehicle (vin, description, horsepower, year, model, manufacturer, vehicle_type, purchase_price, purchase_date, condition, fuel_type, employee_buyer, customer_seller) VALUES ('1119381208312', 'very nice car', 1200, 1994, 'Yukon', 'Honda', 'Truck', 1000.00, '12-01-2001', 'Good', 'Gas', 'johndoe', '555223333') RETURNING vin;

INSERT INTO vehicle (vin, description, horsepower, year, model, manufacturer, vehicle_type, purchase_price, purchase_date, condition, fuel_type, employee_buyer, customer_seller) VALUES ('2229381208312', 'very nice car 2', 1200, 1995, 'Yukon', 'Honda', 'Truck', 1000.00, '12-01-2001', 'Good', 'Gas', 'ownerdoe', '555223333') RETURNING vin;

-- add vendors
INSERT INTO vendor (name, phone_number, street, city, state, postal_code) VALUES ('Best Parts Supplier', '1234567890', '123 Main St', 'Anytown', 'NY', '12345') RETURNING *;
INSERT INTO vendor (name, phone_number, street, city, state, postal_code) VALUES ('Napa Auto Parts', '9198675309', '555 West St', 'Othertown', 'WV', '78787') RETURNING *;

-- sample select vendor by name
SELECT name, phone_number, street, city, state, postal_code FROM vendor WHERE name = 'Best Parts Supplier';

-- add a parts order for the vehicle
INSERT INTO parts_order (vin, ordinal, vendor_name) SELECT '1119381208312', COUNT(*) + 1, 'Best Parts Supplier' from parts_order WHERE vin='1119381208312' RETURNING parts_order_number;

-- Insert parts associated with the parts order
INSERT INTO part (part_number, unit_price, description, quantity, status, parts_order_number)
VALUES
('PART-001', 50.00, 'Brake Pads', 4, 'ordered', '1119381208312-001'),
('PART-002', 20.00, 'Oil Filter', 2, 'ordered', '1119381208312-001'),
('PART-003', 100.00, 'Windshield Wipers', 1, 'ordered', '1119381208312-001') RETURNING *;

-- Check total prices are updated
SELECT * FROM parts_order;
SELECT vin, total_parts_price, purchase_price, sale_price FROM vehicle_with_sale_price;


-- add another parts order for the vehicle
INSERT INTO parts_order (vin, ordinal, vendor_name) SELECT '1119381208312', COUNT(*) + 1, 'Best Parts Supplier' from parts_order WHERE vin='1119381208312' RETURNING parts_order_number;

-- add parts order for different vehicle
INSERT INTO parts_order (vin, ordinal, vendor_name) SELECT '2229381208312', COUNT(*) + 1, 'Best Parts Supplier' from parts_order WHERE vin='2229381208312' RETURNING parts_order_number;

-- Insert parts associated with the parts order
INSERT INTO part (part_number, unit_price, description, quantity, status, parts_order_number)
VALUES
('PART-001', 50.00, 'Brake Pads', 4, 'ordered', '1119381208312-002'),
('PART-002', 20.00, 'Oil Filter', 2, 'ordered', '1119381208312-002'),
('PART-003', 100.00, 'Windshield Wipers', 1, 'ordered', '1119381208312-002'),
('PART-004', 50.00, 'Seatbelt', 1, 'ordered', '2229381208312-001') RETURNING *;

-- Check total prices are updated
SELECT * FROM parts_order;
SELECT vin, total_parts_price, purchase_price, sale_price FROM vehicle_with_sale_price;
-- update parts status
-- search all vehicles with parts completed and return things for search screen
-- search all vehicles and return things for search screen
-- return things for vehicle detail screen 
-- sell the vehicle (update with customer, sales person, sale date)
-- run queries that returns each of the reports
