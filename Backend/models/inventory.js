const mongoose = require('mongoose'); // Importing the Mongoose library.

const Schema = mongoose.Schema; // Creating an instance of the Mongoose Schema class.

const inventorySchema = new Schema({ // Defining the schema for the collection named "Inventory".
    item: { // "item" field with type "String" and "required" flag set to true.
        type: String,
        required: true
    },
    quantity: { // "quantity" field with type "Number" and "required" flag set to true.
        type: Number,
        required: true
    }
});

const Inventory = mongoose.model('Inventory', inventorySchema); // Creating a Mongoose model based on the "Inventory" schema.

module.exports = Inventory; // Exporting the "Inventory" model so that it can be used in other parts of the application.

