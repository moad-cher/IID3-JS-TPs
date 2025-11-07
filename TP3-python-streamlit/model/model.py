import pymongo as pm
from bson.objectid import ObjectId

MONGO_URI = "mongodb://127.0.0.1:27017/"
client = pm.MongoClient(MONGO_URI)
db = client.booktracker
books_collection = db.books

def add_book(book_data):
    """Add a new book to the database."""
    result = books_collection.insert_one(book_data)
    return result.inserted_id


def get_books():
    """Retrieve all books from the database."""
    books = books_collection.find()
    return list(books)


def delete_book(book_id):
    """Delete a book from the database. Accepts either ObjectId or string id."""
    try:
        oid = ObjectId(book_id)
    except Exception:
        # if already an ObjectId or invalid, try using as-is
        oid = book_id
    result = books_collection.delete_one({"_id": oid})
    return result.deleted_count


def update_book(book_id, update_data):
    """Update fields of a book. `update_data` is a dict with fields to set."""
    try:
        oid = ObjectId(book_id)
    except Exception:
        oid = book_id
    result = books_collection.update_one({"_id": oid}, {"$set": update_data})
    return result.modified_count


def increment_pages_read(book_id, delta=1):
    """Increment (or decrement if delta negative) the pages_read for a book.
    Ensures pages_read remains between 0 and pages and updates `finished` accordingly.
    Returns number of modified documents (0/1).
    """
    try:
        oid = ObjectId(book_id)
    except Exception:
        oid = book_id

    book = books_collection.find_one({"_id": oid})
    if not book:
        return 0

    current = int(book.get("pages_read", 0))
    pages = int(book.get("pages", 0)) if book.get("pages") is not None else 0
    new_pages = max(0, current + int(delta))
    if pages > 0:
        new_pages = min(new_pages, pages)

    finished = pages > 0 and new_pages >= pages

    result = books_collection.update_one({"_id": oid}, {"$set": {"pages_read": new_pages, "finished": finished}})
    return result.modified_count