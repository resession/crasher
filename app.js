require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const userRoutes = require('./routes/user.js')
const messageRoutes = require('./routes/message.js')
const commentRoutes = require('./routes/comment.js')
const rateLimit = require("express-rate-limit")
const MongoStore = require('rate-limit-mongo')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true}, error => {
    if(error){
        console.log('not connected\n', error)
    } else {
        console.log('connected')
    }
});

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(rateLimit({windowMs: 60000, max: 120, message: 'Too many connections from this client', store: new MongoStore({uri: process.env.DB})}))
app.use(morgan('tiny'))

app.get('/', (req, res) => {
    return res.status(200).json('success')
})

app.use('/user', userRoutes)
app.use('/message', messageRoutes)
app.use('/comment', commentRoutes)

app.get('*', (req, res) => {
    return res.status(400).json('error')
})

// app.listen(process.env.PORT, process.env.HOST, () => {
//     console.log('listening')
// })

app.listen(process.env.PORT, process.env.HOST, () => {
    console.log('listening')
})