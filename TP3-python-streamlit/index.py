import streamlit as st
import model.model as model
import model.book as book

# Create an HTML file where we have a form that register new books (use tailwindCSS to style it)
# Each book have a title(string), author(string), number of pages(number), status(String Enum), price (number), number of pages read (number < number of pages), format(String Enum), suggested by(string), finished(boolean).
# Status can have one of the following values: Read, Re-read, DNF, Currently reading, Returned Unread, Want to read
# Format can have one of the following values: Print, PDF, Ebook, AudioBook
# By default finished is equal to 0, the finished value will change to 1 automatically when number of pages read is euqal to number of pages
# Create a class book have the following methods: a constructor, currentlyAt, deleteBook
# The book class should be its own module.
# Create a web page where we can track our reading by listing books and showing the percentage of reading for each book, and a global section where you can see the total amount of book read and the amount of pages
# The books are stored in MongoDB
st.set_page_config(page_icon="📚",page_title="Book Reading Tracker", layout="wide")
st.title("Book Reading Tracker")
# initialize session state variables
ss = st.session_state
if 'mode' not in ss:
    ss['mode'] = 'add'
if 'edit_book_id' not in ss:
    ss['edit_book_id'] = None
if 'edit_book_data' not in ss:
    ss['edit_book_data'] = {}

c1,c2=st.columns(2)
with c1:
    # Header with mode switcher
    col_h1, col_h2 = st.columns([3, 1])
    with col_h1:
        st.header(f"{ss.mode.capitalize()} Book")
    with col_h2:
        if ss.mode == 'edit' and st.button("Cancel", key="cancel_edit"):
            ss['mode'] = 'add'
            ss['edit_book_id'] = None
            ss['edit_book_data'] = {}
            st.rerun()
    
    # Get current book data if in edit mode
    current_data = ss.get('edit_book_data', {})
    
    with st.form("book_form"):
        Title = st.text_input("Title", value=current_data.get('title', ''))
        Author = st.text_input("Author", value=current_data.get('author', ''))
        Pages = st.number_input("Pages", min_value=1, value=int(current_data.get('pages', 1)))
        
        status_options = ["Read", "Re-read", "DNF", "Currently reading", "Returned Unread", "Want to read"]
        status_idx = status_options.index(current_data.get('status', 'Want to read')) if current_data.get('status') in status_options else 5
        Status = st.selectbox("Status", options=status_options, index=status_idx)
        
        Price = st.number_input("Price", min_value=0.0, format="%.2f", value=float(current_data.get('price', 0.0)))
        Pages_Read = st.number_input("Pages Read", min_value=0, value=int(current_data.get('pages_read', 0)))
        
        format_options = ["Print", "PDF", "Ebook", "AudioBook"]
        format_idx = format_options.index(current_data.get('format', 'Print')) if current_data.get('format') in format_options else 0
        Format = st.selectbox("Format", options=format_options, index=format_idx)
        
        Suggested_By = st.text_input("Suggested By", value=current_data.get('suggested_by', ''))
        Finished = st.checkbox("Finished", value=current_data.get('finished', False))
        if Pages_Read == Pages:
            Finished = True

        submit_label = "Update Book" if ss.mode == 'edit' else "Add Book"
        if st.form_submit_button(submit_label):

            book_data = {
                "title": Title,
                "author": Author,
                "pages": Pages,
                "status": Status,
                "price": Price,
                "pages_read": Pages_Read,
                "format": Format,
                "suggested_by": Suggested_By,
                "finished": Finished
            }
            
            if ss.mode == 'edit':
                model.update_book(ss['edit_book_id'], book_data)
                st.success("Book updated successfully!")
                ss['mode'] = 'add'
                ss['edit_book_id'] = None
                ss['edit_book_data'] = {}
            else:
                model.add_book(book_data)
                st.success("Book added successfully!")
            st.rerun()

@st._fragment
def display_book(book):
    # display basic info
    id_str = str(book.get('_id'))
    b1, b2 = st.columns([3, 1])
    with b1:
        st.subheader(book["title"])
    with b2:
        if st.button("Edit", key=f"edit_{id_str}"):
            ss['mode'] = 'edit'
            ss['edit_book_id'] = id_str
            ss['edit_book_data'] = book
            st.rerun()

    st.write(f"Author: {book['author']}")
    st.write(f"Status: {book['status']}")
    st.write(f"Price: ${book['price']:.2f}")
    # pages progress
    pages = book.get('pages', 0) or 0
    pages_read = book.get('pages_read', 0) or 0
    pct = (pages_read / pages * 100) if pages else 0
    st.progress(value=pct / 100 if pages else 0,text=f"{pages_read}/{pages} pages ({pct:.2f}%)" if pages else "No page info")
    st.write(f"Format: {book['format']}")
    st.write(f"Finished: {'Yes' if book.get('finished') else 'No'}")

    # actions: increment, decrement, set, edit, delete
    a3, a4= st.columns([1.5,1])

    with a3:
        # allow manual set of pages read
        new_val = st.number_input("Pages", min_value=0, max_value=pages if pages else None, value=pages_read, key=f"set_{id_str}", label_visibility="collapsed")
        if st.button("Set", key=f"update_{id_str}"):
            # ensure bounds and set finished flag
            finished = pages and int(new_val) >= pages
            model.update_book(id_str, {"pages_read": int(new_val), "finished": bool(finished)})
            st.rerun()
    with a4:
        if st.button("Delete", key=f"del_{id_str}"):
            model.delete_book(id_str)
            st.rerun()

    st.write("---")

with c2:
    st.header("Your Books")
    books = model.get_books()
    st.write(f"Total Books: {len(books)}\nTotal Pages Read: {sum(book['pages_read'] for book in books)}")
    for book in books:
        display_book(book)

