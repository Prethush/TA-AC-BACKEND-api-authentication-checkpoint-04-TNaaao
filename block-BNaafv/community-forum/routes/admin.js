let express = require('express');
let router = express.Router();
let User = require('../models/users');
let auth = require('../middleware/auth');
let Question = require('../models/questions');
let Answer = require('../models/answers'); 
const { verifyToken } = require('../middleware/auth');

//register admin
router.post('/register', async (req, res, next) => {
    req.body.admin.isBlocked = false;
    req.body.admin.role = "admin";
    try{
        let user = await User.create(req.body.admin);
        let token = await user.signToken();
        return res.status(200).json({admin: user.userLoginJSON(token)});
    }catch(error){
        next(error);
    }
  });
  
  //login admin
  router.post('/login', async (req, res, next) => {
    let {email, passwd} = req.body.admin;
    if(!email || !passwd){
      return res.status(400).json({errors: {body: ["Email/Password required"]}});
    }
    try{
      let user = await User.findOne({email});
      if(!user) {
        return res.status(400).json({errors: {body: ["Email is not registered"]}});
      }
      let result = await user.verifyPasswd(passwd);
      if(!result) {
        return res.status(400).json({errors: {body: ["Password is incorrect"]}});
      }
      let token = await user.signToken();
      return res.status(200).json({admin: user.userLoginJSON(token)});
    }catch(error) {
      next(error);
    }
  });
  
//block users
router.post('/:id/block', auth.verifyToken, async (req, res, next) => {
    let id = req.params.id;
    req.body.isBlocked = true;
    try{
        let user = await User.findByIdAndUpdate(id, req.body);
        return res.status(201).json({msg: "The user is successfully blocked"});
    }catch(error) {
        next(error);
    }
});

//unblock
router.delete('/:id/block', auth.verifyToken, async (req, res, next) => {
  let id = req.params.id;
  req.body.isBlocked = false;
  try{
      let user = await User.findByIdAndUpdate(id, req.body);
      return res.status(201).json({msg: "The user is successfully unblocked"});
  }catch(error){
      next(error);
  }
});

//list all users
router.get('/users', verifyToken, async (req, res, next) => {
  try{
    let users = await User.find({role: 'user'});
    return res.status(201).json({users: users.map(user => user.userJSONProfile())});
  }catch(error){
    next(error);
  }
})
//tracking all the questions
router.get('/listQuestions', auth.authOptional, async (req, res, next) => {
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

//delete question
router.delete('/questions/:slug', auth.verifyToken, async (req, res, next) => {
  let slug = req.params.slug;
  console.log(slug);
  try{
      let question = await Question.findOne({slug});
      if(!question) {
          return res.status(400).json({errors: {body: ["There is no result for your search"]}});
      }
          question = await Question.findByIdAndDelete(question.id);
          let answer = await Answer.deleteMany({questionId: question.id});
          return res.status(201).json({msg: "Question is successfully deleted"});
  }catch(error) {
      next(error);
  }
});
module.exports = router;