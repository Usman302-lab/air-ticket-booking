require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Airline = require('../src/models/airline');
const Flight = require('../src/models/flight');

const airlines = [
    { name: 'Pakistan International Airlines', website: 'https://www.piac.com.pk' },
    { name: 'Emirates', website: 'https://www.emirates.com' },
    { name: 'Qatar Airways', website: 'https://www.qatarairways.com' },
    { name: 'Turkish Airlines', website: 'https://www.turkishairlines.com' },
    { name: 'Etihad Airways', website: 'https://www.etihad.com' },
];

const flightTemplates = (ids) => {
    const [PIA, EK, QR, TK, EY] = ids;
    const base = new Date('2026-06-01');
    const d = (offset) => new Date(base.getTime() + offset * 86400000);

    return [
        // Karachi <-> Dubai
        { flightNumber: 'PK201', departureAirport: 'Karachi', arrivalAirport: 'Dubai', duration: 150, airline: PIA, flightDate: d(0), departureTime: '08:00', arrivalTime: '10:30', price: 220, boardingGate: 12 },
        { flightNumber: 'EK603', departureAirport: 'Dubai', arrivalAirport: 'Karachi', duration: 145, airline: EK, flightDate: d(1), departureTime: '14:15', arrivalTime: '16:40', price: 310, boardingGate: 7 },

        // Lahore <-> Dubai
        { flightNumber: 'PK202', departureAirport: 'Lahore', arrivalAirport: 'Dubai', duration: 185, airline: PIA, flightDate: d(2), departureTime: '06:30', arrivalTime: '09:35', price: 195, boardingGate: 3 },
        { flightNumber: 'EK611', departureAirport: 'Dubai', arrivalAirport: 'Lahore', duration: 180, airline: EK, flightDate: d(3), departureTime: '22:45', arrivalTime: '01:45', price: 285, boardingGate: 15 },

        // Islamabad <-> Doha
        { flightNumber: 'QR627', departureAirport: 'Islamabad', arrivalAirport: 'Doha', duration: 210, airline: QR, flightDate: d(4), departureTime: '03:30', arrivalTime: '07:00', price: 240, boardingGate: 9 },
        { flightNumber: 'QR628', departureAirport: 'Doha', arrivalAirport: 'Islamabad', duration: 205, airline: QR, flightDate: d(5), departureTime: '19:00', arrivalTime: '22:25', price: 255, boardingGate: 22 },

        // Karachi <-> Istanbul
        { flightNumber: 'TK710', departureAirport: 'Karachi', arrivalAirport: 'Istanbul', duration: 420, airline: TK, flightDate: d(6), departureTime: '01:00', arrivalTime: '08:00', price: 480, boardingGate: 5 },
        { flightNumber: 'TK711', departureAirport: 'Istanbul', arrivalAirport: 'Karachi', duration: 435, airline: TK, flightDate: d(7), departureTime: '10:30', arrivalTime: '18:45', price: 510, boardingGate: 11 },

        // Lahore <-> Abu Dhabi
        { flightNumber: 'EY243', departureAirport: 'Lahore', arrivalAirport: 'Abu Dhabi', duration: 190, airline: EY, flightDate: d(8), departureTime: '11:20', arrivalTime: '14:30', price: 175, boardingGate: 6 },
        { flightNumber: 'EY244', departureAirport: 'Abu Dhabi', arrivalAirport: 'Lahore', duration: 195, airline: EY, flightDate: d(9), departureTime: '16:00', arrivalTime: '19:15', price: 190, boardingGate: 18 },

        // Karachi <-> London
        { flightNumber: 'PK785', departureAirport: 'Karachi', arrivalAirport: 'London', duration: 510, airline: PIA, flightDate: d(10), departureTime: '23:30', arrivalTime: '08:00', price: 720, boardingGate: 2 },
        { flightNumber: 'EK7', departureAirport: 'London', arrivalAirport: 'Karachi', duration: 525, airline: EK, flightDate: d(11), departureTime: '09:15', arrivalTime: '20:00', price: 890, boardingGate: 41 },

        // Islamabad <-> Kuala Lumpur
        { flightNumber: 'PK308', departureAirport: 'Islamabad', arrivalAirport: 'Kuala Lumpur', duration: 480, airline: PIA, flightDate: d(12), departureTime: '05:00', arrivalTime: '13:00', price: 540, boardingGate: 8 },

        // Karachi <-> New York (via Dubai)
        { flightNumber: 'EK203', departureAirport: 'Karachi', arrivalAirport: 'New York', duration: 870, airline: EK, flightDate: d(13), departureTime: '02:15', arrivalTime: '17:45', price: 1100, boardingGate: 34 },

        // Lahore <-> Manchester
        { flightNumber: 'PK701', departureAirport: 'Lahore', arrivalAirport: 'Manchester', duration: 495, airline: PIA, flightDate: d(14), departureTime: '17:00', arrivalTime: '01:15', price: 650, boardingGate: 4 },
    ];
};

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Airline.deleteMany({});
    await Flight.deleteMany({});
    console.log('Cleared existing airlines and flights');

    const created = await Airline.insertMany(airlines);
    const ids = created.map(a => a._id);
    console.log(`Inserted ${created.length} airlines`);

    const flights = await Flight.insertMany(flightTemplates(ids));
    console.log(`Inserted ${flights.length} flights`);

    console.log('\nSeed complete. Sample flights:');
    flights.slice(0, 3).forEach(f =>
        console.log(`  ${f.flightNumber}  ${f.departureAirport} → ${f.arrivalAirport}  $${f.price}`)
    );

    await mongoose.disconnect();
    console.log('\nDone.');
}

seed().catch(err => { console.error(err); process.exit(1); });
