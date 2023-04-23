const User = require('../models/user');
const Inventory = require('../models/inventory');
const Feedback = require('../models/feedback');
const Payment = require('../models/payment');
const Paymenthistory = require('../models/paymenthistory');
const nodedmailer = require("nodemailer");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


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
    return jwt.sign({ id }, 'deep gaurang vrund', {
        expiresIn: maxAge
    });
}


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
            const auth = await bcrypt.compare(password, customer.password);
            // const isMatch = await bcrypt.compare(password, user.password);
            if (customer && auth && customer.role === role) {

                // req.session.user_id = user._id;
                // const user = await User.login(username, password, role);
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


            if (manager && auth && manager.role === role) {
                const user = await User.login(username, password, role);
                const token = createToken(user._id);
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
                res.status(201).render(`${role}/index`, { manager });
            }
            else {
                console.log(username);
                res.status(400).send('Invalid manager');
            }
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
        // if(res.locals.user.username === username)
        // {
            res.render('customer/index', { customer: customer });
        // }
        // else
        // {
        //     res.render('login');
        // }
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
        let customer = await User.findOne({ username: username, role: 'customer' });
        
        // customer.password = req.body.password;
        // const cpassword = req.body.cpassword;

        // const auth = bcrypt.compare(req.body.oldpassword, customer.password);
        if (req.body.password === req.body.cpassword && req.body.cpassword ) {
            const validpassword = validatepassword(req.body.password);
            if (!validpassword) {
                res.render('signup', { err: "Password must be between 6 to 16 characters and must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character" });
            }
            const bcryptPass = await bcrypt.hash(req.body.password, 12);
        
            User.updateOne({ username: username },
                { $set: { password: bcryptPass }, validate: true }).then((result) => {
                    console.log("Gaurang");
                    customer.password = bcryptPass;
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

const manager_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const manager = await User.findOne({ username: username, role: 'manager' });
        console.log(manager);
        res.render('manager/index', { manager: manager });
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the manager.');
    }
}

const manager_edit_get = async (req, res) => {
    try {
        const { username } = req.params;
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {
            // res.render('manager/edit',{manager:manager});
            res.send(manager);
        }
        else {
            res.send("Error occured!");
        }
    } catch (error) {
        res.send("Unable to find Manager");
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
                console.log(err);
                res.send('cannot update');
            }
            );

    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the manager.');
    }
}


const manager_view_get = async (req, res) => {
    try {
        const { username } = req.params;
        const manager = await User.findOne({ username: username, role: 'manager' });
        if (manager) {
            // res.render('manager/view',{manager:manager});
            res.send(manager);
        }
        else {
            res.send('No Manager found.');
        }
    } catch (error) {
        res.send('An error occurred while finding the customer.');

    }

}



const manager_changepassword_get = async (req, res) => {
    try {
        const username = req.params.username; // use req.params.username to get the username
        const manager = await User.findOne({ username: username, role: 'manager' });

        if (manager) {

            // res.render('manager/changepassword', { manager: manager });
            res.send(manager);
        } else {
            res.send('No manager found.');
        }
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the manager.');
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
        res.send('An error occurred while finding the manager.');
    }
}

const manager_inventoryupgrade_get = async (req,res) => {
    try{
        const username = req.params.username;
        const manager = await User.findOne({username:username,role:'manager'});
        res.render('/manager/inventoryupgrade',{manager});

    } catch (error) {
        console.log(error);
    }
}



const manager_inventoryupgrade_patch = async (req,res) => {
    try{
        const item_ = req.body.item; //of item's
        const item = item_.toLowerCase();
        const quantity = req.body.quantity; //of item's quantity'of item's
        const username = req.params.username; //manager's
        const inventory = await Inventory.findOne({item:item});//finding inventory
        const manager = await User.findOne({username:username,role: 'manager'});
        if(inventory && manager)
        {
            //if both found
            Inventory.updateOne({item:item}, {$set : {quantity:inventory.quantity+quantity}})
            .then((result) => {
                console.log(result);
                // res.render('manager/inventoryupgrade', { manager: manager });
                res.send("Updated successfully");
            })
            .catch((error) => {
                console.log(error);
                res.send("In 1st catch");
            });
        }
        else if(manager && (!inventory))
        {
            const _inventory = new Inventory({
                item:item,
                quantity:quantity
            });
            const response = await _inventory.save();
            // res.render('manager/inventoryupgrade', { manager: manager });
            res.send("New added");
        }
        else
        {
            console.log("Error");
        }
    } catch (error) {
        console.log(error);
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
    res.redirect('/');
}
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
    customer_paymenthistory_get,
    manager_get,
    manager_edit_get,
    manager_edit_patch,
    manager_view_get,
    manager_changepassword_get,
    manager_changepassword_patch,
    logout_get,
    manager_inventoryupgrade_get,
    manager_inventoryupgrade_patch,
    manager_inventorydegrade_get,
    manager_inventorydegrade_patch
};