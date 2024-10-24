-- connect to db
\c dealership


\echo 'SEARCH CUSTOMER'
\echo '-------------------------------------------------------'
SELECT tax_id FROM customer WHERE tax_id = '333445555';
\echo '-------------------------------------------------------'
\echo
-- PUBLIC SEARCH SCREEN
\echo 'PUBLIC SEARCH SCREEN'
\echo '-------------------------------------------------------'
-- Display total number of cars available for sale (cars without pending parts) 
\echo 'Number of Vehicles Ready'
WITH po_not_installed AS (
    SELECT po.vin
    FROM parts_order AS po
    INNER JOIN part AS p ON po.parts_order_number = p.parts_order_number
    WHERE p.status <> 'installed'
)

SELECT COUNT(*)
FROM vehicle AS v
LEFT JOIN po_not_installed ON v.vin = po_not_installed.vin
WHERE
    po_not_installed.vin IS NULL
    AND v.sale_date IS NULL;
\echo '-------------------------------------------------------'
\echo 'PENDING Number of Vehicles'
-- Display total number of cars parts pending, not sold.
WITH po_not_installed AS (
    SELECT po.vin
    FROM parts_order AS po
    INNER JOIN part AS p ON po.parts_order_number = p.parts_order_number
    WHERE p.status <> 'installed'
)

SELECT COUNT(*)
FROM vehicle AS v
LEFT JOIN po_not_installed ON v.vin = po_not_installed.vin
WHERE
    po_not_installed.vin IS NOT NULL
    AND v.sale_date IS NULL;

-- search all vehicles with parts completed and return things for search screen


-- old one, but the good one
SELECT
    vw.vin,
    vw.vehicle_type,
    vw.manufacturer,
    vw.model,
    vw.model_year,
    vw.fuel_type,
    vw.colors,
    vw.horsepower,
    vw.sale_price
FROM (
    SELECT
        v.vin,
        v.vehicle_type,
        v.manufacturer,
        v.model,
        v.description,
        v.model_year,
        v.fuel_type,
        v.horsepower,
        v.purchase_price,
        v.sale_date,
        STRING_AGG(vc.color, ', ') AS colors,
        ROUND(
            (1.25 * v.purchase_price) + (1.1 * v.total_parts_price), 2
        ) AS sale_price
    FROM vehicle AS v
    LEFT JOIN vehicle_color AS vc ON v.vin = vc.vin
    GROUP BY
        v.vin,
        v.vehicle_type,
        v.manufacturer,
        v.model,
        v.model_year,
        v.fuel_type,
        v.horsepower,
        v.purchase_price,
        v.sale_date
) AS vw
WHERE
    vw.vin NOT IN (
        SELECT po.vin
        FROM parts_order AS po
        INNER JOIN part AS p ON po.parts_order_number = p.parts_order_number
        WHERE p.status <> 'installed'
    )
    AND (
        (vw.sale_date IS NULL AND 'unsold' = 'unsold')   -- Only unsold vehicles
        -- Only sold vehicles
        OR (vw.sale_date IS NOT NULL AND 'unsold' = 'sold')
        OR ('unsold' = 'both')  -- Both sold and unsold
    )

    -- user defined filters
    AND (vw.vehicle_type = 'Truck' OR 'Truck' IS NULL)
    AND (vw.manufacturer = 'Ford' OR 'Ford' IS NULL)
    AND (vw.model_year = '2023' OR '2023' IS NULL)
    AND (vw.fuel_type = 'Gas' OR 'Gas' IS NULL)
    AND (vw.colors LIKE NULL OR NULL IS NULL)
    AND (vw.vin IS NULL OR NULL IS NULL)
    AND (
        (vw.manufacturer ILIKE '%nice%' OR '%nice%' IS NULL)
        OR (vw.model ILIKE '%nice%' OR '%nice%' IS NULL)
        OR (vw.model_year::TEXT ILIKE '%nice%' OR '%nice%' IS NULL)
        OR (vw.description ILIKE '%nice%' OR '%nice%' IS NULL)
    )
ORDER BY vw.vin ASC;
-- 


\echo '-------------------------------------------------------'
\echo
-- search all vehicles and return things for search screen
\echo
\echo 'EMPLOYEE SEARCH SCREEN'
\echo '-------------------------------------------------------'
\echo 'TODO'
\echo '-------------------------------------------------------'
\echo


\echo
\echo 'VEHICLE DETAIL SCREEN'
\echo '-------------------------------------------------------'
\echo 'VEHICLE DETAIL INFO'
SELECT
    v.vin,
    v.vehicle_type,
    v.manufacturer,
    v.model,
    v.description,
    v.model_year,
    v.fuel_type,
    v.horsepower,
    v.purchase_price,
    v.total_parts_price,
    v.customer_seller,
    v.customer_buyer,
    v.inventory_clerk,
    v.salesperson,
    v.sale_date,
    STRING_AGG(vc.color, ', ') AS colors,
    ROUND(
        (1.25 * v.purchase_price) + (1.1 * v.total_parts_price), 2
    ) AS sale_price
FROM vehicle AS v
LEFT JOIN vehicle_color AS vc ON v.vin = vc.vin
WHERE v.vin = '1119381208312'
GROUP BY
    v.vin,
    v.vehicle_type,
    v.manufacturer,
    v.model,
    v.model_year,
    v.fuel_type,
    v.horsepower,
    v.purchase_price,
    v.total_parts_price,
    v.customer_seller,
    v.customer_buyer,
    v.inventory_clerk,
    v.salesperson,
    v.sale_date;
\echo 'CUSTOMER BUYER/SELLER INFO (OWNERS AND MANAGERS)'
SELECT
    cs.phone_number,
    CONCAT(
        cs.street, ', ', cs.city, ', ', cs.state, ', ', cs.postal_code
    ) AS address,
    COALESCE(
        CONCAT(b.title, ' ', b.first_name, ' ', b.last_name),
        CONCAT(i.first_name, ' ', i.last_name)
    ) AS contact,
    COALESCE(b.business_name, NULL) AS business_name
FROM customer AS cs
LEFT JOIN
    individual AS i ON cs.tax_id = i.ssn
LEFT JOIN
    business AS b ON cs.tax_id = b.tin
WHERE cs.tax_id = '555223333';
\echo 'EMPLOYEE BUYER/SELLER INFO (OWNERS AND MANAGERS)'
SELECT
    CONCAT(
        eb.first_name, ' ', eb.last_name
    ) AS name
FROM app_user AS eb
WHERE eb.username = 'johndoe';
\echo 'VEHICLE PARTS INFO (OWNERS AND INVENTORY CLERK)'
SELECT
    p.part_number,
    p.description,
    p.quantity,
    p.unit_price,
    p.status,
    p.parts_order_number,
    po.vendor_name
FROM part AS p
INNER JOIN parts_order AS po ON p.parts_order_number = po.parts_order_number
WHERE po.vin = '1119381208312'
ORDER BY p.parts_order_number;
\echo '-------------------------------------------------------'
\echo

--||REPORTS||==

-- REPORT 1: View Seller's History
\echo 'Seller History'
\echo '-------------------------------------------------------'
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
\echo '-------------------------------------------------------'
\echo

\echo
\echo REPORT 2: Average time in inventory grouped by vehicle type
\echo '-------------------------------------------------------'
SELECT
    vt.vehicle_type,
    COALESCE(
        AVG(
            DATE_PART(
                'day', v.sale_date::TIMESTAMP - v.purchase_date::TIMESTAMP
            )
            + 1
        )::VARCHAR,
        'N/A'
    ) AS average_time_in_inventory
FROM (
    SELECT UNNEST(ARRAY[
        'Sedan',
        'Coupe',
        'Convertible',
        'CUV',
        'Truck',
        'Van',
        'Minivan',
        'SUV',
        'Other'
    ]) AS vehicle_type
) AS vt
LEFT JOIN
    vehicle AS v
    ON vt.vehicle_type = v.vehicle_type AND v.sale_date IS NOT NULL
GROUP BY vt.vehicle_type
ORDER BY vt.vehicle_type;
\echo '-------------------------------------------------------'
\echo


\echo
\echo REPORT 3: View Price Per Condition
\echo '-------------------------------------------------------'
SELECT
    vt.vehicle_type,
    COALESCE(
        SUM(
            CASE WHEN v.condition = 'Excellent' THEN v.purchase_price ELSE 0 END
        ),
        0
    ) AS excellenttotalprice,
    COALESCE(
        SUM(
            CASE WHEN v.condition = 'Very Good' THEN v.purchase_price ELSE 0 END
        ),
        0
    ) AS verygoodtotalprice,
    COALESCE(
        SUM(CASE WHEN v.condition = 'Good' THEN v.purchase_price ELSE 0 END), 0
    ) AS goodtotalprice,
    COALESCE(
        SUM(CASE WHEN v.condition = 'Fair' THEN v.purchase_price ELSE 0 END), 0
    ) AS fairtotalprice
FROM (
    SELECT UNNEST(ARRAY[
        'Sedan',
        'Coupe',
        'Convertible',
        'CUV',
        'Truck',
        'Van',
        'Minivan',
        'SUV',
        'Other'
    ]) AS vehicle_type
) AS vt
LEFT JOIN vehicle AS v ON vt.vehicle_type = v.vehicle_type
GROUP BY vt.vehicle_type
ORDER BY vt.vehicle_type DESC;
\echo '-------------------------------------------------------'
\echo

\echo
\echo REPORT 4: View Parts Stats
\echo '-------------------------------------------------------'
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
\echo '-------------------------------------------------------'
\echo

\echo
\echo REPORT 5: Monthly Sales Report
\echo P1) Monthly Summary
\echo '-------------------------------------------------------'
SELECT
    DATE_PART('year', v.sale_date) AS year_sold,
    DATE_PART('month', v.sale_date) AS month_sold,
    COUNT(DISTINCT v.vin) AS numbervehicles,
    SUM(
        ROUND((1.25 * v.purchase_price) + (1.1 * v.total_parts_price), 2)
    ) AS grossincome,
    (
        SUM(ROUND((1.25 * v.purchase_price) + (1.1 * v.total_parts_price), 2))
        - SUM(v.total_parts_price)
    ) AS netincome
FROM vehicle AS v
WHERE v.sale_date IS NOT NULL
GROUP BY
    DATE_PART('year', v.sale_date),
    DATE_PART('month', v.sale_date)
HAVING
    SUM(ROUND((1.25 * v.purchase_price) + (1.1 * v.total_parts_price), 2)) > 0
ORDER BY year_sold DESC, month_sold DESC;
\echo '-------------------------------------------------------'
\echo

\echo
\echo P2) Drilldown Summary (september 2024)
\echo '-------------------------------------------------------'
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
            SUM(
                ROUND(
                    (1.25 * v.purchase_price) + (1.1 * v.total_parts_price), 2
                )
            ) AS totalsales
        FROM vehicle AS v
        INNER JOIN salesperson AS e ON v.salesperson = e.username
        WHERE
            EXTRACT(YEAR FROM v.sale_date) = 2024
            AND EXTRACT(MONTH FROM v.sale_date) = 9
        GROUP BY e.username
    ) AS a
INNER JOIN app_user AS au ON a.username = au.username
GROUP BY au.first_name, au.last_name, vehiclesold, totalsales
ORDER BY vehiclesold DESC, totalsales DESC;
\echo '-------------------------------------------------------'
\echo
