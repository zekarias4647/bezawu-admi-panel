const express = require('express');

const { check, validationResult, param } = require('express-validator');
const router = express.Router();
const { query } = require('../connection/db');
const authMiddleware = require('../middleware/auth');

// Get all stories
router.get('/stories-get', authMiddleware, async (req, res) => {
    try {


        const text = `
            SELECT 
                s.*,
                (SELECT COUNT(*) FROM story_comments_and_likes WHERE story_id = s.id AND type = 'comment')::int as comments_count,
                (SELECT COUNT(*) FROM story_comments_and_likes WHERE story_id = s.id AND type = 'like')::int as likes_count
            FROM stories s
            ORDER BY s.created_at DESC
        `;

        const result = await query(text);

        res.json(result.rows);
    } catch (err) {
        console.error('[API] Error fetching stories:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Get single story detail
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const text = `
            SELECT 
                s.*,
                (SELECT COUNT(*) FROM story_comments_and_likes WHERE story_id = s.id AND type = 'comment')::int as comments_count,
                (SELECT COUNT(*) FROM story_comments_and_likes WHERE story_id = s.id AND type = 'like')::int as likes_count
            FROM stories s
            WHERE s.id = $1
        `;
        const result = await query(text, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[API] Error fetching story:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Create a new story
router.post('/stories-post', [
    authMiddleware,
    check('title', 'Title is required').not().isEmpty().trim().escape(),
    check('video_url', 'Video URL is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { title, video_url, link, description } = req.body;
        const { branchId, supermarketId } = req.user;

        if (!title || !video_url) {
            return res.status(400).json({ message: 'Title and Video URL are required' });
        }

        const text = `
            INSERT INTO stories (title, video_url, link, description, branch_id, supermarket_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const result = await query(text, [title, video_url, link, description, branchId, supermarketId]);

        res.status(201).json({
            message: 'Story created successfully',
            story: result.rows[0]
        });
    } catch (err) {
        console.error('[API] Error creating story:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Toggle active status
router.patch('/:id/toggle', [
    authMiddleware,
    param('id', 'Invalid Story ID').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        const result = await query(
            'UPDATE stories SET is_active = NOT is_active WHERE id = $1 RETURNING is_active',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Story not found' });
        }

        res.json({
            message: 'Story status updated',
            is_active: result.rows[0].is_active
        });
    } catch (err) {
        console.error('[API] Error toggling story status:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Delete story
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM stories WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Story not found' });
        }

        res.json({ message: 'Story deleted successfully' });
    } catch (err) {
        console.error('[API] Error deleting story:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// Get comments for a story
router.get('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            "SELECT * FROM story_comments_and_likes WHERE story_id = $1 AND type = 'comment' ORDER BY created_at DESC",
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[API] Error fetching comments:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Like a comment (simple increment for now as requested "store and count")
router.post('/comments/:commentId/like', [
    authMiddleware,
    param('commentId', 'Invalid Comment ID').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { commentId } = req.params;
        // In a real app we'd check if user already liked it in a join table.
        // For now, simpler increment as requested.
        const result = await query(
            'UPDATE story_comments_and_likes SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count',
            [commentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.json({ likes_count: result.rows[0].likes_count });
    } catch (err) {
        console.error('[API] Error liking comment:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
