import {Component} from '@angular/core';
import {AppService} from "../app.service";

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss'],

})

export class HomeComponent {

  constructor(public appService: AppService) {
  }

  ngOnInit(): void {
    this.appService.loadClient();
  }
}
