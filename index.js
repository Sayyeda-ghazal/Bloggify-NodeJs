const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const userRoute = require('./routes/user');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/auth');

const app = express();
const PORT = 8080;

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    console.log("res.locals.user:", res.locals.user);
    next();
  }); 

mongoose.connect('mongodb://localhost:27017/Blogify').then(e => console.log('MongoDb Connected'));

app.set('view engine', 'ejs');
app.set("views", path.resolve('./views'));

app.get("/", (req, res) => {
    res.render("home",{
        user: req.user,
    });
});

app.use('/user', userRoute)

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`))