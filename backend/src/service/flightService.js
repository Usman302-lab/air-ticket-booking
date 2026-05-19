const Flight = require('../models/flight');

const createFlight = async (data) => {
    try {
        const newFlight = {
            departureAirport: data.departureAirport,
            arrivalAirport: data.arrivalAirport,
            duration: data.duration,
            departureTime: data.departureTime,
            arrivalTime: data.arrivalTime,
            flightNumber: data.flightNumber,
            price: data.price,
            airline: data.airlineId
        }
        const response = await new Flight(newFlight).save();
        return response;
    } catch (err) {
        console.log(err);
    }
}

const updateFlight = async (data) => {
    try {
        const response = await Flight.updateOne({flightNumber: data.flightNumber}, data);
        return response;
    } catch(err) {
        console.log(err);
    }
}

const destroyFlight = async (flightNumber) => {
    try {
        const response = await Flight.findOneAndDelete({flightNumber: flightNumber});
        return response;
    } catch(err) {
        console.log(err);
    }
}

const getFlight = async (flightNumber) => {
    try {
        const response = await Flight.findOne({flightNumber: flightNumber});
        return response;
    } catch(err) {
        console.log(err);
    }
}   

const getAllFlights = async (data) => {
    try {
        const query = {};
        if (data.departureAirport) query.departureAirport = new RegExp(data.departureAirport, 'i');
        if (data.arrivalAirport) query.arrivalAirport = new RegExp(data.arrivalAirport, 'i');
        if (data.maxPrice) query.price = { $lte: Number(data.maxPrice) };

        let dbQuery = Flight.find(query);

        if (data.sort === 'price_asc') dbQuery = dbQuery.sort('price');
        else if (data.sort === 'price_desc') dbQuery = dbQuery.sort('-price');
        else if (data.sort === 'duration_asc') dbQuery = dbQuery.sort('duration');
        else if (data.sort === 'duration_desc') dbQuery = dbQuery.sort('-duration');

        return await dbQuery.populate('airline').exec();
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    createFlight,
    updateFlight,
    destroyFlight,
    getFlight,
    getAllFlights
}