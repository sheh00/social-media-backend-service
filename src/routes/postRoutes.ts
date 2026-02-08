import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
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

export default router;