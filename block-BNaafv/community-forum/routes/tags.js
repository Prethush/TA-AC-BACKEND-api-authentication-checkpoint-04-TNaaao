let express = require('express');
let router = express.Router();
let auth = require('../middleware/auth');
let Question = require('../models/questions');


//list tags
router.get('/', auth.authOptional, async (req, res, next) => {
    try{
        let tags = await Question.find({}).distinct('tags');
        return res.status(200).json({tags});
    }catch(error) {
        next(error);
    }
});
module.exports = router;