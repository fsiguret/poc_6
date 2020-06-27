const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const validateInput = require('../middleware/joi-validate-signup');

router.post('/signup', validateInput, userCtrl.signup);
router.post('/login', validateInput, userCtrl.login);

module.exports = router;
