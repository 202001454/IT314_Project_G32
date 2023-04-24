const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
    item: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

   
const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;
