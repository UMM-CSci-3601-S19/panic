export interface Ride {
  _id: string;
  owner: string;
  ownerID: string;
  notes: string;
  seatsAvailable: number;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  isDriving: boolean;
  roundTrip?: boolean;
  nonSmoking: boolean;
  pendingPassengerIds?: string[];
  pendingPassengerNames?: string[];
  passengerIds?: string[];
  passengerNames?: string[];
}
