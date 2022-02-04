const router = require('express').Router();
const {User} = require('./all.model.js');
const bcrypt= require('bcrypt')
const mongoose = require('mongoose')
const authenticationMiddleware = require('./auth.js')
var _ = require('lodash');


router.route('/').get(authenticationMiddleware,(req,res)=>{
    var s = req.url.split('=');
    const $regex = _.escapeRegExp([string=s[1]]);
    User.find({username: { $regex, $options: 'si'}})
        .then(users => {
            if(users)
            {    
                let newUser=[]
                users.map((user)=>{
                    const singleUser={id:user._id,username: user.username, email:user.email, phone:user.phone , createdAt:user.createdAt, updatedAt: user.updatedAt, profile_pic: user.profile_pic, followers: user.followers, followings: user.followings}
                    newUser.push(singleUser)
                })
                res.json(newUser)
            }else{
                return res.status(404).json({"detail":"no users found"})
            }
        })
        .catch(error => res.status(404).json(error))
});

router.route('/add').post(async(req,res)=>{
    var username,email,password,hashPass;
    if(req.body.username){username = req.body.username;}
    else {res.status(400).json({"detail":"bad request"});}
    if(req.body.email){email = req.body.email;}
    else {res.status(400).json({"detail":"bad request"});}
    if(req.body.password){password = req.body.password; hashPass = await bcrypt.hash(password,10)}
    else {res.status(400).json({"detail":"bad request"});}
     

    const newUser = new User({username, password:hashPass, email:email});
    

    newUser.save()
    .then(user => res.json({username:user.username,email:user.email}))
    .catch(err => res.status(409).json(err))
});

router.route('/:id').get(authenticationMiddleware, (req,res)=>{
    var isValid = mongoose.Types.ObjectId.isValid(req.params.id); 
        if(isValid && req.params.id.length === 24)
            {User.findById(req.params.id)
                .then(user=>{
                    const singleUser={id:user._id,username: user.username,email:user.email, phone:user.phone , createdAt:user.createdAt, updatedAt: user.updatedAt, profile_pic: user.profile_pic, followers: user.followers, followings: user.followings}
                    
                    res.json(singleUser)
                })
                .catch(error => res.status(404).json(error))}
                else{
                    res.status(400).json({"detail":"bad user id"})
                }
})
router.route('/username/:username').get(authenticationMiddleware, (req,res)=>{
    User.findOne({username:req.params.username})
        .then(user=>{
                    const singleUser={id:user._id,username: user.username ,email:user.email, phone:user.phone, createdAt:user.createdAt, updatedAt: user.updatedAt, profile_pic: user.profile_pic, followers: user.followers, followings: user.followings}
                    
                    res.json(singleUser)
                })
        .catch(error => res.status(404).json(error))
               
})

router.route('/changepassword').put((req,res)=>{
    var username,oldPassword,password;
    if(req.body.username){username = req.body.username;}
    else {res.status(400).json({"detail":"bad request"});}
    if(req.body.old_password){oldPassword = req.body.old_password;}
    else {res.status(400).json({"detail":"bad request"});}
    if(req.body.password){password = req.body.password;}
    else {res.status(400).json({"detail":"bad request"});}

    User.findOne({username: username},async(err, userResult)=>{
        if(err) throw err;
        if(userResult){
            try{
                if (await bcrypt.compare(oldPassword, userResult.password)) {
                    const newpass = await bcrypt.hash(password,10)
                    userResult.password = newpass;
                    userResult.save()
                            .then(updateUser => res.json({'detail':'password updated'}))
                            .catch(err => res.status(400).json(err))
                }else{
                    return res.status(401).json({"detail":"unauthorized"})
                }
            }catch(err){
                console.error(err)
            }    
        }
    })
})

router.route('/').put(authenticationMiddleware, (req,res)=>{
    const username = req.username;
    if(!(req.body.phone === null || req.body.phone === '') || 
    !(req.body.email === null || req.body.email === '') ||
    !(req.body.profile_pic === null || req.body.profile_pic === '')){
        console.log(req.body)
        User.findOne(username, (err, userResult)=>{
            if(err) throw err;
            try{
                if(userResult){
                    if(req.body.phone){
                        userResult.phone = req.body.phone;
                    }
                    if(req.body.email){
                        userResult.email = req.body.email;
                    }
                    if(req.body.profile_pic){
                        userResult.profile_pic = req.body.profile_pic;
                    }
                    userResult.save()
                            .then(usr => {
                                res.json({'detail':'user details updated'})
                            })
                            .catch(err => res.status(400).json(err))
                }else{
                    return res.status(404).json({'detail':'user not found'})
                }
            }catch(e){
                console.error(e)
            }
        })
    }else{
        return res.status(400).json({'detail':'bad request'});
    }
    
})

module.exports=router