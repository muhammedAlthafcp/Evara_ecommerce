const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const databaseUrl = process.env.DATABASE_URL || 'your-default-connection-string-here';

// Connect to MongoDB
mongoose.connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})


    .then(() => {
        console.log("Connection to MongoDB was successful");
    })
    .catch((error) => {
        console.error("Error in MongoDB connection", error);
        process.exit(1); // Exit the process with failure code
    });

    
module.exports = mongoose;
