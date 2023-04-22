const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');

const static_path = path.join(__dirname, 'public');
app.use(express.static(static_path));
app.use(express.json());
app.use(cookieParser());

const dbURI = 'mongodb+srv://gaurang:gaurang@cluster0.olbixf6.mongodb.net/Central_Mess_Management_System?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('Connected to DB'))
    .catch((err) => console.log(err));

app.use(authRoutes);

app.listen(3000, () => {
    console.log('SERVING YOUR APP!');
});
