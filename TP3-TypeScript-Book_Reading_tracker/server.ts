// Simple Book Reading Tracker Server - TypeScript
// Matches Streamlit model simplicity: CRUD operations + increment/set-pages

import express from 'express';
import path from 'path';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Book Schema
const BookSchema = new mongoose.Schema({
    title: String,
    author: String,
    pages: Number,
    status: String,
    price: Number,
    pages_read: Number,
    format: String,
    suggested_by: String,
    finished: { type: Boolean, default: false }
});

const Book = mongoose.model('Book', BookSchema);

// Connect to MongoDB
const MONGO_URI = 'mongodb://127.0.0.1:27017/booktracker';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB error:', err));

// Routes - Simple like Streamlit model.py

// Get all books
app.get('/api/books', async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

// Get book by ID
app.get('/api/books/:id', async (req, res) => {
    const book = await Book.findById(req.params.id);
    res.json(book);
});

// Add book
app.post('/api/books', async (req, res) => {
    const bookData = req.body;
    // Auto-set finished if pages_read >= pages
    if (bookData.pages_read >= bookData.pages && bookData.pages > 0) {
        bookData.finished = true;
    }
    const book = await Book.create(bookData);
    res.json(book);
});

// Update book (edit mode)
app.put('/api/books/:id', async (req, res) => {
    const bookData = req.body;
    // Auto-set finished
    if (bookData.pages_read >= bookData.pages && bookData.pages > 0) {
        bookData.finished = true;
    } else {
        bookData.finished = false;
    }
    const book = await Book.findByIdAndUpdate(req.params.id, bookData, { new: true });
    res.json(book);
});

// Increment pages (like Streamlit increment_pages_read)
app.patch('/api/books/:id/increment', async (req, res) => {
    const { delta } = req.body;
    const book = await Book.findById(req.params.id);
    
    if (book) {
        const currentPages = book.pages_read || 0;
        const maxPages = book.pages || 0;
        book.pages_read = Math.max(0, Math.min(currentPages + delta, maxPages));
        book.finished = book.pages_read >= maxPages && maxPages > 0;
        await book.save();
    }
    
    res.json(book);
});

// Set pages (manual set)
app.patch('/api/books/:id/set-pages', async (req, res) => {
    const { pagesRead } = req.body;
    const book = await Book.findById(req.params.id);
    
    if (book) {
        const maxPages = book.pages || 0;
        book.pages_read = Math.max(0, Math.min(pagesRead, maxPages));
        book.finished = book.pages_read >= maxPages && maxPages > 0;
        await book.save();
    }
    
    res.json(book);
});

// Delete book
app.delete('/api/books/:id', async (req, res) => {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
