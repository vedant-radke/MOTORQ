const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    vin: { 
        type: String, 
        required: true, 
        unique: true 
    },
    manufacturer: { 
        type: String 
    },
    model: { 
        type: String 
    },
    year: { 
        type: String 
    },
    orgName: { 
        type: String, 
        required: true 
    }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
