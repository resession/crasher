const router = require('express').Router()
const Comment = require('../models/comment.js')
const EC = require('elliptic').ec
const MD5 = require('md5')

router.get('/id/:id', (req, res) => {
    Comment.findOne({_id: req.params.id}, (error, data) => {
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
    if(!req.body.key || !req.body.text || !req.body.message || typeof(req.body.message) !== 'string' || typeof(req.body.text) !== 'string' || typeof(req.body.key) !== 'string'){
        return res.status(400).json('error')
    } else {
        Comment.create({user: new EC('secp256k1').keyFromPrivate(req.body.key).getPublic('hex'), message: req.body.message, text: req.body.text, created: Date.now()}, (error, data) => {
            if(error){
                console.log(error)
                return res.status(500).json('error')
            } else if(data){
                return res.status(200).json(data)
            }
        })
    }
})

router.get('/message/:message', (req, res) => {
    if(!req.body.message || typeof(req.body.message) !== 'string'){
        Comment.find({message: req.body.message}, (error, data) => {
            if(error){
                console.log(error)
                return res.status(500).json('error')
            } else if(data){
                return res.status(200).json(data)
            } else if(!data){
                return res.status(400).json('error')
            }
        })
    }
})

// router.get('/message/:message', (req, res) => {
//     if(!req.body.message || typeof(req.body.message) !== 'string'){
//         Comment.paginate({message: req.body.message}, {page: Number()}, (error, data) => {
//             if(error){
//                 console.log(error)
//                 return res.status(500).json('error')
//             } else if(data){
//                 return res.status(200).json(data)
//             }
//         })
//     }
// })

module.exports = router