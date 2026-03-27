  const mongoose = require("mongoose");
  const Counter = require("./counter");

  const userSchema = new mongoose.Schema({
    user_id: {
      type: Number,
      unique: true
    },
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
    phone: {
      type: String,
      required: true,
      unique: true
    },
    country:{
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true
    },
    state:{
      type:String
    },
    city:{
      type: String
    },
    lat:{
      type: Number
    },
    lng:{
      type: Number 
    },
    profileImage: {
      type: String,
      default: ""
    },
    role:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  /* 🔥 AUTO INCREMENT LOGIC */
  userSchema.pre("save", async function (next) {
    if (this.user_id) return next();

    const counter = await Counter.findByIdAndUpdate(
      { _id: "user_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.user_id = counter.seq;
    next();
  });

  module.exports = mongoose.model("User", userSchema);
