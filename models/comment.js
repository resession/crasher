const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const CommentSchema = new mongoose.Schema({
    message: String,
    text: String,
    user: String,
    created: Number
})
CommentSchema.plugin(mongoosePaginate)
const Comment = mongoose.model('Comment', CommentSchema)

module.exports = Comment