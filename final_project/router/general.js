const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  // Extract username and password from the request body
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username) {
        return res.status(400).json({ error: "Username is required." });
    }
    if (!password) {
        return res.status(400).json({ error: "Password is required." });
    }

    // Check if the username already exists
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ error: "Username already exists. Please choose a different username." });
    }

    // Add the new user to the users array
    users.push({ username, password });

    // Respond with success message
    return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
   return res.send(books); 
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    // Extract the email parameter from the request URL
    const isbn = req.params.isbn;
    // Filter the users array to find users whose email matches the extracted email parameter
    let filtered_books = books.filter((book) => book.isbn === isbn);
    // Send the filtered_users array as the response to the client
    res.send(filtered_books);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // Extract the author name from the request parameters
    const requestedAuthor = req.params.author;

    // Step 1: Obtain all the keys for the 'books' object
    const bookKeys = Object.keys(books);

    // Step 2: Filter books by matching the author
    const filteredBooks = bookKeys
        .map(key => books[key]) // Convert the object into an array of book details
        .filter(book => book.author === requestedAuthor); // Filter books by the requested author

    // Respond with the filtered books
    if (filteredBooks.length > 0) {
        return res.status(200).json({
            message: `Books by author '${requestedAuthor}'`,
            books: filteredBooks
        });
    } else {
        return res.status(404).json({
            message: `No books found for author '${requestedAuthor}'`
        });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    // Extract the author name from the request parameters
    const requestedTitle = req.params.title;

    // Step 1: Obtain all the keys for the 'books' object
    const bookKeys = Object.keys(books);

    // Step 2: Filter books by matching the author
    const filteredBooks = bookKeys
        .map(key => books[key]) // Convert the object into an array of book details
        .filter(book => book.author === requestedTitle); // Filter books by the requested author

    // Respond with the filtered books
    if (filteredBooks.length > 0) {
        return res.status(200).json({
            message: `Books by title '${requestedTitle}'`,
            books: filteredBooks
        });
    } else {
        return res.status(404).json({
            message: `No books found for title '${requestedTitle}'`
        });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const requestedISBN = req.params.isbn;
    const book = Object.values(books).find(book => book.isbn === requestedISBN);

    if (book) {
        return res.status(200).json({
            message: `Reviews for book with ISBN '${requestedISBN}'`,
            reviews: book.reviews || {}
        });
    } else {
        return res.status(404).json({
            message: `No book found with ISBN '${requestedISBN}'`
        });
    }
});

module.exports.general = public_users;
