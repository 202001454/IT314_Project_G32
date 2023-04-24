// Import the Mongoose library
const mongoose = require('mongoose');

// Create a new instance of a Mongoose schema object
const Schema = mongoose.Schema;

// Define a new schema for the feedback data
const feedbackSchema = new Schema({
    // Define a field for the cleanliness rating, which is a required number
    cleanliness: {
        type: Number,
        required: true
    },
    // Define a field for the service rating, which is a required number
    service: {
        type: Number,
        required: true
    },
    // Define a field for the food rating, which is a required number
    food: {
        type: Number,
        required: true
    },
    // Define a field for the comment, which is an optional string
    comment: {
        type: String,
    },
    // Define a field for the date, which is a required date object
    date: {
        type: Date,
        required: true
    },
    // Define a field for the username, which is a required string
    username: {
        type: String,
        required: true
    }
});

// Create a new Mongoose model using the feedback schema
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Export the feedback model so it can be used by other modules
module.exports = Feedback;
