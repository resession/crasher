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

router.get('/id/:id', (req, res) => {
    Message.findOne({_id: req.params.id}, (error, data) => {
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

router.post('/submit', (req, res) => {
    if(!req.body.key || !req.body.text || typeof(req.body.text) !== 'string' || typeof(req.body.key) !== 'string' || req.body.text.length > 300){
        return res.status(400).json('error')
    } else {
        Message.findOne({hash: MD5(req.body.text)}, (foundError, found) => {
            if(foundError){
                return res.status(500).json('error')
            } else if(found){
                found.popular = Date.now() - found.updated
                found.updated = Date.now()
                found.posted = found.posted + 1
                found.save()
                return res.status(200).json(found)
            } else if(!found){
                Message.create({tags: [], updated: Date.now(), popular: Date.now(), posted: 0, comments: 0, user: new EC('secp256k1').keyFromPrivate(req.body.key).getPublic('hex'), text: req.body.text, hash: MD5(req.body.text), created: Date.now()}, (createdError, created) => {
                    if(createdError){
                        return res.status(500).json('error')
                    } else if(created){
                        return res.status(200).json(created)
                    } else if(!created){
                        return res.status(400).json('error')
                    }
                })
            }
        })
    }
})

router.get('/newest/:page/:limit', (req, res) => {
    let page = Number(req.params.page)
    let limit = Number(req.params.limit)
    if(isNaN(page) || isNaN(limit)){
        return res.status(400).json('error')
    } else {
        Message.paginate({}, {page, limit}, (error, data) => {
            if(error){
                return res.status(500).json('error')
            } else if(data){
                return res.status(200).json(data)
            } else if(!data){
                return res.status(400).json('error')
            }
        })
    }
})

// router.get('/popular/:page/:limit', (req, res) => {
//     Message.paginate({}, {page, limit}, (error, data) => {})
// })

// router.get('/updated/:page/:limit', (req, res) => {
//     Message.paginate({}, {page, limit}, (error, data) => {})
// })

module.exports = router