const express=require('express');
const issuerouter=express.Router({mergeParams:true});
const sqlite3=require('sqlite3');
const db=new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

issuerouter.param('issueId',(req,res,next,issueId)=>{
    const sql='SELECT * FROM ISSUE WHERE issue.Id=$issueId ';
    const values={
        $issueId:issueId
    };
    db.get(sql,values,(err,issue)=>{
        if(err){
            next(err);
        }else if(issue){
            next();
        }else{
            res.sendStatus(400);
        }
    });
});

issuerouter.get('/',(req,res,next)=>{
    const sql='SELECT * FROM Issue WHERE Issue.series_id=$seriesId';
    const values={
        $seriesId:req.param.seriesId
    };
    db.all(sql,value,(err,issue)=>{
        if(err){
            next(err);
        }else{
            res.status(200).json({issue:issue});
        }
    });
});

issuerouter.post('/',(req,res,next)=>{
    const name=req.body.issue.name;
    const issueNumber=req.body.issue.issueNumber;
    const publicationDate=req.body.issue.publicationDate;
    const artistId=req.body.issue.artistId;
    const artistSql='SELECT * FROM Artist WHERE Artist.id=$artistid';
    const artistValues={$artistId:artistId};
    db.get(artistSql,artistValues,(error,issue)=>{
        if(error){
            next(error);
        }else{
            if(!name || !issueNumber || !publicationDate || !artistId){
                return res.statusCode(400);
            }
            const sql='INSERT INTO Issue(name,issueNumber,publicationDate,artistId,seriesId) VALUES($name,$issueNumber,$publicationDate,$artistId,$seriesId)';
            const values={
                $name:name,
                $issueNumber:issueNumber,
                $publicationDate:publicationDate,
                $artistId:artistId,
                $seriesId:seriesId
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

issuerouter.put('/:issueId',(req,res,next)=>{
    const name=req.body.issue.name;
    const issueNumber=req.body.issue.issueNumber;
    const publicationDate=req.body.issue.publicationDate;
    const artistId=req.body.issue.artistId;
    const artistSql='SELECT * FROM Artist WHERE Artist.id=$artistid';
    const artistValues={$artistId:artistId};
    db.get(artistSql,artistValues,(err,issue)=>{
        if(err){
            next(err);
        }else{
            if(!name || !issueNumber || !publicationDate || !artistId){
                return res.statusCode(400);
            }
            const sql='UPDATE Issue SET name=$name,issue_number=$issueNumber'+
                        'publication_date=$publication,artistId=$artist_Id'+
                         'WHERE Issue.id=$IssueId';
            const values={
                $name:name,
                $issueNumber:issueNumber,
                $publicationDate:publicationDate,
                $artistId:artistId,
                $issueId:req.param.issueId
            };
            db.run(sql,values,(err,issue)=>{
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

issuerouter.delete('/:issueId',(req,res,next)=>{
    const sql='DELETE FROM Issue WHERE Issue.id=$issueId';
    const values={$issueId:req.param.issueId};

    db.run(sql,values,(err,issue)=>{
        if(err){
            next(err);
        }
        else{
            res.sendStatus(204);
        }
    });
});

module.exports=issuerouter;