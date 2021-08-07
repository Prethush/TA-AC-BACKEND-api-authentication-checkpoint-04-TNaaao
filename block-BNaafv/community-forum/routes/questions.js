let express = require('express');
let router = express.Router();
let auth = require('../middleware/auth');
let Question = require('../models/questions');
let User = require('../models/users');
let random = require('../middleware/random');
let Answer = require('../models/answers');
let Comment = require('../models/comments');

//create question
router.post('/', auth.verifyToken, async (req, res, next) => {
    req.body.question.author = req.user.userId;
    try{
        let question = await Question.create(req.body.question);
        question = await Question.findById(question.id).populate('author');
        return res.status(201).json({question: question.displayQuestion(req.user.userId)});
    }catch(error){
        next(error);
    }
});

//list a specific question
router.get('/:slug', auth.authOptional, async (req, res, next) => {
    let slug = req.params.slug;
    try{
        let question = await Question.findOne({slug});
        if(!question){
            return res.status(400).json({errors: {body: ["There is no result for your search"]}});
        }
        question = await Question.findById(question.id).populate([{path: 'author', model: 'User'}, {path: 'answers', model: 'Answer', populate: {path: 'author', model: 'User'}}]);
        return res.status(201).json({question: question.displayQuestionJSON(req.user.userId)});
    }catch(error){
        next(error);
    }
});

//list all questions
router.get('/', auth.authOptional, async (req, res, next) => {
    let id = req.user ? req.user.userId : false;
    try{
        let questions = await Question.find({}).populate('author');
        return res.status(201).json({questions: questions.map(question => {
            return question.displayQuestion(id);
        })});
       
    }catch(error) {
        next(error);
    }
});

//update question
router.put('/:id', auth.verifyToken, async (req, res, next) => {
    let id = req.params.id;
    if(req.body.question.title){
        req.body.question.slug = req.body.question.title.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '').split(" ").join("-").toLowerCase() + "-" +random();
    }
    console.log(req.body.question.slug);
    try{
        let question = await Question.findById(id);
        if(req.user.userId == question.author){
            question = await Question.findByIdAndUpdate(id, req.body.question).populate('author');
            return res.status(201).json({question: question.displayQuestion(req.user.userId)});
        }else{
            return res.status(400).json({errors: {body: ["You don't have authorization to perform this task"]}}); 
        }
    }catch(error){
        next(error);
    }
});

//delete question 
router.delete('/:slug', auth.verifyToken, async (req, res, next) => {
    let slug = req.params.slug;
    console.log(slug);
    try{
        let question = await Question.findOne({slug});
        if(!question) {
            return res.status(400).json({errors: {body: ["There is no result for your search"]}});
        }
        console.log(question);
        if(req.user.userId == question.author){
            question = await Question.findByIdAndDelete(question.id);
            let answer = await Answer.deleteMany({questionId: question.id});
            return res.status(201).json({msg: "Question is successfully deleted"});
        }else {
            return res.status(400).json({errors: {body: ["You don't have authorization to perform this task"]}}); 
        }
    }catch(error) {
        next(error);
    }
});

//add answer
router.post('/:id/answers', auth.verifyToken, async (req, res, next) => {
    let id = req.params.id;
    req.body.answer.author = req.user.userId;
    
    try{
        let question = await Question.findById(id);
        console.log(question);
        req.body.answer.questionId = question.id;
        let answer = await Answer.create(req.body.answer);
        question = await Question.findByIdAndUpdate(id, {$push: {answers: answer.id}});
        answer = await Answer.findById(answer.id).populate('author');
        return res.status(201).json({answer: answer.displayAnswerJSON()});
    }catch(error){
        next(error);
    }
});

//list answers
router.get('/:id/answers', auth.verifyToken, async (req, res, next) => {
    let id = req.params.id;
    try {
        let question = await Question.findById(id);
        let answers = await Answer.find({questionId: id}).populate('author');
        return res.status(201).json({answers: 
            answers.map(answer => {
                return answer.displayAnswerDetails();
            })
        })
        
    }catch(error){
        next(error);
    }
});

//upvote questions
router.post('/:id/upvote', auth.verifyToken, async (req, res, next) => {
    let id = req.params.id;
    try{
        let user = await User.findById(req.user.userId);
        let question = await Question.findById(id);
        if(!user.upvoteQuestionList.includes(id)){
            question = await Question.findByIdAndUpdate(id, {$inc: {upvote: 1}}).populate('author');
            user = await User.findByIdAndUpdate(user.id, {$push: {upvoteQuestionList: question.id}});
            return res.status(201).json({question: question.displayQuestion(user.id)});
        }else {
            return res.status(400).json({errors: {body: ["you are already voted for this question"]}});
        }
    }catch(error){
        next(error);
    }
});

//add comments
router.post('/:id/comments', auth.verifyToken, async (req, res, next) => {
    let id = req.params.id;
    
    try{
        req.body.comment.questionId = id;
        req.body.comment.author = req.user.userId;
        let comment = await Comment.create(req.body.comment);
        let question = await Question.findByIdAndUpdate(id, {$push: {comments: comment.id}});
        comment = await Comment.findById(comment.id).populate('author');
        return res.status(201).json({comment: comment.commentJSON(req.user.userId)});
    }catch(error){
        next(error);
    }
})
router.delete('/:id/')

module.exports = router;