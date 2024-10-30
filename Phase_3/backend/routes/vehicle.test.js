const request = require('supertest');
const faker = require('faker');

const {
  generateVehicleData,
  generateCustomerData,
} = require('./test/testUtils');

const { startServer, stopServer } = require('../server'); // Adjust the path as necessary

let server;

beforeAll(async () => {
  server = await startServer(4001); // Use a different port for tests
});

afterAll(async () => {
  await stopServer(server);
});

const KNOWN_VEHICLE = {
  vin: 'WXY93812083121111',
  vehicle_type: 'Van',
  manufacturer: 'Ford',
  model: 'Transit',
  description: 'Widget Nice Corp Delivery Van',
  model_year: 2022,
  fuel_type: 'Gas',
  horsepower: 200,
  purchase_price: '35000.00',
  total_parts_price: '0.00',
  customer_seller: '444555666',
  customer_buyer: null,
  inventory_clerk: 'ownerdoe',
  salesperson: null,
  sale_date: null,
  colors: 'Red, Blue',
  sale_price: '43750.00',
};

describe('Vehicle API', () => {
  it('should create a vehicle', async () => {
    // Corrected placement of async function
    const customerData = generateCustomerData(); // Assuming you generate customer data
    const response = await request(server).post('/customer').send(customerData);

    try {
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('tax_id');
    } catch (error) {
      console.error('Error in individual customer creation:', {
        status: response.status,
        body: JSON.stringify(response.body),
        error: error.message,
        customerData: customerData,
      });
      throw error; // Re-throw the error to fail the test
    }

    const vehicleData = generateVehicleData(customerData.tax_id, 'ownerdoe');
    const response2 = await request(server).post('/vehicle').send(vehicleData);

    try {
      expect(response2.status).toBe(201);
      expect(response2.body).toHaveProperty('vin');
    } catch (error) {
      console.error('Error in vehicle creation:', {
        status: response2.status,
        body: JSON.stringify(response2.body),
        error: error.message,
        vehicleData: vehicleData,
      });
      throw error; // Re-throw the error to fail the test
    }
  });

  it('should get a vehicle by vin', async () => {
    const response = await request(server).get(
      `/vehicle?vin=${KNOWN_VEHICLE.vin}`
    );

    expect(response.status).toBe(200);

    // Assert that the response body matches the known vehicle data
    const responseBody = response.body;

    for (const [key, value] of Object.entries(KNOWN_VEHICLE)) {
      expect(responseBody[key]).toEqual(value);
    }
  });

  it('should reject a too short vin', async () => {
    const KNOWN_VEHICLE = {
      vin: '2111',
    };
    const response = await request(server).get(
      `/vehicle?vin=${KNOWN_VEHICLE.vin}`
    );
    expect(response.status).toBe(400);
  });

  it('should reject a too long vin', async () => {
    const KNOWN_VEHICLE = {
      vin: '211aasdfsdsssssasdfdsssssdsfaasdffdd1',
    };
    const response = await request(server).get(
      `/vehicle?vin=${KNOWN_VEHICLE.vin}`
    );
    expect(response.status).toBe(400);
  });

  it('should reject a vin with spaces', async () => {
    const KNOWN_VEHICLE = {
      vin: 'WXY93812 83121111',
    };
    const response = await request(server).get(
      `/vehicle?vin=${KNOWN_VEHICLE.vin}`
    );
    expect(response.status).toBe(400);
  });
});

describe('Vehicle Search API', () => {
  it('should get a vehicle by vin', async () => {
    const response = await request(server).get(
      `/vehicle/search?vin=${KNOWN_VEHICLE.vin}`
    );

    expect(response.status).toBe(200);

    const matchedVehicle = response.body[0];

    const expectedKeys = [
      'vin',
      'vehicle_type',
      'manufacturer',
      'model',
      'model_year',
      'fuel_type',
      'horsepower',
      'sale_price',
    ];
    // TODO: Assert on colors too
    for (const key of expectedKeys) {
      console.log(
        key,
        'found:',
        matchedVehicle[key],
        'expected:',
        KNOWN_VEHICLE[key]
      );
      expect(matchedVehicle[key]).toEqual(KNOWN_VEHICLE[key]);
    }
  });

  it('should reject a too short vin', async () => {
    const KNOWN_VEHICLE = {
      vin: '2111',
    };
    const response = await request(server).get(
      `/vehicle/search?vin=${KNOWN_VEHICLE.vin}`
    );
    expect(response.status).toBe(400);
  });

  it('should reject a too long vin', async () => {
    const KNOWN_VEHICLE = {
      vin: '211aasdfsdsssssasdfdsssssdsfaasdffdd1',
    };
    const response = await request(server).get(
      `/vehicle/search?vin=${KNOWN_VEHICLE.vin}`
    );
    expect(response.status).toBe(400);
  });

  it('should reject a vin with spaces', async () => {
    const KNOWN_VEHICLE = {
      vin: 'WXY93812 83121111',
    };
    const response = await request(server).get(
      `/vehicle/search?vin=${KNOWN_VEHICLE.vin}`
    );
    expect(response.status).toBe(400);
  });
  // TODO: lots more search test cases
});
