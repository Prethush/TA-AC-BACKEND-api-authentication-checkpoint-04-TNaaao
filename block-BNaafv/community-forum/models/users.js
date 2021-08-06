let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');

require('dotenv').config();

let userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    image: {type: String},
    bio: String,
    passwd: {type: String, required: true, minlength: 5},
    following: Boolean,
    followingList: [{type: Schema.Types.ObjectId, ref: "User"}],
    followersList: [{type: Schema.Types.ObjectId, ref: "User"}],
    upvoteQuestionList: [{type: Schema.Types.ObjectId, ref: "Question"}],
    upvoteAnswerList: [{type: Schema.Types.ObjectId, ref: "Answer"}]
}, {timestamps: true});

userSchema.pre('save', async function(next) {
    if(this.passwd && this.isModified('passwd')) {
        this.passwd = await bcrypt.hash(this.passwd, 10);
    }
    next();
});

userSchema.methods.userJSONProfile = function(id = null) {
    console.log(id, this.followersList);
    return{
        name: this.name,
        email: this.email,
        image: this.image,
        bio: this.bio,
        following: id ? this.followersList.includes(id) : false
    }
}

userSchema.methods.verifyPasswd = async function(passwd) {
    try{
        let result = await bcrypt.compare(passwd, this.passwd);
        return result;
    }catch(error){
        return error;
    }
}

userSchema.methods.signToken = async function() {
    let payload = {userId: this.id, email: this.email, username: this.username};
    try{
        let token = await jwt.sign(payload, process.env.SECRET);
        return token;
    }catch(error) {
        return error;
    }
}

userSchema.methods.userLoginJSON = function(token) {
    return {
        token: token,
        email: this.email,
        username: this.username
    }
}

userSchema.methods.displayAuthor = function(id = null) {
    return {
        id: this.id,
        username: this.username,
        following: id ? this.followersList.includes(id) : false
    }
}
module.exports = mongoose.model("User", userSchema);