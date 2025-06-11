const { Router } = require('express');
const path = require("path");
const multer = require('multer');
const Blog = require('../models/blogs');

const router = Router();

// 1. Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('./public/uploads')); // Ensure this folder exists!
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

// 2. GET route to render blog creation form
router.get("/add-new", (req, res) => {
  return res.render('addBlog', {
    user: req.user,
  });
});

// 3. POST route to handle blog submission
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

router.get('/:id',async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  return res.render("blog", {
    user: req.user,
    blog,
  });
});

module.exports = router;
