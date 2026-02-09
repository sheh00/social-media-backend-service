import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { validatePost } from '../middleware/validationMiddleware';




import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getUserPosts
} from '../controllers/postController';

const router = express.Router();

// All post routes require authentication
router.post('/', authenticate, createPost);
router.get('/', authenticate, getAllPosts);
router.get('/my-posts', authenticate, getUserPosts);
router.get('/:id', authenticate, getPostById);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/', authenticate, validatePost, createPost);
router.put('/:id', authenticate, validatePost, updatePost);
export default router;