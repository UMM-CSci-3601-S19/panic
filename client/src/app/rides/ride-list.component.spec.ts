import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {Ride} from './ride';
import {RideListComponent} from './ride-list.component';
import {RideListService} from './ride-list.service';
import {Observable} from 'rxjs/Observable';
import {FormsModule} from '@angular/forms';
import {CustomModule} from '../custom.module';
import {RouterLinkDirectiveStub} from "./router-link-directive-stub";

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import {By} from "@angular/platform-browser";
import {Subject} from "rxjs/Subject";
import {RideComponent} from "./ride.component";
import {ChatService} from "../chat/chat-service";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ChatComponent} from "../chat/chat.component";
import {UserService} from "../users/user.service";

describe('Ride list', () => {

  let rideComponent: RideComponent;
  let rideList: RideListComponent;
  let componentFixture: ComponentFixture<RideComponent>;
  let fixture: ComponentFixture<RideListComponent>;

  let rideListServiceStub: {
    getRides: () => Observable<Ride[]>,
    refreshNeeded$: Subject<void>,
  };

  let linkDes;
  let routerLinks;

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
      refreshNeeded$: new Subject<void>(),
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
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(RideListComponent);
      componentFixture = TestBed.createComponent(RideComponent);
      rideList = fixture.componentInstance;
      rideComponent = componentFixture.componentInstance;
      fixture.detectChanges();
      componentFixture.detectChanges();

      // find DebugElements with an attached RouterLinkStubDirective
      linkDes = fixture.debugElement.queryAll(By.directive(RouterLinkDirectiveStub));

      // get attached link directive instances
      // using each DebugElement's injector
      routerLinks = linkDes.map(de => de.injector.get(RouterLinkDirectiveStub));

    });
  }));

  //Affirmative containings: has the following items
  it('contains all the rides', () => {
    expect(rideList.rides.length).toBe(3);
  });

  it('contains a ride with owner \'Chris\' and his UserId', () => {
    expect(rideList.rides.some((ride: Ride) => ride.owner === 'Chris')).toBe(true);
    expect(rideList.rides.some((ride: Ride) => ride.ownerID === '001')).toBe(true);
  });

  it('contain a ride with owner \'Dennis\' and his UserId', () => {
    expect(rideList.rides.some((ride: Ride) => ride.owner === 'Dennis')).toBe(true);
    expect(rideList.rides.some((ride: Ride) => ride.ownerID === '002')).toBe(true);
  });

  it('has two rides that have 3 available seats', () => {
    expect(rideList.rides.filter((ride: Ride) => ride.seatsAvailable === 3).length).toBe(2);
  });

  it('has two rides that where a ride is being offered', () => {
    expect(rideList.rides.filter((ride: Ride) => ride.driver).length).toBe(2);
  });

  it('has one ride that where a ride is being requested', () => {
    expect(rideList.rides.filter((ride: Ride) => !ride.driver).length).toBe(1);
  });

  it('has two rides with origin \'UMM\'', () => {
    expect(rideList.rides.filter((ride: Ride) => ride.origin === 'UMM').length).toBe(2);
  });

  it('has one ride with destination \'Fergus Falls, MN\'', () => {
    expect(rideList.rides.filter((ride: Ride) => ride.destination === 'Fergus Falls, MN').length).toBe(1);
  });

  it('has one ride with departure time \'16:30:00\'', () => {
    expect(rideList.rides.filter((ride: Ride) => ride.departureTime === '16:30:00').length).toBe(1);
  });

  it('has one ride with departure date \'3/30/2019\'', () => {
    expect(rideList.rides.filter((ride: Ride) => ride.departureDate === '3/30/2019').length).toBe(1);
  });

  it('has one ride with _id \'dennis_id\'', () => {
    expect(rideList.rides.filter((ride: Ride) => ride._id.$oid === 'dennis_id').length).toBe(1);
  });

  it('has three rides with notes containing \'These are\'', () => {
    expect(rideList.rides.filter((ride: Ride) => ride.notes.includes('These are')).length).toBe(3);
  });

  it('has two rides with non-smoking indicated', () => {
    expect(rideList.rides.filter((ride: Ride) => ride.nonSmoking === true).length).toBe(2);
  });

  it('has one ride where non-smoking is not indicated', () => {
    expect(rideList.rides.filter((ride: Ride) => ride.nonSmoking === false).length).toBe(1);
  });

  it('has two rides with round-trip indicated', () => {
    expect(rideList.rides.filter((ride: Ride) => ride.roundTrip === true).length).toBe(2);
  });

  it('has one ride declared one way indicated', () => {
    expect(rideList.rides.filter((ride: Ride) => ride.roundTrip === false).length).toBe(1);
  });


  ///////////////////////////////////////////
  ////  Does not contain certain fields   ///
  ///////////////////////////////////////////


  it('doesn\'t contain a ride with owner \'Dilbert\'', () => {
    expect(rideList.rides.some((ride: Ride) => ride.owner === 'Dilbert')).toBe(false);
  });

  it('doesn\'t contain a ride with origin \'The Circus\'', () => {
    expect(rideList.rides.some((ride: Ride) => ride.origin === 'The Circus')).toBe(false);
  });

  it('doesn\'t have a ride with destination \'Wadena, MN\'', () => {
    expect(rideList.rides.some((ride: Ride) => ride.destination === 'Wadena, MN')).toBe(false);
  });

  it('doesn\'t have a ride with departure time \'17:30:00\'', () => {
    expect(rideList.rides.some((ride: Ride) => ride.departureTime === '17:30:00')).toBe(false);
  });

  it('doesn\'t have a ride with departure date \'11/30/2019\'', () => {
    expect(rideList.rides.some((ride: Ride) => ride.departureDate === '11/30/2019')).toBe(false);
  });

  it('doesn\'t have a ride with _id \'bob_id\'', () => {
    expect(rideList.rides.some((ride: Ride) => ride._id.$oid === 'bob_id')).toBe(false);
  });

  it('doesn\'t have a ride with notes \'Smoker\'', () => {
    expect(rideList.rides.some((ride: Ride) => ride.notes === 'Smoker')).toBe(false);
  });

  it('doesn\'t have a requested ride with zero or more seats available', () => {
    expect(rideList.rides.some((ride: Ride) => !ride.driver && ride.seatsAvailable > 0)).toBe(false);
  });
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////
  //////   Basic Filtering Tests   //////////
  ///////////////////////////////////////////

  it('filters by origin', () => {
    expect(rideList.filteredRides.length).toBe(3);
    rideList.rideOrigin = 'UM';
    rideList.refreshRides().subscribe(() => {
      expect(rideList.filteredRides.length).toBe(2);
    });
  });

  it('filters by destination', () => {
    expect(rideList.filteredRides.length).toBe(3);
    rideList.rideDestination = 'Fergus';
    rideList.refreshRides().subscribe(() => {
      expect(rideList.filteredRides.length).toBe(1);
    });
  });

  it('filters by isDriving TRUE', () => {
    expect(rideList.filteredRides.length).toBe(3);
    rideList.rideDriving = true;
    rideList.refreshRides().subscribe(() => {
      expect(rideList.filteredRides.length).toBe(2);
    });
  });

  it('filters by isDriving FALSE', () => {
    expect(rideList.filteredRides.length).toBe(3);
    rideList.rideDriving = false;
    rideList.refreshRides().subscribe(() => {
      expect(rideList.filteredRides.length).toBe(1);
    });
  });
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////
  ////  Tag Filtering Tests   ////////
  ////////////////////////////////////

  // Tag filtering works like this: if you check the nonSmoking checkbox,
  // ride-list only displays rides with nonSmoking specified. However, unchecking the box
  // displays rides with AND without the nonSmoking tag. The same is true for roundTrip tag.

  // Therefore, without the nonSmoking checked, we SHOULD get all the rides (given that all other filters are
  // their original values.

  // Since the rideNonSmoking parameter is false be default, we should have all rides at first.
  it('filters by nonSmoking tag', () => {
    expect(rideList.filteredRides.length).toBe(3);

    // Now, we set rideNonSmoking to true and should see a change in the ride-list.
    rideList.rideNonSmoking = true;
    rideList.refreshRides().subscribe(() => {
      expect(rideList.filteredRides.length).toBe(2);
    });
  });

  // As explained earlier, roundTrip works the same way.
  it('filters by roundTrip tag', () => {
    // roundTrip is false by default.
    expect(rideList.filteredRides.length).toBe(3);

    // Now we set roundTrip to true and test.
    rideList.rideRoundTrip = true;
    rideList.refreshRides().subscribe(() => {
      expect(rideList.filteredRides.length).toBe(2);
    });
  });
  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////
  /////  Combining filters   /////////////
  ////////////////////////////////////////

  it('filters by origin and destination', () => {
    expect(rideList.filteredRides.length).toBe(3);
    rideList.rideOrigin = 'UMM';
    rideList.rideDestination = 'w';
    rideList.refreshRides().subscribe(() => {
      expect(rideList.filteredRides.length).toBe(1);
    });
  });

  it('filters by isDriving and nonSmoking', () => {
    expect(rideList.filteredRides.length).toBe(3);
    rideList.rideDriving = true;
    rideList.rideNonSmoking = true;
    rideList.refreshRides().subscribe(() => {
      expect(rideList.filteredRides.length).toBe(1);
    });
  });

  it('filters by isDriving and roundTrip', () => {
    expect(rideList.filteredRides.length).toBe(3);
    rideList.rideDriving = true;
    rideList.rideRoundTrip = true;
    rideList.refreshRides().subscribe(() => {
      expect(rideList.filteredRides.length).toBe(1);
    });
  });

  it('filters by nonSmoking and roundTrip', () => {
    expect(rideList.filteredRides.length).toBe(3);
    rideList.rideNonSmoking = true;
    rideList.rideRoundTrip = true;
    rideList.refreshRides().subscribe(() => {
      expect(rideList.filteredRides.length).toBe(2);
    });
  });

  it('filters by origin, destination, isDriving, nonSmoking, and roundTrip', () => {
    expect(rideList.filteredRides.length).toBe(3);
    rideList.rideOrigin = 'UMM';
    rideList.rideDestination = 'w';
    rideList.rideDriving = true;
    rideList.rideNonSmoking = true;
    rideList.rideRoundTrip = true;
    rideList.refreshRides().subscribe(() => {
      expect(rideList.filteredRides.length).toBe(1);
    });
  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////
  /////  Testing Join Requests   /////////////
  ////////////////////////////////////////////

  it('contains all the rides', () => {
    expect(rideList.rides.length).toBe(3);
  });

  /*it('request a ride', () => {
    expect(rideList.rides.some((ride: Ride) => ride.pendingPassengerIds[0] === "002")).toBe(false);
    expect(rideList.rides.some((ride: Ride) => ride.pendingPassengerNames[0] === 'Dennis')).toBe(false);
    rideComponent.requestJoinRide('chris_id', "002", 'Dennis');
    rideList
    rideList.refreshRides().subscribe(() => {
      expect(rideList.rides.some((ride: Ride) => ride.pendingPassengerIds[0] === "002")).toBe(true);
      expect(rideList.rides.some((ride: Ride) => ride.pendingPassengerNames[0] === 'Dennis')).toBe(true);
    });
  });

  it('accept a ride', () =>{
    expect(rideList.rides.some((ride: Ride) => ride.pendingPassengerIds === "002")).toBe(false);
    expect(rideList.rides.some((ride: Ride) => ride.pendingPassengerNames === 'Dennis')).toBe(false);
    expect(rideList.rides.some((ride: Ride) => ride.passengerIds === "002")).toBe(false);
    expect(rideList.rides.some((ride: Ride) => ride.passengerNames === 'Dennis')).toBe(false);
    rideComponent.requestJoinRide('chris_id', "002", 'Dennis');
    rideComponent.approveJoinRide('chris_id', "002", 'Dennis');
    rideList.refreshRides().subscribe(() => {
      expect(rideList.rides.some((ride: Ride) => ride.pendingPassengerIds === "002")).toBe(false);
      expect(rideList.rides.some((ride: Ride) => ride.pendingPassengerIds === 'Dennis')).toBe(false);
      expect(rideList.rides.some((ride: Ride) => ride.passengerIds === "002")).toBe(true);
      expect(rideList.rides.some((ride: Ride) => ride.passengerNames === 'Dennis')).toBe(true);
    });
  });

  it('decline a ride', () => {
    expect(rideList.rides.some((ride: Ride) => ride.pendingPassengerIds === "002")).toBe(false);
    expect(rideList.rides.some((ride: Ride) => ride.pendingPassengerNames === 'Dennis')).toBe(false);
    expect(rideList.rides.some((ride: Ride) => ride.passengerIds === "002")).toBe(false);
    expect(rideList.rides.some((ride: Ride) => ride.passengerNames.length === 'Dennis')).toBe(false);
    rideComponent.requestJoinRide('chris_id', "002", 'Dennis');
    rideComponent.declineJoinRide('chris_id', "002", 'Dennis');
    rideList.refreshRides().subscribe(() => {
      expect(rideList.rides.some((ride: Ride) => ride.pendingPassengerIds === "002")).toBe(false);
      expect(rideList.rides.some((ride: Ride) => ride.pendingPassengerNames === 'Dennis')).toBe(false);
      expect(rideList.rides.some((ride: Ride) => ride.passengerIds === "002")).toBe(false);
      expect(rideList.rides.some((ride: Ride) => ride.passengerNames === 'Dennis')).toBe(false);
    });
  });*/
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

describe('Misbehaving Ride List', () => {
  let rideList: RideListComponent;
  let fixture: ComponentFixture<RideListComponent>;

  let rideListServiceStub: {
    getRides: () => Observable<Ride[]>
    refreshNeeded$: Subject<void>
  };

  let linkDes;
  let routerLinks;

  beforeEach(() => {
    // stub RideService for test purposes
    rideListServiceStub = {
      getRides: () => Observable.create(observer => {
        observer.error('Error-prone observable');
      }),
      refreshNeeded$: new Subject<void>()
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, CustomModule, HttpClientTestingModule],
      declarations: [RideListComponent,RouterLinkDirectiveStub, RideComponent,ChatComponent],
      providers: [{provide: RideListService, useValue: rideListServiceStub},
        ChatService,
        UserService
      ]
    });
  });

  beforeEach(async(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(RideListComponent);
      rideList = fixture.componentInstance;
      fixture.detectChanges();

      // find DebugElements with an attached RouterLinkStubDirective
      linkDes = fixture.debugElement.queryAll(By.directive(RouterLinkDirectiveStub));

      // get attached link directive instances
      // using each DebugElement's injector
      routerLinks = linkDes.map(de => de.injector.get(RouterLinkDirectiveStub));
    });
  }));

  it('generates an error if we don\'t set up a RideListService', () => {
    // Since the observer throws an error, we don't expect rides to be defined.
    expect(rideList.rides).toBeUndefined();
  });
});

