export interface Ride {
  _id?: {
    $oid: string
  };
  owner: string;
  ownerID: string;
  driver?: string;
  driverID?: string;
  notes: string;
  seatsAvailable?: number;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  roundTrip?: boolean;
  nonSmoking: boolean;
  pendingPassengerIds?: string[];
  pendingPassengerNames?: string[];
  passengerIds?: string[];
  passengerNames?: string[];
}
