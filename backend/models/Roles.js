const mongoose = require("mongoose")

const roleSchema = new mongoose.Schema({

    roleName:{
        type: String,
        required: true,
        unique:true
    },
    permissions:{
        add:{type:Boolean, default:false},
        edit:{type: Boolean, default:false},
        delete:{type:Boolean, default:false}
    },
},{timestamps:true});

module.exports = mongoose.model("Role", roleSchema);