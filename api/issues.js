const express=require('express');
const issuerouter=express.Router({mergeParams:true});
const sqlite3=require('sqlite3');
const db=new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//if issue with the supplied issueId exist
issuerouter.param('issueId',(req,res,next,issueId)=>{
    const sql='SELECT * FROM Issue WHERE Issue.id=$issueId ';
    const values={
        $issueId:issueId
    };
    db.get(sql,values,(err,issue)=>{
        if(err){
            next(err);
        }else if(issue){
            next();
        }else{
            res.sendStatus(404);
        }
    });
});
//get all issues of a specified series
issuerouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Issue WHERE Issue.series_id = $seriesId';
    const values = { $seriesId: req.params.seriesId};
    db.all(sql, values, (error, issues) => {
      if (error) {
        next(error);
      } else {
        res.status(200).json({issues: issues});
      }
    });
  });
// add the new issue in the database and should return error if not enough data or if the artist is missing
issuerouter.post('/',(req,res,next)=>{
    const name=req.body.issue.name;
    const issueNumber=req.body.issue.issueNumber;
    const publicationDate=req.body.issue.publicationDate;
    const artistId=req.body.issue.artistId;
    const artistSql='SELECT * FROM Artist WHERE Artist.id=$artistid';
    const artistValues={$artistId:artistId};
    db.get(artistSql,artistValues,(error,artist)=>{
        if(error){
            next(error);
        }else{
            //error if not enough data
            if(!name || !issueNumber || !publicationDate || !artist){
                return res.sendStatus(400);
            }
            //query to update the database
            const sql='INSERT INTO Issue(name,issue_Number,publication_date,artist_Id,series_Id) VALUES($name,$issueNumber,$publicationDate,$artistId,$seriesId)';
            const values={
                $name:name,
                $issueNumber:issueNumber,
                $publicationDate:publicationDate,
                $artistId:artistId,
                $seriesId:req.param.seriesId
            };
            db.run(sql,values,function(err){
                if(err){
                    next(err);
                }else{
                    db.get(`SELECT * FROM Issue WHERE Issue.id=${this.lastID} `,(error,issue)=>{
                        res.status(201).json({issue:issue});
                    });
                }
        
            });
        }
    }); 
});

//update the issue in db and return the newly updated series
issuerouter.put('/:issueId',(req,res,next)=>{
    const name=req.body.issue.name;
    const issueNumber=req.body.issue.issueNumber;
    const publicationDate=req.body.issue.publicationDate;
    const artistId=req.body.issue.artistId;
    const artistSql='SELECT * FROM Artist WHERE Artist.id=$artistid';
    const artistValues={$artistId:artistId};
    db.get(artistSql,artistValues,(err,artist)=>{
        if(err){
            next(err);
        }else{
            if(!name || !issueNumber || !publicationDate || !artist){
                return res.statusCode(400);
            }
            const sql='UPDATE Issue SET name=$name,issue_number=$issueNumber'+
                        'publication_date=$publicationDate,artistId=$artist_Id'+
                         'WHERE Issue.id=$IssueId';
            const values={
                $name:name,
                $issueNumber:issueNumber,
                $publicationDate:publicationDate,
                $artistId:artistId,
                $issueId:req.param.issueId
            };
            db.run(sql,values,function(err){
                if(err){
                    next(err);
                }else{
                    db.get(`SELECT * FROM Issue WHERE Issue.Id=${req.param.issueId}`,(err,issue)=>{
                        res.status(200).json({issue:issue});
                    });
                }
            });                
        }
    });
});

//delete issue with the specefied issueId
issuerouter.delete('/:issueId',(req,res,next)=>{
    const sql='DELETE FROM Issue WHERE Issue.id=$issueId';
    const values={$issueId:req.param.issueId};

    db.run(sql,values,(err)=>{
        if(err){
            next(err);
        }
        else{
            res.sendStatus(204);
        }
    });
});

module.exports=issuerouter;