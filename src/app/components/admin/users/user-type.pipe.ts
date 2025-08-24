import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'userType',
  standalone: true
})
export class UserTypePipe implements PipeTransform {
  transform(users: any[], type: string): any[] {
  return users.filter(u => u.type === type);
  }
}
