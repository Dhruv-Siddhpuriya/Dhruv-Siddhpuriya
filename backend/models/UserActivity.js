const mongoose = require("mongoose");

const UserActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true }, // display name
  action: { type: String, required: true },   // what user did
  target: { type: String },                   // device name, field updated, etc.
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserActivity", UserActivitySchema);