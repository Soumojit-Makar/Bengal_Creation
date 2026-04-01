const express = require("express");
const router = express.Router();
const { addAddress, getAddressesByCustomer, updateAddress, deleteAddress } = require("../controllers/addressController");

router.post("/", addAddress);
/*
  #swagger.tags = ['Addresses']
  #swagger.summary = 'Add a new address'
*/

router.get("/my/:customerId", getAddressesByCustomer);
/*
  #swagger.tags = ['Addresses']
  #swagger.summary = 'Get all addresses for a customer'
*/

router.put("/:id", updateAddress);
/*
  #swagger.tags = ['Addresses']
  #swagger.summary = 'Update an address by ID'
*/

router.delete("/:id", deleteAddress);
/*
  #swagger.tags = ['Addresses']
  #swagger.summary = 'Delete an address'
*/

module.exports = router;
