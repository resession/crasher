const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const MessageSchema = new mongoose.Schema({
    text: String,
    hash: String,
    user: {type: String, required: false},
    popular: {type: Number, required: false},
    updated: {type: Number, required: false},
    created: Number,
    posted: {type: Number, required: false}
})
MessageSchema.plugin(mongoosePaginate)
const Message = mongoose.model('Message', MessageSchema)

module.exports = Message