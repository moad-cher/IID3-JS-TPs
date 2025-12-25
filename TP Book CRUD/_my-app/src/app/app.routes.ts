import { Routes } from '@angular/router';
import { BookList } from './book-list/book-list';
import { BookForm } from './book-form/book-form';

export const routes: Routes = [
  { path: '', redirectTo: '/books', pathMatch: 'full' },
  { path: 'books', component: BookList },
  { path: 'books/create', component: BookForm },
  { path: 'books/edit/:id', component: BookForm }
];