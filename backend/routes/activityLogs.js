const UserSession = require("../UserSession");
const router = require("express").Router();
const client = require("../utils/redisClient"); // ✅ ADD REDIS

/**
 * GET USER SESSION LOGS
 */
router.get("/", async (req, res) => {
  try {
    const cacheKey = "userSessions:all";

    // ✅ 1. CHECK CACHE
    const cached = await client.get(cacheKey);
    if (cached) {
      console.log("⚡ Sessions from Redis");
      return res.json(JSON.parse(cached));
    }

    // 🐢 2. FETCH FROM DB (HEAVY QUERY)
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

    // ✅ 3. STORE IN REDIS (5 minutes)
    await client.setEx(cacheKey, 300, JSON.stringify(logs));

    console.log("🐢 Sessions from DB");

    res.json(logs);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;