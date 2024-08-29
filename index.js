const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const vehicleRoutes = require('./routes/vehicle.routes.js');
const orgRoutes = require('./routes/org.routes.js');

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/vehicles', vehicleRoutes);
app.use('/', orgRoutes);

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("Connected to DB!!!");
    } catch (err) {
        console.error("Failed to connect to DB:", err.message);
        setTimeout(connect, 5000); 
    }
};

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    connect();
});
