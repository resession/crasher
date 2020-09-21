const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const MessageSchema = new mongoose.Schema({
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
MessageSchema.plugin(mongoosePaginate)
const Message = mongoose.model('Message', MessageSchema)

module.exports = Message