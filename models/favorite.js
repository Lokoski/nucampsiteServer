const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, //references another doc
        ref: 'User' //sets how its gonna be called(don't know how to explain it better!)
    },
    campsites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campsite'
    }]
},{
    timestamps: true
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;