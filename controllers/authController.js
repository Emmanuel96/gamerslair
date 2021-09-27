var bcryptjs = require('bcryptjs')
var userModel = require('../models/user')
const passport = require('passport')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const nodemailerSendgrid = require('nodemailer-sendgrid')
const {promisify} = require('util')
const jsonwebtoken = require('jsonwebtoken')
const Str = require('@supercharge/strings')
// -- MAILING TRANSPORT SET UP 

const transport = nodemailer.createTransport(nodemailerSendgrid({
    apiKey: process.env.SENDGRID_API_KEY,
  }));
    
// -- MAILING TRANSPORT SET UP END


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

exports.getResetPassword = function(req, res, next){
    // Find if the users token is still valid
    // if it's still valid, then reset the users password
    var token = req.params.token
    const user = {'resetPasswordToken':token}
    userModel.findOne(user)
    .then(user =>{
        if(!user) {
            res.status(400).json({
                                    'success': false,
                                    "message": 'token is either invalid or has expired'
                                })
            res.redirect('/forgot-password');
        } else {
            // it exists but does the time match our current time? 
            if(user.resetPasswordExpires > Date.now()){
              res.render('password-reset', {title: 'Password-Reset',token })
              // res.redirect('/password-reset/'+req.params.token)
            }else{
              res.status(400).json({'success': false, "message": 'Token is expired bruv'})
            }
        }
    })
    .catch(err => {
        return res.send("Be like say error dey here, token probably no even exist")
    })

    return res.render('resetPassword', {title: "Reset Password", token})
}

exports.postForgotPassword = async function(req, res, next){
    // create token 
    const token = (await promisify(crypto.randomBytes)(20)).toString('hex');
    // create user variable
    const email = req.body.email
    // use schema findone method
    userModel.findOne({email: email})
      .then(user =>{
          if(!user) {
              console.log('user', user)
              return res.status(404)
                        .json({ 
                                success: false,
                                message:"No user with this email exists"
                              })
          } else {
              // return res.send("Ok this particular guy exist")
              // set password token and expiring time then save new user
              user.resetPasswordToken = token;
              user.resetPasswordExpires = Date.now() + 3600000;
              user.save()
              // set up reset email
              const resetEmail = {
                to: user.email,
                from: `${process.env.EMAIL}`,
                subject: 'Spin-to-win Password Reset',
                html: `
                          <!doctype html>
                          <html lang="en-US">
  
                          <head>
                              <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                              <title>Reset Password</title>
                              <meta name="description" content="Reset Password Email Template.">
                              <style type="text/css">
                                  a:hover {text-decoration: underline !important;}
                              </style>
                          </head>
  
                          <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                              <!--100% body table-->
                              <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                                  style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                                  <tr>
                                      <td>
                                          <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                              align="center" cellpadding="0" cellspacing="0">
                                              <tr>
                                                  <td style="height:80px;">&nbsp;</td>
                                              </tr>
                        
                                              <tr>
                                                  <td style="height:20px;">&nbsp;</td>
                                              </tr>
                                              <tr>
                                                  <td>
                                                      <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                                          style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                                          <tr>
                                                              <td style="height:40px;">&nbsp;</td>
                                                          </tr>
                                                          <tr>
                                                              <td style="padding:0 35px;">
                                                  
                                                              <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                                                      requested to reset your password</h1>
                                                                  <span
                                                                      style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                                  <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                                      We cannot simply send you your old password. A unique link to reset your
                                                                      password has been generated for you. To reset your password, click the
                                                                      following link and follow the instructions.
                                                                  </p>
                                                                  <a href="http://localhost:3000/reset-password/${token}"
                                                                      style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                                                      Password</a>
                                                              </td>
                                                          </tr>
                                                          <tr>
                                                              <td style="height:40px;">&nbsp;</td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              <tr>
                                                  <td style="height:20px;">&nbsp;</td>
                                              </tr>
                                              <tr>
                                                  <td style="height:80px;">&nbsp;</td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                              <!--/100% body table-->
                          </body>
  
                          </html>
                `,
              };
              transport.sendMail(resetEmail);
              // req.flash('info', `An e-mail has been sent to ${user.email} with further instructions.`);
              res.status(200)
                  .json({   
                            success: true,
                            message:'Password reset email has been sent'
                        })
          }
      })
      .catch(err => {
          console.log('err: ', err)
          return res.status(404)
                    .json({
                            success: false,
                            message:"No user registered with this email"
                        })
    })
  }

exports.postResetPassword = function(req, res, next){
    const my_user = {'resetPasswordToken': req.body.token}
    console.log('token: ', req.body.token )
    userModel.findOne(my_user)
      .then(user=>{
        if(!user) {
            return res.status(404)
               .json({
                 success: false, 
                 message: 'Something went wrong, try again.'
               })
        }else{
           bcryptjs.genSalt(10, (err, salt ) => {
            bcryptjs.hash(req.body.password, salt, (err, hash) => {
                if (err) throw err; 
                // save the password now my Guy, we are done with this,
                // at least the back end functionality
                user.password = hash 
                console.log('hash', hash)
                // man just save it and ask them bruv to login themselves
                user.save()
                // res.render(path.resolve('pages', 'login-v2'))
                return res.status(200)
                   .json({
                     success: true, 
                     message: "Password Successfully Reset"
                   })
            }); 
          }); 
         
        }
  })
}