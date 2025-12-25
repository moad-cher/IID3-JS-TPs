import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NameTransformerPipe } from './name-transformer.pipe';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, NameTransformerPipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})


export class App {
  form: FormGroup;
  isLoggedIn = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      username: ['Moad', [Validators.required, Validators.minLength(3)]],
      email: ['moadchergui13@gmail.com', [Validators.required, Validators.email]],
      password: ['moad123', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('Form Data:', this.form.value);
      this.isLoggedIn = true;
    }
  }
  
  private _books : { name: string; year: number }[] = [
    {name: 'Book 1', year: 2001},
    {name: 'Book 2', year: 2002},
    {name: 'Book 3', year: 2020}
  ];
  public get books() : { name: string; year: number }[] {
    return this._books;
  }
  public set books(v : { name: string; year: number }[]) {
    this._books = v;
  }

}
