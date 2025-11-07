// Simple Book Reading Tracker - Client Side
// Matches Streamlit simplicity: load books, add books, edit, delete, increment
let editMode = false;
let editId = null;
// Load and display books
async function loadBooks() {
    const res = await fetch('/api/books');
    const books = await res.json();
    const list = document.getElementById('books-list');
    list.innerHTML = '';
    let totalRead = 0;
    let totalPages = 0;
    books.forEach(book => {
        const pct = book.pages > 0 ? Math.round((book.pages_read / book.pages) * 100) : 0;
        if (book.finished)
            totalRead++;
        totalPages += book.pages_read;
        const div = document.createElement('div');
        div.className = 'bg-gray-50 p-4 rounded-lg border-l-4 border-purple-600';
        div.innerHTML = `
            <div class="mb-3">
                <h3 class="text-lg font-semibold text-gray-800">${book.title}</h3>
                <p class="text-sm text-gray-600">Author: ${book.author}</p>
                <p class="text-sm text-gray-600">Status: ${book.status}</p>
                <p class="text-sm text-gray-600">Price: $${book.price.toFixed(2)}</p>
                <p class="text-sm text-gray-600">Pages Read: ${book.pages_read}/${book.pages} (${pct}%)</p>
                <p class="text-sm text-gray-600">Format: ${book.format}</p>
                <p class="text-sm text-gray-600">Finished: ${book.finished ? 'Yes' : 'No'}</p>
            </div>
            <div class="flex gap-2 flex-wrap">
                <button onclick="increment('${book._id}', 1)" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">+1</button>
                <button onclick="increment('${book._id}', -1)" class="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700">-1</button>
                <input type="number" id="set-${book._id}" value="${book.pages_read}" min="0" max="${book.pages}" class="w-20 px-2 py-1 border rounded text-sm">
                <button onclick="setPages('${book._id}')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Set</button>
                <button onclick="editBook('${book._id}')" class="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700">Edit</button>
                <button onclick="deleteBook('${book._id}')" class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });
    document.getElementById('total-read').textContent = totalRead.toString();
    document.getElementById('total-pages').textContent = totalPages.toString();
}
// Add or update book
async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const book = {
        title: formData.get('title'),
        author: formData.get('author'),
        pages: Number(formData.get('pages')),
        status: formData.get('status'),
        price: Number(formData.get('price')),
        pages_read: Number(formData.get('pages_read')),
        format: formData.get('format'),
        suggested_by: formData.get('suggested_by'),
        finished: formData.get('finished') === 'on'
    };
    if (editMode && editId) {
        await fetch(`/api/books/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
        });
        cancelEdit();
    }
    else {
        await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
        });
    }
    form.reset();
    loadBooks();
}
// Edit book
async function editBook(id) {
    editMode = true;
    editId = id;
    const res = await fetch(`/api/books/${id}`);
    const book = await res.json();
    document.getElementById('title').value = book.title;
    document.getElementById('author').value = book.author;
    document.getElementById('pages').value = book.pages.toString();
    document.getElementById('status').value = book.status;
    document.getElementById('price').value = book.price.toString();
    document.getElementById('pages_read').value = book.pages_read.toString();
    document.getElementById('format').value = book.format;
    document.getElementById('suggested_by').value = book.suggested_by || '';
    document.getElementById('finished').checked = book.finished;
    document.querySelector('h2').textContent = 'Edit Book';
    document.querySelector('input[type="submit"]').setAttribute('value', 'Update Book');
    document.getElementById('cancel-btn').style.display = 'inline-block';
}
function cancelEdit() {
    editMode = false;
    editId = null;
    document.querySelector('h2').textContent = 'Add a New Book';
    document.querySelector('input[type="submit"]').setAttribute('value', 'Add Book');
    document.getElementById('cancel-btn').style.display = 'none';
    document.getElementById('book-form').reset();
}
// Delete book
async function deleteBook(id) {
    if (!confirm('Delete this book?'))
        return;
    await fetch(`/api/books/${id}`, { method: 'DELETE' });
    loadBooks();
}
// Increment pages
async function increment(id, delta) {
    await fetch(`/api/books/${id}/increment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
    });
    loadBooks();
}
// Set pages
async function setPages(id) {
    const input = document.getElementById(`set-${id}`);
    const pagesRead = Number(input.value);
    await fetch(`/api/books/${id}/set-pages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagesRead })
    });
    loadBooks();
}
// Make functions global
window.editBook = editBook;
window.deleteBook = deleteBook;
window.increment = increment;
window.setPages = setPages;
window.cancelEdit = cancelEdit;
// Initialize
document.getElementById('book-form').addEventListener('submit', handleSubmit);
loadBooks();
