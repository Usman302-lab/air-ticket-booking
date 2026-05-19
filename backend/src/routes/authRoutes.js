require('dotenv').config();
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/signup', passport.authenticate('signup', { session: false }), async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Signup successful',
        data: { user: req.user },
    });
});

router.post('/login', async (req, res, next) => {
    passport.authenticate('login', async (err, user) => {
        try {
            if (err || !user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
            req.login(user, { session: false }, async (loginErr) => {
                if (loginErr) return next(loginErr);
                const token = jwt.sign(
                    { user: { _id: user._id, email: user.email } },
                    process.env.JWT_SECRET || 'TOP_SECRET'
                );
                return res.status(200).json({ token, success: true, message: 'Successfully signed in' });
            });
        } catch (err) {
            return next(err);
        }
    })(req, res, next);
});

module.exports = router;
