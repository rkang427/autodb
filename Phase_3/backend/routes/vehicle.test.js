const request = require('supertest');
const faker = require('faker');

const {
  generateVehicleData,
  generateCustomerData,
} = require('./test/testUtils');

const { startServer, stopServer } = require('../server'); // Adjust the path as necessary

let server;
let cookie;

beforeAll(async () => {
  server = await startServer(4001); // Use a different port for tests

  // Log in and store the session cookie
  const loginResponse = await request(server)
    .post('/auth/login')
    .send({ username: 'ownerdoe', password: 'password' });

  expect(loginResponse.status).toBe(200); // Ensure login was successful
  cookie = loginResponse.headers['set-cookie'][0]; // Extract the cookie
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

describe('Vehicle API with Authentication', () => {
  it('should create a vehicle', async () => {
    const customerData = generateCustomerData(); // Assuming you generate customer data
    const response = await request(server)
      .post('/customer')
      .set('Cookie', cookie) // Set the authentication cookie
      .send(customerData);

    try {
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('tax_id');
    } catch (error) {
      console.error('Error in individual customer creation:', {
        status: response.status,
        body: JSON.stringify(response.body),
        error: error.msg,
        customerData: customerData,
      });
      throw error; // Re-throw the error to fail the test
    }

    const vehicleData = generateVehicleData(customerData.tax_id, 'ownerdoe');
    const response2 = await request(server)
      .post('/vehicle')
      .set('Cookie', cookie) // Set the authentication cookie
      .send(vehicleData);

    try {
      expect(response2.status).toBe(201);
      expect(response2.body).toHaveProperty('vin');
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

  it('should get a vehicle by vin', async () => {
    const response = await request(server)
      .get(`/vehicle?vin=${KNOWN_VEHICLE.vin}`)
      .set('Cookie', cookie); // Use the cookie for the GET request

    expect(response.status).toBe(200);

    // Assert that the response body matches the known vehicle data
    const responseBody = response.body;

    for (const [key, value] of Object.entries(KNOWN_VEHICLE)) {
      expect(responseBody['vehicle'][key]).toEqual(value);
    }
  });

  it('should reject a too short vin', async () => {
    const KNOWN_VEHICLE = {
      vin: '2111',
    };
    const response = await request(server)
      .get(`/vehicle?vin=${KNOWN_VEHICLE.vin}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
  });

  it('should reject a too long vin', async () => {
    const KNOWN_VEHICLE = {
      vin: '211aasdfsdsssssasdfdsssssdsfaasdffdd1',
    };
    const response = await request(server)
      .get(`/vehicle?vin=${KNOWN_VEHICLE.vin}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
  });

  it('should reject a vin with spaces', async () => {
    const KNOWN_VEHICLE = {
      vin: 'WXY93812 83121111',
    };
    const response = await request(server)
      .get(`/vehicle?vin=${KNOWN_VEHICLE.vin}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
  });
});

describe('Vehicle Search API with Authentication', () => {
  it('should get a vehicle by vin', async () => {
    const response = await request(server)
      .get(`/vehicle/search?vin=${KNOWN_VEHICLE.vin}`)
      .set('Cookie', cookie); // Use the cookie for the GET request

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

  it('should reject a too short vin', async () => {
    const KNOWN_VEHICLE = {
      vin: '2111',
    };
    const response = await request(server)
      .get(`/vehicle/search?vin=${KNOWN_VEHICLE.vin}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
  });

  it('should reject a too long vin', async () => {
    const KNOWN_VEHICLE = {
      vin: '211aasdfsdsssssasdfdsssssdsfaasdffdd1',
    };
    const response = await request(server)
      .get(`/vehicle/search?vin=${KNOWN_VEHICLE.vin}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
  });

  it('should reject a vin with spaces', async () => {
    const KNOWN_VEHICLE = {
      vin: 'WXY93812 83121111',
    };
    const response = await request(server)
      .get(`/vehicle/search?vin=${KNOWN_VEHICLE.vin}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
  });

  it('should reject a vin that is not 17 characters long', async () => {
    const response = await request(server)
      .get('/vehicle/search?vin=1234567')
      .set('Cookie', cookie);
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe('vin must be 17 characters long');

    const response2 = await request(server)
      .get('/vehicle/search?vin=123456789012345678')
      .set('Cookie', cookie);

    expect(response2.status).toBe(400);
    expect(response2.body.errors[0].msg).toBe('vin must be 17 characters long');
  });

  it('should accept a valid vin', async () => {
    const response = await request(server)
      .get(`/vehicle/search?vin=${KNOWN_VEHICLE.vin}`)
      .set('Cookie', cookie);
    expect(response.status).toBe(200);
  });

  it('should return 404 for a non-existent VIN', async () => {
    const response = await request(server)
      .get(`/vehicle/search?vin=ZZZZZZZZZZZZZZZZZ`)
      .set('Cookie', cookie);
    expect(response.status).toBe(404);
    expect(response.body.errors[0].msg).toBe(
      'Sorry, it looks like we don’t have that in stock!'
    );
  });

  it('should reject a description longer than 280 characters', async () => {
    const longDescription = 'A'.repeat(281);
    const response = await request(server)
      .get(`/vehicle/search?description=${encodeURIComponent(longDescription)}`)
      .set('Cookie', cookie);
    expect(response.status).toBe(400);
  });

  it('should reject a keyword longer than 120 characters', async () => {
    const longKeyword = 'A'.repeat(121);
    const response = await request(server)
      .get(`/vehicle/search?keyword=${encodeURIComponent(longKeyword)}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
  });

  it('should reject unsupported characters in keyword', async () => {
    const response = await request(server)
      .get(`/vehicle/search?keyword=%`)
      .set('Cookie', cookie);
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'Keyword contains invalid characters.'
    );
  });

  it('should reject requests with invalid filter_type', async () => {
    const response = await request(server)
      .get(`/vehicle/search?filter_type=invalid`)
      .set('Cookie', cookie);
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe(
      'filter_type must be one of: sold, unsold, both'
    );
  });

  it('should return vehicles matching multiple search criteria', async () => {
    const response = await request(server)
      .get(`/vehicle/search?vehicle_type=Van&fuel_type=Gas&color=Blue`)
      .set('Cookie', cookie);
    expect(response.status).toBe(200);
    response.body.forEach((vehicle) => {
      expect(vehicle.vehicle_type).toBe('Van');
      expect(vehicle.fuel_type).toBe('Gas');
      expect(vehicle.colors).toContain('Blue');
    });
  });

  it('should return vehicles by specified model year', async () => {
    const response = await request(server)
      .get(`/vehicle/search?model_year=2022`)
      .set('Cookie', cookie);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ model_year: 2022 })])
    );
  });

  it('should reject an invalid model year format', async () => {
    const response = await request(server)
      .get('/vehicle/search?model_year=abcd')
      .set('Cookie', cookie);
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toBe('Invalid value');
  });

  it('should return vehicles containing the specified color', async () => {
    const response = await request(server)
      .get(`/vehicle/search?color=Red`)
      .set('Cookie', cookie);
    expect(response.status).toBe(200);
    response.body.forEach((vehicle) => {
      expect(vehicle.colors).toContain('Red');
    });
  });

  it('should return vehicles by specified fuel type', async () => {
    const response = await request(server)
      .get(`/vehicle/search?fuel_type=Gas`)
      .set('Cookie', cookie);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ fuel_type: 'Gas' })])
    );
  });

  it('should return vehicles by specified vehicle type', async () => {
    const response = await request(server)
      .get(`/vehicle/search?vehicle_type=Van`)
      .set('Cookie', cookie);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ vehicle_type: 'Van' })])
    );
  });

  it('should return vehicles by specified manufacturer', async () => {
    const response = await request(server)
      .get(`/vehicle/search?manufacturer=Ford`)
      .set('Cookie', cookie);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ manufacturer: 'Ford' }),
      ])
    );
  });

  it('should return vehicles that match multiple criteria (vehicle_type, fuel_type, model_year)', async () => {
    const response = await request(server)
      .get('/vehicle/search?vehicle_type=Van&fuel_type=Gas&model_year=2022')
      .set('Cookie', cookie);
    expect(response.status).toBe(200);
    response.body.forEach((vehicle) => {
      expect(vehicle.vehicle_type).toBe('Van');
      expect(vehicle.fuel_type).toBe('Gas');
      expect(vehicle.model_year).toBe(2022);
    });
  });

  it('should return vehicles that partially match the keyword in description or model', async () => {
    const response = await request(server)
      .get('/vehicle/search?keyword=Trans')
      .set('Cookie', cookie);
    expect(response.status).toBe(200);
    response.body.forEach((vehicle) => {
      expect(
        vehicle.model.includes('Trans') || vehicle.description.includes('Trans')
      ).toBe(true);
    });
  });
  
  /*
  //TODO: add test case for case insensitivity - does not work
  it('should handle case insensitivity in search fields', async () => {
    const response = await request(server)
      .get(`/vehicle/search?manufacturer=ford`)
      .set('Cookie', cookie);

    expect(response.status).toBe(200);

    response.body.forEach(vehicle => {
      // Check if the manufacturer name matches 'Ford' regardless of case
      expect(vehicle.manufacturer.toLowerCase()).toBe('ford');
    });
  });
  */
});

// Additional edge case for POST /vehicle validation
describe('Vehicle API - POST /vehicle validation', () => {
  it('should reject a POST request with missing required fields', async () => {
    const incompleteVehicleData = {
      vin: 'WXY93812083121111',
      model: 'Transit',
      // Other required fields are missing
    };

    const response = await request(server)
      .post('/vehicle')
      .set('Cookie', cookie) // Set the authentication cookie
      .send(incompleteVehicleData);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('should reject a duplicate vehicle VIN', async () => {
    const customerData = generateCustomerData();
    const customerResponse = await request(server)
      .post('/customer')
      .set('Cookie', cookie)
      .send(customerData);

    expect(customerResponse.status).toBe(201);
    const customerTaxId = customerResponse.body.tax_id;

    // Create the first vehicle with a unique VIN
    const vehicleData = generateVehicleData(customerTaxId, 'ownerdoe');
    vehicleData.vin = faker.vehicle.vin(); // Generates a unique VIN for initial creation

    const firstResponse = await request(server)
      .post('/vehicle')
      .set('Cookie', cookie)
      .send(vehicleData);

    expect(firstResponse.status).toBe(201);

    // Attempt to create another vehicle with the same VIN
    const duplicateResponse = await request(server)
      .post('/vehicle')
      .set('Cookie', cookie)
      .send(vehicleData);

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.errors[0].msg).toContain('VIN already exists');
  });

  it('should reject invalid data type for horsepower', async () => {
    const vehicleData = generateVehicleData(
      KNOWN_VEHICLE.customer_seller,
      KNOWN_VEHICLE.inventory_clerk
    );
    vehicleData.horsepower = 'two hundred'; // Invalid type

    const response = await request(server)
      .post('/vehicle')
      .set('Cookie', cookie) // Set the authentication cookie
      .send(vehicleData);
    expect(response.status).toBe(400);
    expect(response.body.errors[0].msg).toContain('Invalid value');
  });
});
