const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, "Name should be at least 3 characters long"],
        maxlength: [20, "Name should be at most 20 characters long"],
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phonenumber: {
        type: Number,
        required: true,
    },
    blocked: { type: Boolean, default: false },
    balance: {
        type: Number,
        default: 0,
    },
});

const User = mongoose.model("user", userSchema);
module.exports = User;


