package umm3601.ride;

import org.bson.Document;
import spark.Request;
import spark.Response;

import java.util.List;

public class RideRequestHandler {

  private final RideController rideController;

  public RideRequestHandler(RideController rideController) {
    this.rideController = rideController;
  }

  /**
   * Method called from Server when the 'api/rides' endpoint is received.
   * This handles the request received and the response that will be sent back.
   *
   * @param req the HTTP request
   * @param res the HTTP response
   * @return an array of rides in JSON formatted String
   */
  public String getRides(Request req, Response res) {
    res.type("application/json");
    return rideController.getRides(req.queryMap().toMap());
  }

  public String getRide(Request req, Response res) {
    res.type("application/json");
    String rideId = req.params("rideId");

    return rideController.getRide(rideId);
  }

  public String getMyRides(Request req, Response res) {
    res.type("application/json");
    String userId = req.params("userId");
    String myRides;
    try {
      myRides = rideController.getMyRides(userId);
    } catch (IllegalArgumentException e) {
      res.status(400);
      res.body("Could not find the userId " + userId);
      return "";
    }
    if (myRides != null) {
      return myRides;
    } else {
      res.status(404);
      res.body("The requested user with userId " + userId + " was not found");
      return "";
    }
  }

  /**
   * Method called from Server when the 'api/rides/new' endpoint is received.
   * Gets specified rides info from request and calls addNewRide helper method
   * to append that info to a document
   *
   * @param req the HTTP request
   * @param res the HTTP response
   * @return a boolean as whether the ride was added successfully or not
   */
  public String addNewRide(Request req, Response res) {
    res.type("application/json");

    Document newRide = Document.parse(req.body());

    String owner = newRide.getString("owner");
    String ownerID = newRide.getString("ownerID");
    String driver = newRide.getString("driver");
    String driverID = newRide.getString("driverID");
    String notes = newRide.getString("notes");
    int seatsAvailable = newRide.getInteger("seatsAvailable");
    String origin = newRide.getString("origin");
    String destination = newRide.getString("destination");
    String departureDate = newRide.getString("departureDate");
    String departureTime = newRide.getString("departureTime");
    boolean roundTrip = newRide.getBoolean("roundTrip");
    boolean nonSmoking = newRide.getBoolean("nonSmoking");

    return rideController.addNewRide(owner, ownerID, driver, driverID, notes, seatsAvailable, origin, destination,
      departureDate, departureTime, roundTrip, nonSmoking);

  }

  public Boolean deleteRide(Request req, Response res){
    res.type("application/json");

    Document deleteRide = Document.parse(req.body());

    String id = deleteRide.getString("_id");
    System.err.println("Deleting ride id=" + id);
    return rideController.deleteRide(id);
  }

  public boolean editRide(Request req, Response res) {

    System.err.println("Print something!");

    res.type("application/json");

    // Turn the request into a Document
    Document editRide = Document.parse(req.body());

    String id = editRide.getObjectId("_id").toHexString();
//    We don't include the following fields, because they shouldn't be edited.
//    String user = editRide.getString("user");
//    String userId = editRide.getString("userId");
    String driver = editRide.getString("driver");
    String driverID = editRide.getString("driverID");
    String notes = editRide.getString("notes");
    int seatsAvailable = editRide.getInteger("seatsAvailable");
    String origin = editRide.getString("origin");
    String destination = editRide.getString("destination");
    String departureDate = editRide.getString("departureDate");
    String departureTime = editRide.getString("departureTime");
    Boolean roundTrip = editRide.getBoolean("roundTrip");
    Boolean nonSmoking = editRide.getBoolean("nonSmoking");

    return rideController.editRide(id, driver, driverID, notes, seatsAvailable, origin, destination,
      departureDate, departureTime, roundTrip, nonSmoking);
  }

  public boolean approveJoinRide(Request req, Response res) {

    System.out.println("---------------------------");
    System.out.println("We have reached approveJoinRide in Ride Request Handler!!!!!");
    System.out.println("The request to be parsed is " + req);

    res.type("application/json");

    // Turn the request into a Document
    Document joinRide = Document.parse(req.body());

    System.out.println("The Join Ride Document is " + joinRide);

    String rideId = joinRide.getObjectId("rideId").toHexString();
    System.out.println("The rideId for joinRide is " + rideId);
    String passengerId = joinRide.getString("pendingPassengerId");
    System.out.println("The passengerId for joinRide is " + passengerId);
    String passengerName = joinRide.getString("pendingPassengerName");
    System.out.println("The passengerName for joinRide is " + passengerName);

    return rideController.approveJoinRide(rideId, passengerId, passengerName);
  }

  public boolean declineJoinRide(Request req, Response res) {

    System.out.println("---------------------------");
    System.out.println("We have reached declineJoinRide in Ride Request Handler!!!!!");
    System.out.println("The request to be parsed is " + req);

    res.type("application/json");

    // Turn the request into a Document
    Document joinRide = Document.parse(req.body());

    System.out.println("The Join Ride Document is " + joinRide);

    String rideId = joinRide.getObjectId("rideId").toHexString();
    System.out.println("The rideId for joinRide is " + rideId);
    String passengerId = joinRide.getString("pendingPassengerId");
    System.out.println("The passengerId for joinRide is " + passengerId);
    String passengerName = joinRide.getString("pendingPassengerName");
    System.out.println("The passengerName for joinRide is " + passengerName);

    return rideController.declineJoinRide(rideId, passengerId, passengerName);
  }

  public boolean requestJoinRide(Request req, Response res) {

    System.out.println("---------------------------");
    System.out.println("We have reached requestJoinRide in Ride Request Handler!!!!!");
    System.out.println("The request to be parsed is " + req);

    res.type("application/json");

    // Turn the request into a Document
    Document joinRide = Document.parse(req.body());

    System.out.println("The Join Ride Document is " + joinRide);

    String rideId = joinRide.getObjectId("rideId").toHexString();
    System.out.println("The rideId for joinRide is " + rideId);
    String passengerId = joinRide.getString("pendingPassengerId");
    System.out.println("The passengerId for joinRide is " + passengerId);
    String passengerName = joinRide.getString("pendingPassengerName");
    System.out.println("The passengerName for joinRide is " + passengerName);
    System.out.println("---------------------------");

    return rideController.requestJoinRide(rideId, passengerId, passengerName);
  }

  public boolean driveRide(Request req, Response res) {
    res.type("application/json");

    // Turn the request into a Document
    Document driveRide = Document.parse(req.body());

    String rideId = driveRide.getObjectId("rideId").toHexString();
    String driverId = driveRide.getString("driverId");
    String driverName = driveRide.getString("driverName");

    return rideController.driveRide(rideId, driverId, driverName);
  }

  public boolean leaveRide(Request req, Response res) {

    res.type("application/json");

    // Turn the request into a Document
    Document leaveRide = Document.parse(req.body());

    System.out.println("leave-ride document" + leaveRide);

    String userID = leaveRide.getString("userID");
    System.out.println("userID " + userID);
    String rideID = leaveRide.getString("rideID");
    System.out.println(rideID);

    return rideController.leaveRide(userID, rideID);
  }
}
