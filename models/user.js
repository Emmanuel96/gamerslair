const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true
        }, 
        lastName: {
            type: String, 
            required: true
        },
        email: {
            type: String, 
            required: true, 
            unique: true
        }, 
        phoneNumber: {
            type: String
        },
        profileImage: {
            type: String
        },
        xboxId: {
            type: String, 
            required: true
        },
        playstationId:{
            type: String, 
            required: true
        },
        password: {
            type: String, 
            required: true,
        },
        role: {
            type: Number, 
            default: 1,
            required: true
        },
        resetPasswordToken: {
            type: String, 
            required: false
        },
        resetPasswordExpires: {
            type: Date
        }

    }, {strict: false, timestamps: true}
);

module.exports = mongoose.model("User", UserSchema)