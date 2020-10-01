const router = require('express').Router()
const Comment = require('../models/comment.js')
const EC = require('elliptic').ec
const MD5 = require('md5')
const DataHash = require('../models/datahash.js')
const {verifyRecaptcha} = require('../folder/data.js')

router.get('/id/:id', (req, res) => {
    Comment.findOne({_id: req.params.id}, (error, data) => {
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

// router.get('/uid/:id/:page/:limit', (req, res) => {
//     let page = Number(req.params.page)
//     let limit = Number(req.params.limit)
//     if(isNaN(page) || isNaN(limit)){
//         return res.status(400).json('error')
//     } else {
//         Comment.paginate({_id: req.params.id}, {page, limit, sort: {created: -1}}, (error, data) => {
//             if(error){
//                 console.log(error)
//                 return res.status(500).json('error')
//             } else if(data){
//                 return res.status(200).json(data)
//             } else if(!data){
//                 return res.status(400).json('error')
//             }
//         })
//     }
// })

router.get('/id/:id/:page/:limit', (req, res) => {
    let page = Number(req.params.page)
    let limit = Number(req.params.limit)
    if(isNaN(page) || isNaN(limit)){
        return res.status(400).json('error')
    } else {
        Comment.paginate({id: req.params.id}, {page, limit, sort: {created: -1}}, (error, data) => {
            if(error){
                console.log(error)
                return res.status(500).json('error')
            } else if(!data){
                return res.status(400).json('error')
            } else if(data){
                return res.status(200).json(data)
            }
        })
    }
})

router.post('/hash/text',
(req, res, next) => {
    if(!req.body.text || !req.body.id || typeof(req.body.id) !== 'string' || typeof(req.body.text) !== 'string' || req.body.text.length > 600){
        return res.status(400).json('error')
    } else {
        next()
    }
},
// verifyRecaptcha,
(req, res) => {
    DataHash.findOne({hash: req.body.id}, (hashError, hashData) => {
        if(hashError){
            console.log(hashError)
            return res.status(500).json('error')
        } else if(hashData){
            let user = !req.body.key || typeof(req.body.key) !== 'string' ? 'anon' : new EC('secp256k1').keyFromPrivate(req.body.key).getPublic('hex')
            Comment.create({user, id: req.body.id, text: req.body.text, created: Date.now()}, (commentError, commentData) => {
                if(commentError){
                    console.log(commentError)
                    return res.status(500).json('error')
                } else if(commentData){
                    hashData.comments = hashData.comments + 1
                    hashData.save()
                    return res.status(200).json(commentData)
                } else if(!commentData){
                    return res.status(400).json('error')
                }
            })
        } else if(!hashData){
            return res.status(400).json('error')
        }
    })
})

router.get('/newest/:page/:limit', (req, res) => {
    let page = Number(req.params.page)
    let limit = Number(req.params.limit)
    if(isNaN(page) || isNaN(limit)){
        return res.status(400).json('error')
    } else {
        Comment.paginate({}, {page, limit, sort: {created: -1}}, (error, data) => {
            if(error){
                console.log(error)
                return res.status(500).json('error')
            } else if(data){
                return res.status(200).json(data)
            }
        })
    }
})

module.exports = router