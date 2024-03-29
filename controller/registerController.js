const registerModel = require("../models/registerModel.js");
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const validator = require("validator");
let emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
const createUser = async function (req, res) {
    try {
        const data = req.body;
        if (!data.title) {
            return res.status(400).send({ status: false, msg: "title is required field" })
        }
        if (!data.name) {
            return res.status(400).send({ status: false, msg: "name is required field" })
        }
        if (!data.phone) {
            return res.status(400).send({ status: false, msg: "phone is required field" })
        }
        const duplicatePhone = await registerModel.findOne({ phone: data.phone });

        if (duplicatePhone) {
            return res.status(400).send({ status: false, msg: "phone already exist" });
        }
        if (!data.email) {
            return res.status(400).send({ status: false, msg: "email is required field" });
        }
        if (!emailRegex.test(data.email)) {
            return res.status(400).send({status : false,message:"please enter  a valid email"});
        }
        const duplicateEmail = await registerModel.findOne({ email: data.email });

        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: "email already exist" });
        }
        if (!(data.password.length > 8 && data.password.length < 15)) {
            return res.status(400).send({ status: false, msg: "password length should be  between 8 to 15 characters" });
        }
        const usercreated = await registerModel.create(data);
        res.status(201).send({ status: true, message: "user created succeessfully", data: usercreated });
    }
    catch (error) {
        return res.status(500).send({ msg: error.message });
    }
};

const getUser = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!userId) {
            return res.status(400).send({ status: false, message: "Please provide a valid userId" })
        }
        const user = await registerModel.findOne({ id: userId })
        if (!user) {
            return res.status(404).send({ status: false, message: "No user found" })
        }
        return res.status(200).send({ status: true, message: "user details found,data :user" })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
const updateUser = async function(req,res){
    try {
        let data = req.body;
        let userId = req.params.userId;
        if (!userId) {
            return res.status(400).send({status:false,message:"Please enter userId"});
        }
        const user = await registerModel.findById(userId);
        if (!user) {
            return res.status(400).send({status:false, message:"Please enter valid userId"})
    } 
    const updateUser = await registerModel.findOneAndUpdate({_id:userId},
    {$set:{title:data.title, name:data.name, phone:data.phone, email:data.email, password:data.password}},
    {new:true})
    return res.status(200).send ({status:true,message:"user details updated successfully",data:updateUser})
}
catch (error) {
        res.status(500).send({status:false,error:error.message})
    }
}
const deleteUser = async function (req,res) {
    try {
        const userId= req.params.userId
        const user = await registerModel.findById(userId);
        if (!user) {
            return res.status(404).send({status:false,message:"user not found"})
        }
        if(user.isDeleted==true){
            return res.status(400).send({status:false,message:"user has already been deleted "})
        }
        const deleteUser = await registerModel.findByIdAndUpdate(userId,
            {$set:{isDeleted:true}},{new:true})
            return res.status(201).send({status:true,msg:"user deleted successfully"})
    } catch (error) {
        res.status(500).send({status:false,error:error.msg})
    }
}
const login = async function (req,res) {
    try {
        const data = req.body;
        if(!data.email){
            return res.status(400).send({ status: false, msg: "email is required field" });
        }
        if(!data.password){
            return res.status(400).send({ status: false, msg: "password is required field" });
        }
        const userMatch =await registerModel.findOne({email:data.email, password:data.password})
        if (!userMatch) {
            return res.status(400).send({ status: false, msg: "email or password is incorrect" })
        }
        const token = jwt.sign({userId:userMatch._id,
        },'lata12',{expiresIn:'70h'})
        return res.status(200).send({ status: true, msg: "you are successfully logged in",token })
    
    } 
    catch (error) {
      res.status(500).send({status:false,error:error.msg})
    }
    
}
module.exports.getUser = getUser;
module.exports.updateUser = updateUser;
module.exports.createUser = createUser;
module.exports.deleteUser = deleteUser;
module.exports.login = login;