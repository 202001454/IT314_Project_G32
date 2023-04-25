require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const User = require('./models/user');
const { json } = require('express');
const methodoverride = require('method-override');
const { v4: uuid } = require('uuid');
const path = require('path');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('Connected to DB'))
    .catch((err) => console.log(err));


const app = express();
const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, 'public');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));
app.use(morgan('dev'));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.listen(port);


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
// app.get('/add-user', (req, res) => {


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