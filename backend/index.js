require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const apiRouter = require('./src/routes/index');
const authRouter = require('./src/routes/authRoutes');
const { connect } = require('./src/config/database');
require('./src/util/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/auth', authRouter);
app.use('/api', passport.authenticate('jwt', { session: false }), apiRouter);

app.listen(PORT, async () => {
    await connect();
    console.log(`Server running on port ${PORT}`);
});
