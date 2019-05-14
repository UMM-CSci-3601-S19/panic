import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RideComponent } from './ride.component';
import {CustomModule} from "../custom.module";
import {RouterTestingModule} from "@angular/router/testing";
import {RideListService} from "./ride-list.service";
import {Ride} from "./ride";
import {UserService} from "../users/user.service";
import {ChatComponent} from "../chat/chat.component";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ProfileService} from "../users/profile.service";

describe('RideComponent', () => {
  let component: RideComponent;
  let rideList: RideListComponent;
  let componentFixture: ComponentFixture<RideComponent>;
  let fixture: ComponentFixture<RideComponent>;

  let rideListServiceStub: {
    getRides: () => Observable<Ride[]>,
    refreshNeeded$: Subject<void>,
    requestJoinRide: () => Observable<joinRideObject>
  };

  let linkDes;
  let routerLinks;
  let rideStub: Ride = {
    owner: '',
    ownerID: '',
    notes: '',
    seatsAvailable: 0,
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    nonSmoking: false,
    passengerIds: [],
    passengerNames: [],
    pendingPassengerIds: [],
    pendingPassengerNames: []
  };


  let componentServiceStub: {
  };
  beforeEach(() => {
    // stub RideService for test purposes
    rideListServiceStub = {
      getRides: () => Observable.of([
        {
          _id: {$oid: 'chris_id'},
          owner: 'Chris',
          ownerID: "001",
          driver: 'Chris',
          driverID: 'chris_id',
          notes: 'These are Chris\'s ride notes',
          seatsAvailable: 3,
          origin: 'UMM',
          destination: 'Willie\'s',
          departureDate: '3/6/2019',
          departureTime: '10:00:00',
          nonSmoking: true,
          roundTrip: true,
          pendingPassengerIds: [],
          pendingPassengerNames: [],
          passengerIds: [],
          passengerNames: []
        },
        {
          _id: {$oid: 'dennis_id'},
          owner: 'Dennis',
          ownerID: "002",
          notes: 'These are Dennis\'s ride notes',
          seatsAvailable: -1,
          origin: 'Caribou Coffee',
          destination: 'Minneapolis, MN',
          departureDate: '8/15/2018',
          departureTime: '11:30:00',
          nonSmoking: true,
          roundTrip: true,
          pendingPassengerIds: [],
          pendingPassengerNames: [],
          passengerIds: ["002"],
          passengerNames: ['Dennis']
        },
        {
          _id: {$oid: 'agatha_id'},
          owner: 'Agatha',
          ownerID: "003",
          driver: 'Agatha',
          driverID: 'agatha_id',
          notes: 'These are Agatha\'s ride notes',
          seatsAvailable: 3,
          origin: 'UMM',
          destination: 'Fergus Falls, MN',
          departureDate: '3/30/2019',
          departureTime: '16:30:00',
          nonSmoking: false,
          roundTrip: false,
          pendingPassengerIds: [],
          pendingPassengerNames: [],
          passengerIds: [],
          passengerNames: []
        }
      ]),
      requestJoinRide: () => Observable.of({
        rideId: 'chris_id',
        pendingPassengerId: "002",
        pendingPassengerName: 'Dennis'
      }),
      refreshNeeded$: new Subject<void>()
    };

    TestBed.configureTestingModule({
      imports: [CustomModule, HttpClientTestingModule],
      declarations: [RideListComponent,RouterLinkDirectiveStub,RideComponent, ChatComponent],
      providers: [
        {provide: RideListService, useValue: rideListServiceStub},
        ChatService,
        UserService,
        RideComponent
      ]
    });
  });



  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ CustomModule, RouterTestingModule, HttpClientTestingModule ],
      declarations: [ RideComponent, ChatComponent ],
      providers: [
        { provide: RideListService, useValue: componentServiceStub },
        ProfileService,
        UserService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RideComponent);
    component = fixture.componentInstance;
    component.ride = rideStub;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //TIME AND DATE PARSING
  //Time parsing from 24 hour format to 12 hour AM/PM
  it('the client parses 13:01 time to 1:01 PM', () => {
    expect(component.hourParse("13:01")).toBe("1:01 PM");
  });

  it('the client parses 23:59 time to 11:59 PM', () => {
    expect(component.hourParse("23:59")).toBe("11:59 PM");
  });

  it('the client parses 00:00 time to 12:00 AM', () => {
    expect(component.hourParse("00:00")).toBe("12:00 AM");
  });

  it('the client parses 00:59 time to 12:59 AM', () => {
    expect(component.hourParse("00:59")).toBe("12:59 AM");
  });

  it('the client parses 12:00 time to 12:00 PM', () => {
    expect(component.hourParse("12:00")).toBe("12:00 PM");
  });

  it('the client parses 12:30 time to 12:30 PM', () => {
    expect(component.hourParse("12:30")).toBe("12:30 PM");
  });

  it('the client parses 15:30 time to 3:30 PM', () => {
    expect(component.hourParse("15:30")).toBe("3:30 PM");
  });

  it('the client parses 09:44 time to 9:44 AM', () => {
    expect(component.hourParse("09:44")).toBe("9:44 AM");
  });

  it('the client parses 11:03 time to 11:03 AM', () => {
    expect(component.hourParse("11:03")).toBe("11:03 AM");
  });

  it('the client parses 10:00 time to 10:00 AM', () => {
    expect(component.hourParse("10:00")).toBe("10:00 AM");
  });

  it('the client parses 09:59 time to 9:59 AM', () => {
    expect(component.hourParse("09:59")).toBe("9:59 AM");
  });



  /*it('contains all the rides', () => {
    expect(component.rides.length).toBe(3);
  });

  it('request a ride', () => {
    expect(component.rides.some((ride: Ride) => ride.pendingPassengerIds[0] === "002")).toBe(false);
    expect(component.rides.some((ride: Ride) => ride.pendingPassengerNames[0] === 'Dennis')).toBe(false);
    component.requestJoinRide('chris_id', "002", 'Dennis');
    rideList.refreshRides().subscribe(() => {

      expect(component.rides.some((ride: Ride) => ride.pendingPassengerIds[0] === "002")).toBe(true);
      expect(component.rides.some((ride: Ride) => ride.pendingPassengerNames[0] === 'Dennis')).toBe(true);
    });
  });

  it('accept a ride', () =>{
    expect(component.rides.some((ride: Ride) => ride.pendingPassengerIds[0] === "002")).toBe(false);
    expect(component.rides.some((ride: Ride) => ride.pendingPassengerNames[0] === 'Dennis')).toBe(false);
    expect(component.rides.some((ride: Ride) => ride.passengerIds[0] === "002")).toBe(false);
    expect(component.rides.some((ride: Ride) => ride.passengerNames[0] === 'Dennis')).toBe(false);
    component.requestJoinRide('chris_id', "002", 'Dennis');
    component.approveJoinRide('chris_id', "002", 'Dennis');
    rideList.refreshRides().subscribe(() => {
      expect(component.rides.some((ride: Ride) => ride.pendingPassengerIds[0] === "002")).toBe(false);
      expect(component.rides.some((ride: Ride) => ride.pendingPassengerIds[0] === 'Dennis')).toBe(false);
      expect(component.rides.some((ride: Ride) => ride.passengerIds[0] === "002")).toBe(true);
      expect(component.rides.some((ride: Ride) => ride.passengerNames[0] === 'Dennis')).toBe(true);
    });
  });

  it('decline a ride', () => {
    expect(component.rides.some((ride: Ride) => ride.pendingPassengerIds[0] === "002")).toBe(false);
    expect(component.rides.some((ride: Ride) => ride.pendingPassengerNames[0] === 'Dennis')).toBe(false);
    expect(component.rides.some((ride: Ride) => ride.passengerIds[0] === "002")).toBe(false);
    expect(component.rides.some((ride: Ride) => ride.passengerNames.length[0] === 'Dennis')).toBe(false);
    component.requestJoinRide('chris_id', "002", 'Dennis');
    component.declineJoinRide('chris_id', "002", 'Dennis');
    rideList.refreshRides().subscribe(() => {
      expect(component.rides.some((ride: Ride) => ride.pendingPassengerIds[0] === "002")).toBe(false);
      expect(component.rides.some((ride: Ride) => ride.pendingPassengerNames[0] === 'Dennis')).toBe(false);
      expect(component.rides.some((ride: Ride) => ride.passengerIds[0] === "002")).toBe(false);
      expect(component.rides.some((ride: Ride) => ride.passengerNames[0] === 'Dennis')).toBe(false);
    });
  });*/
});
