import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import Credentials from '../../../credentials.json';

import {Observable} from 'rxjs/Observable';

import {environment} from '../../environments/environment';
import {Ride} from "../rides/ride";
import {User} from "../users/user";
import * as stream from 'getstream';
import {Message} from "../message/message";

@Injectable()
export class ChatService {
  readonly baseUrl: string = environment.API_URL + 'chat';
  private API_KEY = (<any>Credentials).API_KEY;
  public client;
  private loggedInUser = JSON.parse(localStorage.user);
  private userToken;

  constructor(private http: HttpClient) {
    this.connectStream();
  }

  sendMessage(message: Message, feedId: string) {
    let rideFeed = this.client.feed('ride', feedId, this.userToken);

    let activity = {
      actor: message.from._id,
      verb: "send",
      object: message,
      foreign_id: feedId
    };

    rideFeed.addActivity(activity)
      .then(function(data) {
        console.log("Successfully posted message: " + JSON.stringify(data));
      })
      .catch(function(reason) {
        console.log(reason.error);
      });
  }

  getMessages(feedId: string): Promise<any> {
    let rideFeed = this.client.feed('ride', feedId, this.userToken);

    return new Promise( (resolve, reject) => {
      rideFeed.get().then( feedData => {
        resolve(feedData.results);
      }).catch(reason => {
        console.log(reason.error);
        reject([]);
      });
    });
  }

  deleteChat(feedId: string) {
    let rideFeed = this.client.feed('ride', feedId, this.userToken);

    console.log("Deleting messages in chat: " + feedId);
    rideFeed.removeActivity({ foreignId: feedId })
      .then( data => {
        console.log("Successful deleted messages in chat: " + JSON.stringify(data));
      })
      .catch ( reason => {
        console.log("Failed to delete messages in chat: " + JSON.stringify(reason.error));
      });
  }

  connectStream() {
    this.getToken(this.loggedInUser).subscribe( userToken => {
      this.userToken = userToken;
      this.client = stream.connect(this.API_KEY, userToken,"49831");
      return this.client;
    });
  }

  checkStream() {
    if (!this.client) { return this.connectStream(); }
  }

  /**
   * Obtains a token from the server, currently an all-access token that gives this user
   * the ability to create, read, update, and delete any GetStream resource.
   * @param {Object} user
   * @returns {Observable<string>}
   */
  getToken(user: User): Observable<string> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      responseType: 'text' as 'json'
    };

    return this.http.post<string>(this.baseUrl + "/authenticate", user, httpOptions);
  }
}
