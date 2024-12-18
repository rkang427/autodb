-- connect to db
\c dealership

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
    '11193812083121111',
    COUNT(*) + 1,
    'Best Parts Supplier'
FROM parts_order
WHERE vin = '1119381208312' RETURNING parts_order_number;

-- Insert parts associated with the parts order
INSERT INTO part (
    part_number, unit_price, description, quantity, status, parts_order_number
)
VALUES
('PART-001', 50.00, 'Brake Pads', 4, 'ordered', '11193812083121111-001'),
('PART-002', 20.00, 'Oil Filter', 2, 'ordered', '11193812083121111-001'),
(
    'PART-003', 100.00, 'Windshield Wipers', 1, 'ordered', '11193812083121111-001'
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
        WHERE po.vin = '11193812083121111'
    )
WHERE v.vin = '11193812083121111';
-- second vehicle
UPDATE vehicle v
SET
    total_parts_price = (
        SELECT COALESCE(SUM(p.quantity * p.unit_price), 0)
        FROM part AS p
        INNER JOIN
            parts_order AS po
            ON p.parts_order_number = po.parts_order_number
        WHERE po.vin = '22293812083121111'
    )
WHERE v.vin = '22293812083121111';

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
    '11193812083121111',
    COUNT(*) + 1,
    'Best Parts Supplier'
FROM parts_order
WHERE vin = '11193812083121111' RETURNING parts_order_number;

-- add parts order for different vehicles
INSERT INTO parts_order (vin, ordinal, vendor_name)
SELECT
    '22293812083121111',
    COUNT(*) + 1,
    'Napa Auto Parts'
FROM parts_order
WHERE vin = '22293812083121111' RETURNING parts_order_number;

INSERT INTO parts_order (vin, ordinal, vendor_name)
SELECT
    '44493812083121111',
    COUNT(*) + 1,
    'Napa Auto Parts'
FROM parts_order
WHERE vin = '44493812083121111' RETURNING parts_order_number;

-- this will be used for not installed parts in the test:
INSERT INTO parts_order (vin, ordinal, vendor_name)
SELECT
    '88893812083121111',
    COUNT(*) + 1,
    'Napa Auto Parts'
FROM parts_order
WHERE vin = '88893812083121111' RETURNING parts_order_number;

-- Insert parts associated with the parts orders
INSERT INTO part (
    part_number, unit_price, description, quantity, status, parts_order_number
)
VALUES
('PART-001', 50.00, 'Brake Pads', 4, 'ordered', '11193812083121111-002'),
('PART-002', 20.00, 'Oil Filter', 2, 'ordered', '11193812083121111-002'),
('PART-003', 100.00, 'Windshield Wipers', 1, 'ordered', '11193812083121111-002'),
('PART-004', 50.00, 'Seatbelt', 1, 'ordered', '22293812083121111-001'),
('PART-003', 100.00, 'Windshield Wipers', 1, 'ordered', '44493812083121111-001'),
('PART-003', 100.00, 'Windshield Wipers', 1, 'ordered', '88893812083121111-001'),
('PART-004', 50.00, 'Seatbelt', 1, 'ordered', '44493812083121111-001') RETURNING *;
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
        WHERE po.vin = '11193812083121111'
    )
WHERE v.vin = '11193812083121111';
-- second vehicle
UPDATE vehicle v
SET
    total_parts_price = (
        SELECT COALESCE(SUM(p.quantity * p.unit_price), 0)
        FROM part AS p
        INNER JOIN
            parts_order AS po
            ON p.parts_order_number = po.parts_order_number
        WHERE po.vin = '22293812083121111'
    )
WHERE v.vin = '22293812083121111';
-- third vehicle
UPDATE vehicle v
SET
    total_parts_price = (
        SELECT COALESCE(SUM(p.quantity * p.unit_price), 0)
        FROM part AS p
        INNER JOIN
            parts_order AS po
            ON p.parts_order_number = po.parts_order_number
        WHERE po.vin = '44493812083121111'
    )
WHERE v.vin = '44493812083121111';

-- fourth vehicle
UPDATE vehicle v
SET
    total_parts_price = (
        SELECT COALESCE(SUM(p.quantity * p.unit_price), 0)
        FROM part AS p
        INNER JOIN
            parts_order AS po
            ON p.parts_order_number = po.parts_order_number
        WHERE po.vin = '88893812083121111'
    )
WHERE v.vin = '88893812083121111';

-- Check total prices are updated
SELECT * FROM parts_order;
SELECT
    vin,
    total_parts_price,
    purchase_price,
    ROUND((1.25 * purchase_price) + (1.1 * total_parts_price), 2) AS sale_price
FROM
    vehicle;

-- update parts for part order to received and then installed
-- in application part_number would be " = $part_number selected"

UPDATE part
SET status = 'installed'
WHERE
    parts_order_number = '11193812083121111-001' AND part_number IN (SELECT part_number FROM part WHERE parts_order_number = '11193812083121111-001');
UPDATE part
SET status = 'installed'
WHERE
    parts_order_number = '11193812083121111-002' AND part_number IN (SELECT part_number FROM part WHERE parts_order_number = '11193812083121111-002');
UPDATE part
SET status = 'installed'
WHERE
    parts_order_number = '22293812083121111-001' AND part_number IN (SELECT part_number FROM part WHERE parts_order_number = '22293812083121111-001');
UPDATE part
SET status = 'installed'
WHERE
    parts_order_number = '44493812083121111-001' AND part_number IN (SELECT part_number FROM part WHERE parts_order_number = '4449381208311111-001');

UPDATE part
SET status = 'received'
WHERE
    parts_order_number = '88893812083121111-001' AND part_number IN (SELECT part_number FROM part WHERE parts_order_number = '88893812083121111-001');

-- show parts status now
SELECT * FROM part;

-- sell the vehicles (update with customer, sales person, sale date)
UPDATE vehicle
SET
    sale_date = CURRENT_DATE,
    customer_buyer = '333445555',
    salesperson = 'ownerdoe'
WHERE vehicle.vin = '44493812083121111' AND sale_date IS NULL
RETURNING
vin,
purchase_date,
purchase_price,
sale_date,
customer_seller,
customer_buyer,
salesperson,
inventory_clerk;

UPDATE vehicle
SET
    sale_date = DATE '2024-09-15',
    customer_buyer = '555223333',
    salesperson = 'janedoe'
WHERE
    vehicle.vin = '22293812083121111' AND sale_date IS NULL
RETURNING
vin,
purchase_date,
purchase_price,
sale_date,
customer_seller,
customer_buyer,
salesperson,
inventory_clerk;

UPDATE vehicle
SET
    sale_date = DATE '2024-09-17',
    customer_buyer = '333445555',
    salesperson = 'janedoe'
WHERE
    vehicle.vin = '11193812083121111' AND sale_date IS NULL
RETURNING
vin,
purchase_date,
purchase_price,
sale_date,
customer_seller,
customer_buyer,
salesperson,
inventory_clerk;
