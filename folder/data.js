const axios = require('axios').default

const secretKey = process.env.SECRETKEY
// const urlRecaptcha = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRETKEY}&response=`

function verifyRecaptcha(req, res, next){
    if(!req.body.token || req.body.token !== 'string'){
        return res.status(400).json('error')
    } else {
        axios.post('https://www.google.com/recaptcha/api/siteverify', {}, {params: {secret: secretKey, response: req.body.token}}).then(data => {
            if(!data.success || !data.score){
                return res.status(400).json('error')
            } else {
                next()
            }
        }).catch(error => {
            console.log(error)
            return res.status(400).json('error')
        })
    }
}

// function urlRecaptcha(token){
//     return `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
// }

module.exports = {verifyRecaptcha}