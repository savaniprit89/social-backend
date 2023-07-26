const router = require('express').Router()
const postCtrl=require('../controllers/postCtrl');
const auth = require('../middleware/auth');
router.route('/posts')
    .post(auth, postCtrl.createPost)
    .get(postCtrl.getPost)

router.route('/posts/:id')
    .patch(auth, postCtrl.updatePost)
    .get(auth,postCtrl.getuserPost)
    .delete(auth,postCtrl.deletePost)

router.route('/posts/:id/like')
    .patch( auth,postCtrl.likePost)
router.route('/posts/:id/unlike')
    .patch( auth,postCtrl.unlikePost)
router.get('/user_posts/:id',auth,postCtrl.getuserPosts);
router.get('/post_discover',auth,postCtrl.getuserDiscover);
router.patch('/savepost/:id',auth,postCtrl.savePost);
router.patch('/unsavepost/:id',auth,postCtrl.unsavePost);
router.get('/getsavepost',auth,postCtrl.getsavePost);
module.exports=router