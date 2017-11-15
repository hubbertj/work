import { Pipe, PipeTransform } from '@angular/core';
/*
 * Simply rename string to a different label
 * 
 * Usage:
 *   string | notificationRename
 * Example:
 *   {{ Left | notificationRename }}
 *   formats to: Departed
*/
@Pipe({name: 'notificationRename'})
export class NotificationRename implements PipeTransform {
  transform(value: string): string {
  	let output: string = '';
  	switch(value.toLowerCase()){
  		case 'delivered':
  			output = 'Delivered';
  			break;
  		case 'arrived':
  			output = 'Arrived';
  			break;
  		case 'left':
  			output = 'Departed';
  			break;
  		case 'departed':
  			output = 'Started';
  			break;
  	}
    return output;
  }
}