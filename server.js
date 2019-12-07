//imported all packages required
const bodyparser=require('body-parser');
const cors=require('cors');
const morgan=require('morgan');
const errorhandler=require('errorhandler');
const express= require('express');

//imported the apirouter
const apirouter=require('./api/api');

//created instance of the express app
const app =express();
//port set to env port value else 8081
const PORT= process.env.PORT || 8081

//used middleware for all the routes
app.use(bodyparser.json());
app.use(cors());
app.use(morgan('dev'))

//mounted apirouter for all routes of /api
app.use('/api',apirouter);

app.use(errorhandler());

//server started
app.listen(PORT,()=>{
    console.log(`sever running on port ${PORT}`);
});

//exported the express app
module.exports=app;
