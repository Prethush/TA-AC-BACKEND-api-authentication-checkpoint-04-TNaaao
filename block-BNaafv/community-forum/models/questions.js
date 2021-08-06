let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

let questionSchema = new Schema({
    title: {type: String, required: true},
    slug: {type: String, slug: "title", unique: true},
    author: {type: Schema.Types.ObjectId, ref: "User", required: true},
    answers: [{type: Schema.Types.ObjectId, ref: "Answer"}],
    description: String,
    tags: [String], 
    upvote: {type: Number, default: 0},
    comments: [{type: Schema.Types.ObjectId, ref: "Comment"}]
}, {timestamps: true});

questionSchema.methods.displayQuestionJSON = function(id = false){
    return {
        tags: this.tags,
        answers: this.answers.map(answer => answer.displayAnswerJSON(id)),
        comments: this.comments.map(comment => comment.commentJSON(id)),
        id: this.id,
        title: this.title,
        slug: this.slug,
        description: this.description,
        author: this.author.displayAuthor(id),
        upvote: this.upvote,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }
}


module.exports = mongoose.model("Question", questionSchema);