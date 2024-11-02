const seedDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start a transaction

    // Insert some customers with valid lengths
    await client.query(
      "INSERT INTO customer (tax_id) VALUES ('123456789'), ('987654321');"
    );

    // Insert corresponding individual and business records
    await client.query(
      "INSERT INTO individual (ssn, first_name, last_name) VALUES ('123456789', 'John', 'Doe');"
    );
    await client.query(
      "INSERT INTO business (tin, business_name) VALUES ('987654321', 'Doe Enterprises');"
    );

    // Insert vehicles that will trigger highlighting conditions
    await client.query(`
            INSERT INTO vehicle (vin, purchase_price, customer_seller, sale_date, vehicle_type) 
            VALUES 
            ('1HGCM82633A123456', 600, '123456789', '2024-01-01', 'Sedan'), 
            ('1HGCM82633A654321', 1500, '987654321', '2024-02-01', 'Coupe');
        `);

    // Insert parts orders and corresponding parts
    await client.query(`
            INSERT INTO parts_order (parts_order_number, vin, vendor_name) 
            VALUES 
            ('PO123', '1HGCM82633A123456', 'Vendor A'), 
            ('PO124', '1HGCM82633A123456', 'Vendor B');
        `);

    await client.query(`
            INSERT INTO part (parts_order_number, quantity, unit_price) 
            VALUES 
            ('PO123', 10, 60), 
            ('PO124', 3, 20);
        `);

    await client.query('COMMIT'); // Commit the transaction
    console.log('Database seeded successfully.');
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback in case of error
    console.error('Error seeding database:', error);
  } finally {
    client.release();
  }
};
