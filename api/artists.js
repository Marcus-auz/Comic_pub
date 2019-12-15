const express = require('express');
const sqlite3=require('sqlite3');

//created express router instance
const artistsrouter=express.Router();
//if test datbase set ,then load it else use database.sqlite
const db=new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//router param (to select the artist with that id if not then return error)
artistsrouter.param('artistId',(req,res,next,artistId)=>{
    const sql='SELECT * FROM Artist WHERE Artist.Id=$artistId'; //get artist with the passes id
    const values={$artistId:artistId};
    db.get(sql,values,(error,artist)=>{
        if(error){
            next(error);    //if error send it to middleware chain
        }else if(artist){
            req.artist=artist;  //if artist found attached it to the req object
            next();
        }else{
            res.sendStatus(404);    //if no artist with that id send 404 error
        }
    });
});

//get method for the /api/artist path (return all artist who are currently employed)
artistsrouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE Artist.is_currently_employed = 1', (err, artists) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({artists: artists});//key artist and value of the retrieved artist
        }
    });
});

//  " /api/artist/:artistId  " //grabbed artist in the param is send as a response with a json body
artistsrouter.get('/:artistId',(req,res,next)=>{
    res.status(200).json({artist:req.artist});
});
//post request to add a new artist 
artistsrouter.post('/',(req,res,next)=>{
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    //adding the artist as currently employed if not set already
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);     // checked if all parameters are present in the artist info passed
    }
    //sql query to add the new artist with the passed parameter
    const sql = 'INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)';
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed
    };
    //if no error then retrieve the newly created artist
    db.run(sql, values, function(error) {
        if(error){
            next(error);
        }else{
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`,
            (error, artist) => {
                res.status(201).json({artist: artist}); //sended the updated artist in the response body
            });
        }
    });
});

//updating the artist with the supplied artist id and updated attributes
artistsrouter.put('/:artistId',(req,res,next)=>{
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    }
    //sql query to update the data fields of the artist
    const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, ' +
      'biography = $biography, is_currently_employed = $isCurrentlyEmployed ' +
      'WHERE Artist.id = $artistId';
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed,
        $artistId: req.params.artistId
    };
    //retrived the updated artist
    db.run(sql, values, (error) => {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`,
            (error, artist) => {
              res.status(200).json({artist: artist});
            });
        }
    });
});

//instead of deleting the artist making them unemployed since in our root path we are taking only employed artists
artistsrouter.delete('/:artistId', (req, res, next) => {
    //sql query to update the emplyment status of the artistid passed
    const sql = 'UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = $artistId';
    const values = {$artistId: req.params.artistId};
    //send updated artist 
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`,
          (error, artist) => {
            res.status(200).json({artist: artist});
          });
      }
    });
  });

//exported the router
module.exports=artistsrouter;