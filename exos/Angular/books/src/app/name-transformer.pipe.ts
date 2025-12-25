import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameTransformer',
  standalone: true
})
export class NameTransformerPipe implements PipeTransform {
  transform(name: string): string {
    return 'name of the book is ' + name;
  }
}
