const User = require('../models/user');
const Feedback = require('../models/feedback');
const Payment = require('../models/payment');
const Paymenthistory = require('../models/paymenthistory');
const nodedmailer = require("nodemailer");


const sendVerifyMail = async (name, email, user_id) => {
    try {

        const transporter = nodedmailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'centralmess777@gmail.com',
                pass: 'ymnrfortalkgakyi'
            }
        });
        const mailOption = {
            from: 'centralmess777@gmail.com',
            to: email,
            subject: 'For verification mail',
            html: '<p>Hii ' + name + ', please click here to <a href = "localhost:3000/verify?id=' + user_id + '"> Verify </a> your mail</p>'
        }
        transporter.sendMail(mailOption, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Email has been sent" + info);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_varified: 1 } });
        console.log(updateInfo);
        res.render('emailverified');
    } catch (error) {
        console.log(error.message);
    }
}



const login_get = (req, res) => {

    res.render('login', { title: 'Login' });
}
const login_post = async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const role = req.body.role;


        if (role === 'customer') {
            // console.log(req.body);
            const customer = await User.findOne({ username, role });
            // const isMatch = await bcrypt.compare(password, user.password);
            if (customer && customer.password === password && customer.role === role) {

                // req.session.user_id = user._id;
                res.status(201).render(`${role}/index`, { customer });
            } else {
                res.status(500).send('Invalid Login Details');
            }
        }
        else if (role === 'manager') {
            const manager = await User.findOne({ username: username, role: role });

            if (manager && manager.password === password && manager.role === role) {
                res.status(201).render(`${role}/index`, { manager });
            }
            else {
                console.log(username);
                res.status(400).send('Invalid manager');
            }
        }
        else if (role === 'cadet') {
            const cadet = await User.findOne({ username, role });

            if (cadet && cadet.password === password && cadet.role === req.body.role) {
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
// app.post('/login', async (req, res) => {
//     const { username, password, role } = req.body;
//     res.send({ username, password, role });

//     // verify username password and role in the User database
//     // redirect to the .ejs page according to role

// });

const signup_get = (req, res) => {
    const err = undefined;
    res.render('Signup', { err });
}


const signup_post = async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        //validate password
        // const validpassword = await validatepassword(password);
        // if (!validpassword) {
        //     res.render('signup', { err: "Password must be between 6 to 16 characters and must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character" });
        // }

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
                // res.send("Username already exists");
                res.render('signup', { err: "Username already exists" });
            }
            const foundEmail = await User.findOne({ email: user.email });
            console.log(foundEmail);

            if (foundEmail) {
                // res.send("Email already exists");
                res.render('signup', { err: "Email already exists" });
            }

            //if not exists then save the user in the database
            const registered = user.save().then((result) => {
                // sendVerifyMail(req.body.fullname,req.body.email,result._id);
                res.send(result);
            }).catch((err) => {
                console.log(err);
            }
            );
            res.status(201).render('login');
        } else {
            res.send("Password are not matching");
        }

    } catch (error) {
        res.status(400);
        res.send(error);
    }
}

const customer_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const customer = await User.findOne({ username: username });
        console.log(customer);
        res.render('customer/index', { customer: customer });
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the customer.');
    }
}


const customer_view_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const customer = await User.findOne({ username: username, role: 'customer' });
        if (customer) {
            // res.render('customer/view', { customer: customer });

            res.send(customer);
        } else {
            res.send('No customer found.');
        }


    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the customer.');
    }
}


const customer_changepassword_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const customer = await User.findOne({ username: username, role: 'customer' });


        if (customer) {



            // res.render('customer/changepassword', { customer: customer });
            res.send(customer);
        } else {
            res.send('No customer found.');
        }
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the customer.');
    }
}

const customer_changepassword_patch = async (req, res) => {
    try {
        const { username } = req.params; // use req.params.username to get the username
        const customer = await User.findOne({ username: username, role: 'customer' });

        customer.password = req.body.password;
        const cpassword = req.body.cpassword;


        if (customer.password === cpassword && cpassword) {
            User.updateOne({ username: username },
                { $set: { password: req.body.password }, validate: true }).then((result) => {
                    console.log(result);
                    res.render('customer/index', { customer: customer });
                }).catch((err) => {
                    console.log(err);
                    res.send(err);
                }
                );
        }
        else {
            res.send("Password are not matching");
        }

    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the customer.');
    }
}

const customer_edit_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const customer = await User.findOne({ username: username, role: 'customer' });
        if (customer) {

            // res.render('customer/edit', { customer: customer });
            res.send(customer);
        } else {
            res.send('No customer found.');
        }

    } catch (error) {


        console.log(error);
        res.send('An error occurred while finding the customer.');
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
            { $set: { password: req.body.password, fullname: req.body.fullname, date: req.body.date, email: req.body.email, phone: req.body.phone, gender: req.body.gender }, validate: true }).then((result) => {
                console.log(result);
                res.render('customer/index', { customer: customer });
            }).catch((err) => {
                console.log(err);
                res.send(err);
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
        console.log(error);
        res.send('An error occurred while finding the customer.');
    }
};


const customer_feedback_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const customer = await User.findOne({ username: username, role: 'customer' });
        if (customer) {
            // res.render('customer/feedback', { customer: customer });
            res.send(customer);
        } else {
            res.send('No customer found.');
        }

    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the customer.');
    }
}


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
            date: req.body.date

        });
        const fb = await feedback.save();
        res.render('customer/index', { customer: customer });
        // }
        // else {
        //     res.send('No customer found.');
        // }

    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the customer.');
    }
}

const customer_paymenthistory_get = async (req, res) => {
    try {

        const username = req.params.username; // use req.params.username to get the username
        const customer = await User.findOne({ username: username, role: 'customer' });
        if (customer) {
            const found = await Paymenthistory.findMany({ username: username, role: 'customer' }).sort({ startdate: -1 });
            // res.render('customer/paymenthistory', { customer: customer  , found: found});
            res.send(found);
        } else {
            res.send('No customer found.');
        }

    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the customer.');
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





module.exports = {
    login_get,
    login_post,
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
    customer_paymenthistory_get


};