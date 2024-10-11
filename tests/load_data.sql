-- connect to db
\c dealership

-- List relations present
\dt

--Create Customers
-- Fred is an individual
insert into customer (tax_id, customer_type, phone_number, street, city, state, postal_code) VALUES ('111223333', 'i', '9198675301', '123 Maple', 'Charlotte', 'North Carolina', '27344') RETURNING *;
insert into individual (ssn, customer_type, first_name, last_name) VALUES ('111223333', 'i', 'Fred', 'Flintstone') RETURNING *;

-- Wilma represents a business
insert into customer (tax_id, customer_type, phone_number, street, city, state, postal_code) VALUES ('555223333', 'b', '9198675302', '124 Maple', 'Charlotte', 'North Carolina', '27344') RETURNING *;
insert into business (tin, customer_type, business_name, title, first_name, last_name) VALUES ('555223333', 'b', 'Wilma Motorsports', 'CEO', 'Wilma', 'Flintstone') RETURNING *;


-- create the dealership employee users
insert into app_user(username, user_type, password, first_name, last_name) VALUES ('johndoe',
'inventory_clerk', 'password', 'John', 'Doe') RETURNING *;
insert into employee_buyer(username) VALUES ('johndoe') RETURNING *;

insert into app_user(username, user_type, password, first_name, last_name) VALUES ('janedoe',
'sales_person', 'password', 'Jane', 'Doe') RETURNING *;
insert into employee_seller(username) VALUES ('janedoe') RETURNING *;

insert into app_user(username, user_type, password, first_name, last_name) VALUES ('barrydoe',
'manager', 'password', 'Barry', 'Doe') RETURNING *;

insert into app_user(username, user_type, password, first_name, last_name) VALUES ('ownerdoe',
'owner', 'password', 'Owner', 'Doe') RETURNING *;
insert into employee_buyer(username) VALUES ('ownerdoe') RETURNING *;
insert into employee_seller(username) VALUES ('ownerdoe') RETURNING *;


-- add a vehicle (as an inventory clerk would have to do) with null sale date + associate an inventory clerk
INSERT INTO vehicle (vin, description, horsepower, year, model, manufacturer, vehicle_type, purchase_price, purchase_date, condition, fuel_type, employee_buyer, customer_seller) VALUES ('1119381208312', 'very nice car', 1200, 1994, 'Yukon', 'Honda', 'Truck', 1000.00, '12-01-2001', 'Good', 'Gas', 'johndoe', '555223333') RETURNING vin;

INSERT INTO vehicle (vin, description, horsepower, year, model, manufacturer, vehicle_type, purchase_price, purchase_date, condition, fuel_type, employee_buyer, customer_seller) VALUES ('2229381208312', 'very nice car 2', 1200, 1995, 'Yukon', 'Honda', 'Truck', 1000.00, '12-01-2001', 'Good', 'Gas', 'ownerdoe', '555223333') RETURNING vin;

-- add a vendor
INSERT INTO vendor (name, phone_number, street, city, state, postal_code) VALUES ('Best Parts Supplier', '1234567890', '123 Main St', 'Anytown', 'NY', '12345') RETURNING *;

-- add a parts order for the vehicle
INSERT INTO parts_order (vin, ordinal, vendor_name)
VALUES ('1119381208312', 1, 'Best Parts Supplier') RETURNING *;

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
INSERT INTO parts_order (vin, ordinal, vendor_name)
VALUES ('1119381208312', 2, 'Best Parts Supplier') RETURNING *;

-- add parts order for different vehicle
INSERT INTO parts_order (vin, ordinal, vendor_name)
VALUES ('2229381208312', 1, 'Best Parts Supplier') RETURNING *;

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
