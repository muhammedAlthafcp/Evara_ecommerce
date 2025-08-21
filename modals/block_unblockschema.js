// models/User.js
const mongoose = require('mongoose');

const block_unblockschema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    blocked: { type: Boolean, default: false },
    // Add other fields as necessary
});

const blockUser = mongoose.model('blockUser', block_unblockschema);


module.exports = blockUser;
