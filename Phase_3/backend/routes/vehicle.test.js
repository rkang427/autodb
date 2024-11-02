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
      'colors'
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
  it('should reject a vin that is not 17 characters long', async () => {
    const response = await request(server).get('/vehicle/search?vin=1234567');
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe('vin must be 17 characters long');

    const response2 = await request(server).get('/vehicle/search?vin=123456789012345678');
    expect(response2.status).toBe(400);
    expect(response2.body.errors[0].msg).toBe('vin must be 17 characters long');
  });

  it('should accept a valid vin', async () => {
    const response = await request(server).get(`/vehicle/search?vin=${KNOWN_VEHICLE.vin}`);
    expect(response.status).toBe(200);
  });

  it('should reject a description longer than 280 characters', async () => {
    const longDescription = 'A'.repeat(281);
    const response = await request(server).get(`/vehicle/search?description=${encodeURIComponent(longDescription)}`);
    expect(response.status).toBe(400);
  });

  it('should reject a keyword longer than 120 characters', async () => {
    const longKeyword = 'A'.repeat(121);
    const response = await request(server).get(`/vehicle/search?keyword=${encodeURIComponent(longKeyword)}`);
    expect(response.status).toBe(400);
  });

});

// Additional edge case for POST /vehicle validation
describe('Vehicle API - POST /vehicle validation', () => {
  it('should reject a POST request with missing required fields', async () => {
    const incompleteVehicleData = {
      vin: 'WXY93812083121111',
      model: 'Transit'
      // Other required fields are missing
    };

    const response = await request(server).post('/vehicle').send(incompleteVehicleData);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject a duplicate vehicle vin', async () => {
    const vehicleData = generateVehicleData(KNOWN_VEHICLE.customer_seller, KNOWN_VEHICLE.inventory_clerk);
    vehicleData.vin = KNOWN_VEHICLE.vin; // Duplicate VIN

    const response = await request(server).post('/vehicle').send(vehicleData);
    expect(response.status).toBe(409);
    expect(response.body.error).toBe('Error: Vehicle already exists.');
  });
  it('should reject invalid data type for horsepower', async () => {
    const vehicleData = generateVehicleData(KNOWN_VEHICLE.customer_seller, KNOWN_VEHICLE.inventory_clerk);
    vehicleData.horsepower = 'two hundred'; // Invalid type

    const response = await request(server).post('/vehicle').send(vehicleData);
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toContain('Invalid value');
  });
  
});