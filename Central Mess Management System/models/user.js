const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['manager', 'cadet', 'customer']
    },
    gender: {

        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    date: {
        type: Date,
        required: true
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
