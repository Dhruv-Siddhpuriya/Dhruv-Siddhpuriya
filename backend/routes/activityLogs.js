const UserSession = require("../UserSession");
const client = require("../utils/redisClient");
const router = require("express").Router();
/**
 * @swagger
 * /user-sessions:
 *   get:
 *     summary: Get all user session logs
 *     description: Fetches user session logs with user details like name, login/logout time, IP address, and device.
 *     tags:
 *       - User Sessions
 *     responses:
 *       200:
 *         description: Successfully fetched user session logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "65f1a2c4b1234567890abcde"
 *                   userId:
 *                     type: string
 *                     example: "65f1a2c4b1234567890abcd1"
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   registeredAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-03-01T10:00:00Z"
 *                   loginTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-03-20T09:00:00Z"
 *                   logoutTime:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-03-20T17:00:00Z"
 *                   ipAddress:
 *                     type: string
 *                     example: "192.168.1.1"
 *                   device:
 *                     type: string
 *                     example: "Chrome on Windows"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/", async (req, res) => {
    try {
      const cacheKey = "userSessions:all";
  
      // ✅ 1. CHECK CACHE
      const cached = await client.get(cacheKey);
      if (cached) {
        console.log("⚡ UserSessions from Redis");
        return res.json(JSON.parse(cached));
      }
  
      // ❌ 2. FETCH FROM DB
      const logs = await UserSession.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $unwind: "$user"
        },
        {
          $project: {
            _id: 1,
            userId: "$user._id",
            name: {
              $concat: ["$user.firstName", " ", "$user.lastName"]
            },
            registeredAt: "$user.createdAt",
            loginTime: 1,
            logoutTime: 1,
            ipAddress: 1,
            device: 1
          }
        },
        {
          $sort: { loginTime: -1 }
        }
      ]);
  
      // ✅ 3. STORE IN REDIS (5 min cache)
      await client.setEx(cacheKey, 300, JSON.stringify(logs));
  
      console.log("🐢 UserSessions from DB");
  
      res.json(logs);
  
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
module.exports = router;