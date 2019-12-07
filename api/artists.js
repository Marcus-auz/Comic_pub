const express = require('express');
const sqlite3=require('sqlite3');

//created express router instance
const artistsrouter=express.Router();
//if test datbase set then load it else use database.sqlite
const db=new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//get method for the /api/artist path
artistsrouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE Artist.is_currently_employed = 1', (err, artists) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({artists: artists});
        }
    });
});


//exported the router
module.exports=artistsrouter;