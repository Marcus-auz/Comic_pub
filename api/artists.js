const express = require('express');
const sqlite3=require('sqlite3');

//created express router instance
const artistsrouter=express.Router();
//if test datbase set then load it else use database.sqlite
const db=new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//app param
artistsrouter.param('artistId',(req,res,next,artistId)=>{
    const sql='SELECT * FROM Artist WHERE Artist,Id=$artistId';
    const values={$artistId:artistId};
    db.get(sql,values,(error,artist)=>{
        if(err){
            next(err);
        }else if(artist){
            res.artist=artist;
            next();
        }else{
            res.sendStatus(404);
        }
    })
});

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

///api/artist/:artistId 
artistsrouter.get('/:artistId',(req,res,next)=>{
    res.statusCode(200).json({artist:req.artist});
});
//post request to check all artist objects
artistsrouter.post('/',(req,res,err)=>{
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    }
    //if(is_currently_employed!=1)is_currently_employed=1;
    const sql = 'INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)';
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed
    };

    db.run(sql, values, function(error) {
        if(error){
            next(error);
        }else{
            db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`,
            (error, artist) => {
                res.status(201).json({artist: artist});
            });
        }
    });
});

//put handler to check all required values
artistsrouter.put('/:artistId',(req,res,next)=>{
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    }

    const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $artistId';
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed,
        $artistId: req.params.artistId
    };

    db.run(sql, values, (error) => {
        if(error){
            next(error);
        }else{
            db.get(`SELECT * FROM Artist WHERE Artist,id=${req.param.artistId}`,(error,artist)=>{
                res.status(200).json({artist:artist});
            });
        }
    });
});

artistsrouter.delete('/:artistId',(req,res,next)=>{
    const sql = 'UPDATE Artist SET is_currently_employed=0 WHERE Artist.id=$artistId';
    const values={$artistId:req.param.artistId};

    db.run(sql,values,(error)=>{
        if(error){
            next(error);
        }else{
            db.get(`SELECT * FROM Artist WHERE Artist.Id=${req.param.artistId}`,
            (error,artist)=>{
                res.status(200).json({artist:artist});
            });
        }
    })
})

//exported the router
module.exports=artistsrouter;