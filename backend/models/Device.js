const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deviceId: { type: String, unique: true },
  deviceName: String,
  customFields: {
    type: Object,
    default: {}
  },
  images: [
    {
      type: String,
      default: ""
    }
  ],
  
  isActive: { type: Boolean, default: true },
  activityLogs: [
    {
      startTime: Date,
      endTime: Date
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Device", deviceSchema);
