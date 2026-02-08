import { Request, Response } from 'express';
import Post from '../models/Post';
import User from '../models/User';

// Helper to safely get numeric ID
const getNumericId = (id: string | string[] | undefined): number | undefined => {
  if (!id) return undefined;
  if (Array.isArray(id)) return Number(id[0]);
  return Number(id);
};

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const user_id = req.user?.user_id;

    if (!content || content.trim() === '') {
      res.status(400).json({ message: 'Content is required' });
      return;
    }

    if (!user_id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const post = await Post.create({
      user_id: Number(user_id),
      content,
      created_at: new Date(),
      updated_at: new Date()
    });

    const postWithAuthor = await Post.findByPk(post.post_id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'user_name', 'first_name', 'last_name', 'profile_image_url']
      }]
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: postWithAuthor
    });
  } catch (error: any) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.findAll({
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'user_name', 'first_name', 'last_name', 'profile_image_url']
      }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      message: 'Posts retrieved successfully',
      count: posts.length,
      posts
    });
  } catch (error: any) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getNumericId(req.params.id);

    if (!id) {
      res.status(400).json({ message: 'Invalid post ID' });
      return;
    }

    const post = await Post.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'user_name', 'first_name', 'last_name', 'profile_image_url']
      }]
    });

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    res.status(200).json({
      message: 'Post retrieved successfully',
      post
    });
  } catch (error: any) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getNumericId(req.params.id);
    const { content } = req.body;
    const user_id = req.user?.user_id;

    if (!id) {
      res.status(400).json({ message: 'Invalid post ID' });
      return;
    }

    if (!content || content.trim() === '') {
      res.status(400).json({ message: 'Content is required' });
      return;
    }

    if (!user_id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const post = await Post.findByPk(id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (post.user_id !== Number(user_id)) {
      res.status(403).json({ message: 'Not authorized to update this post' });
      return;
    }

    post.content = content;
    post.updated_at = new Date();
    await post.save();

    const updatedPost = await Post.findByPk(post.post_id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'user_name', 'first_name', 'last_name', 'profile_image_url']
      }]
    });

    res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error: any) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getNumericId(req.params.id);
    const user_id = req.user?.user_id;

    if (!id) {
      res.status(400).json({ message: 'Invalid post ID' });
      return;
    }

    if (!user_id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const post = await Post.findByPk(id);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    if (post.user_id !== Number(user_id)) {
      res.status(403).json({ message: 'Not authorized to delete this post' });
      return;
    }

    await post.destroy();

    res.status(200).json({
      message: 'Post deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const posts = await Post.findAll({
      where: { user_id: Number(user_id) },
      include: [{
        model: User,
        as: 'author',
        attributes: ['user_id', 'user_name', 'first_name', 'last_name', 'profile_image_url']
      }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      message: 'User posts retrieved successfully',
      count: posts.length,
      posts
    });
  } catch (error: any) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
