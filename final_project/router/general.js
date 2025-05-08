const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    const booksArray = Object.values(books);
    Promise.resolve(booksArray)
        .then((data) => {
            res.status(200).send(data); // Send the array in the response
        })
    .catch((err) => {
        res.status(500).json({ message: "Error fetching books" }); // Handle potential errors
    }); 
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    Promise.resolve(books[isbn])
        .then(book => {
            if(book) {
               res.status(200).send(book);
            }
            else{
                res.status(404).json({message: "Book not found"});
            }
        })
        .catch(err => {
            console.error("Error", err);
            res.status(500).json({message: "Internal server error"});
        })
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const requestedAuthor = req.params.author;

  Promise.resolve()
      .then(() => {
          const bookKeys = Object.keys(books);
          const filteredBooks = bookKeys
              .map(key => books[key])
              .filter(book => book.author === requestedAuthor);
          return filteredBooks;
      })
      .then((filteredBooks) => {
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
      })
      .catch((err) => {
          console.error("Error:", err);
          return res.status(500).json({ message: "Internal server error" });
      });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const requestedTitle = req.params.title;

    // Use Promise.resolve to start the Promise chain
    Promise.resolve()
        .then(() => {
            // Step 1: Obtain all the keys for the 'books' object
            const bookKeys = Object.keys(books);

            // Step 2: Filter books by matching the title
            const filteredBooks = bookKeys
                .map(key => books[key])
                .filter(book => book.title === requestedTitle); // corrected to filter by title

            return filteredBooks; // Pass the filtered books to the next .then()
        })
        .then((filteredBooks) => {
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
        })
        .catch((err) => {
             // Catch any errors that might occur during the process
            console.error("Error:", err);
            return res.status(500).json({ message: "Internal server error" });
        });
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
