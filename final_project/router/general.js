const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios').default;

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',async (req, res) => {
    try{
        const bookList = await axios.get(books)
        res.send(JSON.stringify(bookList,null,4));
    }
    catch(error){
        res.status(500).send({
            error: "Could not get book list"
        });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async (req, res) => {
    const ISBN = req.params.isbn;

    try {
        const book = await axios.get(books[ISBN])
        if(book){
            res.send(book);
        }
    }
    catch(error){
        res.status(500).send({
            error: "No book with that ISBN"
        });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',async (req, res) => {
   const author = req.params.author;
   try{
        const bookList = await axios.get(books)
        const bookKeys = Object.keys(bookList);
        const matchBooks = [];
        for(const key of bookKeys){
            if(books[key].author === author){
                matchBooks.push(books[key]);
            }
        }
        if (matchBooks.length === 0) {
        return res.status(404).send({ message: "No books found for the given author." });
        }
        res.send(matchBooks);
   }
   catch(error){
        res.status(500).send({
        error: "No book with that author"
    });
   }
});

// Get all books based on title
public_users.get('/title/:title',async (req, res)=> {
    const title = req.params.title;
    try{
        const bookList = await axios.get(books)
        const bookKeys = Object.keys(bookList);
        const matchBooks = [];
        for(const key of bookKeys){
            if(books[key].title === title){
                matchBooks.push(books[key]);
            }
        }
        if (matchBooks.length === 0) {
        return res.status(404).send({ message: "No books found for the given author." });
        }
    res.send(matchBooks);
    }
    catch(error){
        res.status(500).send({
            error: "No book with that title"
    });
    }   
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn].reviews)
});

module.exports.general = public_users;
