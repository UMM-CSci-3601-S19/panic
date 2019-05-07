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
  passengerIds?: string[];
  passengerNames?: string[];
  driverId?: string;
  driverName?: string;
}
