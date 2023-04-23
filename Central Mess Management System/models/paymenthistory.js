const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymenthistorySchema = new Schema({

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
        required: true,
        enum: ['customer']
    }


});

const Paymenthistory = mongoose.model('Paymenthistory', paymenthistorySchema);
module.exports = Paymenthistory;