var bcryptjs = require('bcryptjs')
var userModel = require('../models/user')
const passport = require('passport')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const {promisify} = require('util')
const jsonwebtoken = require('jsonwebtoken')
const Str = require('@supercharge/strings')

// -- SET UP PASSPORT -- 

//get public and public keys 
const pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const pathToPrivKey = path.join(__dirname, '..', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');

function issueJWT(user) {
    const _id = user._id;
  
    // token expires in 30 days 
    const expiresIn = '30d';
  
  
    const payload = {
      sub: _id,
      iat: Date.now()
    };
    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });
    return {
      token: "Bearer " + signedToken,
      expires: expiresIn
    }
}
// -- END PASSPORT SET UP --

//go to register page function
exports.getRegister = function(req, res, next){
    return res.render('register', {title: 'Register'})
}

exports.postRegister = function(req, res, next){
    let {email, firstName, lastName, password, phoneNumber, xboxId, playstationId} = req.body
    console.log('password: ',password)
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
                                                user: user,
                                                message: "Registration Successful"
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
    console.log(req.body)
    email = req.body.email 
    password = req.body.password
    userModel.findOne({ email: email })
    .then(user => {
        if(!user) {
            console.log("We cannot find that particular user")
            res.status(404).json({
              success: false,
              message: "Invalid Credentials"
            });
        } else {
            console.log("There's a user, we just comparing the passwords now")
            console.log('password', user)
            bcryptjs.compare(password, user.password, (err, isMatch) => {
                if(err) throw err; 
                if (isMatch) {
                  //issue JWT
                  const tokenObject = issueJWT(user);
                  res.status(200).json({
                    success: true,
                    user:user,
                    token: tokenObject.token,
                    expiresIn: tokenObject.expires,
                    message: "Successful Login"
                  });
                } else {
                    console.log("Actually no match")
                    res.status(404)
                      .json({
                          success: false,
                          message: 'Invalid Credentials'
                      })
                }
            })
        }
    })
    .catch(err => {
        console.log('error: ', err)
        res.status(404)
           .json({
               success: false,
               message: 'Invalid Credentials'
           })
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