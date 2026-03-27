const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  loginTime: {
    type: Date,
    required: true
  },
  logoutTime: {
    type: Date,
    default: null
  },

  // ✅ ADD THESE
  ipAddress: {
    type: String,
    default: null
  },
  device: {
    type: String,
    default: null
  },

  country: {
    type: String
  },
  state: {
    type: String
  }

}); 

module.exports = mongoose.model("UserSession", userSessionSchema);