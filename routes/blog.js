const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');

// Hilfsfunktion zum Konvertieren von Text in HTML
function convertToHtml(text) {
    return text
        // Überschriften
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Code-Blöcke
        .replace(/```(.*?)\n([\s\S]*?)```/gm, (match, lang, code) => 
            `<pre><code class="language-${lang}">${code.trim()}</code></pre>`)
        // Inline-Code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Listen
        .replace(/^\s*\n\*/gm, '<ul>\n*')
        .replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n\n$2')
        .replace(/^\*(.+)/gm, '<li>$1</li>')
        // Blockquotes
        .replace(/^\> (.+)/gm, '<blockquote>$1</blockquote>')
        // Fettschrift
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Kursiv
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Absätze
        .replace(/\n\s*\n/g, '</p><p>')
        // Abschließende Formatierung
        .replace(/^(.+)$/gm, '<p>$1</p>');
}

// GET /api/blog - Alle Blog-Posts abrufen
router.get('/', async (req, res) => {
    try {
        const { tag, search } = req.query;
        let query = { published: true };

        if (tag) {
            query.tags = tag;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const posts = await BlogPost.find(query)
            .select('-content') // Content nicht in der Übersicht senden
            .sort({ date: -1 }); // Neueste zuerst

        res.json(posts);
    } catch (error) {
        console.error('Error in GET /api/blog:', error);
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});

// GET /api/blog/:slug - Einzelnen Blog-Post abrufen
router.get('/:slug', async (req, res) => {
    try {
        const post = await BlogPost.findOne({ 
            slug: req.params.slug,
            published: true 
        });
        
        if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        // Konvertiere den Content in HTML
        const postObject = post.toObject();
        postObject.content = convertToHtml(post.content);

        res.json(postObject);
    } catch (error) {
        console.error('Error in GET /api/blog/:slug:', error);
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
});

// POST /api/blog - Neuen Blog-Post erstellen
router.post('/', async (req, res) => {
    try {
        console.log('Received blog post data:', req.body);
        const { title, excerpt, content, author, tags, published = true } = req.body;

        if (!title || !content) {
            console.log('Validation failed:', { title, content });
            return res.status(400).json({ error: 'Title and content are required' });
        }

        console.log('Creating new blog post with:', { title, excerpt, content, author, tags, published });
        const post = new BlogPost({
            title,
            excerpt: excerpt || title,
            content,
            author,
            tags: tags || [],
            published
        });

        console.log('Saving blog post...');
        const savedPost = await post.save();
        console.log('Blog post saved successfully:', savedPost);
        res.status(201).json(savedPost);
    } catch (error) {
        console.error('Error in POST /api/blog:', error);
        res.status(500).json({ error: 'Failed to create blog post', details: error.message });
    }
});

// PUT /api/blog/:id - Blog-Post aktualisieren
router.put('/:id', async (req, res) => {
    try {
        const { title, excerpt, content, author, tags, published } = req.body;
        const post = await BlogPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        post.title = title;
        post.excerpt = excerpt || title;
        post.content = content;
        post.author = author;
        post.tags = tags || [];
        if (typeof published === 'boolean') {
            post.published = published;
        }

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        console.error('Error in PUT /api/blog/:id:', error);
        res.status(500).json({ error: 'Failed to update blog post' });
    }
});

// DELETE /api/blog/:id - Blog-Post löschen
router.delete('/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        await post.deleteOne();
        res.status(204).send();
    } catch (error) {
        console.error('Error in DELETE /api/blog/:id:', error);
        res.status(500).json({ error: 'Failed to delete blog post' });
    }
});

module.exports = router;
