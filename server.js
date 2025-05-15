/*const express = require("express");
const app = express();

const path = require("path");
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views")); // Views folder

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    BlogTitle: String,
    Content: String,
    author: String
});

const Blog = mongoose.model("Blog", blogSchema);


app.post("/addBlog", async (req, res) => {
    try {
        const { BlogTitle, Content, author } = req.body;
        const newBlog = new Blog({ BlogTitle, Content, author });
        await newBlog.save();
        res.status(201).send({ message: "Blog added successfully", blog: newBlog });
    } catch (err) {
        res.status(500).send({ message: "Error adding blog", error: err });
    }
});


app.get("/allblogs", async (req, res) => {
    const blogs = await Blog.find();
    res.render("allblogs", { blogs });
});

app.get("/getblog/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).send({ message: "Blog not found" });
        res.render("blog", blog);
    } catch (err) {
        res.status(400).send({ message: "Invalid blog ID", error: err });
    }
});


app.get("/new", (req, res) => {
    res.render("addBlog");
});
           
app.delete("/deleteblog/:id", async (req, res) => {
    const result = await Blog.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).send({ message: "Blog not found" });
    res.send({ message: "Blog deleted successfully" });
});

app.patch("/updateblog/:id", async (req, res) => {
    const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    if (!updatedBlog) return res.status(404).send({ message: "Blog not found" });
    res.send({ message: "Blog updated successfully", blog: updatedBlog });
});

  
app.listen(3000, () => {
    console.log("Blog Server started Successfully on port 3000!!");
});

mongoose.connect("mongodb://127.0.0.1:27017/navyaBlogs")
    .then(() => console.log("Connected to MongoDB!"))
    .catch(err => console.error("MongoDB connection error:", err));
*/
const express = require("express");
const app = express();

const path = require("path");
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "Views")); // Views folder

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const mongoose = require("mongoose");
const exphbs = require('express-handlebars');


const hbs = exphbs.create({
  extname: 'hbs',
  defaultLayout: false, // only use if you're not using layouts
  allowProtoPropertiesByDefault: true,
  helpers: {
    eq: (a, b) => a === b,
    add: (a, b) => a + 1,
    subtract: (a, b) => a - 1,
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true, // Disable the check for prototype properties
  },
});

app.engine('hbs', hbs.engine); // ✅ use the hbs you created
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'Views'));




const blogSchema = new mongoose.Schema({
    BlogTitle: String,
    Content: String,
    author: String,
    category: String,  // New field for category
    likes: {
        type: Number,
        default: 0
    },
    comments: [String]
});
                                                                   
const Blog = mongoose.model("Blog", blogSchema);

let blogData = [
    {
        id: 1,
        BlogTitle: "WordCraft Wonderland",
        Content: "Welcome to Woodcraft Wonderland—a space where creativity and craftsmanship come together!",
        author: "Sargun"
    },
    {
        id: 2,
        BlogTitle: "Dream Drafts",
        Content: "Welcome to Dream Drafts, where imagination meets design!",
        author: "Kavya"
    },
    {
        id: 3,
        BlogTitle: "A Journey to Switzerland",
        Content: "Switzerland, a land of majestic mountains, crystal-clear lakes, and charming villages...",
        author: "Sargun"
    }
];



app.post("/addBlog", async (req, res) => {
    try {
        const { BlogTitle, Content, author, category } = req.body;  // Capture category
        const newBlog = new Blog({ BlogTitle, Content, author, category });  // Save category
        await newBlog.save();
        res.status(201).send({ message: "Blog added successfully", blog: newBlog });
    } catch (err) {
        res.status(500).send({ message: "Error adding blog", error: err });
    }
});

app.post("/like/:id", async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true }
        );
        if (!blog) return res.status(404).send({ message: "Blog not found" });
        res.redirect("/allblogs");
    } catch (err) {
        res.status(400).send({ message: "Error liking blog", error: err });
    }
});

app.post("/comment/:id", async (req, res) => {
    try {
        const { comment } = req.body;
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $push: { comments: comment } },
            { new: true }
        );
        if (!blog) return res.status(404).send({ message: "Blog not found" });
        res.redirect("/allblogs");
    } catch (err) {
        res.status(400).send({ message: "Error commenting on blog", error: err });
    }
});

app.get("/allblogs", async (req, res) => {
    const sortOrder = req.query.sortOrder || 'desc'; // Default to descending
    const categoryFilter = req.query.category || 'all';  // Default to 'all' category

    const page = parseInt(req.query.page) || 1; // Current page
    const limit = 5; // Number of blogs per page
    const skip = (page - 1) * limit;

    const sortCriteria = { likes: sortOrder === 'asc' ? 1 : -1 }; // Only sort by likes

    const filter = categoryFilter !== 'all' ? { category: categoryFilter } : {}; // Filter by category if not 'all'

    try {
        const blogs = await Blog.find(filter).skip(skip).limit(limit).sort(sortCriteria);
        const totalBlogs = await Blog.countDocuments();
        const totalPages = Math.ceil(totalBlogs / limit);

        res.render("allblogs", { blogs, page, totalPages, sortOrder, categoryFilter });
    } catch (err) {
        res.status(500).send({ message: "Error fetching blogs", error: err });
    }
});
        
    


app.get("/getblog/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).send({ message: "Blog not found" });
        res.render("blog", blog.toObject());
    } catch (err) {
        res.status(400).send({ message: "Invalid blog ID", error: err });
    }
});


app.get("/new", (req, res) => {
    res.render("addBlog");
});


app.delete("/deleteblog/:id", async (req, res) => {
    const result = await Blog.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).send({ message: "Blog not found" });
    res.send({ message: "Blog deleted successfully" });
});

app.patch("/updateblog/:id", async (req,res) => {
    const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );
    if (!updatedBlog) return res.status(404).send({ message: "Blog not found" });
    res.send({ message: "Blog updated successfully", blog: updatedBlog });
});
app.get("/category/:category", async (req, res) => {
    const category = req.params.category;
    try {
        const blogs = await Blog.find({ category: category });
        res.render("allblogs", { blogs, category });
    } catch (err) {
        res.status(500).send({ message: "Error fetching blogs", error: err });
    }
});

app.get("/search", async (req, res) => {
    const query = req.query.query;
    const category = req.query.category || 'all';  // Get the selected category (if any)

    try {
        const filter = category !== 'all' ? { category: category } : {};  // Filter by category if not 'all'
        const blogs = await Blog.find({
            ...filter,
            $or: [
                { BlogTitle: { $regex: query, $options: 'i' } },
                { Content: { $regex: query, $options: 'i' } }
            ]
        });
        res.render("allblogs", { blogs, category });
    } catch (err) {
        res.status(500).send({ message: "Error fetching blogs", error: err });
    }
});



 

mongoose.connect("mongodb://127.0.0.1:27017/navyaBlogs")
    .then(() => {
        console.log("Connected to MongoDB!");
        app.listen(5000, () => {
            console.log("Blog Server started Successfully on port 4000!");
        });
    })
    .catch(err => console.error("MongoDB connection error:", err));
