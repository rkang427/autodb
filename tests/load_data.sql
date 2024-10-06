-- connect to db
\c dealership

-- List relations present
\dt

--Create Customers
insert into customer (tax_id, phone_number, street, city, state, postal_code) VALUES ('111223333', '9198675301', '123 Maple', 'Charlotte', 'North Carolina', '27344') RETURNING *;
insert into customer (tax_id, phone_number, street, city, state, postal_code) VALUES ('555223333', '9198675302', '124 Maple', 'Charlotte', 'North Carolina', '27344') RETURNING *;
insert into individual (ssn, first_name, last_name) VALUES ('111223333', 'Fred', 'Flintstone') RETURNING *;
insert into business (tin, business_name, title, first_name, last_name) VALUES ('555223333', 'Wilma Motorsports', 'CEO', 'Wilma', 'Flintstone') RETURNING *;
