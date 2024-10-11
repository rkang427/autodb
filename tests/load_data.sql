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
'inventory_clerk', 'password', 'John', 'Doe');
insert into employee_buyer(username) VALUES ('johndoe');

insert into app_user(username, user_type, password, first_name, last_name) VALUES ('janedoe',
'sales_person', 'password', 'Jane', 'Doe');
insert into employee_seller(username) VALUES ('janedoe');

insert into app_user(username, user_type, password, first_name, last_name) VALUES ('barrydoe',
'manager', 'password', 'Barry', 'Doe');

insert into app_user(username, user_type, password, first_name, last_name) VALUES ('ownerdoe',
'owner', 'password', 'Owner', 'Doe');
insert into employee_buyer(username) VALUES ('ownerdoe');
insert into employee_seller(username) VALUES ('ownerdoe');


-- add a vehicle (as an inventory clerk would have to do) with null sale date + associate an inventory clerk
INSERT INTO vehicle (vin, description, horsepower, year, model, manufacturer, vehicle_type, purchase_price, purchase_date, condition, fuel_type, employee_buyer, customer_seller) VALUES ('0129381208312', 'very nice car', 1200, 1994, 'Yukon', 'Honda', 'Truck', 1000.00, '12-01-2001', 'Good', 'Gas', 'johndoe', '555223333');

-- add a parts order for the vehicle
-- add parts to order
-- update parts status
-- search all vehicles with parts completed and return things for search screen
-- search all vehicles and return things for search screen
-- return things for vehicle detail screen 
-- sell the vehicle (update with customer, sales person, sale date)
-- run queries that returns each of the reports
