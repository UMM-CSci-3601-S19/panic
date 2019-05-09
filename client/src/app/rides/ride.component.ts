import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {Ride} from "./ride";
import {RideListService} from "./ride-list.service";
import {joinRideObject} from "./joinRideObject";
import {driveRideObject} from "./driveRideObject";
import {DeleteRideComponent} from "./delete-ride.component";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {leaveRideObject} from "./leaveRideObject";
import {ChatComponent} from "../chat/chat.component";
import {User} from "../users/user";
import {UserService} from "../users/user.service";
import {ProfileService} from "../users/profile.service";

@Component({
  selector: 'app-ride',
  templateUrl: './ride.component.html',
  styleUrls: ['./ride.component.scss']
})
export class RideComponent implements OnInit {

  @Input() ride: Ride = {
    _id: {$oid: ''},
    owner: '',
    ownerID: '',
    driver: '',
    driverID: '',
    notes: '',
    seatsAvailable: null,
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    nonSmoking: null,
    roundTrip: null,
    pendingPassengerIds: [],
    pendingPassengerNames: [],
    passengerIds: [],
    passengerNames: []
  };

  public currUserId = localStorage.getItem("userId");
  public currUserFullName = localStorage.getItem("userFullName");
  public passengerRequests: joinRideObject[] = [];

  private highlightedID: string = '';
  private highlightedDestination: string = '';

  public fullCard: boolean = false;
  public people: User[];

  constructor(private rideListService: RideListService,
              public userService: UserService,
              public profileService: ProfileService,
              public dialog: MatDialog) {
  }

  routeProfile(profileId) {
    if(this.profileService.hasListener()){
      this.profileService.updateProfile(profileId);
    }
    this.dialog.closeAll();
  }

  openRide() {
    const dialogRef = this.dialog.open(RideComponent, <MatDialogConfig>{
      maxWidth: '85vw',
      maxHeight: '90vh',
      height: '85vh'
    });
    dialogRef.componentInstance.fullCard = true;
    dialogRef.componentInstance.ride = this.ride;
  }

  makePassengerRequestObjects() {
    let numIds = this.ride.pendingPassengerIds.length;
    for(let i=0; i<numIds; i++){
      let newJoinRequest: joinRideObject = {
        rideId: this.ride._id.$oid,
        pendingPassengerId: this.ride.pendingPassengerIds[i],
        pendingPassengerName: this.ride.pendingPassengerNames[i]
      };
      this.passengerRequests.push(newJoinRequest);
    }
  }

  checkPassengerRequests() {
    if (this.ride.pendingPassengerIds.length != 0) {
      this.makePassengerRequestObjects();
    }
  }

  approveJoinRide(rideId: string, passengerId: string, passengerName: string): void {
    const joinedRide: joinRideObject = {
      rideId: rideId,
      pendingPassengerId: passengerId,
      pendingPassengerName: passengerName,
    };

    console.log("---------------------------");
    console.log("Ride Component - Approve Join Ride");
    console.log("Join Ride id is" + rideId);
    console.log("Join Ride passenger id is " + passengerId);
    console.log("Join Ride passenger name is " + passengerName);
    console.log("---------------------------");

    this.rideListService.approveJoinRide(joinedRide).subscribe(

      result => {
        console.log("Successfully approve ride:" + result);
        this.highlightedID = result;
        console.log('detecting changes after requesting ride');
        this.refreshRide();
      },
      err => {
        // This should probably be turned into some sort of meaningful response.
        console.log('There was an error adding the ride.');
        console.log('The newRide or dialogResult was ' );
        console.log('The error was ' + JSON.stringify(err));
      });
  };

  driveRide(rideId: string): void {

    const drivenRide: driveRideObject = {
      rideId: rideId,
      driverId: this.currUserId,
      driverName: this.currUserFullName,
    };

    this.rideListService.driveRide(drivenRide).subscribe(
      result => {
        this.highlightedID = result;
        this.refreshRide();
      },
      err => {
        // This should probably be turned into some sort of meaningful response.
        console.log('There was an error adding the ride.');
        console.log('The newRide or dialogResult was ' );
        console.log('The error was ' + JSON.stringify(err));
      });
  }

  leaveRide(rideID: string) {

    const leftRide: leaveRideObject = {
      userID: this.currUserId,
      rideID: rideID,
    };

    this.rideListService.leaveRide(leftRide).subscribe(
      result => {
        this.highlightedID = result;
        console.log("Did leaving the ride succeed? " + result);
        this.refreshRide();
        this.dialog.closeAll();
      },
      err => {
        // This should probably be turned into some sort of meaningful response.
        console.log('There was an error approving the ride.');
        console.log('The newRide or dialogResult was ' );
        console.log('The error was ' + JSON.stringify(err));
      });
  };

  declineJoinRide(rideId: string, passengerId: string, passengerName: string): void {
    const joinedRide: joinRideObject = {
      rideId: rideId,
      pendingPassengerId: passengerId,
      pendingPassengerName: passengerName,
    };

    console.log("---------------------------");
    console.log("Ride Component - Decline Join Ride");
    console.log("Join Ride id is" + rideId);
    console.log("Join Ride passenger id is " + passengerId);
    console.log("Join Ride passenger name is " + passengerName);
    console.log("---------------------------");

    this.rideListService.declineJoinRide(joinedRide).subscribe(

      result => {
        console.log("Successfully decline ride:" + result);
        this.highlightedID = result;
        this.refreshRide();
      },
      err => {
        // This should probably be turned into some sort of meaningful response.
        console.log('There was an error declining the ride.');
        console.log('The newRide or dialogResult was ' );
        console.log('The error was ' + JSON.stringify(err));
      });
  };

  requestJoinRide(rideId: string, passengerId: string, passengerName: string): void {

    const joinedRide: joinRideObject = {
      rideId: rideId,
      pendingPassengerId: passengerId,
      pendingPassengerName: passengerName,
    };

    console.log("---------------------------");
    console.log("Ride Component - Request Join Ride");
    console.log("Join Ride id is" + rideId);
    console.log("Join Ride passenger id is " + passengerId);
    console.log("Join Ride passenger name is " + passengerName);
    console.log("---------------------------");

    this.rideListService.requestJoinRide(joinedRide).subscribe(
      result => {
        console.log("Successfully requested ride:" + result);
        this.highlightedID = result;
        this.refreshRide();
      },
      err => {
        // This should probably be turned into some sort of meaningful response.
        console.log('There was an error requesting the ride.');
        console.log('The newRide or dialogResult was ' );
        console.log('The error was ' + JSON.stringify(err));
      });
  };

  //These methods are made to retrieve a specific id or name of a pending passenger
  //so they can be used to identify someone who's requesting a ride
  public retrievePendingPassengerId(idIndex: number): string{
    return this.ride.pendingPassengerIds[idIndex];
  }
  public retrievePendingPassengerName(nameIndex: number): string{
    return this.ride.pendingPassengerNames[nameIndex];
  }

  openDeleteDialog(currentId: object): void {
    const dialogRef = this.dialog.open(DeleteRideComponent, <MatDialogConfig>{
      width: '500px',
      data: {id: currentId}
    });

    dialogRef.afterClosed().subscribe(deletedRideId => {
      if (deletedRideId != null) {
        this.rideListService.deleteRide(deletedRideId).subscribe(

          result => {
            console.log('openDeleteDialog has gotten a result!');
            this.highlightedDestination = result;
            console.log('The result is ' + result);
            window.location.reload();
          },

          err => {
            console.log('There was an error deleting the ride.');
            console.log('The id we attempted to delete was  ' + deletedRideId);
            console.log('The error was ' + JSON.stringify(err));
          });
      }
    });
  }

  checkIfInRide() {
    for (let i = 0; i < this.people.length; i++) {
      if (this.currUserId == this.people[i].userId) {
        return true;
      }
    }
    return false;
  }

  public userOwnsThisRide(ride: Ride): boolean {
    return (ride.ownerID === this.currUserId);
  }

  public userCanJoinRide(ride: Ride): boolean {
    return (
      (ride.seatsAvailable > 0)
      && !this.userOwnsThisRide(ride)
      && !this.userIsAPassenger(ride)
      && !this.userIsAPendingPassenger(ride)
    )
  }

  public rideHasPassengerRequests(ride: Ride): boolean{
    return (ride.pendingPassengerIds.length > 0);
  }

  public userIsAPassenger(ride: Ride): boolean {
    return (ride.passengerIds.indexOf(this.currUserId) !== -1);
  }

  public userIsAPendingPassenger(ride: Ride): boolean {
    return (ride.pendingPassengerIds.indexOf(this.currUserId) !== -1);
  }

  // public userCanRequestRide(): boolean {
  //   return !(this.ride.driverID === this.currUserId) &&
  //          !(this.ride.passengerIds.indexOf(this.currUserId) !== -1) &&
  //           (this.ride.seatsAvailable > 0);
  // }

  public userCanLeaveRide(): boolean {
    return (this.ride.passengerIds.indexOf(this.currUserId) !== -1) ||
          ((this.ride.driverID) == this.currUserId);
  }

  refreshRide() {
    this.rideListService.getRide(this.ride._id.$oid).subscribe(ride => {
      this.ride = ride;
      this.checkPassengerRequests();
      this.refreshRiders();
    });
  }

  refreshRiders() {
    this.people = [];

    if (this.ride.driverID) {
      this.userService.getUserById(this.ride.driverID).subscribe( driver => {
        this.people.push(driver);
      });
    }

    for (let id of this.ride.passengerIds) {
      this.userService.getUserById(id).subscribe(user => {
        this.people.push(user);
      });
    }
  }

  ngOnInit() {
    this.checkPassengerRequests();
    this.refreshRiders();
    // this.people = [];
    //
    // if (this.ride.driverID) {
    //   this.userService.getUserById(this.ride.driverID).subscribe( driver => {
    //     this.people.push(driver);
    //   });
    // }
    //
    // for (let id of this.ride.passengerIds) {
    //   this.userService.getUserById(id).subscribe(user => {
    //     this.people.push(user);
    //   });
    // }
  }

  giveRideToService(ride: Ride){

    localStorage.setItem("rideId", ride._id.$oid);
    localStorage.setItem("rideUser", ride.owner);
    localStorage.setItem("rideUserId", ride.ownerID);
    localStorage.setItem("rideDriver", ride.driver);
    localStorage.setItem("rideDriverID", ride.driverID);
    if (!ride.notes) {
      localStorage.setItem("rideNotes", "");
    } else {
      localStorage.setItem("rideNotes", ride.notes);
    }
    localStorage.setItem("rideSeatsAvailable", ride.seatsAvailable.toString());
    localStorage.setItem("rideOrigin", ride.origin);
    localStorage.setItem("rideDestination", ride.destination);
    localStorage.setItem("rideDepartureDate", ride.departureDate);
    localStorage.setItem("rideDepartureTime", ride.departureTime);
    localStorage.setItem("rideRoundTrip", ride.roundTrip.toString());
    localStorage.setItem("rideNonSmoking", ride.nonSmoking.toString());

    this.rideListService.grabRide(ride);
  }

  /**
   * Converts 24 hour time to AM/PM (modified from Tushar Gupta @ https://jsfiddle.net/cse_tushar/xEuUR/)
   * @param {string} time The time to be parsed in 24 hour format, 00:00 to 23:59.
   * @returns {string} formats time like "12:00 AM" or "11:59 PM"
   */
  public hourParse(time) {
    if (time == null || !time) {
      return null;
    }
    let hours = time.substring(0,2);
    let min = time.substring(3,5);
    if(hours == 0) {
      return '12:' + min + ' AM';
    } else if (hours == 12) {
      return '12:' + min + ' PM';
    } else if (hours < 12) {
      if(hours<10){return hours[1] + ':' + min + ' AM';} //strip off leading 0, ie "09:XX" --> "9:XX"
      else{return hours + ':' + min + ' AM';}
    } else {
      hours = hours - 12;
      hours = (hours.length < 10) ? '0' + hours:hours;
      return hours + ':' + min + ' PM';
    }
  }
}
