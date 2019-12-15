const express =require('express');
//imported the artist router
const artistsrouter=require('./artists')
//imported series router
const seriesrouter=require('./series');
//created instance of express router
const apirouter=express.Router();

//mounted the artistrouter to all /artist on apirouter
apirouter.use('/artists',artistsrouter);
//mounting the series router on all /series router
seriesrouter.use('/series',seriesrouter);

//exported the api router
module.exports=apirouter;