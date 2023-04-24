require('dotenv').config();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const varifying_token = process.env.SECRET;

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, varifying_token, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            } else {
                console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
}

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'deep gaurang vrund', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            } else {
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                console.log(res.locals.user);
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser };