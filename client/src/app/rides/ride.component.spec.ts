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
  let fixture: ComponentFixture<RideComponent>;

  let componentServiceStub: {
  };
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
});
