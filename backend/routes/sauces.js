const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-configuration');
const saucesCtrl = require('../controllers/sauces');

router.get('/', auth, saucesCtrl.getAllSauces);
router.get('/:id', auth, saucesCtrl.getOneSauce);
router.post('/', auth, multer, saucesCtrl.addSauce);
router.post('/:id/like', auth, saucesCtrl.likeOrDislikeSauce);
router.put('/:id', auth, multer, saucesCtrl.changeSauce);
router.delete('/:id', auth, saucesCtrl.deleteSauce);

module.exports = router;
