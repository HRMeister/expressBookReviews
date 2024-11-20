const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean

}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60*60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from the URL
    const username = req.session.authorization.username; // Get the username from the session
    const review = req.query.review; // Get the review from the query parameters
  
    // Validate the request
    if (!username) {
      return res.status(401).send({ message: "You must be logged in to post a review." });
    }
    if (!review) {
      return res.status(400).send({ message: "Review content is required." });
    }
    if (!books[isbn]) {
      return res.status(404).send({ message: "Book not found." });
    }
  
    // Add or update the review
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    books[isbn].reviews[username] = review;
  
    return res.send({
      message: "Review added/updated successfully.",
      book: books[isbn],
    });
});

regd_users.delete("/auth/review/:isbn",(req,res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (books[isbn].reviews[username]){
        delete books[isbn].reviews[username];
    }

    return res.send({
        message: "Review deleted successfully.",
        book: books[isbn],
      });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
