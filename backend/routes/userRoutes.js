const express = require('express');
const router = express.Router();
const User = require('../user');
const client = require('../utils/redisClient'); // ✅ ADD THIS

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 */
router.get('/', async (req, res) => {
  try {
    const cacheKey = "users:all";

    // ✅ 1. CHECK CACHE
    const cached = await client.get(cacheKey);
    if (cached) {
      console.log("⚡ Users from Redis");
      return res.json(JSON.parse(cached));
    }

    // 🐢 2. FETCH FROM DB
    const users = await User.find().populate("role").lean();

    // ✅ 3. STORE IN REDIS (5 min)
    await client.setEx(cacheKey, 300, JSON.stringify(users));

    console.log("🐢 Users from DB");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/**
 * UPDATE USER ROLE
 */
router.put('/:userId/role', async (req, res) => {
  try {
    const { roleId } = req.body;

    await User.findByIdAndUpdate(req.params.userId, {
      role: roleId,
    });

    // ❌ CLEAR CACHE
    await client.del("users:all");

    res.json({ message: "Role Assigned" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/**
 * DELETE MULTIPLE USERS
 */
router.delete("/", async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ message: "userIds must be an array" });
    }

    await User.deleteMany({
      _id: { $in: userIds }
    });

    // ❌ CLEAR CACHE
    await client.del("users:all");

    res.json({ message: "Users deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;