const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chatbotController");

router.post("/", chat);
/*
  #swagger.tags = ['Chatbot']
  #swagger.summary = 'RAG Chatbot - Bengal Creations assistant'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { question: 'What is your return policy?' }
  }
*/

module.exports = router;
