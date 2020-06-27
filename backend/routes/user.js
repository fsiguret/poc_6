const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const validateInput = require('../middleware/joi-validate-signup');
const limiter = require('../middleware/rate-limit');

router.post('/signup', validateInput, userCtrl.signup);
router.post('/login', limiter, validateInput, userCtrl.login);

module.exports = router;
