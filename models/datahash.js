const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const DataHashSchema = new mongoose.Schema({
    text: String,
    hash: String,
    user: String,
    popular: Number,
    updated: Number,
    created: Number,
    posted: Number,
    comments: Number,
    tags: Array
})
DataHashSchema.plugin(mongoosePaginate)
const DataHash = mongoose.model('DataHash', DataHashSchema)

module.exports = DataHash