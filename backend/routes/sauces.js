const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const saucesCtrl = require('../controllers/sauces');

router.get('/', auth, saucesCtrl.getAllSauces);
router.get('/:id', auth, saucesCtrl.getOneSauce);
router.post('/', auth, saucesCtrl.addSauce);
router.put('/:id', auth, saucesCtrl.changeSauce);
router.delete('/:id', auth, saucesCtrl.deleteSauce);

module.exports = router;
