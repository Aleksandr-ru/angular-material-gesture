import { NgModule } from '@angular/core';
import { MatTabGroupGestureDirective } from './mat-tab-group-gesture.directive';
import {MatTabNavBarGestureDirective} from './mat-tab-nav-bar-gesture.directive';



@NgModule({
  declarations: [
    MatTabGroupGestureDirective,
    MatTabNavBarGestureDirective
  ],
  imports: [
  ],
  exports: [
    MatTabGroupGestureDirective,
    MatTabNavBarGestureDirective
  ]
})
export class MatTabGroupGestureModule { }
