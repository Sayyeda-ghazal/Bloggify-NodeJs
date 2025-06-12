require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
const Blog = require('./models/blogs');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/auth');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')));
app.use('/images', express.static(path.resolve(__dirname, 'public/images')));

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    console.log("res.locals.user:", res.locals.user);
    next();
  }); 

mongoose.connect(process.env.MONGO_URL).then(e => console.log('MongoDb Connected'));

app.set('view engine', 'ejs');
app.set("views", path.resolve('./views'));

app.get("/", async (req, res) => {
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
    res.render("home", {
        user: req.user,
        blogs: allBlogs,
    });
});


app.use('/user', userRoute);
app.use('/blog', blogRoute);

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`))