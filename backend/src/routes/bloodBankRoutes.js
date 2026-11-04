const express = require('express');
const router = express.Router();
const bloodBankController = require('../controllers/bloodBankController');

router.get('/', bloodBankController.getBloodBanks);
router.get('/donors', bloodBankController.getBloodDonors);
router.post('/donors', bloodBankController.registerDonor);

module.exports = router;
