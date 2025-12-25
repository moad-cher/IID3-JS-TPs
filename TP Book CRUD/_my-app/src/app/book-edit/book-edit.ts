import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BookService } from '../services/book.service';
import { Book } from '../models/book';

@Component({
  selector: 'app-book-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-edit.html',
  styleUrl: './book-edit.css',
})
export class BookEdit implements OnInit, OnDestroy {
  bookForm: FormGroup;
  bookId: number = 0;
  loading = true;
  private destroy$ = new Subject<void>();

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
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const idParam = params['id'];
      this.bookId = Number(idParam);
      if (!isNaN(this.bookId)) {
        this.loadBook();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      this.bookService.updateBook(this.bookId, this.bookForm.value).subscribe({
        next: () => {
          this.router.navigate(['/books']);
        },
        error: (error) => {
          console.error('Error updating book:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/books']);
  }
}
