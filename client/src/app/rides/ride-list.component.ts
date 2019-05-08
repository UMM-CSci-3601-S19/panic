import {Component, OnInit} from '@angular/core';
import {RideListService} from './ride-list.service';
import {Ride} from './ride';
import {Observable} from 'rxjs/Observable';
import {MatDialog, MatDialogConfig} from "@angular/material";
import {ChatService} from "../chat/chat-service";

@Component({
  selector: 'ride-list-component',
  templateUrl: 'ride-list.component.html',
  styleUrls: ['./ride-list.component.scss'],
  providers: []
})

export class RideListComponent implements OnInit {
  // public so that tests can reference them (.spec.ts)
  public rides: Ride[];
  public filteredRides: Ride[];

  // target values used in filtering
  public rideDestination: string;
  public rideOrigin: string;
  public rideDriving: boolean;
  public rideNonSmoking: boolean = false; // this defaults the box to be unchecked
  public rideRoundTrip: boolean = false;

  // Inject the RideListService into this component.
  constructor(public rideListService: RideListService, public chatService: ChatService, public dialog: MatDialog) {
    this.chatService.connectStream();
  }

  ngOnInit(): void {
    localStorage.removeItem("rideId");
    localStorage.removeItem("rideUser");
    localStorage.removeItem("rideUserId");
    localStorage.removeItem("rideDriver");
    localStorage.removeItem("rideDriverID");
    localStorage.removeItem("rideNotes");
    localStorage.removeItem("rideSeatsAvailable");
    localStorage.removeItem("rideOrigin");
    localStorage.removeItem("rideDestination");
    localStorage.removeItem("rideDepartureDate");
    localStorage.removeItem("rideDepartureTime");
    localStorage.removeItem("rideRoundTrip");
    localStorage.removeItem("rideNonSmoking");

    this.rideListService.refreshNeeded$
      .subscribe(() => {
        this.refreshRides();
      });
    // this.refreshRides();
    this.loadService();
  }

  public filterRides(searchDestination: string, searchOrigin: string,
                     searchIsDriving: boolean, searchNonSmoking: boolean,
                     searchRoundTrip): Ride[] {

    this.filteredRides = this.rides;

    // Filter by destination
    if (searchDestination != null) {
      searchDestination = searchDestination.toLocaleLowerCase();

      this.filteredRides = this.filteredRides.filter(ride => {
        return !searchDestination || ride.destination.toLowerCase().indexOf(searchDestination) !== -1;
      });
    }

    // Filter by origin
    if (searchOrigin != null) {
      searchOrigin = searchOrigin.toLocaleLowerCase();

      this.filteredRides = this.filteredRides.filter(ride => {
        return !searchOrigin || ride.origin.toLowerCase().indexOf(searchOrigin) !== -1;
      });
    }

    if (searchIsDriving != null) {

      this.filteredRides = this.filteredRides.filter(ride => {
        return (!!ride.driver) === searchIsDriving;
      });
    }

    // We only check for true, so that an unchecked box allows all rides to come through.
    if (searchNonSmoking === true) {

      this.filteredRides = this.filteredRides.filter(ride => {
        return ride.nonSmoking === searchNonSmoking;
      });
    }

    if (searchRoundTrip === true) {

      this.filteredRides = this.filteredRides.filter(ride => {
        return ride.roundTrip === searchRoundTrip;
      });
    }

    return this.filteredRides;
  }

  refreshRides(): Observable<Ride[]> {
    const rides: Observable<Ride[]> = this.rideListService.getRides();
    rides.subscribe(
      rides => {
        this.rides = rides;
        this.filterRides(this.rideDestination, this.rideOrigin, this.rideDriving,
          this.rideNonSmoking, this.rideRoundTrip);
      },
      err => {
        console.log(err);
      });
    return rides;
  }

  loadService(): void {
    this.rideListService.getRides().subscribe(
      rides => {
        this.rides = rides;
      },
      err => {
        console.log(err);
      }
    );
  }

  // These two methods are used in the HTML instead of ngModel, since it solves a problem where
  // clicking on the checkbox didn't always 'uncheck' the box. Implementing this method with
  // (click)=toggleNonSmoking, and checked="rideNonSmoking", fixes that bothersome problem.
  public toggleNonSmoking() {
    this.rideNonSmoking = !this.rideNonSmoking;
  }
  public toggleRoundTrip() {
    this.rideRoundTrip = !this.rideRoundTrip;
  }

}
