const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    cleanliness: {
        type: Number,
        required: true
    },
    service: {
        type: Number,
        required: true
    },
    food: {
        type: Number,
        required: true
    },
    comment: {
        type: String,

    },
    date: {
        type: Date,
        required: true
    },
    username: {
        type: String,
        required: true
    }
});

   
const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
