const mongoose = require('mongoose'); //Import mongoose
require('mongoose-currency').loadType(mongoose); // Defining a schema type for currency 
const Currency = mongoose.Types.Currency; //Using the currency middleware

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const campsiteSchema = new Schema({
    name: {
        type: String,
        required: true, //we must use the exact key when making a POST request
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    
    comments: [commentSchema] //this is a sub-document(nested schema)//The data structure is an Array
    //a one-to-many relationship --> this schema will contain many comments
}, {
    timestamps: true
});

const Campsite = mongoose.model('Campsite', campsiteSchema);

module.exports = Campsite;