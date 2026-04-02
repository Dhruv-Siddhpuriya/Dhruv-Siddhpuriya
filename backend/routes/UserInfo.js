const router = require("express").Router();
const User = require("../user"); // adjust if your path is different
const upload = require("../middleware/upload");
const client = require("../utils/redisClient");
// 🔹 GET USER PROFILE
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get("/:id", async (req, res) => {
  try {
       const cacheKey = `user:${req.params.id}`;
       const cached = await client.get(cacheKey);
    if (cached) {
      console.log("⚡ User from Redis");
      return res.json(JSON.parse(cached));
    }
    const user = await User.findById(req.params.id).select("-password").populate("role");

    await client.setEx(cacheKey, 300, JSON.stringify(user));
      console.log("🐢 User from DB");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
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
 *             example:
 *               name: John Doe
 *               email: john@gmail.com
 *     responses:
 *       200:
 *         description: User updated successfully
 */
// 🔹 UPDATE USER PROFILE
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
/**
 * @swagger
 * /api/users/upload-profile/{id}:
 *   put:
 *     summary: Upload user profile image
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded
 */
router.put("/upload-profile/:id",upload.single("profileImage"),async (req, res) => {
    try {
      const imagePath = req.file.filename;

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { profileImage: imagePath },
        { new: true }
      );

      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

module.exports = router;
