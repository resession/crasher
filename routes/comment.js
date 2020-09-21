const router = require('express').Router()
const Comment = require('../models/comment.js')
const EC = require('elliptic').ec
const MD5 = require('md5')
const Message = require('../models/message.js')

router.get('/message/:message/:page/:limit', (req, res) => {
    Comment.paginate({message: req.body.message}, {page, limit}, (error, data) => {
        if(error){
            console.log(error)
            return res.status(500).json('error')
        } else if(data){
            return res.status(200).json(data)
        } else if(!data){
            return res.status(400).json('error')
        }
    })
})

router.get('/id/:id/:page/:limit', (req, res) => {
    Comment.paginate({_id: req.params.id}, {page, limit}, (error, data) => {
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

router.post('/text', (req, res) => {
    if(!req.body.key || !req.body.text || !req.body.message || typeof(req.body.message) !== 'string' || typeof(req.body.text) !== 'string' || typeof(req.body.key) !== 'string'){
        return res.status(400).json('error')
    } else {
        Message.findOne({hash: req.body.message}, (messageError, messageData) => {
            if(messageError){
                return res.status(500).json('error')
            } else if(messageData){
                Comment.create({user: new EC('secp256k1').keyFromPrivate(req.body.key).getPublic('hex'), message: req.body.message, text: req.body.text, created: Date.now()}, (commentError, commentData) => {
                    if(commentError){
                        console.log(commentError)
                        return res.status(500).json('error')
                    } else if(commentData){
                        messageData.comments = messageData.comments + 1
                        messageData.save()
                        return res.status(200).json(commentData)
                    } else if(!commentData){
                        return res.status(400).json('error')
                    }
                })
            } else if(!messageData){
                return res.status(400).json('error')
            }
        })
    }
})

router.get('/newest/:page/:limit', (req, res) => {
    Comment.paginate({}, {page, limit}, (error, data) => {
        if(error){
            console.log(error)
            return res.status(500).json('error')
        } else if(data){
            return res.status(200).json(data)
        }
    })
})

module.exports = router