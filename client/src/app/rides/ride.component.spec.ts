import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RideComponent } from './ride.component';
import {CustomModule} from "../custom.module";
import {RouterTestingModule} from "@angular/router/testing";
import {RideListService} from "./ride-list.service";
import {Ride} from "./ride";

describe('RideComponent', () => {
  let component: RideComponent;
  let fixture: ComponentFixture<RideComponent>;

  let rideListServiceStub: {
  };
  let rideStub: Ride = {
    _id: {$oid:''},
    owner: '',
    ownerID: '',
    notes: '',
    seatsAvailable: 0,
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    isDriving: false,
    nonSmoking: false,
    passengerIds: []
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ CustomModule, RouterTestingModule ],
      declarations: [ RideComponent ],
      providers: [{ provide: RideListService, useValue: rideListServiceStub }]
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
});
