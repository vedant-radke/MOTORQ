const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    account: { 
        type: String 
    },
    website: { 
        type: String 
    },
    fuelReimbursementPolicy: { 
        type: String, 
        default: '1000' 
    },
    speedLimitPolicy: { 
        type: String 
    },
    parent: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Org'  // Reference to the same model
    }
});

const Org = mongoose.model('Org', orgSchema);

module.exports = Org;
