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
INSERT INTO business (tin, customer_type, business_name, title, first_name, last_name) 
VALUES ('555223333', 'b', 'Wilma Motorsports', 'CEO', 'Wilma', 'Flintstone'),
('555223334', 'b', 'Wilma Motorsports', 'CEO', 'Wilma', 'Flintstone')
 RETURNING *;


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
INSERT INTO vehicle (vin, description, horsepower, model_year, model, manufacturer, vehicle_type, purchase_price, purchase_date, condition, fuel_type, employee_buyer, customer_seller) 
VALUES ('1119381208312', 'very nice car', 1200, 1994, 'Yukon', 'Honda', 'Truck', 1000.00, '12-01-2001', 'Good', 'Gas', 'johndoe', '555223333') RETURNING vin;

INSERT INTO vehicle (vin, description, horsepower, model_year, model, manufacturer, vehicle_type, purchase_price, purchase_date, condition, fuel_type, employee_buyer, customer_seller) VALUES ('2229381208312', 'very nice car 2', 1200, 1995, 'Yukon', 'Honda', 'Truck', 1000.00, '12-01-2001', 'Good', 'Gas', 'ownerdoe', '555223333') RETURNING vin;

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


-- |More Customers/Vehicles Bought|
INSERT INTO customer (tax_id, customer_type, email, phone_number, street, city, state, postal_code) VALUES
('111222333', 'i', 'alice.jones@example.com', '111-222-3333', '123 Elm St', 'CityX', 'StateX', '11111'),
('444555666', 'b', 'contact@widgetcorp.com', '444-555-6666', '456 Oak St', 'CityY', 'StateY', '22222');

INSERT INTO individual (ssn, customer_type, first_name, last_name) VALUES
('111222333', 'i', 'Alice', 'Jones');

INSERT INTO business (tin, customer_type, business_name, title, first_name, last_name) VALUES
('444555666', 'b', 'Widget Corp', 'CEO', 'Bob', 'Smith');


INSERT INTO vehicle (vin, description, horsepower, model_year, model, manufacturer, vehicle_type, purchase_price, purchase_date, condition, fuel_type, employee_buyer, customer_seller, total_parts_price, employee_seller, customer_buyer, sale_date) VALUES
('1HGCM82633A123456', 'Sedan Model X', 150, 2022, 'Model X', 'Honda', 'Sedan', 22000.00, '2023-05-10', 'Excellent', 'Gas', 'employee1', '111222333', 500.00, 'employee2', '111222333', NULL), 
('1HGCM82633A123457', 'Truck Model Y', 250, 2023, 'Model Y', 'Ford', 'Truck', 32000.00, '2023-06-15', 'Very Good', 'Gas', 'employee3', '444555666', 1000.00, 'employee4', '444555666', NULL);


INSERT INTO parts_order (ordinal, vin, total_parts_price, vendor_name) VALUES
(1, '1HGCM82633A123456', 500.00, 'Parts Vendor A'), 
(1, '1HGCM82633A123457', 1000.00, 'Parts Vendor B');


INSERT INTO part (part_number, unit_price, description, quantity, status, parts_order_number) VALUES
('PART001', 250.00, 'Engine Part A', 1, 'installed', '1HGCM82633A123456-001'),
('PART002', 250.00, 'Brake Part B', 1, 'installed', '1HGCM82633A123456-001'),
('PART003', 500.00, 'Wheel Part C', 2, 'installed', '1HGCM82633A123457-001'),
('PART004', 500.00, 'Suspension Part D', 1, 'installed', '1HGCM82633A123457-001');


-- Check total prices are updated
SELECT * FROM parts_order;
SELECT vin, total_parts_price, purchase_price, sale_price FROM vehicle_with_sale_price;

-- update parts status
UPDATE part
SET status = 'installed'
WHERE parts_order_number IN (
    SELECT parts_order_number
    FROM parts_order
    WHERE vin = '1119381208312'
);
-- search all vehicles with parts completed and return things for search screen
SELECT vw.vin, vw.sale_price, vw.model, vw.model_year
FROM vehicle_with_sale_price vw
WHERE vw.vin NOT IN (
    SELECT po.vin
    FROM parts_order po
    JOIN part p ON p.parts_order_number = po.parts_order_number
    AND p.status <> 'installed'
    WHERE po.vin = vw.vin
);
-- search all vehicles and return things for search screen
-- return things for vehicle detail screen 
-- sell the vehicle (update with customer, sales person, sale date)
UPDATE vehicle
SET 
    sale_date = CURRENT_DATE,
    customer_buyer = '111223333', -- Replace with the tax_id of the chosen seller (e.g., Fred Flintstone)
    employee_seller = 'ownerdoe'   -- The username of the owner employee
WHERE vehicle.vin = '1119381208312' RETURNING vin, purchase_date, purchase_price, sale_date, customer_seller, customer_buyer, employee_seller, employee_buyer; -- Specify the VIN of the vehicle you want to update


--||REPORTS||==
-- run queries that returns each of the reports

-- REPORT 1: View Seller's History
SELECT
nameBusiness, vehicleCount, averagePurchasePrice, totalPartsCount, averagePartsCostPerVehiclePurchased  
--(higlighting) 
-- CASE WHEN ($averagePartsCostPerVehicle > 500 OR averagePartsPerVehicle > 5) THEN ‘highlight’ 
-- ELSE ‘no-highlight’ END AS highlight_class 
FROM  
(
SELECT nameBusiness,
--cb.customer_type, b.business_name, i.first_name, i.last_name, 
SUM(p.quantity) AS totalPartsCount, 
SUM(a.total_parts_price) AS totalPartsPrice, 
SUM(a.total_parts_price) / COUNT(DISTINCT a.VIN) AS averagePartsCostPerVehiclePurchased, 
SUM(p.quantity) / COUNT(DISTINCT a.VIN) AS averagePartsPerVehicle, 
SUM(a.purchase_price)/COUNT(DISTINCT a.VIN) as averagePurchasePrice, 
COUNT (DISTINCT a.VIN) AS vehicleCount 
FROM 
( 
SELECT v.customer_seller, --v.customer_buyer, 
v.purchase_price, v.total_parts_price, v.vin, cb.tax_id, 
COALESCE(CONCAT(i.first_name, ' ', i.last_name), b.business_name) AS nameBusiness
FROM Vehicle v JOIN
Customer cb ON v.customer_buyer = cb.tax_id
LEFT JOIN individual i ON cb.tax_id = i.ssn
LEFT JOIN business b ON cb.tax_id = b.tin --, po.ordinal
JOIN Customer cs ON v.customer_seller = cs.tax_id
) AS a
JOIN  
parts_order po ON po.vin = a.vin 
JOIN 
part p ON po.parts_order_number = p.parts_order_number

GROUP BY a.tax_id, nameBusiness
) 
AS s 
ORDER BY vehicleCount DESC, averagePurchasePrice ASC;

-- REPORT 2: Average time in inventory grouped by vehicle type
SELECT vehicle_type, AVG(DATE_PART('day', sale_date::timestamp - purchase_date::timestamp) + 1) AS average_time_in_inventory 
FROM vehicle WHERE sale_date IS NOT NULL GROUP BY vehicle_type;

-- REPORT 3: View Price Per Condition
SELECT vehicle_type,  
SUM(CASE WHEN Condition = 'Excellent' THEN purchase_price ELSE 0 END) AS ExcellentTotalPrice, 
SUM(CASE WHEN Condition = 'Very Good' THEN purchase_price ELSE 0 END) AS VeryGoodTotalPrice, 
SUM(CASE WHEN Condition = 'Good' THEN purchase_price ELSE 0 END) AS GoodTotalPrice,  
SUM(CASE WHEN Condition = 'Fair' THEN purchase_price ELSE 0 END) AS FairTotalPrice  
FROM Vehicle  
GROUP BY vehicle_type; 

-- REPORT 4: View Parts Stats
SELECT vendor.Name,  
       SUM(part.Quantity) AS TotalPartsQuantity,  
       SUM(part.Quantity * part.unit_price) AS VendorTotalExpense 
FROM Parts_Order partsorder
JOIN Part part ON partsorder.parts_order_number = part.parts_order_number 
JOIN Vendor vendor ON vendor.name = partsorder.vendor_name
GROUP BY Vendor.Name 
ORDER BY VendorTotalExpense DESC; 

--5) Monthly Sales Report
--P1) Monthly Summary
SELECT date_part('year', sale_date) as yearSold, 
date_part('month',sale_date) as monthSold, 
numberVehicles, grossIncome, (grossIncome - totalExpense) as netIncome 
FROM 
(SELECT  
COUNT(DISTINCT VIN) as numberVehicles, 
SUM(purchase_price) as grossIncome,  
sale_date,  
SUM(v.total_parts_price) as totalExpense
FROM Vehicle v
WHERE sale_date is not NULL
GROUP BY sale_date)a
GROUP BY date_part('year', sale_date), date_part('month',sale_date), numberVehicles, grossIncome, totalExpense
HAVING grossIncome > 0
ORDER BY date_part('year', sale_date) DESC,date_part('month',sale_date)  DESC ;

--P2) Drilldown Summary
SELECT au.first_name, au.last_name, vehicleSold, totalSales
FROM  
(SELECT COUNT(DISTINCT v.VIN) as VehicleSold, SUM(purchase_price) AS totalSales, e.username
FROM Vehicle v JOIN Employee_Seller e ON v.employee_seller = e.username 
GROUP BY e.username) a
JOIN App_User au ON a.username = au.username 
--WHERE EXTRACT(YEAR FROM v.sale_date) = {(int type > 999)‘YEAR OF DATETIME SELECTED FOR DRILLDOWN’}  
--AND EXTRACT(MONTH FROM v.sale_date) = {(int type>0){MONTH OF DATETIME SELECTED FOR DRILLDOWN’} 
GROUP BY au.first_name, au.last_name, vehicleSold, totalSales
ORDER BY vehicleSold DESC, totalSales DESC 