const User = require('../models/user');
const nodedmailer = require("nodemailer");

const sendVerifyMail = async(name,email,user_id) =>{
    try{

        const transporter = nodedmailer.createTransport({
            host : 'smtp.gmail.com',
            port : 587,
            secure : false,
            requireTLS : true,
            auth : {
                user : 'centralmess777@gmail.com',
                pass : 'ymnrfortalkgakyi'
            }
        });
        const mailOption = {
            from: 'centralmess777@gmail.com',
            to:email,
            subject: 'For verification mail',
            html: '<p>Hii '+name+', please click here to <a href = "localhost:3000/verify?id='+user_id+'"> Verify </a> your mail</p>'
        }
        transporter.sendMail(mailOption,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been sent"+ info);
            }
        })
    } catch(error){
        console.log(error.message);
    }
}

const verifyMail = async(req,res) => {
    try{
        const updateInfo = await User.updateOne({_id:req.query.id},{$set: {is_varified:1}});
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
        const user = await User.findOne({ username });
        // const isMatch = await bcrypt.compare(password, user.password);
        if (user && user.password === password && user.role === req.body.role) {

            // req.session.user_id = user._id;
            res.status(201).render('home');
        } else {
            res.status(400).send('Invalid Login Details');
        }
    } catch (error) {
        res.status(400).send('Invalid Login Details');
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
        const validpassword = await validatepassword(password);
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
        res.render('customer/index', { customer: customer });
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the customer.');
    }
}

const customer_patch = async (req, res) => {
    try {
        const { username } = req.params; // use req.params.username to get the username
        const customer = await User.findOne({ username: username });

        customer.password = req.body.password;
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
    customer_patch,
    add_user_get
};