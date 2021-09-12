var bcryptjs = require('bcryptjs')
var userModel = require('../models/user')

exports.getRegister = function(req, res, next){
    return res.render('register', {title: 'Register'})
}

exports.postRegister = function(req, res, next){
    let {email, firstName, lastName, password, phoneNumber, xboxId, playstationId} = req.body

    userModel.findOne({ email })
        .then(user => {
            // if user is not found, create a new user
            if(!user){
                const newUser = new userModel({email, password, lastName, firstName, phoneNumber, xboxId, playstationId})
                bcryptjs.genSalt(10, (err, salt) => {
                    bcryptjs.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err; 
                        newUser.password = hash 
                        newUser 
                            .save()
                            .then(user => {
                                return res.status(200)
                                          .json({
                                                success: true, 
                                                // user: user
                                            })
                            })
                            .catch( err => {
                                console.log('err: ',err)
                                return res.status(404)
                                          .json({success: false, message: "Error with registration"})
                            })
                    })
                })
            }else{
                //if user is found, inform front end of that
                return res.status(404)
                .json({success: false, message: 'User registered with this email already exists'})
            }            
        })
}

exports.getLogin = function(req, res, next){
    return res.render('login', {title: 'Login'})
}

exports.postLogin = function(req, res, next){
    return res.status(200)
              .json({
                  success: true,
                  message: 'Successful login'
              })
}

exports.getForgotPassword = function(req, res, next){
    return res.render('forgotPassword', {title: 'Forgot Password'})
}

exports.postForgotPassword = function(req, res, next){
    return res.status(200)
              .json({
                  success: true, 
                  message: 'Successfully Sent Reset Password Email'
              })
}

exports.getResetPassword = function(req, res, next){
    return res.render('resetPassword', {title: "Reset Password", token: 'asdfasdfa'})
}

exports.postResetPassword = function(req, res, next){
    return res.status(200)
              .json({
                  success: true, 
                  message: "Successfully reset password"
              })
}