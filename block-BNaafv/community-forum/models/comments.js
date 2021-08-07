let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let commentSchema = new Schema({
    text: {type: String, required: true},
    questionId: {type: Schema.Types.ObjectId, ref: "Question"},
    answerId: {type: Schema.Types.ObjectId, ref: "Answer"},
    author: {type: Schema.Types.ObjectId, ref: "User", required: true}
}, {timestamps: true});

commentSchema.methods.commentJSON = function(id = null){
    return {
        text: this.text,
        author: this.author.displayAuthor(id)
    }
} 
module.exports = mongoose.model("Comment", commentSchema);