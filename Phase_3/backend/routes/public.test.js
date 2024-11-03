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
  // Don't log in -- all these willbe unauthenicated requests
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
  colors: 'Red, Blue',
  sale_price: '43750.00',
  // should be null for public user
  purchase_price: null,
  total_parts_price: null,
  customer_seller: null,
  customer_buyer: null,
  inventory_clerk: null,
  salesperson: null,
  sale_date: null,
};

describe('Vehicle API as Public User', () => {
  it('should not create a vehicle', async () => {
    const vehicleData = generateVehicleData('444555666', 'ownerdoe');
    const response2 = await request(server).post('/vehicle').send(vehicleData);

    try {
      expect(response2.status).toBe(401);
    } catch (error) {
      console.error('Error in vehicle creation:', {
        status: response2.status,
        body: JSON.stringify(response2.body),
        error: error.msg,
        vehicleData: vehicleData,
      });
      throw error; // Re-throw the error to fail the test
    }
  });

  it('should be able to get vehicle detail by vin', async () => {
    const response = await request(server).get(
      `/vehicle?vin=${KNOWN_VEHICLE.vin}`
    );
    expect(response.status).toBe(200);
    // Assert that the response body matches the known vehicle data
    const responseBody = response.body;

    for (const [key, value] of Object.entries(KNOWN_VEHICLE)) {
      expect(responseBody['vehicle'][key]).toEqual(value);
    }
    // TODO: assert parts, inventory_clerk, salesperson, customer_seller, customer_buyer are null in rest of result body
  });
});

describe('Vehicle Search API as Public user', () => {
  it('should get a vehicle by mix of filters', async () => {
    const response = await request(server).get(
      `/vehicle/search?vehicle_type=${KNOWN_VEHICLE.vehicle_type}&manufacturer=${KNOWN_VEHICLE.manufacturer}&model=${KNOWN_VEHICLE.model}&keyword=WIDGET`
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
      'colors',
    ];

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
    // Assert on colors too
    expect(matchedVehicle.colors).toEqual(KNOWN_VEHICLE.colors);
  });
  it('should not get a vehicle by vin', async () => {
    const response = await request(server).get(
      `/vehicle/search?vin=${KNOWN_VEHICLE.vin}`
    );
    expect(response.status).toBe(400);
  });

  it('should reject setting filter_type', async () => {
    const response = await request(server).get(
      `/vehicle/search?filter_type=sold`
    );
    expect(response.status).toBe(400);
  });

  it('should reject a keyword longer than 120 characters', async () => {
    const longKeyword = 'A'.repeat(121);
    const response = await request(server).get(
      `/vehicle/search?keyword=${encodeURIComponent(longKeyword)}`
    );

    expect(response.status).toBe(400);
  });
});

describe('Root API as Public user', () => {
  it('should get colors', async () => {
    const response = await request(server).get(`/`);
    expect(response.status).toBe(200);

    const colors = response.body['colors'];
    expect(colors).toBeDefined();
    expect(colors.length).toBeGreaterThan(0);
  });

  it('should get fuel types', async () => {
    const response = await request(server).get(`/`);
    expect(response.status).toBe(200);

    const fuelTypes = response.body['fuel_types'];
    expect(fuelTypes).toBeDefined();
    expect(fuelTypes.length).toBeGreaterThan(0);
  });

  it('should get manufacturers', async () => {
    const response = await request(server).get(`/`);
    expect(response.status).toBe(200);

    const manufacturers = response.body['manufacturers'];
    expect(manufacturers).toBeDefined();
    expect(manufacturers.length).toBeGreaterThan(0);
  });

  it('should get model years', async () => {
    const response = await request(server).get(`/`);
    expect(response.status).toBe(200);

    const modelYears = response.body['model_years'];
    expect(modelYears).toBeDefined();
    expect(modelYears.length).toBeGreaterThan(0);
  });

  it('should get vehicle types', async () => {
    const response = await request(server).get(`/`);
    expect(response.status).toBe(200);

    const vehicleTypes = response.body['vehicle_types'];
    expect(vehicleTypes).toBeDefined();
    expect(vehicleTypes.length).toBeGreaterThan(0);
  });

  it('should have not_ready as null', async () => {
    const response = await request(server).get(`/`);
    expect(response.status).toBe(200);

    const notReady = response.body['not_ready'];
    expect(notReady).toBeNull();
  });
  it('should have ready as number greater than 0', async () => {
    const response = await request(server).get(`/`);
    expect(response.status).toBe(200);

    const ready = response.body['ready'];
    expect(ready).toBeGreaterThan(0);
  });
});
