const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const session = require('express-session');

let users = [];
const JWT_SECRET = "your_jwt_secret";

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
}

const checkUserCredentials = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return user.username === username && user.password === password;
    });
  return validusers.length > 0;
}

// Middleware to authenticate users using JWT
const authenticatedUser = (req, res, next)=>{
    console.log(req.headers.authorization);
    if (req.session.authorization) { // Get the authorization object stored in the session
        token = req.session.authorization['accessToken']; // Retrieve the token from authorization object
        console.log(token);
        jwt.verify(token, "access", (err, user) => { // Use JWT to verify token
          if (!err) {
            console.log(user)
            req.user = user;
            next();
          } else {
            return res.status(403).json({ message: "User not authenticated" });
          }
        });
      } else {
        return res.status(403).json({ message: "User not logged in" });
      }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    if (checkUserCredentials(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken, username
        };
        return res.status(200).json({ message: "Login successful", token: accessToken });
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
    const username = req.session.username;

    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const reviewKey = `${username}-${isbn}`;

    if (!req.app.locals.reviews) {
        req.app.locals.reviews = {};
    }

    req.app.locals.reviews[reviewKey] = review;

    return res.status(200).json({ message: "Review posted/updated successfully" });

});

regd_users.delete("/auth/review/:isbn", authenticatedUser, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const reviewKeyPrefix = `${username}-${isbn}`;
    let reviewDeleted = false;

     if (req.app.locals.reviews) {
        for (const key in req.app.locals.reviews) {
            if (key.startsWith(reviewKeyPrefix)) {
                delete req.app.locals.reviews[key];
                reviewDeleted = true;
                break; //important to exit the loop
            }
        }
    }
    if (reviewDeleted)
        return res.status(200).json({ message: "Review deleted successfully" });
    else
        return res.status(404).json({ message: "Review not found for this user and ISBN" });

});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
