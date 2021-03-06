const router = require('express').Router()
const DataHash = require('../models/datahash.js')
const EC = require('elliptic').ec
const MD5 = require('md5')
const {verifyRecaptcha} = require('../folder/data.js')

router.get('/hash/:hash', (req, res) => {
    DataHash.findOne({hash: req.params.hash.toLowerCase()}, (error, data) => {
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
    DataHash.findOne({_id: req.params.id}, (error, data) => {
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

router.post('/submit',
(req, res, next) => {
    if(!req.body.text || typeof(req.body.text) !== 'string' || req.body.text.length > 300){
        return res.status(400).json('error')
    } else {
        next()
    }
},
verifyRecaptcha,
(req, res) => {
    DataHash.findOne({hash: MD5(req.body.text)}, (foundError, found) => {
        let user = !req.body.key || typeof(req.body.key) !== 'string' ? 'anon' : new EC('secp256k1').keyFromPrivate(req.body.key).getPublic('hex')
        let tags = !req.body.tags || typeof(req.body.tags) !== 'string' || req.body.tags.length > 100 ? [] : req.body.tags.split(',')
        if(foundError){
            console.log(foundError)
            return res.status(500).json('error')
        } else if(found){
            found.popular = Date.now() - found.updated
            found.updated = Date.now()
            found.posted = found.posted + 1
            found.tags = tags
            found.save()
            return res.status(200).json(found)
        } else if(!found){
            DataHash.create({tags, updated: Date.now(), popular: Date.now(), posted: 0, comments: 0, user, text: req.body.text, hash: MD5(req.body.text), created: Date.now()}, (createdError, created) => {
                if(createdError){
                    console.log(createdError)
                    return res.status(500).json('error')
                } else if(created){
                    return res.status(200).json(created)
                } else if(!created){
                    return res.status(400).json('error')
                }
            })
        }
    })
})

router.get('/updated/:page/:limit', (req, res) => {
    // console.log('updated')
    let page = Number(req.params.page)
    let limit = Number(req.params.limit)
    if(isNaN(page) || isNaN(limit)){
        return res.status(400).json('error')
    } else {
        DataHash.paginate({}, {page, limit, sort: {updated: -1}}, (error, data) => {
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

router.get('/newest/:page/:limit', (req, res) => {
    // console.log('newest')
    let page = Number(req.params.page)
    let limit = Number(req.params.limit)
    if(isNaN(page) || isNaN(limit)){
        return res.status(400).json('error')
    } else {
        DataHash.paginate({}, {page, limit, sort: {created: -1}}, (error, data) => {
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

router.get('/popular/:page/:limit', (req, res) => {
    // console.log('popular')
    let page = Number(req.params.page)
    let limit = Number(req.params.limit)
    if(isNaN(page) || isNaN(limit)){
        return res.status(400).json('error')
    } else {
        DataHash.paginate({}, {page, limit, sort: {popular: 1}}, (error, data) => {
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

// router.get('/popular/:page/:limit', (req, res) => {
//     DataHash.paginate({}, {page, limit}, (error, data) => {})
// })

// router.get('/updated/:page/:limit', (req, res) => {
//     DataHash.paginate({}, {page, limit}, (error, data) => {})
// })

module.exports = router