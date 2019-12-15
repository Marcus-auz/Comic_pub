const express=require('express');
const seriesrouter=express.Router();
const sqlite3=require('sqlite3');
const issuerouter=require('./issues');
//mounted issue router on the specefied route
issuerouter.use('/:seriesId/issues',issuerouter);
//database connected
const db=new sqlite3.Database(process.env.TEST_DATABASE ||'./database.sqlite');

//retrieve specefied series from database and attach it to request object
seriesrouter.param('seriesId',(req,res,next,seriesId)=>{
    const sql='SELECT * FROM Series WHERE Series.id=$seriesId';
    const value={$seriesId:seriesId};
    db.get(sql,value,(error,series)=>{
        if(error){
            next(error);
        }else if(series){
            req.series=series;
            next();
        }else{
            res.sendStatus(404)
        }
    });
});

//retrieve all series that exist(return error if not such table)
seriesrouter.get('/',(req,res,next)=>{
    db.all('SELECT * FROM Series',(err,series)=>{
        if(err){
            next(err);
        }else{
            res.status(200).json({series:series});
        }
    });
});
//retrieve the series on request object (using param route)
seriesrouter.get('/:seriesId',(req,res,next)=>{
    res.status(200).json({series:req.series});
});

//if name and desc field are missing then send error else add the data in the database and update the series table
seriesrouter.post('/',(req,res,next)=>{
    const name=req.body.series.name;
    const description=req.body.series.description;
    if(!name || !description){  //checking if all fields are present which are required
        return res.sendStatus(400);
    }
    //query to update the passed data if everything's correct
    const sql=('INSERT INTO Series(name,description)VALUES($name,$description)');
    const values={
        $name:name,
        $description:description
    };
    db.run(sql,values,function(error){
        if(error){
            next(error);
        }else{
            db.get(`SELECT * FROM Series Where Series.id=${this.lastID}`,(err,series)=>{    //retrieve the updated series
                res.status(201).json({series:series});
            });
        }
    });

});
//update the series with the corresponding id if all fields are present and that id is present
seriesrouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name,
          description = req.body.series.description;
    if (!name || !description) {
      return res.sendStatus(400);
    }
    //query to update the series
    const sql = 'UPDATE Series SET name = $name, description = $description ' +
        'WHERE Series.id = $seriesId';
    const values = {
      $name: name,
      $description: description,
      $seriesId: req.params.seriesId
    };
  
    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Series WHERE Series.id = ${req.params.seriesId}`,
          (error, series) => {
            res.status(200).json({series: series});
          });
      }
    });
  });

//this series should not have any issues and if no issue then delete the series
//foreign and primary key are used to find the corresponding series with that id after verifying that series has no issue
seriesrouter.delete('/:issueId',(req,res,next)=>{
    const issueSql='SELECT * FROM Issue WHERE Issue.series_id=$seriesId';
    const issueValues={$seriesId:req.param.seriesId};
    db.get(issueSql,issueValues,(err,issue)=>{
        if(err){
            next(err);
        }else if(issue){
            res.sendStatus(400);
        }else{
            const deleteSql='DELETE FROM Series WHERE Series.id=$seriesId';
            const deletevalue={$seriesId:req.param.seriesId};

            db.run(deleteSql,deletevalue,(err,issue)=>{
                if(err){
                    next(err);
                }else{
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports=seriesrouter;