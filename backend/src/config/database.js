require('dotenv').config();
const mongoose = require('mongoose');

const connect = () => {
    console.log('MongoDB connection requested');
    return mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/air-ticket-booking');
};

module.exports = { connect };
