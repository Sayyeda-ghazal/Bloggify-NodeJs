const { Router } = require('express');
const path = require("path");
const multer = require('multer');
const Blog = require('../models/blogs');
const Comment = require('../models/comments');

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('./public/uploads')); 
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render('addBlog', {
    user: req.user,
  });
});

router.post("/", upload.single('featuredImage'), async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).send("Title and body are required.");
  }

  try {
    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user?._id,
      coverImageURL: req.file ? `/uploads/${req.file.filename}` : null
    });

    return res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error("Error creating blog:", err);
    return res.status(500).send("Server Error: Failed to create blog.");
  }
});

router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    console.log('Blog CreatedBy:', blog.createdBy);
    const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
    console.log(comments);

    return res.render("blog", {
      user: req.user,
      blog: blog,
      comments: comments, 
    });
  } catch (err) {
    console.error("Error loading blog page:", err);
    res.status(500).send("Server Error");
  }
});


router.post('/comments/:blogId', async (req, res) => {
  const comments = await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;
