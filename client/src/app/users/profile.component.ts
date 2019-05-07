import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {User} from "./user";
import {UserService} from "./user.service";
import {ActivatedRoute} from "@angular/router";
import {Ride} from "../rides/ride";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {profileInfoObject} from "./profileInfoObject";
import {ProfileService} from "./profile.service";
import {ChatService} from "../chat/chat-service";

@Component({
  selector: 'profile-component',
  templateUrl: 'profile.component.html',
  styleUrls: ['./profile.component.scss'],
})

export class ProfileComponent implements OnInit{

  public profile: User;
  public profileId: string;
  public userRides: Ride[];
  userForm: FormGroup;
  public showPhoneForm: boolean;

  constructor(private userService: UserService,
              private chatService: ChatService,
              private profileService: ProfileService,
              private route: ActivatedRoute,
              private fb:FormBuilder,
  ) {
    this.createForm();
    this.chatService.connectStream();
    profileService.addListener(this);
  }

  public getLocalUserId() {
    return localStorage.getItem("userId");
  }

  getProfile(id?): void{
    if(id) {
      this.profileId = id;
    }else {
      const id = this.route.snapshot.paramMap.get('id');
      this.profileId = id;
    }
      this.userService.getUserById(this.profileId).subscribe(
        user => {
          this.profile = user;
          this.getUserRideFromService();
        });
  }

  getUserRideFromService(): Observable<Ride[]> {
    const userRides: Observable<Ride[]> = this.userService.getMyRides(this.profileId);
    userRides.subscribe(
      rides => {
        this.userRides = rides;
      },
      err => {
        console.log(err);
      });
    return userRides;
  }

  createForm(){
    this.userForm = this.fb.group({
      phone:['',[Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),Validators.required]],
    });
  }

  saveProfileInfo(userId: string, phoneInfo: string): void {

    const profileInfo: profileInfoObject = {
      userId: userId,
      phone: phoneInfo
    };

    this.userService.saveProfileInfo(profileInfo).subscribe(
      result => {
        window.location.reload();
      },
      err => {
        // This should probably be turned into some sort of meaningful response.
        console.log('There was an error adding the ride.');
        console.log('The error was ' + JSON.stringify(err));
      });
  };

  ngOnInit(): void {
    this.getProfile();
  }

  ngOnDestroy(): void {
    this.profileService.removeListener();
  }
}
