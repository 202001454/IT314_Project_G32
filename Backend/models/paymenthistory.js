const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the paymenthistory collection
const paymenthistorySchema = new Schema({

    // Define a field for the username of the user who made the payment
    username: {
        type: String, 
        required: true 
    },

    // Define a field for the start date of the payment period
    startdate: {
        type: Date, 
        required: true 
    },

    // Define a field for the end date of the payment period
    enddate: {
        type: Date, 
        required: true 
    },

    // Define a field for the amount of the payment
    amount: {
        type: Number,
        required: true 
    },

    // Define a field for the role of the user who made the payment
    role: {
        type: String, 
        required: true, 
        enum: ['customer'] 
    }

});

// Create a Mongoose model based on the schema, and name it Paymenthistory
const Paymenthistory = mongoose.model('Paymenthistory', paymenthistorySchema);
module.exports = Paymenthistory; // Export the model 

