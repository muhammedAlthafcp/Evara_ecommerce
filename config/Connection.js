const mongoose = require('mongoose');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL; 

mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connection to MongoDB was successful");
})
.catch((error) => {
  console.error("❌ Error in MongoDB connection:", error.message);
  process.exit(1);
});

module.exports = mongoose;
