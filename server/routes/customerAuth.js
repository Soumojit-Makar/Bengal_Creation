const express = require("express");
const router = express.Router();
const { registerCustomer, loginCustomer, forgotPassword, resetPassword } = require("../controllers/customerAuthController");

router.post("/register", registerCustomer);
/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Register a new customer'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/CustomerRegisterBody' }
  }
  #swagger.responses[200] = { description: 'Customer registered successfully', schema: { msg: 'Customer Registered' } }
  #swagger.responses[400] = { description: 'Email already exists' }
  #swagger.responses[500] = { description: 'Server error' }
*/

router.post("/login", loginCustomer);
/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Customer login'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/CustomerLoginBody' }
  }
  #swagger.responses[200] = { description: 'Login successful', schema: { $ref: '#/definitions/CustomerLoginResponse' } }
  #swagger.responses[400] = { description: 'Invalid credentials' }
*/
router.post("/forgot-password", forgotPassword);
/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Request password reset email'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/ForgotPasswordBody' }
  }
  #swagger.responses[200] = { description: 'Password reset email sent', schema: { msg: 'Password Reset Request' } }
  #swagger.responses[400] = { description: 'Invalid email' }
  #swagger.responses[500] = { description: 'Server error' }
*/
router.post("/reset-password/:customerId", resetPassword);
/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Reset customer password'
  #swagger.parameters['customerId'] = { in: 'path', description: 'ID of the customer', required: true, type: 'string' }
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/ResetPasswordBody' }
  }
  #swagger.responses[200] = { description: 'Password reset successful', schema: { msg: 'Password has been reset' } }
  #swagger.responses[400] = { description: 'Invalid customer ID or password' }
  #swagger.responses[500] = { description: 'Server error' }
*/


module.exports = router;
