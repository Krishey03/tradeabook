const express = require('express');
const router = express.Router();
const { getAllUsers, toggleBlockUser } = require('../../controllers/admin/admin-controller');
const { getAllExchanges, deleteExchange } = require('../../controllers/admin/products-controller');
const { authMiddleware } = require('../../controllers/auth/auth-controller'); 

router.get('/users', authMiddleware, getAllUsers);
router.put('/users/:id/block', authMiddleware, toggleBlockUser);
router.get('/exchanges', getAllExchanges);
router.delete('/exchanges/:id', deleteExchange);



module.exports = router;
