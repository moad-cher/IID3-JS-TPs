import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  number = 0;

  increment() {
    this.number++;
  }

  decrement() {
    this.number--;
  }

  reset() {
    this.number = 0;
  }
}
