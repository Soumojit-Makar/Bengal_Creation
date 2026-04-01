const express = require("express");
const router = express.Router();
const { submitContactForm, getContacts } = require("../controllers/contactController");

router.post("/", submitContactForm);
/*
  #swagger.tags = ['Contact']
  #swagger.summary = 'Submit a contact form'
    #swagger.consumes = ['application/json']
    #swagger.parameters['contact'] = {
        in: 'body',
        description: 'Contact form data',
        required: true,
        schema: {

            name: 'John Doe',
            email: 'johndoe@gmail;com',
            subject: 'Inquiry about product',
            message: 'I would like to know more about your products.'
        }
    }
    #swagger.responses[200] = { description: 'Message submitted & email sent', schema: { $ref: '#/definitions/Contact' } }
    #swagger.responses[400] = { description: 'All fields are required' }
    #swagger.responses[500] = { description: 'Server error' }
*/

router.get("/all", getContacts);
/*
  #swagger.tags = ['Contact']
  #swagger.summary = 'Get all contact form submissions'
  #swagger.responses[200] = { description: 'All contact submissions', schema: [{ $ref: '#/definitions/Contact' }] }
  #swagger.responses[500] = { description: 'Server error' }
*/
module.exports = router;