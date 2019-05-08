import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';
import 'rxjs/add/observable/of';

declare let gapi: any;

@Injectable()
export class AppService {
  private http: HttpClient;

  constructor(private client: HttpClient) {
    this.http = client;
  }

  signIn() {
    console.log("Signing in");
    console.log("gapi " + gapi.toString());
    console.log("gapi.auth2 " + gapi.auth2);
    let authInstance = gapi.auth2.getAuthInstance();
    authInstance.signIn()
      .then((data) => {
        let idToken = data.getAuthResponse().id_token;
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json'
          }),
          responseType: 'text' as 'json'
        };

        this.http.post(environment.API_URL + "login", {idToken: idToken}, httpOptions)
          .subscribe(serverData => {
            console.log("Code sent to server");
            let data = serverData.toString();
            let currUser = JSON.parse(data);
            localStorage.setItem("isSignedIn", 'true');
            localStorage.setItem("userId", currUser.userId);
            localStorage.setItem("userFullName", currUser.fullName);
            localStorage.setItem("pictureUrl", currUser.pictureUrl);
            window.location.reload();
          });
    });
  }

  signOut() {
    let authInstance = gapi.auth2.getAuthInstance();

    if (authInstance.signOut()) {
      localStorage.removeItem('isSignedIn');
      localStorage.removeItem("userId");
      localStorage.removeItem("userFullName");
      localStorage.removeItem("pictureUrl");
      window.location.reload();
    }
  }

  public isSignedIn(): boolean {
    let status = localStorage.getItem('isSignedIn');
    return status == "true";
  }

  loadClient() {
    console.log("gapi follows:");
    console.log(gapi);
    gapi.load('auth2', function() {
      gapi.auth2.init({'clientId': '828151406788-7pmre36dp4bboog4j03fl3ochdc6ed8r.apps.googleusercontent.com'});
    });
  }

  ngOnInit() {
    this.loadClient();
  }
}
