var express = require('express');
var router = express.Router();
let User = require('../models/users');
let auth = require('../middleware/auth');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//register user
router.post('/register', async (req, res, next) => {
  try{
      let user = await User.create(req.body.user);
      let token = await user.signToken();
      return res.status(200).json({user: user.userLoginJSON(token)});
  }catch(error){
      next(error);
  }
});

//login user
router.post('/login', async (req, res, next) => {
  let {email, passwd} = req.body.user;
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
    return res.status(200).json({user: user.userLoginJSON(token)});
  }catch(error) {
    next(error);
  }
});

//get current user
router.get('/current-user', auth.verifyToken, async(req, res, next) => {
  try{
      let user = await User.findById(req.user.userId);
      return res.status(200).json({user: user.userLoginJSON(req.headers.authorization)});
  }catch(error) {
    next(error);
  }
});



module.exports = router;
