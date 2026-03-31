const express = require("express");
const router = express.Router();
const Role = require('../models/Roles');
/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 example: Admin
 *     responses:
 *       200:
 *         description: Role created successfully
 */
router.post('/', async (req,res) => {
    try{
     const role = new Role(req.body);

     await role.save();
     res.json(role)
    }catch(err)
    {
        res.status(500).json({ message: err.message });
    }
});
router.get('/', async (req,res) => {
    const roles = await Role.find();
    res.json(roles);
})

module.exports = router;