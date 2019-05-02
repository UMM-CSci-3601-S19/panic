import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {User} from "./user";
import {Ride} from "../rides/ride";
import {environment} from '../../environments/environment';
import {profileInfoObject} from "./profileInfoObject";


@Injectable()
export class UserService {
  readonly baseUrl: string = environment.API_URL + 'user';
  private userUrl: string = this.baseUrl;

  constructor(private http: HttpClient) {
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(this.userUrl + '/' + userId);
  }

  getMyRides(userId: string): Observable<Ride[]> {
    return this.http.get<Ride[]>(environment.API_URL + 'myRides/' + userId);
  }

  saveProfileInfo(profileInfo: profileInfoObject){
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      responseType: 'text' as 'json'
    };

    return this.http.post<string>(this.userUrl + '/saveProfile', profileInfo, httpOptions);
  }
}
