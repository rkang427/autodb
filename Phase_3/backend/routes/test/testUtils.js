const faker = require('faker');

function generatePhoneNumber() {
  return faker.phone.phoneNumber('##########'); // Generates a 10-digit phone number
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

module.exports = {
  generatePhoneNumber,
  generateTaxId,
  generateCustomerData,
};

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

module.exports = {
  generatePhoneNumber,
  generateTaxId,
  generateCustomerData,
  generateVendorData,
};
