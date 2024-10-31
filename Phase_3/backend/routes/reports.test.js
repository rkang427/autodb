const request = require('supertest');
const { startServer, stopServer } = require('../server'); // Adjust the path as necessary
const pool = require('../config/db'); // Import the database pool

jest.mock('../config/db'); // Mock the database module

let server;

beforeAll(async () => {
  server = await startServer(4001); // Use a different port for tests
});

afterAll(async () => {
  await stopServer(server);
});

describe('Reports API', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('Report 1 - View Seller History', async () => {
    // Mocking the database query result
    pool.query.mockResolvedValueOnce({
        rows: [
            {
                namebusiness: 'Business A',
                vehiclecount: 10,
                averagepurchaseprice: 25000,
                totalpartscount: 20,
                averagepartscostpervehiclepurchased: 100,
                highlight: 'highlight',
            },
        ],
    });

    const response = await request(server).get('/reports/view_seller_history');
    
    // Log the response for debugging
    console.log('Response Status:', response.status);
    console.log('Response Body:', response.body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
        {
            namebusiness: 'Business A',
            vehiclecount: 10,
            averagepurchaseprice: 25000,
            totalpartscount: 20,
            averagepartscostpervehiclepurchased: 100,
            highlight: 'highlight',
        },
    ]);
});


  it('should return 500 on error for View Seller History', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));

    const response = await request(server).get('/reports/view_seller_history');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error retrieving seller history');
  });

  it('Report 2 - Average Time in Inventory Groups', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { vehicle_type: 'Sedan', average_time_in_inventory: '5' },
        { vehicle_type: 'SUV', average_time_in_inventory: '7' },
      ],
    });

    const response = await request(server).get('/reports/avg_time_in_inventory');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { vehicle_type: 'Sedan', average_time_in_inventory: '5' },
      { vehicle_type: 'SUV', average_time_in_inventory: '7' },
    ]);
  });

  it('should return 500 on error for Average Time in Inventory', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));

    const response = await request(server).get('/reports/avg_time_in_inventory');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error retrieving avg time in inventory');
  });

  it('Report 3 - View Price Per Condition', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { vehicle_type: 'Sedan', excellenttotalprice: 30000 },
        { vehicle_type: 'SUV', verygoodtotalprice: 15000 },
      ],
    });

    const response = await request(server).get('/reports/price_per_condition');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { vehicle_type: 'Sedan', excellenttotalprice: 30000 },
      { vehicle_type: 'SUV', verygoodtotalprice: 15000 },
    ]);
  });

  it('should return 500 on error for Price Per Condition', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));

    const response = await request(server).get('/reports/price_per_condition');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error retrieving avg time in inventory');
  });

  it('Report 4 - Part Statistics', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { name: 'Vendor A', totalpartsquantity: 100, vendortotalexpense: 5000 },
      ],
    });

    const response = await request(server).get('/reports/part_statistics');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { name: 'Vendor A', totalpartsquantity: 100, vendortotalexpense: 5000 },
    ]);
  });

  it('should return 500 on error for Part Statistics', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));

    const response = await request(server).get('/reports/part_statistics');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error retrieving part statistics');
  });

  it('Report 5 - Monthly Sales Report pt 1', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { year_sold: 2024, month_sold: 9, numbervehicles: 5, grossincome: 150000, netincome: 120000 },
      ],
    });

    const response = await request(server).get('/reports/monthly_sales/origin');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { year_sold: 2024, month_sold: 9, numbervehicles: 5, grossincome: 150000, netincome: 120000 },
    ]);
  });

  it('should return 500 on error for Monthly Sales Report pt 1', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));

    const response = await request(server).get('/reports/monthly_sales/origin');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error retrieving price per condition report');
  });

  it('Report 6 - Monthly Sales Report pt 2', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { first_name: 'John', last_name: 'Doe', vehiclesold: 10, totalsales: 200000 },
      ],
    });

    const response = await request(server).get('/reports/monthly_sales/drilldown');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { first_name: 'John', last_name: 'Doe', vehiclesold: 10, totalsales: 200000 },
    ]);
  });

  it('should return 500 on error for Monthly Sales Report pt 2', async () => {
    pool.query.mockRejectedValueOnce(new Error('Database error'));

    const response = await request(server).get('/reports/monthly_sales/drilldown');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error retrieving price per condition report');
  });
});
