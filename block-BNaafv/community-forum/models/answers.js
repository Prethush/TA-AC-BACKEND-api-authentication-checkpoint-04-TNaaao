let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let answerSchema = new Schema({
    text: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: "User", required: true},
    questionId: {type: Schema.Types.ObjectId, ref: "Question", required: true},
    upvote: {type: Number, default: 0},
    comments: [{type: Schema.Types.ObjectId, ref: "Comment"}]
}, {timestamps: true});


answerSchema.methods.displayAnswerJSON = function(id = null) {
    return {
        id: this.id,
        text: this.text,
        author: this.author.displayAuthor(id),
        comments: this.comments.map(comment => comment.commentJSON(id)),
        upvote: this.upvote,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}

answerSchema.methods.displayAnswerDetails = function(id = null){
    return {
        id: this.id,
        text: this.text,
        author: this.author.displayAuthor(),
        upvote: this.upvote,
        questionId: this.questionId,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    }
}
module.exports = mongoose.model("Answer", answerSchema);