const router = require('express').Router();
const {Follower, User} = require('./all.model.js');
const mongoose = require('mongoose')
const authenticationMiddleware = require('./auth.js')

router.route('/followers/:following').get(authenticationMiddleware, (req, res)=>{
    const following = req.params.following;
    var followers = []
    Follower.find({following: following}, (err, followerResult)=>{
        if(err) throw err;
        if(followerResult){
            followerResult.map(singleFollower =>{
                User.findById(singleFollower.follower,(err, followerUser)=>{
                    if(err) throw err;
                    if(followerUser){
                        const newUser={id:followerUser._id,username: followerUser.username , createdAt:followerUser.createdAt, updatedAt: followerUser.updatedAt, followers: followerUser.followers, followings: followerUser.followings}
                        return (newUser)
                    }
                })
            })
            console.log("level-3",followers)
            return res.json(followers)
        }else{
            return res.status(404).json({'detail':'no followers found'})
        }
    })

})

router.route('/followings/:follower').get(authenticationMiddleware, (req, res)=>{
    const follower = req.params.follower;
    Follower.find({follower: follower}, (err, followingResult)=>{
        if(err) throw err;
        if(followingResult){
            followingResult.map(singleFollowing =>{
                User.findById(singleFollowing.following,(err, followingUser)=>{
                    if(err) throw err;
                    if(followingUser){
                        const newUser={id:followingUser._id,username: followingUser.username , createdAt:followingUser.createdAt, updatedAt: followingUser.updatedAt, followers: followingUser.followers, followings: followingUser.followings}
                        return res.json(newUser)
                    }
                })
            })
        }else{
            return res.status(404).json({'detail':'no followings found'})
        }
    })

})

router.route('/').post(authenticationMiddleware,(req,res)=>{
    var follower = req.username;
    var following = req.body.following;
    var dir = req.body.dir;
    console.log(req.body)
    try{
        var isFollowingValid = mongoose.Types.ObjectId.isValid(following); 
        if(isFollowingValid && following.length === 24){
            User.findById(following,(err, followingResult)=>{
                if(err) throw err;
                if(followingResult){
                    User.findOne(follower,(err,followerResult)=>{
                        if(err) throw err;
                        Follower.findOne({follower:followerResult, following:followingResult},(err, fresult)=>{
                            if(err) throw err;
                                if(dir)
                                    {
                                        if(!fresult)
                                        {
                                            const newFollower = new Follower({follower:followerResult, following:followingResult})
                                            newFollower.save()
                                            .then(newF => {
                                                followingResult.followers.push({_id:followerResult._id,username:followerResult.username,email:followerResult.email,phone:followerResult.phone,profile_pic:followerResult.profile_pic})
                                                followingResult.save()
                                                followerResult.followings.push({_id:followingResult._id,username:followingResult.username,email:followingResult.email,phone:followingResult.phone,profile_pic:followingResult.profile_pic})
                                                followerResult.save()
                                                res.json("followed successfully")
                                            })
                                            .catch(err => res.status(400).json(err))
                                        }else{
                                            return res.status(409).json({"detail":"already existing following"})
                                        }
                                    }else{
                                        if(!fresult)
                                        {
                                            return res.status(404).json({"detail":"following not found"})
                                        }else{
                                            followingResult.followers=followingResult.followers.filter(follow=> {
                                                return(!fresult.follower.equals(follow._id))
                                            })
                                            followingResult.save()
                                            followerResult.followings=followerResult.followings.filter(follow=> {
                                                return(!fresult.following.equals(follow._id))
                                            })
                                            followerResult.save()
                                            Follower.findByIdAndDelete(fresult._id,(err,deleteResult)=>{
                                                if(err) throw err;                                                
                                                res.json({"detail":"following deleted"})
                                                
                                            })
                                        }

                                    }
                        })
                    })
                }
            })
        }else{
            return res.status(400).json({"detail":"bad following id"})
        }
    }
    catch(error){
        console.error(error)
        return res.status(400).json({"detail":"bad following id"})
    }
})
                            

module.exports=router