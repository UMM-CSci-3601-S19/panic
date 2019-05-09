import { Injectable } from '@angular/core';
import {FormControl, Validators, FormGroup, FormBuilder} from '@angular/forms';

@Injectable()

export class ValidatorService {

  public rideForm: FormGroup;
  constructor(private fb: FormBuilder) { }

  ride_validation_messages = {

    'seatsAvailable': [
      {type: 'required', message: 'Please specify how many seats you\'re offering'},
      {type: 'min', message: 'Please offer at least 1 seat (or 0)'},
      {type: 'max', message: 'Can\'t offer more than 12 seats'}
    ],

    'origin': [
      {type: 'required', message: 'Origin is required'},
      {type: 'maxLength', message: 'Origin cannot be that long'},
      {type: 'pattern', message: 'There is an invalid character'}
    ],

    'destination': [
      {type: 'required', message: 'Destination is required'},
      {type: 'maxLength()', message: 'Destination cannot be that long'},
      {type: 'pattern', message: 'There is an invalid character'}
    ],

    'driving' : [
      {type: 'required', message: 'You must indicate whether you are the driver or not'},
    ],
    'departureDate' : [
      {type: 'required', message: 'Please enter a date'}
    ],
    'notes' : [
      {type: 'maxLength', message: 'Notes cannot be that long'},
      {type: 'pattern', message: 'There is an invalid character'}
    ]
  };

  createForm() {

    this.rideForm = this.fb.group({

      origin: new FormControl('origin', Validators.compose([
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern('^[ a-zA-Z0-9.,\']+$')
      ])),

      destination: new FormControl('destination', Validators.compose([
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern('^[ a-zA-Z0-9.,\']+$')
      ])),

      seatsAvailable: new FormControl('seatsAvailable', Validators.compose([
        Validators.min(0),
        Validators.max(12),
        Validators.required
      ])),

      driving: new FormControl('driving', Validators.compose([
        Validators.required
      ])),

      departureDate: new FormControl('departureDate', Validators.compose([
        Validators.required
      ])),

      departureTime: new FormControl('departureTime'),

      notes: new FormControl('notes', Validators.compose([
        Validators.maxLength(1000),
        Validators.pattern('^[?\'"></!@#$%^&*()_+= a-zA-Z0-9:.,_-]+$')
      ])),

      nonSmoking: null
    });
  }
}
