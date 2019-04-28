import {Component} from '@angular/core';
import {AppService} from "./app.service";
import {Router} from "@angular/router";
import {ProfileService} from "./users/profile.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AppService]
})
export class AppComponent {
  title = 'Mo-Ride App';
  public profileId = localStorage.getItem("userId");

  constructor(public appService: AppService,
              private profileService: ProfileService) {}

  route() {
    if(this.profileService.hasListener()){
      this.profileService.updateProfile(this.profileId);
    }
  }
}
