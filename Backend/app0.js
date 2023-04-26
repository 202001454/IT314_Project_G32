const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const User = require('./models/user');
const { json } = require('express');
const jwt = require('jsonwebtoken');
const secretKey = 'yourSecretKey'; 


const path = require('path');
const dbURI = 'mongodb+srv://gaurang:gaurang@cluster0.olbixf6.mongodb.net/Central_Mess_Management_System?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('Connected to DB'))
    .catch((err) => console.log(err));


const app = express();
const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, 'public');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use(express.static(static_path));


app.set('view engine', 'ejs');
app.listen(port);
app.use(morgan('dev'));


app.get('/add-user', (req, res) => {
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

});


app.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
}
);

app.get('/home', (req, res) => {
    res.render('home', { title: 'Home' });
}
);

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
}
);

app.post('/login', async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const role = req.body.role;
        const ok = await User.findOne({ username: username, password: password, role: role });
        console.log(ok);
        if (ok) {
            res.status(201).render('home');
            const payload = {
                User: {
                  username: ok.username,
                  password: ok.password,
                  role: ok.role
                }
            }
            const createToken = async() => {
                const token = await jwt.sign(payload,secretKey,{expiresIn: '1h'});
               console.log(token);
               const userver = jwt.verify(token,secretKey);
               console.log(userver);
            }
            createToken();

        } else {
            res.send("Invalid Login Details");
        }


    } catch (error) {
        res.status(400);
    }
});

app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup' });
}
);


app.post('/signup', async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;

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
            res.status(201).render('login');
        } else {
            res.send("Password are not matching");
        }

    } catch (error) {
        res.status(400);
        res.send(error);
    }


})


app.use((req, res) => {
    res.status(404);
    res.render('404', { title: '404' });
}
);
const manager_addpayment_post = async (req,res) => {
    try{
        const username = req.params.username;
        const manager = await User.findOne({username:username,role: 'manager'});
        if(manager)
        {
            const customerusername = req.body.username;
            const oldPayment = await Payment.findOne({username:customerusername});
            if(oldPayment)
            {
                oldPayment.startdate = req.body.startdate;
                oldPayment.enddate = req.body.enddate;
                oldPayment.amount = req.body.amount;

                const updated = await Payment.updateOne({username:customerusername},{$set : {startdate:oldPayment.startdate,enddate:oldPayment.enddate,amount:oldPayment.amount}, validate: true});
                if(updated)
                {
                    const updateHistory = new Paymenthistory({
                        username: customerusername,
                        startdate: oldPayment.startdate,
                        enddate: oldPayment.enddate,
                        amount: oldPayment.amount
                    });
                    const historysave = await updateHistory.save();
                    if(historysave)
                    {
                        res.status(201).render('manager/addpayment', { manager: manager });
                    }
                    else
                    {
                        res.send("An error occurred while updating the payment history.");
                    }
                }
                else
                {
                    res.send("An error occurred while updating the payment details.");
                }
            }
            else
            {
                const customer = User.findone({username:customerusername,role:'customer'});
                if(customer)
                {
                    const payment = new Payment({
                        username: req.body.username,
                        startdate: req.body.startdate,
                        enddate: req.body.enddate,
                        amount: req.body.amount
                    });
                    const customerpaymentadded = await payment.save();
                    if(customerpaymentadded)
                    {
                        const paymenthistory = new Paymenthistory({
                            username: customerusername,
                            startdate: req.body.startdate,
                            enddate: req.body.enddate,
                            amount: req.body.amount
                        });
                        const historysave = await paymenthistory.save();
                        if(historysave)
                        {
                            res.status(201).render('manager/addpayment', { manager: manager });
                        }
                        else
                        {
                            res.send("An error occurred while updating the payment history.");
                        }
                    }
                    else
                    {
                        res.send("An error occurred while updating the payment details.");
                    }
                    
                }
                else
                {
                    res.send("customer not found");
                }
            }
        }
    } catch(error) {
        console.log(error);
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
            res.send('An error occurred while finding the cadet.');
        }
    } catch (error) {
        console.log(error);
        res.send('An error occurred while finding the cadet.');
    }
}


const cadet_faq_get = async (req, res) => {
    try{
        const username = req.params.username;
        const cadet = await User.findOne({username:username,role: 'cadet'});
        if(cadet)
        {
            res.render('cadet/faq', { cadet: cadet });
        }
        else
        {
            res.send("Cadet not found");
        }
    } catch (error) {
        console.log(error);
    }
}

/* function for resetpassword*/

const resetpassword_get = async (req, res) => {
    try{
        const id = req.params.id;
        const user = await User.findOne({ _id: id });
        if(user)
        {
            res.render('resetpassword',{err:undefined});
        }
        else
        {
            res.status(404).render('404', { err: 'User not found' });
        }
    } catch (error) {
        // console.log(error);
        res.status(404).render('404', { err: 'resetpassword_get error' });
    }
}

const resetpassword_patch = async (req, res) =>  {
    try{
        const id = req.params.id;
        const user = await User.findOne({ _id: id });
        if(user)
        {
            const password = req.body.password;
            const cpassword = req.body.cpassword;
            if(password === cpassword)
            {
                const hashedPassword = await bcrypt.hash(password, 12);
                User.updateOne({_id :id },{$set:{password:hashedPassword}, validate: true})
                .then((result) => {
                    console.log(result);
                    res.render('login', { err: undefined });
                })
                .catch((err) => {
                    res.status(404).render('404', { err: 'cannot perform updation error' });
                });
            }
            else
            {
                res.status(500).render('resetpassword', { err: 'Password does not match' });
            }
        }
        else
        {
            res.status(500).render('login', { err: 'User not found' });
        }
    } catch(error) {
        res.status(404).render('404', { err: 'resetpassword_patch error' });
    }
}

module.exports={manager_addpayment_post,cadet_about_get,cadet_faq_get,resetpassword_get,resetpassword_patch};