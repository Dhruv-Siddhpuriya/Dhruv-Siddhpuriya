const express = require('express');
const router = express.Router();
const User = require('../user');
const client = require("../utils/redisClient");
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Returns list of users
 *     responses:
 *       200:
 *         description: Successful response
 */
router.get('/' ,async (req,res) => {
    const users =await User.find().populate("role");
    res.json(users);
});


router.put('/:userId/role', async (req,res) =>  {
    const {roleId} = req.body;
    await User.findByIdAndUpdate(req.params.userId, {
        role: roleId,
    })
    res.json({message:"Role Assigned"})
})
router.delete("/", async (req, res) => {
    try {
      const { userIds } = req.body;
  
      if (!Array.isArray(userIds)) {
        return res.status(400).json({ message: "userIds must be an array" });
      }
  
      await User.deleteMany({
        _id: { $in: userIds }
      });
  
      res.json({ message: "Users deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Delete failed" });
    }
  });
module.exports = router;