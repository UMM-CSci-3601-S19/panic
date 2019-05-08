import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {HttpClient} from '@angular/common/http';
import {User} from "./user";
import {Ride} from "../rides/ride";
import {UserService} from "./user.service";
import {profileInfoObject} from "./profileInfoObject";

describe ('User Service: ',() =>{
  const testUser: User =
    {
      _id: "5cb4fc0e61617348950e29d8",
      userId: "655477182929676100000",
      email: "bananacat123@hotmail.com",
      fullName: "Bindi Jenson",
      pictureUrl: "https://bit.ly/2IyHf4I",
      lastName: "Jenson",
      firstName: "Bindi",
      phone: "(981) 461-3498"
    };

  const testRides: Ride[] = [
    {
      _id: {$oid: '5c832bec201270bd881ace79'},
      owner: "Suzette Rutledge",
      ownerID: "342389477594424000000",
      notes: "Occaecat reprehenderit do exercitation laborum. Dolore culpa ut veniam ipsum fugiat voluptate excepteur labore laborum ad Lorem sint aute.",
      seatsAvailable: 1,
      origin: "8631 Hudson Avenue, Crayne, IA 98438",
      destination: "1660 Judge Street, Winston, SD 44478",
      departureDate: "2019-05-11T05:00:00.000Z",
      departureTime: "16:19",
      roundTrip: false,
      nonSmoking: true

    },
  ];

  const testProfileInfo: profileInfoObject = {
    userId: "655477182929676100000",
    phone: "(981) 461-3498"
  };

  const expectedProfileInfo: string ='{"userId":"655477182929676100000","phone":"(981) 461-3498"}';


  let userService: UserService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports:[HttpClientTestingModule]
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);

    userService = new UserService(httpClient);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('getUserById(userId: string) calls api/user/:id', () => {

    userService.getUserById('655477182929676100000').subscribe(
      user => expect(user).toBe(testUser)
    );

    const req = httpTestingController.expectOne(userService.baseUrl + '/655477182929676100000');
    expect(req.request.method).toEqual('GET');
    req.flush(testUser);
  });


  it('getMyRides(userId: string) calls api/MyRides', () => {

     userService.getMyRides("342389477594424000000").subscribe(
       userRides => expect(userRides).toBe(testRides)
     );

     const req = httpTestingController.expectOne('http://localhost:4567/api/myRides/342389477594424000000');
     expect(req.request.method).toEqual('GET');
     req.flush(testRides);
  });

  it('saveProfileInfo(profileInfo: profileInfoObject) calls api/user/saveProfile',() => {

    userService.saveProfileInfo(testProfileInfo).subscribe(
      userProfileInfo => expect(userProfileInfo).toBe(expectedProfileInfo)
    );

    const req = httpTestingController.expectOne(userService.baseUrl + '/saveProfile');
    expect(req.request.method).toEqual('POST');
    req.flush(testProfileInfo);
  });

});
