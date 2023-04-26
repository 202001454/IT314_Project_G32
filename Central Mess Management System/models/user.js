const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');


const userSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: [true, 'please enter a username'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'please enter a password'],
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
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

userSchema.pre('save', async function (next) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.statics.login = async function (username, password , role) {
    const user = await this.findOne({ username , role});
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if(auth){
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect username');
}



const User = mongoose.model('User', userSchema);
module.exports = User;
