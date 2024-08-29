const Vehicle = require('../models/Vehicle.js');
const Org = require('../models/Org.js'); 
const axios = require('axios');

const cache = {}; // Simple in-memory cache
const CACHE_TTL = 5 * 60 * 1000; // Time to live in milliseconds (e.g., 5 minutes)

const getVehicleDetails = async (vin) => {
    try {
        const now = Date.now();

        // Check if the VIN is in cache and still valid
        if (cache[vin] && (now - cache[vin].timestamp < CACHE_TTL)) {
            console.log('Returning cached result');
            return cache[vin].data;
        }

        const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
        
        let manufacturer = null;
        let model = null;
        let year = null;

        response.data.Results.forEach(item => {
            if (item.Variable === 'Manufacturer Name') {
                manufacturer = item.Value;
            }
            if (item.Variable === 'Model') {
                model = item.Value;
            }
            if (item.Variable === 'Model Year') {
                year = item.Value;
            }
        });

        if (!manufacturer || !model || !year) {
            throw new Error('Incomplete data from API');
        }

        // Cache the result before returning
        const vehicleData = { manufacturer, model, year };
        cache[vin] = { data: vehicleData, timestamp: now };

        return vehicleData;

    } catch (error) {
        console.error('Error fetching data from NHTSA API:', error.response ? error.response.data : error.message);
        throw new Error('Error fetching data from NHTSA API');
    }
};

const decodeVin = async (req, res) => {
    const { vin } = req.params;

    if (typeof vin !== 'string' || vin.length !== 17) {
        return res.status(400).json({ message: 'Invalid VIN format' });
    }

    try {
        const vehicle = await getVehicleDetails(vin);
        return res.status(200).json(vehicle);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const addVehicle = async (req, res) => {
    const { vin, org } = req.body;

    if (typeof vin !== 'string' || vin.length !== 17 || !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        return res.status(400).json({ message: 'Invalid VIN format' });
    }

    try {
        const organization = await Org.findOne({ name: org });
        console.log(organization);
        
        if (!organization) {
            return res.status(400).json({ message: 'Organization not found' });
        }

        const vehicleDetails = await getVehicleDetails(vin);

        const existingVehicle = await Vehicle.findOne({ vin });
        if (existingVehicle) {
            return res.status(400).json({ message: 'Vehicle already exists' });
        }

        const newVehicle = new Vehicle({
            vin,
            manufacturer: vehicleDetails.manufacturer,
            model: vehicleDetails.model,
            year: vehicleDetails.year,
            orgName: organization.name 
        });

        await newVehicle.save();

        return res.status(201).json(newVehicle);
    } catch (error) {
        console.error('Error adding vehicle:', error.message);
        return res.status(500).json({ message: error.message });
    }



};

const getVehicleByVin = async (req, res) => {
    const { vin } = req.params;

    if (typeof vin !== 'string' || vin.length !== 17 || !/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        return res.status(400).json({ message: 'Invalid VIN format' });
    }

    try {
        const vehicle = await Vehicle.findOne({ vin });

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        return res.status(200).json(vehicle);
    } catch (error) {
        console.error('Error fetching vehicle:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};



module.exports = {
    decodeVin,
    addVehicle,
    getVehicleByVin
};
