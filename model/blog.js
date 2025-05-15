/*const blogSchema = new mongoose.Schema({
    BlogTitle: String,
    Content: String,
    author: String
});

const Blog = mongoose.model("Blog", blogSchema);*/


const blogSchema = new mongoose.Schema({
    BlogTitle: String,
    Content: String,
    author: String,
     likes: {
        type: Number,
        default: 0
    },
    comments: [String],
 date: {
  type: Date,
  default: Date.now
}

});

const Blog = mongoose.model("Blog", blogSchema);