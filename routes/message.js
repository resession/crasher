const router = require('express').Router()
const Message = require('../models/message.js')
const EC = require('elliptic').ec
const MD5 = require('md5')

router.get('/hash/:hash', (req, res) => {
    Message.findOne({hash: req.params.hash}, (error, data) => {
        if(error){
            console.log(error)
            return res.status(500).json('error')
        } else if(!data){
            return res.status(400).json('error')
        } else if(data){
            return res.status(200).json(data)
        }
    })
})

router.post('/new', (req, res) => {
    if(!req.body.key || !req.body.text || typeof(req.body.text) !== 'string' || typeof(req.body.key) !== 'string'){
        return res.status(400).json('error')
    } else {
        Message.findOneAndUpdate({hash: MD5(req.body.text)}, {text: req.body.text, hash: MD5(req.body.text), created: Date.now()}, {upsert: true, new: true}, (error, data) => {
            if(error){
                console.log(error)
                return res.status(500).json('error')
            } else if(data){
                if(!data.user){
                    data.user = new EC('secp256k1').keyFromPrivate(req.body.key).getPublic('hex')
                    data.updated = Date.now()
                    data.popular = Date.now()
                    data.posted = 1
                    return res.status(200).json(data)
                } else {
                    data.updated = Date.now()
                    data.popular = Date.now() - data.popular
                    data.posted = data.posted + 1
                    return res.status(200).json(data)
                }
            } else if(!data){
                return res.status(400).json('error')
            }
        })
    }
})

module.exports = router