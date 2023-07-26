
const Posts = require('../models/postModel')
const Comments = require('../models/commentModel')
const Users = require('../models/userModel')
class APIFeatures{
    constructor(query,queryString){
        this.query=query;
        this.queryString=queryString
    }

    paginating(){
        const page =this.queryString.page * 1 || 1
        const limit=this.queryString.limit * 1  || 3
        const skip =(page-1)*limit;
        this.query=this.query.skip(skip).limit(limit);
        return this;
    }
}
const postCtrl = {
    createPost: async (req,res)=>{
        try {
            const {content,images}=req.body
            if(images.length === 0){
                return res.status(400).json({msg: "please add photo to post"})
            }
            const newPost=new Posts({content,images,user:req.user._id})
            await newPost.save();
            res.json({msg:"successfully created post",newPost:{
                ...newPost._doc,
                user:req.user
            }})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getPost: async (req,res)=>{
        try {
            console.log(req.user)
            const features= new APIFeatures(Posts.find({
                user:[...req.user.following,req.user._id]
            }),req.query).paginating();

           const posts=await features.query.sort('-createdAt').populate("user likes","avatar username fullname followers").populate({path:"comments",populate:{
            path:"user likes",
            select:"-password"
           }})  
           
           res.json({
            msg: 'Success!',
            result: posts.length,
            posts
        })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
        // try {
        //     console.log("asbabsj")
        //    const posts=await Posts.find({user:[...req.user.following,req.user._id]}).sort('-createdAt').populate("user likes","avatar username fullname").populate({path:"comments",populate:{
        //     path:"user likes",
        //     select:"-password"
        //    }})  
           
        //    res.json({
        //     msg: 'Success!',
        //     result: posts.length,
        //     posts
        // })

        // } catch (err) {
        //     return res.status(500).json({msg: err.message})
        // }
    },
    updatePost: async (req,res)=>{
        try {
           
            const {content,images}=req.body
            const post= await Posts.findByIdAndUpdate({_id:req.params.id},{
                content,images
            }).populate("user likes","avatar username fullname").populate({path:"comments",populate:{
                path:"user likes",
                select:"-password"
               }})  
            res.json({
                msg: 'updated!',
                newPost:{
                    ...post._doc,content,images
                }
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    // getuserPosts: async (req,res)=>{
    //     try {
        
            
    //         const posts = await Posts.find({user:req.params.id}).sort("-createdAt");

          

    //         res.json({
    //            posts,result:posts.length
    //         })
    //     } catch (err) {
    //         return res.status(500).json({msg: err.message})
    //     }
    // },
    likePost: async (req,res)=>{
        try {
            const post = await Posts.find({_id: req.params.id, likes: req.user._id})
            console.log(post)
            if(post.length>0) return res.status(400).json({msg: "You liked this post."})
            
            
            const like = await Posts.findByIdAndUpdate({_id:req.params.id},
              {$push:{likes:req.user._id}},{new:true}
            )
            if(!like){
                return res.status(400).json({msg: "this post not exist"})
            }

            res.json({
                msg: 'liked!'
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unlikePost: async (req,res)=>{
        try {
          
            
            const like = await Posts.findByIdAndUpdate({_id:req.params.id},
              {$pull:{likes:req.user._id}},{new:true}
            )
            console.log(like)
            if(!like){
                return res.status(400).json({msg: "this post not exist"})
            }
            res.json({
                msg: 'unliked!'
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getuserPosts: async (req,res)=>{
        try {
        const features=new APIFeatures(Posts.find({user:req.params.id}), req.query).paginating()
            
            const posts = await features.query.sort("-createdAt");

          

            res.json({
               posts,result:posts.length
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getuserPost: async (req,res)=>{
        try {
        
            
            const post = await Posts.findById(req.params.id).populate("user likes","avatar username fullname followers").populate({path:"comments",populate:{
                path:"user likes",
                select:"-password"
               }})

               if(!post){
                return res.status(400).json({msg: "this post not exist"})
            }

            res.json({
               post
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getuserDiscover: async (req,res)=>{
        try {
        //     const features= new APIFeatures(Posts.find({
        //         user:{$nin:[...req.user.following,req.user._id]}
        //     }),req.query).paginating();

        //    const posts=await features.query.sort('-createdAt')  
           
      
        
        const newArr = [...req.user.following, req.user._id]

        const num  = req.query.num || 9
        const posts = await Posts.aggregate([
            { $match: { user :{ $nin: newArr } } },
            { $sample: { size: Number(num) } },
        ])
        return res.json({
            msg: 'Success!',
            result: posts.length,
            posts
        })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deletePost: async (req,res)=>{
        try {
        
            
           const post=await Posts.findOneAndDelete({_id:req.params.id,user:req.user._id})

           await Comments.deleteMany({_id:{$in:post.comments}});

            res.json({
               msg:"deleted post",
               Npost:{
                ...post,
user:req.user
               }
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    savePost: async (req,res)=>{
        try {
        
            
            const user = await Users.find({_id: req.user._id, saved: req.params.id})
  
            if(user.length>0) return res.status(400).json({msg: "You sabed this post."})
            
            
            const save = await Users.findByIdAndUpdate({_id:req.user._id},
              {$push:{saved:req.params.id}},{new:true}
            )
            if(!save){
                return res.status(400).json({msg: "this user does not exist"})
            }

            res.json({
                msg: 'Saved post'
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unsavePost: async (req,res)=>{
        try {
        
            
           
            
            const save = await Users.findByIdAndUpdate({_id:req.user._id},
              {$pull:{saved:req.params.id}},{new:true}
            )
            if(!save){
                return res.status(400).json({msg: "this user does not exist"})
            }

            res.json({
                msg: 'unSaved post'
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getsavePost: async (req,res)=>{
        try {
        
            
           const features=new APIFeatures(Posts.find({
            _id:{$in: req.user.saved}
           }),req.query).paginating()
            
           
            const savedp=await features.query.sort("-createdAt")


            res.json({
                savedp,
                result:savedp.length
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
}



module.exports = postCtrl
