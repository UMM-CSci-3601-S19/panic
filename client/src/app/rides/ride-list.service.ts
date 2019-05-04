import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';

import {Ride} from './ride';
import {environment} from '../../environments/environment';
import {joinRideObject} from "./joinRideObject";
import {leaveRideObject} from "./leaveRideObject";
import {Subject} from "rxjs/Subject";
import {tap} from "rxjs/operators";




@Injectable()
export class RideListService {
  readonly baseUrl: string = environment.API_URL + 'rides';
  private rideUrl: string = this.baseUrl;
  public singleRide: Ride;

  constructor(private http: HttpClient) {
  }

  private _refreshNeeded$ = new Subject<void>();

  get refreshNeeded$() {
    return this._refreshNeeded$;
  }

  getRides(): Observable<Ride[]> {
    return this.http.get<Ride[]>(this.rideUrl);
  }

  addNewRide(newRide: Ride): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        // We're sending JSON
        'Content-Type': 'application/json'
      }),
      // But we're getting a simple (text) string in response
      // The server sends the hex version of the new ride back
      // so we know how to find/access that user again later.
      responseType: 'text' as 'json'
    };

    // Send post request to add a new user with the user data as the body with specified headers.
    return this.http.post<string>(this.rideUrl + '/new', newRide, httpOptions)
      .pipe(
        tap(() => {
          this._refreshNeeded$.next();
          })
      );
  }




  approveJoinRide(editedRide: joinRideObject) {

    console.log("We have reached approveJoinRide in Ride List Service!!!!");

    const httpOptions = {
      headers: new HttpHeaders({
        // We're sending JSON
        'Content-Type': 'application/json'
      }),
      // But we're getting a simple (text) string in response
      // The server sends the hex version of the new ride back
      // so we know how to find/access that user again later.
      responseType: 'text' as 'json'
    };

    return this.http.post<string>(this.rideUrl + '/approve-join', editedRide, httpOptions)
      .pipe(
        tap(() => {
          this._refreshNeeded$.next();
        })
      );
  }

  declineJoinRide(editedRide: joinRideObject) {

    console.log("We have reached declineJoinRide in Ride List Service!!!!");

    const httpOptions = {
      headers: new HttpHeaders({
        // We're sending JSON
        'Content-Type': 'application/json'
      }),
      // But we're getting a simple (text) string in response
      // The server sends the hex version of the new ride back
      // so we know how to find/access that user again later.
      responseType: 'text' as 'json'
    };

    return this.http.post<string>(this.rideUrl + '/decline-join', editedRide, httpOptions)
      .pipe(
        tap(() => {
          this._refreshNeeded$.next();
        })
      );
  }

  requestJoinRide(editedRide: joinRideObject) {

    console.log("We have reached requestJoinRide in Ride List Service!!!!");

    const httpOptions = {
      headers: new HttpHeaders({
        // We're sending JSON
        'Content-Type': 'application/json'
      }),
      // But we're getting a simple (text) string in response
      // The server sends the hex version of the new ride back
      // so we know how to find/access that user again later.
      responseType: 'text' as 'json'
    };

    return this.http.post<string>(this.rideUrl + '/request-join', editedRide, httpOptions)
      .pipe(
        tap(() => {
          this._refreshNeeded$.next();
        })
      );
  }

  leaveRide(leaveRideObject: leaveRideObject) {

    const httpOptions = {
      headers: new HttpHeaders({
        // We're sending JSON
        'Content-Type': 'application/json'
      }),
      // But we're getting a simple (text) string in response
      // The server sends the hex version of the new ride back
      // so we know how to find/access that user again later.
      responseType: 'text' as 'json'
    };

    return this.http.post<string>(this.rideUrl + '/leave', leaveRideObject, httpOptions)
      .pipe(
        tap(() => {
          this._refreshNeeded$.next();
        })
      );
  }


  grabRide(ride: Ride){
    this.singleRide = ride;
  }

  editRide(editedRide: Ride): Observable<string> {

    console.log("SERVICE: Here is the edited ride" + JSON.stringify(editedRide));

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      responseType: 'text' as 'json'
    };

    console.log("Sending the ride to the server " + this.rideUrl);
    return this.http.post<string>(this.rideUrl + '/update', editedRide, httpOptions)
      .pipe(
        tap(() => {
          this._refreshNeeded$.next();
        }));
  }

  deleteRide(deleteId: String): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      responseType: 'text' as 'json'
    };
    let deleteDoc: string = "{ \"_id\": \"" + deleteId + "\"}";

    return this.http.post<string>(this.rideUrl + '/remove', deleteDoc, httpOptions);
  }

}
