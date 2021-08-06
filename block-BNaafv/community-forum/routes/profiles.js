let express = require('express');
let router = express.Router();
let auth = require('../middleware/auth');
let User = require('../models/users');

//profile info
router.get('/:username', auth.authOptional, async (req, res, next) => {
    let username = req.params.username;
    let id = req.user ? req.user.userId : false;
    try {
        let user = await User.findOne({username});
        if(!user) {
            return res.status(400).json({errors: {body: ["Enter the correct username"]}});
        }
        return res.status(200).json({user: user.userJSONProfile(id)});
    }catch(error) {
        next(error);
    }
});

//update profile
router.put('/:username', auth.verifyToken, async (req, res, next) => {
    let username = req.params.username;
    try{
        let user = await User.findOne({username});
        if(!user) {
            return res.status(400).json({errors: {body: ["Enter the correct username"]}});
        }
        if(req.user.userId == user.id){
            let user = await User.findOneAndUpdate({username}, req.body.user);
            return res.status(200).json({user: user.userJSONProfile(req.user.userId)});
        }else{
            return res.status(400).json({errors: {body: ["You don't have authorization to perform this task"]}});
        }
        
    }catch(error){
        next(error);
    }
});

//follow a user
router.post('/:username/follow', auth.verifyToken, async (req, res, next) => {
    let username = req.params.username;
    try {
        let user1 = await User.findOne({username});
        if(req.user.userId == user1.id) {
            return res.status(400).json({errors: {body: ["You cannot follow yourself"]}});
        }else{
            let user2 = await User.findByIdAndUpdate(req.user.userId, {$push: {followingList: user1.id}});
            if(!user2.followingList.includes(user1.id)){
                user1 = await User.findByIdAndUpdate(user1.id, {$push: {followersList: user2.id}});
                return res.status(201).json({user: user1.userJSONProfile(req.user.userId)});
            }else {
                return res.status(400).json({error: {body: ["You are already following this person"]}});
            } 
        }
    }catch(error) {
        next(error);
    }
});

//unfollow a user
router.delete('/:username/follow', auth.verifyToken, async (req, res, next) => {
    let username = req.params.username;
    try{
        let user1 = await User.findOne({username});
        if(user1.id == req.user.userId) {
            return res.status(400).json({errors: {body: ["You cannot follow or unfollow yourself"]}});
        }else{
            let user2 = await User.findById(req.user.userId);
            if(user2.followingList.includes(user1.id)){
                user2 = await User.findByIdAndUpdate(req.user.userId, {$pull: {followingList: user1.id}});
                user1 = await User.findByIdAndUpdate(user1.id, {$pull: {followersList: user2.id}});
                return res.status(201).json({user: user1.userJSONProfile(user2.id)});
            }else{
                return res.status(400).json({errors: {body: ["You are not following this person"]}});
            }
        }

    }catch(error){
        next(error);
    }
});
module.exports = router;