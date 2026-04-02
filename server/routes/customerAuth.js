const express = require("express");
const router = express.Router();
const { registerCustomer, loginCustomer, forgotPassword, resetPassword, changePassword } = require("../controllers/customerAuthController");

router.post("/register", registerCustomer);
/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Register a new customer'
*/

router.post("/login", loginCustomer);
/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Customer login'
*/
router.post("/google", require("../controllers/Googleauthcontroller").googleLogin);
router.post("/forgot-password", forgotPassword);
/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Request password reset email'
*/

router.post("/reset-password/:customerId", resetPassword);
/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Reset customer password using token'
  #swagger.parameters['customerId'] = { in: 'path', description: 'ID of the customer', required: true, type: 'string' }
*/

router.post("/change-password", changePassword);
/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Change password (authenticated user)'
*/

module.exports = router;
