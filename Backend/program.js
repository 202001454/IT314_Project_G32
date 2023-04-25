const User = require('../models/user');
const jwt = require('jsonwebtoken');

const login_get = (req, res) => {

    res.render('login', { title: 'Login' });
}
const login_post = async (req, res) => {
    try {

        const username = req.body.username;
        const password = req.body.password;
        const role = req.body.role;
        console.log("Parth");
        console.log(role);

        if (role === 'customer') {
            // console.log(req.body);
            const customer = await User.findOne({ username, role });
            const auth = await bcrypt.compare(password, customer.password);
            // const isMatch = await bcrypt.compare(password, user.password);
            if (customer && auth && customer.role === role) {

                // req.session.user_id = user._id;
                // const user = await User.login(username, password, role);
                res.cookie('jwt', '', { maxAge: 1 });
                const token = createToken(customer._id);
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                res.status(201).render(`${role}/index`, { customer });
            } else {
                res.status(500).send('Invalid Login Details');
            }
        }
        else if (role === 'manager') {
            const manager = await User.findOne({ username: username, role: role });
            const auth = await bcrypt.compare(password, manager.password);
            // console.log(manager)
            if (manager && auth && manager.role === role) {
                // const user = await User.login(username, password, role);
                res.cookie('jwt', '', { maxAge: 1 });
                const token = createToken(manager._id);
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                res.status(201).render(`${role}/index`, { manager });
            }
            else {
                console.log(username);
                res.status(400).send('Invalid manager');
            };

        }
        else if (role === 'cadet') {
            const cadet = await User.findOne({ username, role });
            const auth = await bcrypt.compare(password, cadet.password);

            if (cadet && auth && cadet.role === req.body.role) {
                const user = await User.login(username, password, role);
                const token = createToken(user._id);
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                res.status(201).render(`${role}/index`, { cadet });
            }
            else {
                res.status(300).send('Invalid Login Details');
            }

        }
    } catch (error) {
        console.log(req.body);

        res.status(200).send('Invalid Login Details');
    }
};

const signup_get = (req, res) => {
    const err = undefined;
    res.render('Signup', { err });
}

const signup_post = async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        //validate password
        const validpassword = validatepassword(password);
        if (!validpassword) {
            res.render('signup', { err: "Password must be between 6 to 16 characters and must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character" });
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
            //verify username and email in the database if already exists

            const foundUser = await User.findOne({ username: user.username });
            console.log(foundUser);
            if (foundUser) {
                res.render('signup', { err: "Username already exists" });
            }
            const foundEmail = await User.findOne({ email: user.email });
            console.log(foundEmail);

            if (foundEmail) {
                res.render('signup', { err: "Email already exists" });
            }

            //if not exists then save the user in the database
            user.save().then((result) => {
                // sendVerifyMail(req.body.fullname, req.body.email, result._id, req.body.role);
                res.status(201).render('login');
            }).catch((err) => {
                console.log(err);
            }
            );
        } else {
            res.send("Password are not matching");
        }

    } catch (error) {
        res.status(400);
        res.send(error);
    }
}

module.exports = {
    login_get,
    login_post,
    signup_get,
    signup_post
};