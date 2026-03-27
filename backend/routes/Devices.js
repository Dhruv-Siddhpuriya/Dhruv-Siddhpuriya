  const router = require("express").Router();
  const Device = require("../models/Device");
  const crypto = require("crypto");
  const mongoose = require("mongoose");
  const checkPermission = require("../middleware/checkPermission");
  const upload = require("../utils/upload");   // path to your upload.js
  /* 🔑 Generate alphanumeric device ID */
  const generateDeviceId = () => {
    return "DEV-" + crypto.randomBytes(4).toString("hex").toUpperCase();
  };
  /**
   * @swagger
   * /devices:
   *   post:
   *     summary: Add a new device
   *     description: Create a device with images and custom fields
   *     tags: [Devices]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *               deviceName:
   *                 type: string
   *               customFields:
   *                 type: string
   *               images:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *     responses:
   *       200:
   *         description: Device created successfully
   */
  /* ➕ ADD DEVICE */
  router.post("/", checkPermission("add"), upload.array("images", 10), async (req, res) => {
    try {
      const imageFiles = req.files?.map(file => file.filename) || [];
  
      let customFields = {};
      try {
        customFields = JSON.parse(req.body.customFields || "{}");
      } catch {
        return res.status(400).json({ message: "Invalid customFields JSON" });
      }
  
      const device = await Device.create({
        userId: req.body.userId,
        deviceName: req.body.deviceName,
        customFields,
        images: imageFiles,
        deviceId: generateDeviceId(),
        isActive: true,
        activityLogs: [{ startTime: new Date(), endTime: null }]
      });
  
      res.json(device);
  
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  /**
   * @swagger
   * /api/devices/user/{userId}:
   *   get:
   *     summary: Get devices for a user
   *     tags: [Devices]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of user devices
   */
  /* 📥 GET USER DEVICES */
  router.get("/user/:userId", async (req, res) => {
    try {
      const devices = await Device.find({ userId: req.params.userId })
        .select("deviceId deviceName isActive images")
        .lean();
  
      res.json(devices);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  /**
   * @swagger
   * /devices/{id}:
   *   patch:
   *     summary: Toggle device status
   *     tags: [Devices]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Device status updated
   */
  /* 🔁 TOGGLE DEVICE STATUS */
  router.patch("/:id", async (req, res) => {
    try {
      const { isActive } = req.body;
  
      const update = {
        isActive
      };
  
      if (isActive) {
        update.$push = {
          activityLogs: { startTime: new Date(), endTime: null }
        };
      } else {
        update.$set = {
          "activityLogs.$[last].endTime": new Date()
        };
      }
  
      const device = await Device.findOneAndUpdate(
        { _id: req.params.id },
        update,
        {
          new: true,
          arrayFilters: isActive ? [] : [{ "last.endTime": null }]
        }
      ).select("deviceId deviceName isActive");
  
      if (!device) {
        return res.status(404).json({ message: "Not found" });
      }
  
      res.json(device);
  
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  /**
   * @swagger
   * /devices/{id}:
   *   delete:
   *     summary: Delete device
   *     tags: [Devices]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Device deleted successfully
   */
  /* ❌ DELETE DEVICE */
  router.delete("/:id",checkPermission("delete"), async (req, res) => {
    try {
      const deletedDevice = await Device.findByIdAndDelete(req.params.id);

      if (!deletedDevice) {
        return res.status(404).json({ message: "Device not found" });
      }

      res.json({ message: "Device deleted successfully" });
    } catch (err) {
      res.status(500).json(err);
    }
  });
  /**
   * @swagger
   * /devices/device/{deviceId}:
   *   get:
   *     summary: Get device by deviceId
   *     tags: [Devices]
   *     parameters:
   *       - in: path
   *         name: deviceId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Device details
   */
  router.get("/device/:deviceId", async (req, res) => {
    try {
      const device = await Device.findOne({ deviceId: req.params.deviceId })
        .select("deviceId deviceName isActive userId images")
        .lean();
  
      res.json(device);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
/**
 * @swagger
 * /devices/{id}/usage:
 *   get:
 *     summary: Get total usage of a device
 *     description: Calculates total usage time of a device. Optionally filter by date.
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter usage by specific date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Usage calculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalHours:
 *                   type: string
 *                   example: "5.25"
 *                 formattedTime:
 *                   type: string
 *                   example: "5 hr 15 min"
 */
 router.get("/:id/usage", async (req, res) => {
  try {
    const { date } = req.query;

    const device = await Device.findById(req.params.id);

    let totalMs = 0;

    // If date filter applied
    let dayStart, dayEnd;

    if (date) {
      dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);

      dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
    }

    device.activityLogs.forEach(log => {
      let start = new Date(log.startTime);
      let end = log.endTime ? new Date(log.endTime) : new Date();

      // ✅ If no date filter → normal calculation
      if (!date) {
        totalMs += end - start;
        return;
      }

      // ✅ Find overlap
      const overlapStart = start > dayStart ? start : dayStart;
      const overlapEnd = end < dayEnd ? end : dayEnd;

      // ✅ Only add if overlap exists
      if (overlapStart < overlapEnd) {
        totalMs += overlapEnd - overlapStart;
      }
    });

    // Convert milliseconds
    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    res.json({
      totalHours: (totalMs / (1000 * 60 * 60)).toFixed(2),
      formattedTime: `${hours} hr ${minutes} min`
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

//Device Usage chart
/**
 * @swagger
 * /devices/{id}/usage-history:
 *   get:
 *     summary: Get daily usage history for a device
 *     description: Returns day-wise usage data for charts
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daily usage data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     example: "2026-03-20"
 *                   hours:
 *                     type: number
 *                     example: 4.5
 *                   label:
 *                     type: string
 *                     example: "4 hr 30 min"
 */
router.get("/:id/usage-history", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    const dailyUsage = {};

    device.activityLogs.forEach(log => {
      let start = new Date(log.startTime);
      let end = log.endTime ? new Date(log.endTime) : new Date();
    
      while (start < end) {
        let dayStart = new Date(start);
        dayStart.setHours(0, 0, 0, 0);
    
        let dayEnd = new Date(start);
        dayEnd.setHours(23, 59, 59, 999);
    
        const overlapStart = start > dayStart ? start : dayStart;
        const overlapEnd = end < dayEnd ? end : dayEnd;
    
        if (overlapStart < overlapEnd) {
          // ✅ LOCAL DATE FIX
          const dateKey = dayStart.toLocaleDateString("en-CA");
    
          if (!dailyUsage[dateKey]) {
            dailyUsage[dateKey] = 0;
          }
    
          dailyUsage[dateKey] += (overlapEnd - overlapStart);
        }
    
        // ✅ IMPORTANT FIX (move to next day correctly)
        start = new Date(dayStart);
        start.setDate(start.getDate() + 1);
      }
    });

    // Convert to array
    const result = Object.keys(dailyUsage).map(date => {
      const totalSeconds = Math.floor(dailyUsage[date] / 1000);
    
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
    
      return {
        date,
      
        // ✅ CORRECT for chart (decimal)
        hours: +(dailyUsage[date] / (1000 * 60 * 60)).toFixed(2),
      
        // ✅ CORRECT for UI
        label: `${hours} hr ${minutes} min`
      };
    });

    // Sort by date
    result.sort((a, b) => new Date(a.date) - new Date(b.date));
    const today = new Date().toLocaleDateString("en-CA");

    const filteredResult = result.filter(item => item.date !== today);
    
    res.json(filteredResult);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 📅 GET ACTIVATION LOGS FOR A DAY
/**
 * @swagger
 * /devices/{id}/activity-logs:
 *   get:
 *     summary: Get activity logs for a specific date
 *     description: Returns device active sessions (start and end time) for a given date
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to filter logs (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Activity logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                   endTime:
 *                     type: string
 *                     format: date-time
 */
router.get("/:id/activity-logs", async (req, res) => {
  try {
    const { date } = req.query;

    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    let dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    let dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const logs = [];

    device.activityLogs.forEach(log => {
    
if (!log.endTime) return;

let start = new Date(log.startTime);
let end = new Date(log.endTime);

      // check overlap
      const overlapStart = start > dayStart ? start : dayStart;
      const overlapEnd = end < dayEnd ? end : dayEnd;

      if (overlapStart < overlapEnd) {
        logs.push({
          startTime: overlapStart,
          endTime: overlapEnd
        });
      }
    });

    res.json(logs);

  } catch (err) {
    res.status(500).json(err);
  }
});
  module.exports = router;
