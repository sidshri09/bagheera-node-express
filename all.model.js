const mongoose = require('mongoose')


const userSchema2 = new mongoose.Schema({
    username:{
        type: String
    },
    email:{
        type: String
    },
    phone:{
        type: String
    },
    profile_pic:{
        type: String
    },
},
    {
        timestamps: true,
    }
);
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password:{
    type: String,
    required: true,
    minlength: 8
    },
    email:{
        type: String,
        required: true,
        unique:true,
        match: /.+\@.+\..+/
    },
    phone:{
        type: String,
        required: false,
        minlength: 10
    },
    profile_pic:{
        type: String,
        required: true,
        default:'https://nwsid.net/wp-content/uploads/2015/05/dummy-profile-pic-300x300.png'
    },
    refreshToken:{
        type: String,
        required: false
    },
    followers:[userSchema2],
    followings:[userSchema2]

},
    {
        timestamps: true,
    }
);


const postSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true,
        unique: false,
        minlength: 1
    },
    user: userSchema2,
    parent_post: {type: mongoose.Schema.Types.ObjectId, ref:'Post'},
    votes: [{type: mongoose.Schema.Types.ObjectId, ref:'Vote'}],
    voters:[userSchema2]
},
{
    timestamps: true,
}
);

const voteSchema = new mongoose.Schema({
    post:{type: mongoose.Schema.Types.ObjectId, ref:'Post'},
    user:{type: mongoose.Schema.Types.ObjectId, ref:'User'}
},
{
    timestamps: true,
})

const followerSchema = new mongoose.Schema({
    follower:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    following:{type:mongoose.Schema.Types.ObjectId, ref:'User'}
},
{
    timestamps: true,
})

const Post = mongoose.model('Post', postSchema);
const User = mongoose.model('User', userSchema);
const Vote = mongoose.model('Vote', voteSchema);
const Follower = mongoose.model('Follower', followerSchema);

module.exports={Post,User,Vote,Follower}
