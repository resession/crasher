const router = require('express').Router()
const User = require('../models/user.js')
const Message = require('../models/message.js')
const EC = require('elliptic').ec
const MD5 = require('md5')

router.get('/new', (req, res) => {
    let account = new EC('secp256k1').genKeyPair()
    User.create({address: account.getPublic('hex'), followers: [], following: []}, (error, userData) => {
        if(error){
            console.log(error)
            return res.status(400).json('error')
        } else if(userData){
            return res.status(200).json({key: account.getPrivate('hex'), message: 'SAVE THE KEY, IF YOU LOSE THE KEY, YOU CAN NOT LOG BACK IN', user: userData})
        }
    })
    // if(!req.body.key || typeof(req.body.key) !== 'string'){
    //     return res.status(400).json('error')
    // } else {
    //     let address = new EC('secp256k1').keyFromPrivate(req.body.key).getPublic('hex')
    //     let name = MD5(address)
    //     User.create({name, address, followers: [], following: []}, (error, userData) => {
    //         if(error){
    //             console.log(error)
    //             return res.status(400).json('error')
    //         } else if(userData){
    //             return res.status(200).json(userData)
    //         }
    //     })
    // }
    // let address = null
    // let name = null
    // try {
    //     address = new EC('secp256k1').keyFromPrivate(req.body.key).getPublic('hex')
    //     name = MD5(address)
    // } catch (error) {
    //     console.log(error)
    //     return res.status(400).json('error')
    // }
    // try {
    //     let account = new EC('secp256k1').keyFromPrivate(req.body.key).getPublic('hex')
    //     await User.create({name: MD5(account.getPublic('hex')), address: account.getPublic('hex'), followers: [], following: []})
    // } catch (error) {
    //     console.log(error)
    //     return res.status(400).json('error')
    // }
    // try {
    //     let account = new EC('secp256k1').genKeyPair()
    //     // let user = new User({name: MD5(account.getPublic('hex')), address: account.getPublic('hex'), followers: [], following: []}).save()
    //     new User({name: MD5(account.getPublic('hex')), address: account.getPublic('hex'), followers: [], following: []}).save()
    // } catch (error) {   
    // }
    // let account = new EC('secp256k1').genKeyPair()
})

router.get('/address/:address', (req, res) => {
    User.findOne({address: req.params.address}, (error, account) => {
        if(error){
            return res.status(500).json('error')
        } else if(account){
            return res.status(200).json(account)
        } else if(!account){
            return res.status(400).json('error')
        }
    })
})

router.get('/id/:id', (req, res) => {
    User.findOne({_id: req.params.id}, (error, account) => {
        if(error){
            return res.status(500).json('error')
        } else if(account){
            return res.status(200).json(account)
        } else if(!account){
            return res.status(400).json('error')
        }
    })
})

// router.get('/message/id/:id', (req, res) => {})

// router.get('/message/address/:address', (req, res) => {})

router.get('/following/:address/:page/:limit', (req, res) => {
    let page = Number(req.params.page)
    let limit = Number(req.params.limit)
    if(isNaN(page) || isNaN(limit)){
        return res.status(400).json('error')
    } else {
        User.findOne({address: new EC('secp256k1').keyFromPrivate(req.body.key).getPublic('hex')}, (userError, userData) => {
            if(userError){
                return res.status(500).json('error')
            } else if(!userData){
                return res.status(400).json('error')
            } else if(userData){
                Message.paginate({address: {$in: userData.following}}, {page, limit}, (messageError, messageData) => {
                    if(messageError){
                        return res.status(500).json('error')
                    } else if(!messageData){
                        return res.status(400).json('error')
                    } else if(messageData){
                        return res.status(200).json(messageData)
                    }
                })
            }
        })
    }
})

router.get('/followers/:address/:page/:limit', (req, res) => {
    let page = Number(req.params.page)
    let limit = Number(req.params.limit)
    if(isNaN(page) || isNaN(limit)){
        return res.status(400).json('error')
    } else {
        User.findOne({address: new EC('secp256k1').keyFromPrivate(req.body.key).getPublic('hex')}, (userError, userData) => {
            if(userError){
                return res.status(500).json('error')
            } else if(!userData){
                return res.status(400).json('error')
            } else if(userData){
                Message.paginate({address: {$in: userData.followers}}, {page, limit}, (messageError, messageData) => {
                    if(messageError){
                        return res.status(500).json('error')
                    } else if(!messageData){
                        return res.status(400).json('error')
                    } else if(messageData){
                        return res.status(200).json(messageData)
                    }
                })
            }
        })
    }
})

router.post('/follow', (req, res) => {
    if(!req.body.key || !req.body.follow || typeof(req.body.follow) !== 'string' || typeof(req.body.key) !== 'string'){
        return res.status(400).json('error')
    } else {
        User.findOne({address: new EC('secp256k1').keyFromPrivate(req.body.key).getPublic('hex')}, (errorAccount, account) => {
            User.findOne({address: req.body.follow}, (errorFollow, follow) => {
                if(account && follow){
                    account.following.push(follow.address)
                    follow.followers.push(account.address)
                    return res.status(200).json('sucess')
                } else if(!account || !follow){
                    return res.status(400).json('error')
                } else if(errorAccount || errorFollow){
                    return res.status(500).json('error')
                } else {
                    return res.status(400).json('error')
                }
            })
        })
    }
})

router.post('/unfollow', (req, res) => {
    // if(!req.body.key || !req.body.unfollow || typeof(req.body.unfollow) !== 'string' || typeof(req.body.key) !== 'string'){
    if(!req.body.key || !req.body.unfollow || typeof(req.body.unfollow) !== 'string' || typeof(req.body.key) !== 'string'){
        return res.status(400).json('error')
    } else {
        User.findOne({address: new EC('secp256k1').keyFromPrivate(req.body.key).getPublic('hex')}, (errorAccount, account) => {
            User.findOne({address: req.body.follow}, (errorFollow, unfollow) => {
                if(account && unfollow && account.following.includes(unfollow.address) && unfollow.followers.includes(account.address)){
                    account.following.splice(account.following.indexOf(unfollow.address), 1)
                    unfollow.followers.splice(unfollow.followers.indexOf(account.address), 1)
                    // account.following.push(req.body.follow)
                    // follow.followers.push(account.address)
                    return res.status(200).json('success')
                } else if(!account || !unfollow){
                    return res.status(400).json('error')
                } else if(errorAccount || errorFollow){
                    return res.status(500).json('error')
                } else {
                    return res.status(400).json('error')
                }
            })
        })
    }
})

module.exports = router