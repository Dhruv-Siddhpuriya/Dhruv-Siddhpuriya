const User = require('../user');

const checkPermission = (action) => {
    return async (req,res,next) => {
        const userId = req.userId;
        const user = await User.findById(userId).populate("role");
        if(!user.role || !user.role.permissions[action]){
            return res.status(403).json({message: "Permission Denied"})
        }
        next();
    }
}

module.exports = checkPermission;