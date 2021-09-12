const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String
        }, 
        email: {
            type: String, 
            required: true, 
            unique: true
        }, 
        phoneNumber: {
            type: Number
        },
        profileImage: {
            type: String
        },
        gamerId: {
            type: String, 
            required: true
        },
        password: {
            type: String, 
            required: true,
        },
        resetPasswordToken: {
            type: String, 
            required: false
        },
        role: {
            type: String, 
            required: true
        },
        resetPasswordExpires: {
            type: Date
        }

    }, {strict: false, timestamps: true}
);

module.exports = mongoose.model("User", UserSchema)