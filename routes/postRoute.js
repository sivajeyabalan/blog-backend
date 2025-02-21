const express = require('express');
const router = express.Router();
const { getPosts, getPostById, createPost, updatePost, deletePost } = require('../controllers/postController');  // Import the controller
const auth = require('../middleware/authenication')
// Example route
router.get('/', getPosts);
router.get('/:id', getPostById);

router.post('/', auth , createPost);
router.put('/:id', auth , updatePost);
router.delete('/:id' , auth , deletePost);

module.exports = router;  // Ensure this is exporting the router
