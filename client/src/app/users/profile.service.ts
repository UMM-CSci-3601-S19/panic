import {Injectable} from "@angular/core";
import {ProfileComponent} from "./profile.component";
import {UserService} from "./user.service";
import {HttpClient, HttpHandler} from "@angular/common/http";

@Injectable()
export class ProfileService{

  profileComponent: ProfileComponent;

  addListener(profileComponent: ProfileComponent){
    this.profileComponent = profileComponent;
  }

  updateProfile(id){
    this.profileComponent.setId(id);
  }

}
