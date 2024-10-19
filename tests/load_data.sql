-- connect to db
\c dealership

-- List relations present
\dt

--Create Customers
-- Fred is an individual
INSERT INTO customer (
    tax_id, customer_type, phone_number, street, city, state, postal_code
) VALUES (
    '111223333',
    'i',
    '9198675301',
    '123 Maple',
    'Charlotte',
    'North Carolina',
    '27344'
) RETURNING *;

INSERT INTO individual (ssn, customer_type, first_name, last_name) VALUES (
    '111223333', 'i', 'Fred', 'Flintstone'
) RETURNING *;

-- Wilma represents a business
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



-- create the dealership employee users
INSERT INTO app_user (
    username, user_type, password, first_name, last_name) VALUES (
    'johndoe',
    'inventory_clerk', 'password', 'John', 'Doe'
) RETURNING *;
INSERT INTO employee_buyer (username) VALUES ('johndoe') RETURNING *;

INSERT INTO app_user (
    username, user_type, password, first_name, last_name) VALUES (
    'janedoe',
    'sales_person', 'password', 'Jane', 'Doe'
) RETURNING *;
INSERT INTO employee_seller (username) VALUES ('janedoe') RETURNING *;

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
INSERT INTO employee_buyer (username) VALUES ('ownerdoe') RETURNING *;
INSERT INTO employee_seller (username) VALUES ('ownerdoe') RETURNING *;


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
    employee_buyer,
    customer_seller
)
VALUES (
    '1119381208312',
    'very nice car',
    1200,
    1994,
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
    employee_buyer,
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

-- |More Customers/Vehicles Bought|
INSERT INTO customer (
    tax_id, customer_type, email, phone_number, street, city, state, postal_code
) VALUES
(
    '111222333',
    'i',
    'alice.jones@example.com',
    '111-222-3333',
    '123 Elm St',
    'CityX',
    'StateX',
    '11111'
),
(
    '444555666',
    'b',
    'contact@widgetcorp.com',
    '444-555-6666',
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
    employee_buyer,
    customer_seller
) VALUES (
    '4449381208312',  -- New VIN
    'Alice’s Sedan',
    150,
    2018,
    'Civic',
    'Honda',
    'Sedan',
    22000.00,
    '05-15-2021',
    'Excellent',
    'Gas',
    'johndoe',  -- Employee buyer
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
    employee_buyer,
    customer_seller
) VALUES (
    '5559381208312',  -- New VIN
    'Widget Corp Delivery Van',
    200,
    2022,
    'Transit',
    'Ford',
    'Van',
    35000.00,
    '02-01-2022',
    'Very Good',
    'Gas',
    'ownerdoe',  -- Owner
    '444555666'  -- Widget Corp's TIN
) RETURNING vin, purchase_price, customer_seller;

-- add vendors
INSERT INTO vendor (
    name, phone_number, street, city, state, postal_code
) VALUES (
    'Best Parts Supplier', '1234567890', '123 Main St', 'Anytown', 'NY', '12345'
) RETURNING *;
INSERT INTO vendor (
    name, phone_number, street, city, state, postal_code
) VALUES (
    'Napa Auto Parts', '9198675309', '555 West St', 'Othertown', 'WV', '78787'
) RETURNING *;

-- sample select vendor by name
SELECT
    name,
    phone_number,
    street,
    city,
    state,
    postal_code
FROM vendor
WHERE name = 'Best Parts Supplier';

-- add a parts order for the vehicle
INSERT INTO parts_order (vin, ordinal, vendor_name)
SELECT
    '1119381208312',
    COUNT(*) + 1,
    'Best Parts Supplier'
FROM parts_order
WHERE vin = '1119381208312' RETURNING parts_order_number;

-- Insert parts associated with the parts order
INSERT INTO part (
    part_number, unit_price, description, quantity, status, parts_order_number
)
VALUES
('PART-001', 50.00, 'Brake Pads', 4, 'ordered', '1119381208312-001'),
('PART-002', 20.00, 'Oil Filter', 2, 'ordered', '1119381208312-001'),
(
    'PART-003', 100.00, 'Windshield Wipers', 1, 'ordered', '1119381208312-001'
) RETURNING *;
-- update total parts price on vehicle
-- first vehicle
UPDATE vehicle v
SET
    total_parts_price = (
        SELECT COALESCE(SUM(p.quantity * p.unit_price), 0)
        FROM part AS p
        INNER JOIN
            parts_order AS po
            ON p.parts_order_number = po.parts_order_number
        WHERE po.vin = '1119381208312'
    )
WHERE v.vin = '1119381208312';
-- second vehicle
UPDATE vehicle v
SET
    total_parts_price = (
        SELECT COALESCE(SUM(p.quantity * p.unit_price), 0)
        FROM part AS p
        INNER JOIN
            parts_order AS po
            ON p.parts_order_number = po.parts_order_number
        WHERE po.vin = '2229381208312'
    )
WHERE v.vin = '2229381208312';

-- Check total prices are updated
SELECT * FROM parts_order;
SELECT
    vin,
    total_parts_price,
    purchase_price,
    ROUND((1.25 * purchase_price) + (1.1 * total_parts_price), 2) AS sale_price
FROM
    vehicle;


-- add another parts order for the vehicle
INSERT INTO parts_order (vin, ordinal, vendor_name)
SELECT
    '1119381208312',
    COUNT(*) + 1,
    'Best Parts Supplier'
FROM parts_order
WHERE vin = '1119381208312' RETURNING parts_order_number;

-- add parts order for different vehicles
INSERT INTO parts_order (vin, ordinal, vendor_name)
SELECT
    '2229381208312',
    COUNT(*) + 1,
    'Napa Auto Parts'
FROM parts_order
WHERE vin = '2229381208312' RETURNING parts_order_number;

INSERT INTO parts_order (vin, ordinal, vendor_name)
SELECT
    '4449381208312',
    COUNT(*) + 1,
    'Napa Auto Parts'
FROM parts_order
WHERE vin = '4449381208312' RETURNING parts_order_number;

-- Insert parts associated with the parts orders
INSERT INTO part (
    part_number, unit_price, description, quantity, status, parts_order_number
)
VALUES
('PART-001', 50.00, 'Brake Pads', 4, 'ordered', '1119381208312-002'),
('PART-002', 20.00, 'Oil Filter', 2, 'ordered', '1119381208312-002'),
('PART-003', 100.00, 'Windshield Wipers', 1, 'ordered', '1119381208312-002'),
('PART-004', 50.00, 'Seatbelt', 1, 'ordered', '2229381208312-001'),
('PART-003', 100.00, 'Windshield Wipers', 1, 'ordered', '4449381208312-001'),
('PART-004', 50.00, 'Seatbelt', 1, 'ordered', '4449381208312-001') RETURNING *;
-- update total prats price on vehicle
-- first vehicle
UPDATE vehicle v
SET
    total_parts_price = (
        SELECT COALESCE(SUM(p.quantity * p.unit_price), 0)
        FROM part AS p
        INNER JOIN
            parts_order AS po
            ON p.parts_order_number = po.parts_order_number
        WHERE po.vin = '1119381208312'
    )
WHERE v.vin = '1119381208312';
-- second vehicle
UPDATE vehicle v
SET
    total_parts_price = (
        SELECT COALESCE(SUM(p.quantity * p.unit_price), 0)
        FROM part AS p
        INNER JOIN
            parts_order AS po
            ON p.parts_order_number = po.parts_order_number
        WHERE po.vin = '2229381208312'
    )
WHERE v.vin = '2229381208312';
-- third vehicle
UPDATE vehicle v
SET
    total_parts_price = (
        SELECT COALESCE(SUM(p.quantity * p.unit_price), 0)
        FROM part AS p
        INNER JOIN
            parts_order AS po
            ON p.parts_order_number = po.parts_order_number
        WHERE po.vin = '4449381208312'
    )
WHERE v.vin = '4449381208312';


-- Check total prices are updated
SELECT * FROM parts_order;
SELECT
    vin,
    total_parts_price,
    purchase_price,
    ROUND((1.25 * purchase_price) + (1.1 * total_parts_price), 2) AS sale_price
FROM
    vehicle;

-- update parts status
UPDATE part
SET status = 'installed'
WHERE parts_order_number IN (
    SELECT parts_order_number
    FROM parts_order
    WHERE vin = '1119381208312'
);

-- SEARCH SCREEN
-- search all vehicles with parts completed and return things for search screen
SELECT
    vw.vin,
    vw.sale_price,
    vw.model,
    vw.model_year
FROM (
    SELECT
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
        employee_buyer,
        customer_seller,
        total_parts_price,
        employee_seller,
        customer_buyer,
        sale_date,
        ROUND(
            (1.25 * purchase_price) + (1.1 * total_parts_price), 2
        ) AS sale_price
    FROM
        vehicle
) AS vw
WHERE vw.vin NOT IN (
    SELECT po.vin
    FROM parts_order AS po
    INNER JOIN part AS p
        ON
            po.parts_order_number = p.parts_order_number
            AND p.status <> 'installed'
    WHERE po.vin = vw.vin
);
-- search all vehicles and return things for search screen
-- return things for vehicle detail screen 
-- sell the vehicle (update with customer, sales person, sale date)
UPDATE vehicle
SET
    sale_date = CURRENT_DATE,
    -- Replace with the tax_id of the chosen seller (e.g., Fred Flintstone)
    customer_buyer = '111223333',
    employee_seller = 'ownerdoe'   -- The username of the owner employee
-- Specify the VIN of the vehicle you want to update
WHERE vehicle.vin = '1119381208312' RETURNING vin,
purchase_date,
purchase_price,
sale_date,
customer_seller,
customer_buyer,
employee_seller,
employee_buyer;


--||REPORTS||==
-- run queries that returns each of the reports

-- REPORT 1: View Seller's History
SELECT
    COALESCE(
        b.business_name, CONCAT(i.first_name, ' ', i.last_name)
    ) AS namebusiness,
    COUNT(DISTINCT v.vin) AS vehiclecount,
    COALESCE(ROUND(AVG(v.purchase_price), 2), 0) AS averagepurchaseprice,
    COALESCE(SUM(p.quantity), 0) AS totalpartscount,
    COALESCE(
        ROUND(
            SUM(p.quantity * p.unit_price) / NULLIF(COUNT(DISTINCT v.vin), 0), 2
        ),
        0
    ) AS averagepartscostpervehiclepurchased,
    CASE
        WHEN
            ROUND(
                SUM(p.quantity * p.unit_price)
                / NULLIF(COUNT(DISTINCT v.vin), 0),
                2
            )
            > 500
            OR SUM(p.quantity) / NULLIF(COUNT(DISTINCT v.vin), 0) > 5
            THEN 'highlight'
        ELSE 'no-highlight'
    END AS highlight
FROM
    vehicle AS v
LEFT JOIN
    parts_order AS po ON v.vin = po.vin
LEFT JOIN
    part AS p ON po.parts_order_number = p.parts_order_number
INNER JOIN
    customer AS cs ON v.customer_seller = cs.tax_id
LEFT JOIN
    individual AS i ON cs.tax_id = i.ssn
LEFT JOIN
    business AS b ON cs.tax_id = b.tin
GROUP BY
    cs.tax_id, b.business_name, i.first_name, i.last_name
ORDER BY
    vehiclecount DESC, averagepurchaseprice ASC;

-- REPORT 2: Average time in inventory grouped by vehicle type
SELECT
    vehicle_type,
    AVG(
        DATE_PART('day', sale_date::timestamp - purchase_date::timestamp) + 1
    ) AS average_time_in_inventory
FROM vehicle WHERE sale_date IS NOT NULL GROUP BY vehicle_type;

-- REPORT 3: View Price Per Condition
SELECT
    vehicle_type,
    SUM(
        CASE WHEN condition = 'Excellent' THEN purchase_price ELSE 0 END
    ) AS excellenttotalprice,
    SUM(
        CASE WHEN condition = 'Very Good' THEN purchase_price ELSE 0 END
    ) AS verygoodtotalprice,
    SUM(
        CASE WHEN condition = 'Good' THEN purchase_price ELSE 0 END
    ) AS goodtotalprice,
    SUM(
        CASE WHEN condition = 'Fair' THEN purchase_price ELSE 0 END
    ) AS fairtotalprice
FROM vehicle
GROUP BY vehicle_type;

-- REPORT 4: View Parts Stats
SELECT
    vendor.name,
    SUM(part.quantity) AS totalpartsquantity,
    SUM(part.quantity * part.unit_price) AS vendortotalexpense
FROM parts_order AS partsorder
INNER JOIN
    part AS part
    ON partsorder.parts_order_number = part.parts_order_number
INNER JOIN vendor AS vendor ON partsorder.vendor_name = vendor.name
GROUP BY vendor.name
ORDER BY vendortotalexpense DESC;

--5) Monthly Sales Report
--P1) Monthly Summary
SELECT
    numbervehicles,
    grossincome,
    DATE_PART('year', sale_date) AS yearsold,
    DATE_PART('month', sale_date) AS monthsold,
    (grossincome - totalexpense) AS netincome
FROM
    (SELECT
        v.sale_date,
        COUNT(DISTINCT v.vin) AS numbervehicles,
        SUM(v.purchase_price) AS grossincome,
        SUM(v.total_parts_price) AS totalexpense
    FROM vehicle AS v
    WHERE v.sale_date IS NOT NULL
    GROUP BY v.sale_date) AS a
GROUP BY
    DATE_PART('year', sale_date),
    DATE_PART('month', sale_date),
    numbervehicles,
    grossincome,
    totalexpense
HAVING grossincome > 0
ORDER BY DATE_PART('year', sale_date) DESC, DATE_PART('month', sale_date) DESC;

--P2) Drilldown Summary
SELECT
    au.first_name,
    au.last_name,
    vehiclesold,
    totalsales
FROM
    (
        SELECT
            e.username,
            COUNT(DISTINCT v.vin) AS vehiclesold,
            SUM(purchase_price) AS totalsales
        FROM vehicle AS v
        INNER JOIN employee_seller AS e ON v.employee_seller = e.username
        GROUP BY e.username
    ) AS a
INNER JOIN app_user AS au ON a.username = au.username
--WHERE EXTRACT(YEAR FROM v.sale_date) = {(int type > 999)‘YEAR OF DATETIME SELECTED FOR DRILLDOWN’}  
--AND EXTRACT(MONTH FROM v.sale_date) = {(int type>0){MONTH OF DATETIME SELECTED FOR DRILLDOWN’} 
GROUP BY au.first_name, au.last_name, vehiclesold, totalsales
ORDER BY vehiclesold DESC, totalsales DESC
