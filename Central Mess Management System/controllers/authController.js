require('dotenv').config();
const nodemailer = require('nodemailer');
const User = require('../models/user');
const Inventory = require('../models/inventory');
const Feedback = require('../models/feedback');
const Payment = require('../models/payment');
const Paymenthistory = require('../models/paymenthistory');
const Managercheck = require('../models/managercheck');




const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;

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

const maxAge = 50 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, SECRET, {
        expiresIn: maxAge
    });
}


const sendVerifyMail = async (name, email, user_id, userrole, req) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.MAIL,
                pass: process.env.PASS,
            },
        });

        let mailOptions = {
            from: process.env.MAIL,
            to: email,
            subject: '',
            html: '',
        };
        const remaining = `/verify/${user_id}`;
        const protocol = req.protocol || 'http';
        const hostname = req.headers.host || 'localhost:3000';
        const url_ = protocol + '://' + hostname + remaining;
        if (userrole === 'customer') {
            mailOptions.subject = 'For verification mail';
            mailOptions.html = `<p>Hii '${name}', please click <a href="${url_}">here</a> to verify your mail</p>`;
        } else if (userrole === 'manager') {
            mailOptions.to = process.env.MANAGER_MAIL;
            mailOptions.subject = `For verification mail for manager named ${name}`;
            mailOptions.html = `<p>Dear Manager, ${name} wants to be a manager, please click <a href="${url_}">here</a> to verify their mail</p>`;
        } else if (userrole === 'cadet') {
            mailOptions.to = process.env.MANAGER_MAIL;
            mailOptions.subject = `For verification mail for cadet named ${name}`;
            mailOptions.html = `<p>Dear Manager, ${name} wants to be a cadet, please click <a href="${url_}">here</a> to verify their mail</p>`;
        } else {
            throw new Error(`Invalid user role: ${userrole}`);
        }

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email has been sent to ${email}: ${info.messageId}`);
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};


const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.params.id }, { $set: { isVerified: Boolean(true) } });
        const customer = await User.findOne({ _id: req.params.id });
        console.log(customer);
        console.log(updateInfo);
        res.render('login', { err: undefined });
    } catch (error) {
        console.log(error.message);
        res.log('Inside catch block of verifyMail');
    }
}


const login_get = (req, res) => {
    const err = undefined;
    res.render('login', { title: 'Login', err });
}
const login_post = async (req, res) => {
    try {

        const username = req.body.username;
        const password = req.body.password;
        const role = req.body.role;


        const customer = await User.findOne({ username, role });


        if (customer) {
            if (customer.isVerified === false) {
                const err = 'Please verify your mail to login';
                res.status(500).render('login', { err });
            }
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
                    const err = 'Invalid Login Details';
                    res.status(500).render('login', { err });
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
                    const err = 'Invalid Login Details';
                    res.status(500).render('login', { err });
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
                    const err = 'Invalid Login Details';
                    res.status(500).render('login', { err });
                }

            }
        }
        else {
            const err = 'Invalid Login Details';
            res.status(500).render('login', { err });
        }
    } catch (error) {
        const err = `User Doesn't Exist`;
        console.log("LODU");
        res.status(404).render('404', { err });
    }
};
// app.post('/login', async (req, res) => {
//     const { username, password, role } = req.body;
//     res.send({ username, password, role });

//     // verify username password and role in the User database
//     // redirect to the .ejs page according to role

// });

const signup_get = (req, res) => {
    const err = undefined;
    res.render('signup', { err });
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
                const err = 'Username already exists';
                res.status(500).render('signup', { err });
            }
            const foundEmail = await User.findOne({ email: user.email });
            console.log(foundEmail);

            if (foundEmail) {
                res.status(500).render('signup', { err: "Email already exists" });
            }

            //if not exists then save the user in the database
            user.save().then(async (result) => {
                // sendVerifyMail(req.body.fullname, req.body.email, result._id, req.body.role);
                const sendMail = await sendVerifyMail(req.body.fullname, req.body.email, result._id, req.body.role, req);
                res.render('login', { err: undefined });
            }).catch((err) => {
                console.log(err);
            }
            );
        } else {
            res.status(500).render('signup', { err: "Password are not matching" });
        }

    } catch (error) {
        res.status(404).render('404', { err: "Signup_post error" });
    }
}

//----------------------Functions for forget password-----------------------------

const sendForgotPasswordMail = async (name, email, user_id, req) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.MAIL,
                pass: process.env.PASS,
            },
        });

        const remaining = `/resetpassword/${user_id}`;
        const protocol = req.protocol || 'http';
        const hostname = req.headers.host || 'localhost:3000';
        const url_ = protocol + '://' + hostname + remaining;

        let mailOptions = {
            from: process.env.MAIL,
            to: email,
            subject: 'Password reset for central mess portal',
            html: `<p>Hii '${name}', please click <a href="${url_}">here</a> to reset your password.</p>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email has been sent to ${email}: ${info.messageId}`);
    } catch (error) {
        // console.error(error.message);
        // throw error;
        res.status(404).render('404', { err: 'sendForgotPasswordMail error' });
    }
};

const forgotpassword_get = async (req, res) => {
    try {
        res.render('forgotpassword', { err: undefined });
    }
    catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'forgotpassword_get error' });
    }
}

const forgotpassword_post = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await User.findOne({ email: email });
        if (user) {
            const mailSend = await sendForgotPasswordMail(user.fullname, email, user._id, req);
            // res.render('cadet/edit', { cadet: cadet });
            // res.send(cadet);
            res.render('login', { err: 'Please check your email to reset password.' });
        }
        else {
            res.status(500).render('forgotpassword', { err: 'Email not found' });
        }
    } catch (error) {
        // res.send("Unable to find cadet");
        res.status(400).render('404', { err: 'forgotpassword_post error' });
    }
}

const resetpassword_get = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findOne({ _id: id });
        if (user) {
            res.render('resetpassword', {user: user , err: undefined });
        }
        else {
            res.status(404).render('404', { err: 'User not found' });
        }
    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'resetpassword_get error' });
    }
}

const resetpassword_patch = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findOne({ _id: id });
        if (user) {
            const password = req.body.password;
            const cpassword = req.body.cpassword;
            if (password === cpassword) {
                const hashedPassword = await bcrypt.hash(password, 12);
                User.updateOne({ _id: id }, { $set: { password: hashedPassword }, validate: true })
                    .then((result) => {
                        console.log(result);
                        res.render('login', { err: undefined });
                    })
                    .catch((err) => {
                        res.status(404).render('404', { err: 'cannot perform updation error' });
                    });
            }
            else {
                res.status(500).render('resetpassword', { user: user , err: 'Password does not match' });
            }
        }
        else {
            res.status(500).render('login', { err: 'User not found' });
        }
    } catch (error) {
        res.status(404).render('404', { err: 'resetpassword_patch error' });
    }
}

const customer_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const customer = await User.findOne({ username: username });
        // console.log(customer);
        res.render('customer/index', { customer: customer, err: undefined });
    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'Customer_get error' });
    }
}


const customer_view_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const customer = await User.findOne({ username: username, role: 'customer' });
        if (customer) {
            res.render('customer/view', { customer: customer });
            // res.send(customer);
        } else {
            res.status(500).render('signup', { err: `customer doesn't exist` });
        }


    } catch (error) {
        res.status(404).render('404', { err: `customer_view get error` });
        // console.log(error);
        // res.send('An error occurred while finding the customer.');
    }
}


const customer_changepassword_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const customer = await User.findOne({ username: username, role: 'customer' });

        if (customer) {
            res.render('customer/changepassword', { customer: customer, err: undefined });
        } else {
            res.status(500).render('signup', { err: `customer doesn't exist` });
            // res.send('No customer found.');
        }
    } catch (error) {
        res.status(404).render('404', { err: `customer_changepassword_get error` });
        // console.log(error);
        // res.send('An error occurred while finding the customer.');
    }
}

const customer_changepassword_patch = async (req, res) => {
    try {
        const { username } = req.params; // use req.params.username to get the username
        let customer = await User.findOne({ username: username, role: 'customer' });

        // customer.password = req.body.password;
        // const cpassword = req.body.cpassword;

        // const auth = bcrypt.compare(req.body.oldpassword, customer.password);
        if (req.body.password === req.body.cpassword && req.body.cpassword) {
            const validpassword = validatepassword(req.body.password);
            if (!validpassword) {
                res.render('customer/changepassword', { customer: customer, err: "Password must be between 6 to 16 characters and must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character" });
            }
            const bcryptPass = await bcrypt.hash(req.body.password, 12);

            User.updateOne({ username: username },
                { $set: { password: bcryptPass }, validate: true }).then((result) => {
                    // console.log("Gaurang");
                    customer.password = bcryptPass;
                    res.render('customer/index', { customer: customer });
                }).catch((err) => {
                    // console.log("Gaurang");
                    // console.log(err);
                    // res.send(err);
                    res.status(404).render('404', { err: "change password error" });
                }
                );
        }
        else {
            res.status(500).render('customer/changepassword', { customer: customer, err: "Password are not matching" });
            // res.send("Password are not matching");
        }

    } catch (error) {
        // console.log(error);
        // res.send('An error occurred while finding the customer.');
        res.status(404).render('404', { err: `customer_changepassword_patch error` });
    }
}

const customer_edit_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const customer = await User.findOne({ username: username, role: 'customer' });
        if (customer) {

            res.render('customer/edit', { customer: customer, err: undefined });
            // res.send(customer);
        } else {
            res.status(500).render('signup', { err: `customer doesn't exist` });
        }

    } catch (error) {
        res.status(404).render('signup', { err: `customer doesn't exist` });
        // console.log(error);
        // res.send('An error occurred while finding the customer.');
    }
}

const customer_edit_patch = async (req, res) => {
    try {
        const { username } = req.params; // use req.params.username to get the username
        const customer = await User.findOne({ username: username, role: 'customer' });

        // customer.password = req.body.password;
        customer.fullname = req.body.fullname;
        customer.date = req.body.date;
        customer.email = req.body.email;
        customer.phone = req.body.phone;
        customer.gender = req.body.gender;
        // console.log(customer);
        // res.send(username);

        User.updateOne({ username: username },
            { $set: { fullname: req.body.fullname, date: req.body.date, email: req.body.email, phone: req.body.phone, gender: req.body.gender }, validate: true }).then((result) => {
                console.log(result);
                res.render('customer/index', { customer: customer });
            }).catch((err) => {
                // console.log(err);
                // res.send(err);
                res.status(404).render('404', { err: "customer update error" });
            }
            );

        // User.save().then((result) => {
        //     console.log(result);
        //     res.render('customer/index', { customer: customer });
        // }).catch((err) => {
        //     console.log(err);
        // }
        // );



    } catch (error) {
        res.status(404).render('404', { err: `customer_edit_patch error` });
        // console.log(error);
        // res.send('An error occurred while finding the customer.');
    }
};


const customer_feedback_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const customer = await User.findOne({ username: username, role: 'customer' });
        if (customer) {
            res.render('customer/feedback', { customer: customer });
            // res.send(customer);
        } else {
            // res.send('No customer found.');
            res.status(500).render('signup', { err: `customer doesn't exist` });
        }

    } catch (error) {
        res.status(404).render('404', { err: `customer_feedback_get error` });
        // console.log(error);
        // res.send('An error occurred while finding the customer.');
    }
}

// error handling baki ****************************************************
const customer_feedback_post = async (req, res) => {
    try {

        const { username } = req.params; // use req.params.username to get the username
        const customer = await User.findOne({ username: username, role: 'customer' });

        // if (customer) {

        const feedback = new Feedback({
            cleanliness: req.body.cleanliness,
            service: req.body.service,
            food: req.body.food,
            comment: req.body.comment,
            username: username,
            date: new Date(date.getTime() + (330 * 60 * 1000))


        });
        const fb = await feedback.save();
        res.render('customer/index', { customer: customer });

    } catch (error) {
        // console.log(error);
        // res.send('An error occurred while finding the customer.');
        res.status(404).render('404', { err: `customer_feedback_post error` });
    }
}

const customer_paymenthistory_get = async (req, res) => {
    try {

        const username = req.params.username; // use req.params.username to get the username
        const customer = await User.findOne({ username: username, role: 'customer' });
        if (customer) {
            const found = await Paymenthistory.find({ username: customer.username }).sort({ _id: -1 });
            console.log(found);
            res.render('customer/paymenthistory', { customer: customer, paymenthistory: found });
            // res.send(found);
        } else {
            // res.send('No customer found.');
            res.render('signup', { err: `customer doesn't exist` });
        }

    } catch (error) {
        res.status(404).render('404', { err: `customer_paymenthistory_get error` });
        // console.log(error);
        // res.send('An error occurred while finding the customer.');
    }
}

const manager_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const manager = await User.findOne({ username: username, role: 'manager' });
        // console.log(manager);
        res.render('manager/index', { manager: manager });
    } catch (error) {
        res.status(404).render('404', { err: `manager_get error` });
        // console.log(error);
        // res.send('An error occurred while finding the manager.');
    }
}

const manager_edit_get = async (req, res) => {
    try {
        const { username } = req.params;
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {
            res.render('manager/edit', { manager: manager, err: undefined });
            // res.send(manager);
        }
        else {
            res.status(500).render('signup', { err: `manager doesn't exist` });
            // res.send("Error occured!");
        }
    } catch (error) {
        res.status(404).render('404', { err: `manager_edit_get error` });
        // res.send("Unable to find Manager");
    }
}

const manager_edit_patch = async (req, res) => {
    try {
        const { username } = req.params; // use req.params.username to get the username
        const manager = await User.findOne({ username: username, role: 'manager' });


        // manager.password = req.body.password;
        manager.fullname = req.body.fullname;
        manager.date = req.body.date;
        manager.email = req.body.email;
        manager.phone = req.body.phone;
        manager.gender = req.body.gender;
        // console.log(manager);
        // res.send(username);

        User.updateOne({ username: username, role: 'manager' },
            { $set: { fullname: req.body.fullname, date: req.body.date, email: req.body.email, phone: req.body.phone, gender: req.body.gender }, validate: true })
            .then((result) => {
                console.log(result);
                res.render('manager/index', { manager: manager });
            })
            .catch((err) => {
                res.status(404).render('404', { err: `manager details not updated !!` });
                // res.status(500).render('manager/edit', { manager: manager, err: err.message });
                // console.log(err);
                // res.send('cannot update');
            }
            );

    } catch (error) {
        res.status(404).render('404', { err: `manager_edit_patch error` });

        // console.log(error);
        // res.send('An error occurred while finding the manager.');
    }
}


const manager_view_get = async (req, res) => {
    try {
        const { username } = req.params;
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {
            res.render('manager/view', { manager: manager });
            // res.send(manager);
        }
        else {
            res.status(500).render('signup', { err: `manager doesn't exist` });
            // res.send('No Manager found.');
        }
    } catch (error) {
        res.status(404).render('404', { err: `manager_view_get error` });
        // res.send('An error occurred while finding the customer.');

    }

}



const manager_changepassword_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const manager = await User.findOne({ username: username, role: 'manager' });

        if (manager) {

            res.render('manager/changepassword', { manager: manager, err: undefined });
            // res.send(manager);
        } else {
            res.status(500).render('signup', { err: `manager doesn't exist` });
            // res.send('No manager found.');
        }
    } catch (error) {
        res.status(404).render('404', { err: `manager_changepassword_get error` });
        // console.log(error);
        // res.send('An error occurred while finding the manager.');
    }
}

const manager_changepassword_patch = async (req, res) => {
    try {
        const { username } = req.params; // use req.params.username to get the username

        // manager.password = req.body.password;
        // const cpassword = req.body.cpassword;

        if (req.body.password === req.body.cpassword && req.body.cpassword) {
            let manager = await User.findOne({ username: username, role: 'manager' });
            manager.password = await bcrypt.hash(req.body.password, 12);
            User.updateOne({ username: username },
                { $set: { password: manager.password }, validate: true }).then((result) => {
                    console.log(result);
                    res.render('manager/index', { manager: manager });
                }).catch((err) => {
                    // console.log(err);
                    // res.send(err);
                    res.status(404).render('404', { err: `manager password not updated !!` });
                }
                );
        }
        else {
            res.status(500).render('manager/changepassword', { err: `password doesn't match` });
        }
    } catch (error) {
        res.status(404).render('404', { err: `manager_changepassword_patch error` });
        // console.log(error);
        // res.send('An error occurred while finding the manager.');
    }
}

const manager_managercheck_get = async (req, res) => {
    try {
        const username = req.params.username;
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {

            // theDate.toLocaleString()
            // manager.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            const date = new Date();
            const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
            manager.date = ISTTime;

            res.render('manager/managercheck', { manager, err: undefined });
        }
        else {
            res.status(500).render('signup', { err: `manager doesn't exist` });
            // res.status(404).send('Manager not found');
        }
    } catch (error) {
        res.status(404).render('404', { err: `manager_managercheck_get error` });
        // console.log(error);
        // res.status(500).send('Internal server error');
    }

}

const manager_managercheck_post = async (req, res) => {
    try {
        const username = req.params.username;
        let manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {
            const c_username = req.body.username;
            const cdate = req.body.date;
            const c_date = new Date(cdate.getTime() + (330 * 60 * 1000));
            const c_time = req.body.time.toLowerCase();

            //finding the customer from payment database
            const paymentofcustomer = await Payment.findOne({ username: c_username });
            if (paymentofcustomer) {
                // const _date = new Date();
                if (paymentofcustomer.enddate - c_date < 0) {
                    const date = new Date();
                    const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
                    manager.date = ISTTime;
                    res.status(500).render('manager/managercheck', { manager, err: `Payment is expired` });
                    // res.send("payment is expired");
                }
                //payment is done!
                else {
                    const customer = await Managercheck.findOne({ username: c_username, date: c_date });

                    if (customer) {
                        if (c_time == 'breakfast') {
                            if (customer.breakfast == Boolean(false)) {
                                Managercheck.updateOne({ username: c_username, date: c_date }, { $set: { breakfast: Boolean(true) } }).then((result) => {
                                    const date = new Date();

                                    // theDate.toLocaleString()
                                    // manager.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
                                    const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
                                    console.log(ISTTime);
                                    manager.date = ISTTime;
                                    res.render('manager/managercheck', { manager, err: undefined });
                                }).catch((err) => {

                                    res.status(404).render('404', { err: `customer breakfast not updated` });
                                    // console.log(err);
                                    // res.send('cannot update');
                                });
                            }
                            else {
                                // res.send("Already checked for breakfast");
                                const date = new Date();

                                const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
                                console.log(ISTTime);
                                manager.date = ISTTime;
                                res.status(500).render('manager/managercheck', { manager, err: 'Already checked for breakfast' });

                            }

                        }
                        else if (c_time == 'lunch') {
                            if (customer.lunch == Boolean(false)) {
                                Managercheck.updateOne({ username: c_username, date: c_date }, { $set: { lunch: Boolean(true) } }).then((result) => {
                                    const date = new Date();

                                    // theDate.toLocaleString()
                                    // manager.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
                                    const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
                                    console.log(ISTTime);
                                    manager.date = ISTTime;

                                    res.render('manager/managercheck', { manager, err: undefined });
                                }).catch((err) => {
                                    res.status(404).render('404', { err: `customer lunch not updated` });
                                    // console.log(err);
                                    // res.send('cannot update');
                                });
                            }
                            else {

                                const date = new Date();

                                const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
                                console.log(ISTTime);
                                manager.date = ISTTime;
                                res.status(500).render('manager/managercheck', { manager, err: 'Already checked for lunch' });
                                // res.send("Already checked for lunch");
                            }

                        }
                        else {
                            if (customer.dinner == Boolean(false)) {
                                Managercheck.updateOne({ username: c_username, date: c_date }, { $set: { dinner: Boolean(true) } }).then((result) => {
                                    const date = new Date();

                                    // theDate.toLocaleString()
                                    // manager.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
                                    const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
                                    console.log(ISTTime);
                                    manager.date = ISTTime;
                                    res.render('manager/managercheck', { manager, err: undefined });
                                }).catch((err) => {
                                    res.status(404).render('404', { err: `customer dinner not updated` });
                                    // console.log(err);
                                    // res.send('cannot update');
                                });
                            }
                            else {
                                const date = new Date();

                                // res.send("Already checked for dinner");
                                const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
                                console.log(ISTTime);
                                manager.date = ISTTime;

                                res.status(500).render('manager/managercheck', { manager, err: 'Already checked for dinner' });
                            }
                        }
                    }
                    else {
                        //make new and save
                        const _customer = await User.findOne({ username: c_username, role: 'customer' });
                        if (_customer) {

                            let newcustomer = new Managercheck({ username: c_username, date: c_date, breakfast: Boolean(false), lunch: Boolean(false), dinner: Boolean(false) });

                            if (c_time == 'breakfast') {
                                newcustomer.breakfast = Boolean(true);
                            }
                            else if (c_time == 'lunch') {
                                newcustomer.lunch = Boolean(true);
                            }
                            else {
                                newcustomer.dinner = Boolean(true);
                            }
                            const register = await newcustomer.save();
                            const date = new Date();

                            // theDate.toLocaleString()
                            // manager.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
                            const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
                            console.log(ISTTime);
                            manager.date = ISTTime;

                            res.render('manager/managercheck', { manager, err: undefined });

                        }
                        else {
                            // res.send("Customer not found");
                            const date = new Date();

                            const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
                            console.log(ISTTime);
                            manager.date = ISTTime;

                            res.status(500).render('manager/managercheck', { manager, err: 'Customer not found' });
                        }


                    }
                }
            }
            else {

                // res.send("Payment not found");
                const date = new Date();

                const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
                console.log(ISTTime);
                manager.date = ISTTime;

                res.status(500).render('manager/managercheck', { manager, err: 'Payment not found' });
            }

        }
        else {

            res.status(404).render('404', { err: 'Manager not found' });
        }
    } catch (error) {
        // console.log(error);
        // res.status(404).send('Internal server error');
        res.status(404).render('404', { err: 'manager_managercheck_post error' });
    }
}


const manager_inventoryupgrade_get = async (req, res) => {
    try {
        const username = req.params.username;
        const manager = await User.findOne({ username: username, role: 'manager' });
        res.render('manager/inventoryupgrade', { manager, err: undefined });

    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'manager_inventoryupgrade_get error' });
    }
}


const manager_inventorydegrade_get = async (req, res) => {
    try {
        const username = req.params.username;
        const manager = await User.findOne({ username: username, role: 'manager' });
        res.render('manager/inventorydegrade', { manager, err: undefined });

    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'manager_inventorydegrade_get error' });
    }
}

const manager_inventoryupgrade_patch = async (req, res) => {
    try {
        const item_ = req.body.item; //of item's
        const item = item_.toLowerCase();
        const quantity = req.body.quantity; //of item's quantity'of item's
        const username = req.params.username; //manager's
        const inventory = await Inventory.findOne({ item: item });//finding inventory
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (inventory && manager) {
            //if both found
            Inventory.updateOne({ item: item }, { $set: { quantity: Number(inventory.quantity) + Number(quantity) } })
                .then((result) => {
                    // console.log(result);
                    res.render('manager/inventoryupgrade', { manager: manager, err: undefined });
                    // res.send("Updated successfully");
                })
                .catch((error) => {
                    // console.log(error);
                    // res.send("In 1st catch");
                    res.status(404).render('404', { err: 'item updation error' });
                });
        }
        else if (manager && (!inventory)) {
            const _inventory = new Inventory({
                item: item,
                quantity: quantity
            });
            const response = await _inventory.save();
            res.render('manager/inventoryupgrade', { manager: manager, err: undefined });
            // res.send("New added");
        }
        else {
            // // console.log("Error")
            // res.status(404).render('404', { err: 'manager_inventoryupgrade_patch error' });
            res.status(404).render('404', { err: 'item updation error' });

        }
    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'manager_inventoryupgrade_patch error' });
    }
}

const manager_inventorydegrade_patch = async (req, res) => {
    try {
        const item_ = req.body.item; //of item's
        const item = item_.toLowerCase();
        const quantity = req.body.quantity;// of item's

        const username = req.params.username; //manager's

        const inventory = await Inventory.findOne({ item: item });//finding inventory
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (inventory && manager) {
            //if both found
            let qty = (inventory.quantity - Number(quantity) >= 0) ? inventory.quantity - Number(quantity) : 0;

            Inventory.updateOne({ item: item }, { $set: { quantity: qty } })
                .then((result) => {
                    console.log(result);
                    res.render('manager/inventorydegrade', { manager: manager, err: undefined });
                    // res.send("Updated successfully");
                })
                .catch((error) => {
                    // console.log(error);
                    // res.send("In 1st catch");
                    res.status(404).render('404', { err: 'item updation error' });
                });
        }
        else {
            // console.log("Error");
            // res.render('404');
            res.status(500).render('manager/inventorydegrade', { err: `Item doesn't exist` });

        }
    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'manager_inventorydegrade_patch error' });
    }
}



const manager_addpayment_get = async (req, res) => {
    try {
        const username = req.params.username;
        let manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {

            const date = new Date();

            // theDate.toLocaleString()
            // manager.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
            console.log(ISTTime);
            manager.date = ISTTime;
            res.render('manager/addpayment', { manager: manager, err: undefined });
        }
        else {

            // res.send('An error occurred while finding the manager.');
            res.status(404).render('404', { err: 'manager not exists' });
        }
    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'manager_addpayment_get error' });
    }

}


const manager_addpayment_post = async (req, res) => {
    try {
        const { username } = req.params;
        const manager = await User.findOne({ username: username, role: 'manager' });
        const user = await User.findOne({ username: req.body.username, role: 'customer' });
        if (manager && user) {
            const customerusername = req.body.username;
            // console.log("Hiya");
            // console.log(customerusername);
            // console.log("Hiya");
            const oldPayment = await Payment.findOne({ username: customerusername });
            if (oldPayment) {
                oldPayment.startdate = req.body.startdate;
                oldPayment.enddate = req.body.enddate;
                oldPayment.amount = req.body.amount;

                const updated = await Payment.updateOne({ username: customerusername }, { $set: { startdate: oldPayment.startdate, enddate: oldPayment.enddate, amount: oldPayment.amount }, validate: true });
                if (updated) {
                    const updateHistory = new Paymenthistory({
                        username: customerusername,
                        startdate: oldPayment.startdate,
                        enddate: oldPayment.enddate,
                        amount: oldPayment.amount
                    });
                    const historysave = await updateHistory.save();
                    if (historysave) {
                        const date = new Date();

                        // theDate.toLocaleString()
                        // manager.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
                        const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
                        console.log(ISTTime);
                        manager.date = ISTTime;
                        res.render('manager/addpayment', { manager: manager, err: undefined });
                    }
                    else {
                        // res.send("An error occurred while updating the payment history.");
                        res.status(404).render('404', { err: 'payment history save error' });
                    }
                }
                else {
                    // res.send("An error occurred while updating the payment details.");
                    res.status(404).render('404', { err: 'payment details update error' });
                }
            }
            else {
                const customer = await User.findOne({ username: customerusername, role: 'customer' });
                // console.log('customer', customer);
                if (customer) {
                    const payment = new Payment({
                        username: req.body.username,
                        startdate: req.body.startdate,
                        enddate: req.body.enddate,
                        amount: req.body.amount
                    });
                    const customerpaymentadded = await payment.save();
                    if (customerpaymentadded) {
                        const paymenthistory = new Paymenthistory({
                            username: customerusername,
                            startdate: req.body.startdate,
                            enddate: req.body.enddate,
                            amount: req.body.amount
                        });
                        const historysave = await paymenthistory.save();
                        if (historysave) {
                            const date = new Date();

                            // theDate.toLocaleString()
                            // manager.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
                            const ISTTime = new Date(date.getTime() + (330 * 60 * 1000));
                            console.log(ISTTime);
                            manager.date = ISTTime;

                            res.render('manager/addpayment', { manager: manager, err: undefined });
                        }
                        else {
                            // res.send("An error occurred while updating the payment history.");
                            res.status(404).render('404', { err: 'payment history save error' });
                        }
                    }
                    else {
                        // res.send("An error occurred while updating the payment details.");
                        res.status(404).render('404', { err: 'payment details update error' });
                    }

                }
                else {
                    // res.send("customer not found");
                    res.status(404).render('404', { err: 'customer not found' });
                }
            }
        }
        else {
            // res.send("aap payment nahi kar sakte");
            res.status(500).render('manager/addpayment', { manager: manager, err: `User doesn't exist` });

        }
    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'manager_addpayment_post error' });
    }
}

const manager_viewfeedback_get = async (req, res) => {
    try {
        const username = req.params.username;
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {
            const feedback = await Feedback.find().sort({ _id: -1 }).limit(10);
            if (feedback) {
                // console.log(manager.username);
                // console.log("ok");
                res.render('manager/viewfeedback', { manager: manager, feedback: feedback });
            }
            else {
                // res.send("No feedback found");
                res.status(404).render('404', { err: 'No feedback found' });
            }
        }
    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'manager_viewfeedback_get error' });
    }
}

const manager_viewinventory_get = async (req, res) => {
    try {
        const username = req.params.username;
        const manager = await User.findOne({ username: username, role: 'manager' });
        const inventory = await Inventory.find();

        res.render('manager/viewinventory', { manager: manager, inventory: inventory });

    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'manager_viewinventory_get error' });
    }
}

const manager_deleteuser_get = async (req, res) => {
    const username = req.params.username;
    const manager = await User.findOne({ username: username, role: 'manager' });

    res.render('manager/deleteuser', { manager: manager, err: undefined });

}

const manager_deleteuser_delete = async (req, res) => {
    const username = req.params.username;
    const manager = await User.findOne({ username: username, role: 'manager' });
    if (manager) {
        const managerPass = req.body.password;
        const auth = await bcrypt.compare(managerPass, manager.password);
        if (auth) {
            const userusername = req.body.username;
            const _delete = await User.deleteOne({ username: userusername, role: req.body.role });
            if (_delete) {
                res.render('manager/deleteuser', { manager: manager, err: undefined });
            }
            else {
                // res.send("An error occurred while deleting the customer.");
                res.status(500).render('manager/deleteuser', { manager: manager, err: `An error occurred while deleting the customer.` });
            }
        }
        else {
            // res.send("Password not matched for manager");
            res.status(500).render('manager/deleteuser', { manager: manager, err: `Incorrect password` });

        }
    }
    else {
        res.send("Manager not found");
    }
}


const manager_paymenthistorygraph_get = async (req, res) => {
    try {
        const username = req.params.username;
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {
            const durationInMonths = 6;
            const endDate = new Date();
            const startDate = new Date(endDate.getFullYear() - Math.floor(durationInMonths / 12), endDate.getMonth() - (durationInMonths % 12), 1);
            const payments = await Paymenthistory.aggregate([
                {
                    $match: {
                        startdate: { $gte: startDate },
                        // enddate: { $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m',
                                date: '$startdate'
                            }
                        },
                        totalAmount: {
                            $sum: '$amount'
                        }
                    }
                },
                {
                    $project: {
                        month: '$_id',
                        totalAmount: '$totalAmount',
                        _id: 0
                    }
                },
                {
                    $sort: {
                        month: 1
                    }
                }
            ]);
            console.log(payments);
            res.render('manager/viewpaymenthistorygraph', { manager, payments });
        } else {
            // res.send('No manager found');
            res.status(404).render('404', { err: 'No manager found' });
        }
    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'manager_paymenthistorygraph_get error' });

    }
};


const manager_paymenthistorygraph_post = async (req, res) => {
    try {
        const username = req.params.username;
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {
            const durationInMonths = Number(req.body.month);
            const endDate = new Date();
            const startDate = new Date(endDate.getFullYear() - Math.floor(durationInMonths / 12), endDate.getMonth() - (durationInMonths % 12), 1);
            const payments = await Paymenthistory.aggregate([
                {
                    $match: {
                        startdate: { $gte: startDate },
                        //   enddate: { $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: '%Y-%m',
                                date: '$startdate'
                            }
                        },
                        totalAmount: {
                            $sum: '$amount'
                        }
                    }
                },
                {
                    $project: {
                        month: '$_id',
                        totalAmount: '$totalAmount',
                        _id: 0
                    }
                },
                {
                    $sort: {
                        month: 1
                    }
                }
            ]);
            console.log(payments);
            res.render('manager/viewpaymenthistorygraph', { manager, payments });
        } else {
            // res.send('No manager found');
            res.status(404).render('404', { err: 'No manager found' });
        }
    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'manager_paymenthistorygraph_post error' });
    }
};


const cadet_viewprofile_get = async (req, res) => {
    try {
        const username = req.params.username;
        const cadet = await User.findOne({ username: username, role: 'cadet' });
        if (cadet) {
            res.render('cadet/view', { cadet: cadet });
        }
        else {
            // res.send("Cadet not found");
            res.status(404).render('404', { err: 'Cadet not found' });
        }
    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'cadet_viewprofile_get error' });
    }
}

const cadet_changepassword_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const cadet = await User.findOne({ username: username, role: 'cadet' });

        if (cadet) {

            res.render('cadet/changepassword', { cadet: cadet, err: undefined });
            // res.send(cadet);
        } else {
            // res.send('No cadet found.');
            res.status(404).render('404', { err: 'No cadet found.' });
        }
    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'cadet_changepassword_get error' });
    }
}

const cadet_changepassword_patch = async (req, res) => {
    try {
        const { username } = req.params; // use req.params.username to get the username
        let cadet = await User.findOne({ username: username, role: 'cadet' });
        // cadet.password = req.body.password;
        // const cpassword = req.body.cpassword;
        if (cadet) {
            if (req.body.password === req.body.cpassword && req.body.cpassword) {


                cadet.password = await bcrypt.hash(req.body.password, 12);
                User.updateOne({ username: username },
                    { $set: { password: cadet.password }, validate: true }).then((result) => {
                        console.log(result);
                        res.render('cadet/index', { cadet: cadet });
                    }).catch((err) => {
                        // console.log(err);
                        // res.send(err);
                        res.status(404).render('404', { err: "password not updating" });
                    });
            }
            else {
                // res.send("Password are not matching");
                res.status(500).render('cadet/changePassword', { cadet: cadet, err: "Password are not matching" });
            }
        }
        else {
            // res.send('No cadet found.');
            res.status(404).render('404', { err: 'No cadet found.' });
        }

    } catch (error) {
        // console.log(error);
        // res.send('An error occurred while finding the cadet.');
        res.status(404).render('404', { err: 'cadet_changepassword_patch error' });
    }
}



const cadet_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const cadet = await User.findOne({ username: username, role: 'cadet' });
        // console.log(cadet);

        res.render('cadet/index', { cadet: cadet });

    } catch (error) {
        // console.log(error);
        // res.send('An error occurred while finding the cadet.');
        res.status(404).render('404', { err: 'cadet_get error' });
    }
}

const cadet_edit_get = async (req, res) => {
    try {
        const { username } = req.params;
        const cadet = await User.findOne({ username: username, role: 'cadet' });
        res.render('cadet/edit', { cadet: cadet, err: undefined });
        // res.send(cadet);

    } catch (error) {
        // res.send("Unable to find cadet");
        res.status(404).render('404', { err: 'Cadet not exists' });
    }
}

const cadet_edit_patch = async (req, res) => {
    try {
        const { username } = req.params; // use req.params.username to get the username
        const cadet = await User.findOne({ username: username, role: 'cadet' });

        if (cadet) {
            // cadet.password = req.body.password;
            cadet.fullname = req.body.fullname;
            cadet.date = req.body.date;
            cadet.phone = req.body.phone;
            cadet.gender = req.body.gender;
            User.updateOne({ username: username, role: 'cadet' },
                { $set: { fullname: req.body.fullname, date: req.body.date, phone: req.body.phone, gender: req.body.gender }, validate: true })
                .then((result) => {
                    res.render('cadet/index', { cadet: cadet, err: undefined });
                })
                .catch((err) => {
                    // console.log(err);
                    // res.send('cannot update');
                    res.status(404).render('404', { err: 'cadet info not updated' });
                }
                );
        }
        else {
            // res.send("No cadet found");
            res.status(404).render('404', { err: 'Cadet not exists' });
        }


    } catch (error) {
        // console.log(error);
        // res.send('An error occurred while finding the cadet.');
        res.status(404).render('404', { err: 'cadet_edit_patch error' });
    }
}

const cadet_viewinventory_get = async (req, res) => {
    try {
        const username = req.params.username;
        const cadet = await User.findOne({ username: username, role: 'cadet' });
        const inventory = await Inventory.find();

        res.render('cadet/viewinventory', { cadet: cadet, inventory: inventory });

    } catch (error) {
        // console.log(error);
        // res.send('An error occurred while finding the cadet.');
        res.status(404).render('404', { err: 'cadet_viewinventory_get error' });
    }
}








// about and faq

const customer_about_get = async (req, res) => {
    try {
        const username = req.params.username;
        const customer = await User.findOne({ username: username, role: 'customer' });
        if (customer) {
            res.render('customer/about', { customer: customer });
        }
        else {
            // res.send('An error occurred while finding the customer.');
            res.status(404).render('404', { err: 'customer_about_get error' });
        }
    } catch (error) {
        // console.log(error);
        // res.send('An error occurred while finding the customer.');
        res.status(404).render('404', { err: 'An error occurred while finding the customer.' });
    }
}


const customer_faq_get = async (req, res) => {
    try {
        const username = req.params.username;
        const customer = await User.findOne({ username: username, role: 'customer' });
        if (customer) {
            res.render('customer/faq', { customer: customer });
        }
        else {
            // res.send("Customer not found");
            res.status(404).render('404', { err: 'Customer not found' });
        }
    } catch (error) {
        // console.log(error);
        // res.send("Customer not found");
        res.status(404).render('404', { err: 'customer_faq_get error' });
    }
}

const manager_about_get = async (req, res) => {
    try {
        const username = req.params.username;
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {
            res.render('manager/about', { manager: manager });
        }
        else {
            // res.send('An error occurred while finding the manager.');
            res.status(404).render('404', { err: 'An error occurred while finding the manager.' });
        }
    } catch (error) {
        // console.log(error);
        // res.send('An error occurred while finding the manager.');
        res.status(404).render('404', { err: 'manager_about_get error' });
    }
}


const manager_faq_get = async (req, res) => {
    try {
        const username = req.params.username;
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {
            res.render('manager/faq', { manager: manager });
        }
        else {
            // res.send("Manager not found");
            res.status(404).render('404', { err: 'Manager not found' });
        }
    } catch (error) {
        // console.log(error);
        // res.send("Manager not found");
        res.status(404).render('404', { err: 'manager_faq_get error' });
    }
}

const cadet_about_get = async (req, res) => {
    try {
        const username = req.params.username;
        const cadet = await User.findOne({ username: username, role: 'cadet' });
        if (cadet) {
            res.render('cadet/about', { cadet: cadet });
        }
        else {
            // res.send('An error occurred while finding the cadet.');
            res.status(404).render('404', { err: 'An error occurred while finding the cadet.' });
        }
    } catch (error) {
        // console.log(error);
        // res.send('An error occurred while finding the cadet.');
        res.status(404).render('404', { err: 'cadet_about_get error' });
    }
}


const cadet_faq_get = async (req, res) => {
    try {
        const username = req.params.username;
        const cadet = await User.findOne({ username: username, role: 'cadet' });
        if (cadet) {
            res.render('cadet/faq', { cadet: cadet });
        }
        else {
            // res.send("Cadet not found");
            res.status(404).render('404', { err: 'Cadet not found' });
        }
    } catch (error) {
        // console.log(error);
        // res.send("Cadet not found");
        res.status(404).render('404', { err: 'cadet_faq_get error' });
    }
}

const add_user_get = (req, res) => {
    const user = new User({
        fullname: 'Gaurang',
        username: 'gaurang',
        email: 'gaurangsheth@bjfjfjfb',
        password: 'fjbwejfefefj',
        phone: '9327913232',
        role: 'cadet',
        gender: 'female',
        date: '2020-12-12',
    });
    user.save()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        }
        );

};




const logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.render('home');
}
module.exports = {
    login_get,
    login_post,

    resetpassword_get,
    resetpassword_patch,

    forgotpassword_get,
    forgotpassword_post,

    signup_get,
    signup_post,
    customer_get,
    add_user_get,
    customer_view_get,
    customer_changepassword_get,
    customer_edit_get,
    customer_changepassword_patch,
    customer_edit_patch,
    customer_feedback_get,
    customer_feedback_post,
    customer_paymenthistory_get,
    customer_about_get,
    customer_faq_get,

    manager_get,
    manager_edit_get,
    manager_edit_patch,
    manager_view_get,
    manager_changepassword_get,
    manager_changepassword_patch,
    manager_managercheck_get,
    manager_managercheck_post, // POST

    manager_inventoryupgrade_get,
    manager_inventoryupgrade_patch,
    manager_inventorydegrade_get,
    manager_inventorydegrade_patch,
    manager_viewfeedback_get,
    manager_viewinventory_get,
    manager_addpayment_get,
    manager_addpayment_post, // POST

    manager_deleteuser_get,
    manager_deleteuser_delete,
    manager_paymenthistorygraph_get,
    manager_paymenthistorygraph_post, // POST
    manager_deleteuser_get,
    manager_deleteuser_delete,
    manager_paymenthistorygraph_get,
    manager_paymenthistorygraph_post,
    manager_about_get,
    manager_faq_get,


    cadet_viewprofile_get,
    cadet_changepassword_get,
    cadet_changepassword_patch,
    cadet_get,
    cadet_edit_get,
    cadet_edit_patch,
    cadet_viewinventory_get,
    cadet_about_get,
    cadet_faq_get,


    verifyMail,
    sendVerifyMail,
    logout_get


};