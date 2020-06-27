const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-configuration');
const saucesCtrl = require('../controllers/sauces');
const validateInput = require('../middleware/joi-validate-sauce');

router.get('/', auth, saucesCtrl.getAllSauces);
router.get('/:id', auth, saucesCtrl.getOneSauce);
router.post('/', auth, multer, validateInput, saucesCtrl.addSauce);
router.post('/:id/like', auth, saucesCtrl.likeOrDislikeSauce);
router.put('/:id', auth, multer, validateInput, saucesCtrl.changeSauce);
router.delete('/:id', auth, saucesCtrl.deleteSauce);

module.exports = router;
