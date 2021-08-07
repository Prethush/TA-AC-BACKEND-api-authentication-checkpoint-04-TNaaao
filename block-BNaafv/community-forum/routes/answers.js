let express = require('express');
let router = express.Router();
let auth = require('../middleware/auth');
let Answer = require('../models/answers');
let Question = require('../models/questions');
let User = require('../models/users');
let Comment = require('../models/comments');


router.use(auth.verifyToken);

//update answer
router.put('/:id', async (req, res, next) => {
    let id = req.params.id;
    try{
        let answer = await Answer.findById(id);
        if(req.user.userId == answer.author){
            answer = await Answer.findByIdAndUpdate(id, req.body.answer).populate('author');
            return res.status(201).json({answer: answer.displayAnswerDetails()});
        }else {
            return res.status(400).json({errors: {body: ["You don't have authorization to perform this task"]}});  
        }
    }catch(error) {
        next(error);
    }
});

//delete answer
router.delete('/:id', async (req, res, next) => {
    let id = req.params.id;
    try{
        let answer = await Answer.findById(id);
        if(req.user.userId == answer.author){
            answer = await Answer.findByIdAndDelete(id);
            let question = await Question.findByIdAndUpdate(answer.questionId, {$pull: {answers: id}});
            return res.status(201).json({msg: "Answer successfully deleted"});
        }else{
            return res.status(400).json({errors: {body: ["You don't have authorization to perform this task"]}});  
        }
    }catch(error){
        next(error);
    }
});

//upvote answers
router.post('/:id/upvote', async (req, res, next) => {
    let id = req.params.id;
    try{
        let answer = await Answer.findById(id);
        let user = await User.findById(req.user.userId);
        if(!user.upvoteAnswerList.includes(answer.id)) {
            user = await User.findByIdAndUpdate(user.id, {$push: {upvoteAnswerList: answer.id}});
            answer = await Answer.findByIdAndUpdate(answer.id, {$inc: {upvote: 1}}).populate('author');
            return res.status(200).json({answer: answer.displayAnswerDetails(req.user.userId)});
        }else{
            return res.status(400).json({errors: {body: ["you are already voted for this answer"]}});
        }
    }catch(error){
        next(error);
    }
});

//add comments
router.post('/:id/comments', async (req, res, next) => {
    let id = req.params.id;
    req.body.comment.answerId = id;
    req.body.comment.author = req.user.userId;
    try{
        let comment = await Comment.create(req.body.comment);
        let answer = await Answer.findByIdAndUpdate(id, {$push: {comments: comment.id}});
        comment = await Comment.findById(comment.id).populate('author');
        return res.status(201).json({comment: comment.commentJSON(req.user.userId)});
    }catch(error) {
        next(error);
    }
});
module.exports = router;