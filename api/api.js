const express =require('express');
//imported the artist router
const artistsrouter=require('./artists')
//created instance of express router
const apirouter=express.Router();

//mounted the artistrouter to all /artist on apirouter
apirouter.use('/artists',artistsrouter);

//exported the api router
module.exports=apirouter;