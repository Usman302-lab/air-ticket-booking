const Booking = require('../models/booking');

const createBooking = async (data) => {
    try {
        const newBooking = {
            status: data.status || 'booked',
            id: Date.now(),
            flight: data.flight,
            user: data.user,
        };
        return await new Booking(newBooking).save();
    } catch (err) {
        console.log(err);
    }
};

const cancelBooking = async (id) => {
    try {
        return await Booking.findOneAndUpdate({ id: id }, { status: 'cancelled' });
    } catch (err) {
        console.log(err);
    }
};

const boardingPass = async (id) => {
    try {
        return await Booking.findOne({ id: id }).populate('flight').populate('user').exec();
    } catch (err) {
        console.log(err);
    }
};

const getUserBookings = async (userId) => {
    try {
        return await Booking.find({ user: userId }).populate('flight').exec();
    } catch (err) {
        console.log(err);
    }
};

module.exports = { createBooking, cancelBooking, boardingPass, getUserBookings };
