const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const managercheckSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    lunch: {
        type: Boolean,
        required: true,
        default: false
    },
    dinner: {
        type: Boolean,
        required: true,
        default: false
    },
    breakfast: {
        type: Boolean,
        required: true,
        default: false
    }

});


const Managercheck = mongoose.model('Managercheck', managercheckSchema);
module.exports = Managercheck;


