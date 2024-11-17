const { body, query } = require('express-validator');
const {
  MANUFACTURERS,
  COLORS,
  VEHICLE_TYPES,
  FUEL_TYPES,
  CONDITIONS,
} = require('../config/constants');
const sqlInjectionPattern = /['"\\;%-]/;

const customerGetValidator = [
  query('tax_id')
    .isLength({ min: 9, max: 9 })
    .withMessage('tax_id must be 9 digits long')
    .matches(/^[^\s]+$/)
    .withMessage('Field cannot contain spaces'),
];

const vehicleGetValidator = [
  query('vin')
    .isLength({ min: 17, max: 17 })
    .withMessage('vin must be 17 characters long')
    .matches(/^[^\s]+$/)
    .withMessage('Field cannot contain spaces'),
];

const vehiclePatchValidator = [
  body('vin')
    .isLength({ min: 17, max: 17 })
    .withMessage('vin must be 17 characters long')
    .matches(/^[^\s]+$/)
    .withMessage('Field cannot contain spaces'),
  body('customer_buyer')
    .isLength({ min: 9, max: 9 })
    .withMessage(
      'customer_buyer is the ssn/tin of the customer and must be 9 digits long'
    )
    .matches(/^[^\s]+$/)
    .withMessage('Field cannot contain spaces'),
];

const vehicleSearchValidator = [
  query('vin')
    .optional()
    .custom((value, { req }) => {
      // Check if req.session.user is defined
      if (!req.session.user) {
        throw new Error('User is not authenticated, search by VIN disabled.');
      }
      return true; // If validation passes
    })
    .custom((value) => {
      if (sqlInjectionPattern.test(value)) {
        throw new Error('VIN contains invalid characters.');
      }
      return true;
    })
    .isLength({ min: 17, max: 17 })
    .withMessage('vin must be 17 characters long')
    .matches(/^[^\s]+$/)
    .withMessage('Field cannot contain spaces'),
  query('description').optional().isLength({ max: 280 }),
  query('filter_type')
    .optional()
    .custom((value, { req }) => {
      // Check if req.session.user is defined
      if (
        !req.session.user ||
        !['owner', 'manager'].includes(req.session.user.user_type)
      ) {
        throw new Error('User is not authorized to set filter_type.');
      }
      return true; // If validation passes
    })
    .isIn(['sold', 'unsold', 'both'])
    .withMessage('filter_type must be one of: sold, unsold, both'),
  query('keyword')
    .optional()
    .isLength({ max: 120 })
    .withMessage('Keyword must be 120 characters or less')
    .matches(/^[^\s]+$/)
    .withMessage('Keyword cannot contain spaces')
    .custom((value) => {
      if (sqlInjectionPattern.test(value)) {
        throw new Error('Keyword contains invalid characters.');
      }
      return true;
    }),
  query('color')
    .optional()
    .isIn(COLORS)
    .custom((value) => {
      if (sqlInjectionPattern.test(value)) {
        throw new Error('Color contains invalid characters.');
      }
      return true;
    }),
  query('manufacturer')
    .optional()
    .isIn(MANUFACTURERS)
    .custom((value) => {
      if (sqlInjectionPattern.test(value)) {
        throw new Error('Manufacturer contains invalid characters.');
      }
      return true;
    }),
  query('vehicle_type')
    .optional()
    .isIn(VEHICLE_TYPES)
    .custom((value) => {
      if (sqlInjectionPattern.test(value)) {
        throw new Error('Vehicle Type contains invalid characters.');
      }
      return true;
    }),
  query('fuel_type')
    .optional()
    .isIn(FUEL_TYPES)
    .custom((value) => {
      if (sqlInjectionPattern.test(value)) {
        throw new Error('Fuel Type contains invalid characters.');
      }
      return true;
    }),
  query('model_year')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
    .custom((value) => {
      if (sqlInjectionPattern.test(value)) {
        throw new Error('Model Year contains invalid characters.');
      }
      return true;
    }),
];

const vendorGetValidator = [query('name').isLength({ min: 1, max: 120 })];

const customerPostValidator = [
  body('tax_id', 'Invalid tax_id').isInt().isLength({ min: 9, max: 9 }),
  body('email', 'Invalid email').optional().trim().isEmail(),
  body('first_name', 'Invalid first_name').isLength({ min: 1, max: 120 }),
  body('last_name', 'Invalid last_name').isLength({ min: 1, max: 120 }),
  body(
    'phone_number',
    'Invalid phone number, only 10 digit phone number accepted'
  )
    .isInt()
    .isLength({ min: 10, max: 10 }),
  body('street', 'Invalid street address').isLength({ min: 2, max: 120 }),
  body('city', 'Invalid city').isLength({ min: 2, max: 120 }),
  body('state', 'Invalid state').isLength({ min: 2, max: 120 }),
  body('postal_code', 'Invalid postal_code')
    .isInt()
    .isLength({ min: 5, max: 5 }),
  body('customer_type', 'Invalid customer_type')
    .isIn(['i', 'b'])
    .withMessage('Field must be one of the allowed values'),
  body('business_name', 'Invalid business_name')
    .if(body('customer_type').equals('b'))
    .isLength({ min: 1, max: 120 }),
  body('title', 'Invalid title')
    .if(body('customer_type').equals('b'))
    .isLength({ min: 1, max: 120 }),
];

const vendorPostValidator = [
  body('name', 'Invalid name').isLength({ min: 1, max: 120 }),
  body(
    'phone_number',
    'Invalid phone number, only 10 digit phone number accepted'
  )
    .isInt()
    .isLength({ min: 10, max: 10 }),
  body('street', 'Invalid street address').isLength({ min: 2, max: 120 }),
  body('city', 'Invalid city').isLength({ min: 2, max: 120 }),
  body('state', 'Invalid state').isLength({ min: 2, max: 120 }),
  body('postal_code', 'Invalid postal_code')
    .isInt()
    .isLength({ min: 5, max: 5 }),
];

const partsOrderPostValidator = [
  body('vin', 'Invalid vin')
    .isLength({ min: 17, max: 17 })
    .matches(/^[^\s]+$/)
    .withMessage('Field cannot contain spaces'),
  body('vendor_name', 'Invalid Vendor').isLength({ min: 1, max: 120 }),
  // Validate that `parts` is an array
  body('parts', 'Parts must be an array').isArray(),

  // Custom validation for each part in the `parts` array
  body('parts.*.part_number', 'Each part must have a valid part number')
    .isString()
    .notEmpty(),
  body('parts.*.description', 'Each part must have a valid description')
    .isString()
    .notEmpty(),
  body(
    'parts.*.quantity',
    'Each part must have a positive integer quantity'
  ).isInt({ gt: 0 }),
  body(
    'parts.*.unit_price',
    'Each part must have a non-negative unit price'
  ).isFloat({ min: 0.0 }),
];

function isArrayOfColors(value) {
  return Array.isArray(value) && value.every((item) => COLORS.includes(item));
}

const vehiclePostValidator = [
  body('vin')
    .isLength({ min: 17, max: 17 })
    .withMessage('VIN must be 17 characters long')
    .matches(/^[^\s]+$/)
    .withMessage('Field cannot contain spaces'),
  body('description').optional().isString().isLength({ max: 280 }),
  body('horsepower').isInt({ min: 0, max: 32767 }),
  body('model_year').isInt({ min: 1000, max: new Date().getFullYear() + 1 }),
  body('model').isString().isLength({ min: 1, max: 120 }),
  body('manufacturer').isString().isIn(MANUFACTURERS),
  body('vehicle_type').isString().isIn(VEHICLE_TYPES),
  body('fuel_type').isString().isIn(FUEL_TYPES),
  body('purchase_price').isDecimal(),
  body('condition').isString().isIn(CONDITIONS),
  body('inventory_clerk').isString().isLength({ min: 1, max: 120 }),
  body('customer_seller').isInt().isLength({ min: 9, max: 9 }),
  body('colors').isArray({ min: 1 }).custom(isArrayOfColors),
];

const loginValidator = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  customerGetValidator,
  vehicleGetValidator,
  vehiclePatchValidator,
  vehiclePostValidator,
  vehicleSearchValidator,
  vendorGetValidator,
  customerPostValidator,
  vendorPostValidator,
  partsOrderPostValidator,
  loginValidator,
};
