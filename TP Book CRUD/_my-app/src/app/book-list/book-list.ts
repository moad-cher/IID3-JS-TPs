import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookService } from '../services/book.service';
import { Book } from '../models/book';

@Component({
  selector: 'app-book-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
})
export class BookList implements OnInit {
  books: Book[] = [];

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    console.log('Loading books...');
    this.bookService.getBooks().subscribe({
      next: (books) => {
        console.log('Books loaded successfully:', books);
        this.books = books;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.books = [];
      }
    });
  }

  deleteBook(id: number): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => this.loadBooks(),
        error: (error) => console.error('Error deleting book:', error)
      });
    }
  }
}
