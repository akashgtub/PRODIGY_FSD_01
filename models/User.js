const mongoose = require("mongoose");

// Define structure of user
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

// Export model
module.exports = mongoose.model("User", userSchema);