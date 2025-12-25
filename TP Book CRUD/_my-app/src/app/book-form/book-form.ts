import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../services/book.service';
import { Book } from '../models/book';

@Component({
  selector: 'app-book-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-form.html',
  styleUrl: './book-form.css',
})
export class BookForm implements OnInit {
  bookForm: FormGroup;
  isEdit = false;
  bookId: number = 0;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.bookId = Number(id);
      this.loadBook();
    }
  }

  loadBook(): void {
    this.loading = true;
    this.bookService.getBook(this.bookId).subscribe({
      next: (book) => {
        this.bookForm.patchValue(book);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading book:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      this.loading = true;
      const bookData = this.bookForm.value;

      const operation = this.isEdit
        ? this.bookService.updateBook(this.bookId, bookData)
        : this.bookService.createBook(bookData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/books']);
        },
        error: (error) => {
          console.error('Error saving book:', error);
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/books']);
  }
}
