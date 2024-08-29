const express = require('express');
const { addOrg, getAllOrgs } = require('../controllers/org.controller.js');

const router = express.Router();


router.post('/Orgs', addOrg);
router.get('/Orgs', getAllOrgs);


module.exports = router;
