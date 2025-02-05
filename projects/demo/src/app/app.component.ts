import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  swipeLimitWidth = 80;
  connectEdges = true;

  links = ['My nav First link', 'My nav Second link', 'My nav Third link', 'My nav Fourth link', 'My nav Fifth link'];
  activeLink = this.links[0];

}
