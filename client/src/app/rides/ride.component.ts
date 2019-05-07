import {Component, Input, OnInit} from '@angular/core';
import {Ride} from "./ride";
import {RideListService} from "./ride-list.service";
import {requestRideObject} from "./requestRideObject";
import {driveRideObject} from "./driveRideObject";
import {DeleteRideComponent} from "./delete-ride.component";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {leaveRideObject} from "./leaveRideObject";
import {ChatComponent} from "../chat/chat.component";
import {User} from "../users/user";
import {UserService} from "../users/user.service";

@Component({
  selector: 'app-ride',
  templateUrl: './ride.component.html',
  styleUrls: ['./ride.component.scss']
})
export class RideComponent implements OnInit {

  @Input() ride: Ride;

  public currUserId = localStorage.getItem("userId");
  public currUserFullName = localStorage.getItem("userFullName");

  private highlightedID: string = '';
  private highlightedDestination: string = '';

  public fullCard: boolean = false;
  public people: User[];

  constructor(private rideListService: RideListService,
              public userService: UserService,
              public dialog: MatDialog) {
  }

  ngOnInit() {
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

  checkIfInRide() {
    for (let i = 0; i < this.people.length; i++) {
      if (this.currUserId == this.people[i].userId) {
        return true;
      }
    }
    return false;
  }

  openRide() {
    const dialogRef = this.dialog.open(RideComponent, <MatDialogConfig>{
      maxWidth: '100vw',
      maxHeight: '100vh'
    });
    dialogRef.componentInstance.fullCard = true;
    dialogRef.componentInstance.ride = this.ride;
  }

  driveRide(rideId: string, driverId: string, driverName: string): void {
    const drivenRide: driveRideObject = {
      rideId: rideId,
      driverId: driverId,
      driverName: driverName,
    };
    this.rideListService.driveRide(drivenRide).subscribe(

      result => {
        this.highlightedID = result;
      },
      err => {
        // This should probably be turned into some sort of meaningful response.
        console.log('There was an error adding the ride.');
        console.log('The newRide or dialogResult was ' );
        console.log('The error was ' + JSON.stringify(err));
      });
  }

  requestRide(rideId: string, passengerId: string, passengerName: string): void {

    const requestedRide: requestRideObject = {
      rideId: rideId,
      passengerId: passengerId,
      passengerName: passengerName,
    };

    this.rideListService.requestRide(requestedRide).subscribe(

      result => {
        this.highlightedID = result;
      },
      err => {
        // This should probably be turned into some sort of meaningful response.
        console.log('There was an error adding the ride.');
        console.log('The newRide or dialogResult was ' );
        console.log('The error was ' + JSON.stringify(err));
      });
  };

  openChat(rideId: string): void {
    const dialogRef = this.dialog.open(ChatComponent, <MatDialogConfig>{
      maxWidth: '100vw',
      maxHeight: '100vh',
    });
    dialogRef.componentInstance.feedId = rideId;
  }

  openDeleteDialog(currentId: object): void {
    const dialogRef = this.dialog.open(DeleteRideComponent, {
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

  // These three methods are mainly used for checking if a user is allowed to join a ride, but some are also used in
  // ngIf statements for displaying certain elements on the ride cards.
  public userCanRequestRide(ride: Ride): boolean {
    return (
      (ride.seatsAvailable > 0)
      && !this.userOwnsThisRide(ride)
      && !this.userIsAPassenger(ride)
    )
  }
  public userIsDriving(ride: Ride): boolean {
    return (ride.driverId === this.currUserId);
  }

  public userOwnsThisRide(ride: Ride): boolean {
    return (ride.ownerID === this.currUserId);
  }

  public userIsAPassenger(ride: Ride): boolean {
    return (ride.passengerIds.indexOf(this.currUserId) !== -1);
  }

  public userCanDriveRide(ride: Ride): boolean {
    return (
      !this.userIsDriving(ride)
      && !this.userIsAPassenger(ride)
    )
  }
  public userIsADriver(ride: Ride): boolean {
    return (ride.driverId) == this.currUserId;

  }

  giveRideToService(ride: Ride){

    localStorage.setItem("rideId", ride._id.$oid);
    localStorage.setItem("rideUser", ride.owner);
    localStorage.setItem("rideUserId", ride.ownerID);
    localStorage.setItem("rideDriver", ride.driver);
    localStorage.setItem("rideDriverID", ride.driverID);
    localStorage.setItem("rideNotes", ride.notes);
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
    if (time == null) {
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

  leaveRide(userID: string, rideID: string) {

    const leftRide: leaveRideObject = {
      userID: userID,
      rideID: rideID,
    };

    this.rideListService.leaveRide(leftRide).subscribe(

      result => {
        this.highlightedID = result;
      },
      err => {
        // This should probably be turned into some sort of meaningful response.
        console.log('There was an error adding the ride.');
        console.log('The newRide or dialogResult was ' );
        console.log('The error was ' + JSON.stringify(err));
      });
  };
}
