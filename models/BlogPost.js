const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        trim: true
    },
    excerpt: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    readTime: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    published: {
        type: Boolean,
        default: true
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Fügt automatisch createdAt und updatedAt hinzu
});

// Vor dem Speichern: Slug generieren und Lesezeit berechnen
blogPostSchema.pre('save', function(next) {
    // Slug generieren
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // Lesezeit berechnen (grob: 200 Wörter pro Minute)
    if (!this.readTime) {
        const wordCount = this.content.trim().split(/\s+/).length;
        this.readTime = Math.ceil(wordCount / 200) + ' min';
    }

    // lastModified aktualisieren
    this.lastModified = new Date();

    next();
});

// Virtuelle Felder für formatierte Daten
blogPostSchema.virtual('formattedDate').get(function() {
    return this.date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;
