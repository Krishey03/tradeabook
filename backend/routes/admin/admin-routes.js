const express = require('express');
const router = express.Router();
const { getAllUsers, toggleBlockUser } = require('../../controllers/admin/admin-controller');
const { authMiddleware } = require('../../controllers/auth/auth-controller'); 

router.get('/users', authMiddleware, getAllUsers);
router.put('/users/:id/block', authMiddleware, toggleBlockUser);



module.exports = router;
