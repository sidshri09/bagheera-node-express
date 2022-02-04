const router = require('express').Router();
const mongoose = require('mongoose')
const {Vote, User, Post} = require('./all.model.js');
const authenticationMiddleware = require('./auth.js')


router.route('/').post(authenticationMiddleware,(req,res)=>{
    var post = req.body.id;
    var dir = req.body.dir;
    try{
        var isValid = mongoose.Types.ObjectId.isValid(post); 
        if(isValid && post.length === 24){
            Post.findById(post,(err, postResult)=>{
                if(err) throw err;
                if(postResult){
                    User.findOne(req.username,(err,userResult)=>{
                        if(err) throw err;
                        if(userResult){
                            Vote.findOne({post:postResult,user:userResult},(err, voteResult)=>{
                                if(err) throw err;
                
                                if(dir)
                                {
                                    if(!voteResult)
                                    {
                                        const newVote = new Vote({post:postResult,user:userResult});
                                        newVote.save()
                                        .then(vote => {
                                            postResult.votes.push(vote)
                                            postResult.voters.push({_id:userResult._id,username:userResult.username,email:userResult.email,phone:userResult.phone,profile_pic:userResult.profile_pic})
                                            postResult.save()
                                            res.json("post liked")
                                        })
                                        .catch(err => res.status(400).json(err))

                                        
                                    }
                                    else{
                                        return res.status(409).json({"detail":"user already liked the post"})
                                    }
                                }
                                else{
                                    if(!voteResult){
                                        return res.status(404).json({"detail":"vote not found"})
                                    }else{
                                        postResult.votes=postResult.votes.filter(vote=> {
                                            return(!voteResult._id.equals(vote))
                                        })
                                        postResult.voters=postResult.voters.filter(voter=> {
                                            return(!userResult._id.equals(voter._id))
                                        })
                                        postResult.save()
                                        Vote.findByIdAndDelete(voteResult._id,(err,deleteResult)=>{
                                            if(err) throw err;                                            
                                            res.json({"detail":"vote deleted"})
                                            
                                        })
                                    }
                                }
                            })
                            
                        }
                    })
                }
                else{
                    return res.status(404).json({"detail":"post not found"})
                }
            })
        }else{
            return res.status(400).json({"detail":"bad post id"})
        }
    }catch(error){
        console.error(error);
        return res.status(400).json({"detail":"bad post id"})
    }
    
})




module.exports=router