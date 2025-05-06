const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
     return username && username.trim() !== '';
}

const authenticatedUser = (username,password)=>{ //returns boolean
if (req.session && req.session.authorization && req.session.authorization.accessToken) {
        const token = req.session.authorization.accessToken;
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            console.error('JWT Verification Error:', err);
            return res.status(401).json({ message: "User not authenticated - Invalid token" });
        }
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    req.session.authorization = { accessToken: token, username: username };
    req.session.username = username;
    return res.status(200).json({ message: "Login successful", token: token });
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

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
