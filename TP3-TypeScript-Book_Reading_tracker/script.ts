// Simple Book Reading Tracker - Client Side
// Matches Streamlit simplicity: load books, add books, edit, delete, increment

interface Book {
    _id?: string;
    title: string;
    author: string;
    pages: number;
    status: string;
    price: number;
    pages_read: number;
    format: string;
    suggested_by?: string;
    finished: boolean;
}

let editMode = false;
let editId: string | null = null;

// Load and display books
async function loadBooks() {
    const res = await fetch('/api/books');
    const books: Book[] = await res.json();
    
    const list = document.getElementById('books-list')!;
    list.innerHTML = '';
    
    let totalRead = 0;
    let totalPages = 0;
    
    books.forEach(book => {
        const pct = book.pages > 0 ? Math.round((book.pages_read / book.pages) * 100) : 0;
        if (book.finished) totalRead++;
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
    
    document.getElementById('total-read')!.textContent = totalRead.toString();
    document.getElementById('total-pages')!.textContent = totalPages.toString();
}

// Add or update book
async function handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const book: any = {
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
    } else {
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
async function editBook(id: string) {
    editMode = true;
    editId = id;
    
    const res = await fetch(`/api/books/${id}`);
    const book: Book = await res.json();
    
    (document.getElementById('title') as HTMLInputElement).value = book.title;
    (document.getElementById('author') as HTMLInputElement).value = book.author;
    (document.getElementById('pages') as HTMLInputElement).value = book.pages.toString();
    (document.getElementById('status') as HTMLSelectElement).value = book.status;
    (document.getElementById('price') as HTMLInputElement).value = book.price.toString();
    (document.getElementById('pages_read') as HTMLInputElement).value = book.pages_read.toString();
    (document.getElementById('format') as HTMLSelectElement).value = book.format;
    (document.getElementById('suggested_by') as HTMLInputElement).value = book.suggested_by || '';
    (document.getElementById('finished') as HTMLInputElement).checked = book.finished;
    
    document.querySelector('h2')!.textContent = 'Edit Book';
    document.querySelector('input[type="submit"]')!.setAttribute('value', 'Update Book');
    document.getElementById('cancel-btn')!.style.display = 'inline-block';
}

function cancelEdit() {
    editMode = false;
    editId = null;
    document.querySelector('h2')!.textContent = 'Add a New Book';
    document.querySelector('input[type="submit"]')!.setAttribute('value', 'Add Book');
    document.getElementById('cancel-btn')!.style.display = 'none';
    (document.getElementById('book-form') as HTMLFormElement).reset();
}

// Delete book
async function deleteBook(id: string) {
    if (!confirm('Delete this book?')) return;
    await fetch(`/api/books/${id}`, { method: 'DELETE' });
    loadBooks();
}

// Increment pages
async function increment(id: string, delta: number) {
    await fetch(`/api/books/${id}/increment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
    });
    loadBooks();
}

// Set pages
async function setPages(id: string) {
    const input = document.getElementById(`set-${id}`) as HTMLInputElement;
    const pagesRead = Number(input.value);
    
    await fetch(`/api/books/${id}/set-pages`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pagesRead })
    });
    loadBooks();
}

// Make functions global
(window as any).editBook = editBook;
(window as any).deleteBook = deleteBook;
(window as any).increment = increment;
(window as any).setPages = setPages;
(window as any).cancelEdit = cancelEdit;

// Initialize
document.getElementById('book-form')!.addEventListener('submit', handleSubmit);
loadBooks();
