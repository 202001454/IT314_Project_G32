const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({

    username: {
        type: String,
        required: true
    },

    startdate: {
        type: Date,
        required: true
    },

    enddate: {
        type: Date,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        default: 'customer',
        enum: ['customer']
    }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
