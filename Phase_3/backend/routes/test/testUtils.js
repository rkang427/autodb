const faker = require('faker');
const {
  MANUFACTURERS,
  COLORS,
  VEHICLE_TYPES,
  FUEL_TYPES,
  CONDITIONS,
} = require('../../config/constants');

function generatePhoneNumber() {
  return faker.datatype.number({ min: 1000000000, max: 9998999999 }).toString(); // Generates a 10 digit phone number
}

function generateTaxId() {
  return faker.datatype.number({ min: 100000000, max: 999999999 }).toString(); // Generates a 9-digit tax ID
}

function generatePostalCode() {
  return faker.datatype.number({ min: 10000, max: 99999 }).toString(); // Generates a 5-digit postal_code
}

function generateCustomerData(customerType = 'i', tax_id) {
  const commonData = {
    tax_id: tax_id || generateTaxId(),
    phone_number: generatePhoneNumber(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    street: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.state(),
    postal_code: generatePostalCode(),
    customer_type: customerType,
  };

  // If customerType is 'b', add business-specific fields
  if (customerType === 'b') {
    return {
      ...commonData, // unpacks commonData here
      business_name: faker.company.companyName(),
      title: faker.name.jobTitle(),
    };
  }

  // otherwise just the commonData
  return commonData;
}

function generateVendorData() {
  const vendorData = {
    name: faker.company.companyName(),
    street: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.state(),
    postal_code: generatePostalCode(),
    phone_number: generatePhoneNumber(),
  };

  return vendorData;
}

function generateVehicleData(customer_seller, inventory_clerk) {
  const randomColor = faker.helpers.randomize(COLORS, 5);
  const randomColorsArray = Array.isArray(randomColor)
    ? randomColor
    : [randomColor];
  const vehicleData = {
    vin: faker.random.alphaNumeric(17).toUpperCase(),
    description: faker.lorem.sentence(),
    horsepower: faker.datatype.number({ min: 100, max: 500 }),
    model_year: faker.date.past(10).getFullYear(),
    model: faker.vehicle.model(),
    manufacturer: faker.helpers.randomize(MANUFACTURERS),
    vehicle_type: faker.helpers.randomize(VEHICLE_TYPES),
    purchase_price: faker.datatype.float({
      min: 1000,
      max: 100000,
      precision: 0.01,
    }),
    condition: faker.helpers.randomize(CONDITIONS),
    fuel_type: faker.helpers.randomize(FUEL_TYPES),
    inventory_clerk: inventory_clerk, // REQUIRED
    customer_seller: customer_seller, // REQUIRED
    colors: randomColorsArray,
  };
  return vehicleData;
}

module.exports = {
  generatePhoneNumber,
  generateTaxId,
  generateCustomerData,
  generateVendorData,
  generateVehicleData,
};
