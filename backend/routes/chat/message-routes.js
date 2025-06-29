const express = require('express');
const router = express.Router();
const { 
  accessChat, 
  getUserChats, 
  sendMessage, 
  getMessages,
  initiateChat
} = require('../../controllers/chat/message-controller');
const { authMiddleware } = require('../../controllers/auth/auth-controller');

// All chat routes should be protected
router.use(authMiddleware);

router.post('/', accessChat);
router.get('/', getUserChats);
router.post('/message', sendMessage);
router.get('/message/:chatId', getMessages);
router.post('/initiate', initiateChat); // Now protected by authMiddleware

module.exports = router;