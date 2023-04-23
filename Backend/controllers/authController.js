const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleErrors = (err) => {
    console.log(err.message, err.code);
    let error = { username:'', email: '', password: '', date: ''}

    
    if(err.message.includes('username_1')){
        error.username = 'Please enter unique username';
    }
    if(err.message.includes('email_1')){
        error.email = 'Please enter unique email';
    }

    //validation
    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            error[properties.path] = properties.message;
        });
    }
    return error;
}

const validatepassword = (password) => {
    let errors = [];
    if (password.length < 6 || password.length > 16) {
        errors.push('Password must be between 6 and 16 characters');
    }
    // Number check
    if (!password.match(/[0-9]+/)) {
        errors.push('Password must contain at least one number');
    }
    // Uppercase check
    if (!password.match(/[A-Z]+/)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    // Lowercase check
    if (!password.match(/[a-z]+/)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    // Special character check
    if (!password.match(/[!@#$%^&*()]+/)) {
        errors.push('Password must contain at least one special character');
    }
    return errors;
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, 'deep gaurang vrund', {
        expiresIn: maxAge
    });
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.signup_post = async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;
        const passwordErrors = validatepassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({ err: { password: passwordErrors.join(', ') } });
        }
        if (password === cpassword) {
            const user = new User({
                fullname: req.body.fullname,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone,
                role: req.body.role,
                gender: req.body.gender,
                date: req.body.birthdate,
            });
            const registered = await user.save();
            const token = createToken(registered._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.status(201).json({user: registered._id});
        } else {
            res.status(400).send(`password didn't match`);
        }
    } catch (error) {
        console.log(error);
        const err = handleErrors(error);
        res.status(400).json({err});
    }
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.login_post = async (req, res) => {
    try {
        const user = await User.login(req.body.username, req.body.password, req.body.role);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }); 
        res.status(201).json({ user: user._id });
    } catch (error) {
        const err = handleErrors(error);
        res.status(400).json({err});
    }
}

module.exports.secret_get = (req, res) => {
    res.render('secret');
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}