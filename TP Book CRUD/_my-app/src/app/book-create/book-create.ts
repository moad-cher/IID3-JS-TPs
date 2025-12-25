import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-book-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-create.html',
  styleUrl: './book-create.css',
})

export class BookCreate {
  bookForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private router: Router
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      this.bookService.createBook(this.bookForm.value).subscribe({
        next: () => {
          this.router.navigate(['/books']);
        },
        error: (error) => {
          console.error('Error creating book:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/books']);
  }
}
