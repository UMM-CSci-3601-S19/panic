import {AfterContentInit, Component, DoCheck, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Ride} from './ride';
import {FormControl, Validators, FormGroup, FormBuilder} from "@angular/forms";
import {RideListService} from "./ride-list.service";
import {Observable} from "rxjs/Observable";
import {ValidatorService} from "../validator.service";
import {MatSnackBar, MatSnackBarConfig} from "@angular/material";


@Component({
  selector: 'edit-ride.component',
  templateUrl: 'edit-ride.component.html',
})


export class EditRideComponent implements OnInit {
  minDate = new Date();
  public rides: Ride[];
  private highlightedID: string = '';

  public rideId: string;
  public rideUser = localStorage.getItem("userFullName");
  public rideUserId = localStorage.getItem("userId");
  public rideDriver: string;
  public rideDriverID: string;
  public rideNotes: string;
  public rideSeatsAvailable: number;
  public rideOrigin: string;
  public rideDestination: string;
  public rideDepartureDate: string;
  public rideDepartureTime: string;

  public endpoint: string;

  public tempBool: boolean = false;

  // Please leave as true for now, it's important.
  public rideRoundTrip: boolean = false;
  public rideNonSmoking: boolean = false;

  constructor(
    public rideListService : RideListService, private fb: FormBuilder,
    public validatorService : ValidatorService, public snackBar: MatSnackBar) {
  }

  editRide(): void {

    const editedRide: Ride = {
      _id: {
        $oid: this.rideId
      },
      owner: this.rideUser,
      ownerID: this.rideUserId,
      driver: this.rideDriver,
      driverID: this.rideDriverID,
      notes: this.rideNotes,
      seatsAvailable: this.rideSeatsAvailable,
      origin: this.rideOrigin,
      destination: this.rideDestination,
      departureDate: this.rideDepartureDate,
      departureTime: this.rideDepartureTime,
      roundTrip: this.rideRoundTrip,
      nonSmoking: this.rideNonSmoking
    };

    if (editedRide != null) {
      this.rideListService.editRide(editedRide).subscribe(
        result => {
          this.highlightedID = result;
        },
        err => {
          // This should probably be turned into some sort of meaningful response.
          console.log('There was an error adding the ride.');
          console.log('The newRide or dialogResult was ' + editedRide);
          console.log('The error was ' + JSON.stringify(err));
        });

      this.snackBar.open("Successfully Edited A Ride",'' , <MatSnackBarConfig>{duration: 5000,});

      this.refreshRides();
    }
  };

  refreshRides(): Observable<Ride[]> {
    // Get Rides returns an Observable, basically a "promise" that
    // we will get the data from the server.
    //
    // Subscribe waits until the data is fully downloaded, then
    // performs an action on it (the first lambda)
    const rides: Observable<Ride[]> = this.rideListService.getRides();
    rides.subscribe(
      rides => {
        this.rides = rides;
      },
      err => {
        console.log(err);
      });
    return rides;
  }

  setRideFields() {
    this.rideId = localStorage.getItem("rideId");
    this.rideUser = localStorage.getItem("rideUser");
    this.rideUserId = localStorage.getItem("rideUserId");
    this.rideDriver = localStorage.getItem("rideDriver");
    this.rideDriverID = localStorage.getItem("rideDriverID");
    this.rideNotes = localStorage.getItem("rideNotes");
    this.rideSeatsAvailable = +parseInt(localStorage.getItem("rideSeatsAvailable"));
    this.rideOrigin = localStorage.getItem("rideOrigin");
    this.rideDestination = localStorage.getItem("rideDestination");
    this.rideDepartureDate = localStorage.getItem("rideDepartureDate");
    this.rideDepartureTime = localStorage.getItem("rideDepartureTime");
    this.rideRoundTrip = ("true" == localStorage.getItem("rideRoundTrip"));
    this.rideNonSmoking = ("true" == localStorage.getItem("rideNonSmoking"));
    this.endpoint = localStorage.getItem("currEndpoint");
    localStorage.removeItem("currEndpoint")
  }

  // IMPORTANT! This function gets called whenever the user selects 'looking for a ride'.
  //   This is so that form validator doesn't get mad for having an invalid 'rideSeats' value.
  //   Before adding the ride to the DB, the value gets set to 0 (by the ride controller).
  //   Also, ride-list component HTML won't display this number unless it is indeed a User that is driving.
  setRideSeats() {
    this.rideSeatsAvailable = 1;
  }

  check() {
    if (!(this.rideDriver === "null")) {
      return true;
    }
    return false;
  }

  ngOnInit() {
    this.setRideSeats();
    this.setRideFields();
    this.validatorService.createForm();
    if (!this.rideDriver) {
      this.validatorService.rideForm.removeControl("driving");
      this.validatorService.rideForm.removeControl("seatsAvailable");
    }
  }


}
