-- connect to db
\c dealership

-- PUBLIC SEARCH SCREEN
\echo 'PUBLIC SEARCH SCREEN'
\echo '-------------------------------------------------------'
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
\echo 'TODO'
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
            SUM(purchase_price) AS totalsales
        FROM vehicle AS v
        INNER JOIN employee_seller AS e ON v.employee_seller = e.username
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
