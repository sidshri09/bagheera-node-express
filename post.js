const router = require('express').Router();
const {Post, User, Vote} = require('./all.model.js');
const authenticationMiddleware = require('./auth.js');
const mongoose = require('mongoose');
var _ = require('lodash');


router.route('/').get(authenticationMiddleware, (req,res)=>{
    var s = req.url.split('=');
    const $regex = _.escapeRegExp([string=s[1]]);
    Post.find({content: { $regex, $options: 'si'}})
        .then(posts => {
            return res.json(posts)
        })
        .catch(err => console.error(err))
})

router.route('/:post_id').get(authenticationMiddleware, (req,res)=>{
    var isValid = mongoose.Types.ObjectId.isValid(req.params.post_id); 
        if(isValid && req.params.post_id.length === 24)
        {
            Post.findById(req.params.post_id)
            .then(post => {
                return res.json(post)
            })
            .catch(err => console.error(err))
        }
        else{
            res.status(400).json({"detail":"bad request"})
        }
})

router.route('/replies/:post_id').get(authenticationMiddleware, (req,res)=>{
    var isValid = mongoose.Types.ObjectId.isValid(req.params.post_id); 
        if(isValid && req.params.post_id.length === 24)
        {
            Post.find({parent_post:req.params.post_id})
            .then(post => {
                if(post){return res.json(post)}
                else(res.status(404).json({"detail":"no replies found"}))
            })
            .catch(err => console.error(err))
        }
        else{
            res.status(400).json({"detail":"bad request"})
        }
})

router.route('/').post(authenticationMiddleware,(req,res)=>{
    var content, parent_post
    if(req.body.content){content = req.body.content;}
    else{(res.status(400).json({"detail":"bad request"}))}
    if(req.body.parent_post){
        var isValid = mongoose.Types.ObjectId.isValid(req.body.parent_post); 
        if(isValid && req.body.parent_post.length === 24){
            parent_post = req.body.parent_post;
        }else{
            res.status(400).json({"detail":"bad request: invalid parent post"})
        }
    }
    User.findOne(req.username,(err,result)=>{
        if(err) throw err;
        if(result){
            const newPost = new Post({content, parent_post, user: {username:result.username, email:result.email, phone:result.phone, profile_pic:result.profile_pic}});
            newPost.save()
            .then(post => res.json(post))
            .catch(err => console.log(err))
        }
    })

})

router.route('/:id').put(authenticationMiddleware,(req,res)=>{
    var content;
    if(req.body.content){content = req.body.content;}
    else(res.status(400).json({"detail":"bad request"}))
    var isValid = mongoose.Types.ObjectId.isValid(req.params.id); 
        if(isValid && req.params.id.length === 24)
        {
        Post.findById(req.params.id)
            .then(post => {
                post.content = content
                post.save()
                    .then(updatedPost => res.json(updatedPost))
                    .catch(err => console.log(err))
            })
            .catch(err => res.status(404).json({"detail":"post not found"}))
        }
        else{
            res.status(400).json({"detail":"bad request: invalid post id"})
        }
})

router.route('/:id').delete(authenticationMiddleware,(req,res)=>{
    var isValid = mongoose.Types.ObjectId.isValid(req.params.id); 
    if(isValid && req.params.id.length === 24)
    {
        Post.deleteOne({_id:req.params.id})
            .then(deletedPost => res.json({"detail":"post deleted",deletedPost}))
            .catch(err => res.status(400).json(err))
    }else{
        res.status(400).json({"detail":"invalid post id"})
    }
})

module.exports=router