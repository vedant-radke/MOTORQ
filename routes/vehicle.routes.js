const express = require('express');
const { decodeVin, addVehicle, getVehicleByVin } = require('../controllers/vehicle.controller.js');

const router = express.Router();

router.get('/decode/:vin', decodeVin);
router.post('/', addVehicle);
router.get('/:vin', getVehicleByVin);

module.exports = router;
