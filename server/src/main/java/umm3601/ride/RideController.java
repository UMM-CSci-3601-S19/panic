package umm3601.ride;

import com.mongodb.BasicDBObject;
import com.mongodb.MongoException;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import umm3601.user.UserController;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.mongodb.client.model.Filters.*;
import static com.mongodb.client.model.Sorts.ascending;
import static com.mongodb.client.model.Sorts.orderBy;
import static umm3601.DatabaseHelper.serializeIterable;

public class RideController {

  private final MongoCollection<Document> rideCollection;
  private final MongoCollection<Document> userCollection;
  private final UserController userController;

  /**
   * Construct a controller for rides.
   *
   * @param database the database containing ride data
   */
  public RideController(MongoDatabase database) {

    rideCollection = database.getCollection("rides");
    userCollection = database.getCollection("users");
    userController = new UserController(database);
  }

  String getRide(String id) {
    FindIterable<Document> jsonRides
      = rideCollection
      .find(eq("_id", new ObjectId(id)));

    Iterator<Document> iterator = jsonRides.iterator();
    if (iterator.hasNext()) {
      Document ride = iterator.next();
      return ride.toJson();
    } else {
      // We didn't find the desired ride
      return null;
    }
  }

  String getMyRides(String userId) {

    System.out.println("We are attempting to gather results");

    BasicDBObject orQuery = new BasicDBObject();
    List<BasicDBObject> params = new ArrayList<BasicDBObject>();
    params.add(new BasicDBObject("ownerID", userId));
    params.add(new BasicDBObject("passengerIds", userId));
    orQuery.put("$or", params);

    System.out.println(orQuery);

    FindIterable<Document> matchingRides = rideCollection.find(orQuery);

    return serializeIterable(matchingRides);
  }

  /**
   * Helper method which returns all existing rides.
   *
   * @return an array of Rides in a JSON formatted string
   */
  String getRides(Map<String, String[]> queryParams) {

    // server-side filtering will happen here if we sell that in future stories.
    // Right now, this method simply returns all existing rides.
    Document filterDoc = new Document();

    //https://stackoverflow.com/a/3914498 @ Joachim Sauer (Oct 12 2010) & L S (Jun 29 2016)
    //Creates a date in ISO format
    TimeZone tz = TimeZone.getTimeZone("America/Chicago");
    DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'"); // Quoted "Z" to indicate UTC, no timezone offset
    df.setTimeZone(tz);
    String nowAsISO = df.format(new Date());

    //siddhartha jain, Feb 24, 17
    // @ https://stackoverflow.com/questions/42438887/how-to-sort-the-documents-we-got-from-find-command-in-mongodb
    Bson sortDate = ascending("departureDate");
    Bson sortTime = ascending("departureTime");

    //filters out dates that aren't greater than or equal to today's date
    Bson pastDate = gte("departureDate", nowAsISO.substring(0,10)+"T05:00:00.000Z");
    //filters out times that aren't greater than or equal to the current time
    Bson pastTime = gte("departureTime", nowAsISO.substring(11,16));
    //filters out anything past the current date and time
    Bson sameDayPastTime = and(pastDate, pastTime);
    //filters out anything today or later
    Bson tomorrowOrLater = gt("departureDate",nowAsISO.substring(0,10)+"T05:00:00.000Z");
    //Only shows dates that are either (today ^ (today ^ laterThanNow)) or dates after today
    Bson oldRides= or(sameDayPastTime, tomorrowOrLater);

    Bson order = orderBy(sortDate, sortTime);

    FindIterable<Document> matchingRides = rideCollection.find(oldRides).filter(oldRides).sort(order);

    return serializeIterable(matchingRides);
  }

  String addNewRide(String owner, String ownerID, String driver, String driverID, String notes, int seatsAvailable, String origin, String destination,
                           String departureDate, String departureTime, boolean roundTrip, boolean nonSmoking) {

    boolean hasDriver = (driver != null);
    // See methods at bottom of RideController
    seatsAvailable = setSeatsForRequestedRide(hasDriver, seatsAvailable);

    // Since adding a new ride comes with no passengers, we'll create some empty arrays to add to the ride,
    // that way they can be filled later when if someone wants to join
    List<String> passengerIds = new ArrayList<>();
    List<String> passengerNames = new ArrayList<>();
    List<String> pendingPassengerIds = new ArrayList<>();
    List<String> pendingPassengerNames = new ArrayList<>();

    if (!hasDriver) {
      passengerIds.add(ownerID);
      passengerNames.add(owner);
    }

    Document newRide = new Document();
    newRide.append("owner", owner);
    newRide.append("ownerID", ownerID);
    newRide.append("driver", driver);
    newRide.append("driverID", driverID);
    newRide.append("notes", notes);
    newRide.append("seatsAvailable", seatsAvailable);
    newRide.append("origin", origin);
    newRide.append("destination", destination);
    newRide.append("departureDate", departureDate);
    newRide.append("departureTime", departureTime);
    newRide.append("roundTrip", roundTrip);
    newRide.append("nonSmoking", nonSmoking);
    newRide.append("passengerIds", passengerIds);
    newRide.append("passengerNames", passengerNames);
    newRide.append("pendingPassengerIds", pendingPassengerIds);
    newRide.append("pendingPassengerNames", pendingPassengerNames);

    try {
      rideCollection.insertOne(newRide);
      ObjectId id = newRide.getObjectId("_id");
      return id.toHexString();
    }
    catch (MongoException me) {
      me.printStackTrace();
      return null;
    }
  }

  Boolean deleteRide(String id){

    // First format the id so Mongo can handle it correctly.
    ObjectId objId = new ObjectId(id); // _id must be formatted like this for the match to work
    Document filter = new Document("_id", objId); // Here is the actual document we match against

    try{
      // Call deleteOne(the document to match against)
      DeleteResult out = rideCollection.deleteOne(filter);
      //Returns true if 1 document was deleted
      return out.getDeletedCount() == 1;
    }
    catch(MongoException e){
      e.printStackTrace();
      return false;
    }
  }

  boolean editRide(String id, String driver, String driverID, String notes, int seatsAvailable, String origin, String destination,
                   String departureDate, String departureTime, Boolean roundTrip, Boolean nonSmoking) {

    boolean hasDriver = (driver != null);

    // See methods at bottom of RideController
    seatsAvailable = setSeatsForRequestedRide(hasDriver, seatsAvailable);

    // First we create a document for which we can match the document we would like to update
    ObjectId objId = new ObjectId(id); // _id must be formatted like this for the match to work
    Document filter = new Document("_id", objId); // Here is the actual document we match against

    // Now we create a document containing the fields that should be updated in the matched ride document
    Document updateFields = new Document();
    updateFields.append("notes", notes);
    updateFields.append("seatsAvailable", seatsAvailable);
    updateFields.append("origin", origin);
    updateFields.append("destination", destination);
    updateFields.append("departureDate", departureDate);
    updateFields.append("departureTime", departureTime);
    updateFields.append("roundTrip", roundTrip);
    updateFields.append("nonSmoking", nonSmoking);

    // A new document with the $set parameter so Mongo can update appropriately, and the values of $set being
    // the document we just made (which contains the fields we would like to update).
    Document updateDoc = new Document("$set", updateFields);

    // Now the actual updating of seatsAvailable, passengers, and names.
    return tryUpdateOne(filter, updateDoc);
  }

  boolean approveJoinRide(String rideId, String passengerId, String passengerName) {

    System.out.println("---------------------------");
    System.out.println("RideController - Approve Join Ride");
    System.out.println("Join Ride id is " + rideId);
    System.out.println("Join Ride passenger id is " + passengerId);
    System.out.println("Join Ride passenger name is " + passengerName);
    System.out.println("---------------------------");

    ObjectId objId = new ObjectId(rideId); // _id must be formatted like this for the match to work
    Document filter = new Document("_id", objId); // Here is the actual document we match against

    // Create an empty document that will contain our full update
    Document fullUpdate = new Document();

    // This line creates: {"seatsAvailable":-1}
    Document incrementFields = new Document("seatsAvailable", -1);

    // These two lines create: {"passengerIds": passengerId, "passengerNames": passengerName}
    Document pushFields = new Document("passengerIds", passengerId);
    pushFields.append("passengerNames", passengerName);

    System.out.println("Push Fields is " + pushFields);

    //These two lines create {"pendingPassengerId": pendingPassengerId, "pendingPassengerName": pendingPassengerName}
    //which will be removed from the ride

    Document pullFields = new Document("pendingPassengerIds", passengerId);
    pullFields.append("pendingPassengerNames", passengerName);

    System.out.println("Remove Fields is " + pullFields);

    // Appending the previous document gives us
    // {$inc: {seatsAvailable=-1}, $push: {"passengerIds":passengerId, "passengerNames":passengerName}}}
    // $pull {"pendingPassengerId": pendingPassengerId, "pendingPassengerName": pendingPassengerName}
    fullUpdate.append("$inc", incrementFields);
    fullUpdate.append("$push", pushFields);
    fullUpdate.append("$pull", pullFields);

    // Now pass the full update in with the filter and update the record it matches.
    return tryUpdateOne(filter, fullUpdate);
  }

  boolean declineJoinRide(String rideId, String passengerId, String passengerName) {

    System.out.println("---------------------------");
    System.out.println("RideController - Decline Join Ride");
    System.out.println("Join Ride id is " + rideId);
    System.out.println("Join Ride passenger id is " + passengerId);
    System.out.println("Join Ride passenger name is " + passengerName);
    System.out.println("---------------------------");

    ObjectId objId = new ObjectId(rideId); // _id must be formatted like this for the match to work
    Document filter = new Document("_id", objId); // Here is the actual document we match against

    // Create an empty document that will contain our full update
    Document fullUpdate = new Document();

    //These two lines create {"pendingPassengerId": pendingPassengerId, "pendingPassengerName": pendingPassengerName}
    //which will be removed from the ride

    Document pullFields = new Document("pendingPassengerIds", passengerId);
    pullFields.append("pendingPassengerNames", passengerName);

    System.out.println("Remove Fields is " + pullFields);

    // Appending the previous document gives us
    // $pull {"pendingPassengerId": pendingPassengerId, "pendingPassengerName": pendingPassengerName}
    fullUpdate.append("$pull", pullFields);

    // Now pass the full update in with the filter and update the record it matches.
    return tryUpdateOne(filter, fullUpdate);
  }

  boolean requestJoinRide(String rideId, String pendingPassengerId, String pendingPassengerName){

    System.out.println("---------------------------");
    System.out.println("RideController - Request Join Ride");
    System.out.println("Join Ride id is " + rideId);
    System.out.println("Join Ride passenger id is " + pendingPassengerId);
    System.out.println("Join Ride passenger name is " + pendingPassengerName);
    System.out.println("---------------------------");

    ObjectId objId = new ObjectId(rideId); // _id must be formatted like this for the match to work
    Document filter = new Document("_id", objId); // Here is the actual document we match against

    // Create an empty document that will contain our full update
    Document fullUpdate = new Document();

    // These two lines create: {"pendingPassengerId": pendingPassengerId, "pendingPassengerName": pendingPassengerName}
    Document pushFields = new Document("pendingPassengerIds", pendingPassengerId);
    pushFields.append("pendingPassengerNames", pendingPassengerName);

    System.out.println("Push Fields is " + pushFields);

    // Appending the previous document gives us
    // {$push: {"passengerIds":passengerId, "passengerNames":passengerName}}
    fullUpdate.append("$push", pushFields);

    // Now pass the full update in with the filter and update the record it matches.
    return tryUpdateOne(filter, fullUpdate);
  }

  boolean driveRide(String rideID, String driverId, String driverName) {

    ObjectId rideToLeaveId = new ObjectId(rideID);
    Document targetRideId = new Document("_id", rideToLeaveId);

    Document updateDoc = new Document();
    Document ride = rideCollection.find(targetRideId).first();

    updateDoc.append("$set", new Document().append("driverID", driverId));
    tryUpdateOne(targetRideId, updateDoc);
    updateDoc.clear();
    updateDoc.append("$set", new Document().append("driver", driverName));
    tryUpdateOne(targetRideId, updateDoc);
    updateDoc.clear();

    updateDoc.append("$set", new Document().append("ownerID", driverId));
    tryUpdateOne(targetRideId, updateDoc);
    updateDoc.clear();
    updateDoc.append("$set", new Document().append("owner", driverName));
    tryUpdateOne(targetRideId, updateDoc);
    updateDoc.clear();

    List<String> passengerIds = ride.getList("passengerIds", String.class);
    List<String> passengerNames = ride.getList("passengerNames", String.class);

    if (passengerIds.size() > 0 && passengerNames.size() > 0) {
      System.out.println("There are passengers on this ride");

      if (passengerIds.contains(driverId)) {
        System.out.println("Found user in passengerList");
        int index = passengerIds.indexOf(driverId);
        passengerIds.remove(index);
        passengerNames.remove(index);

        updateDoc.append("$set", new Document("passengerIds", passengerIds));
        tryUpdateOne(targetRideId, updateDoc);
        updateDoc.clear();
        updateDoc.append("$set", new Document("passengerNames", passengerNames));
        tryUpdateOne(targetRideId, updateDoc);
        updateDoc.clear();
      }
    }
    return true;
  }

  boolean leaveRide(String driverId, String rideID) {
    boolean driverLeave =
      leaveRideDriver(driverId,rideID);
    boolean passengerLeave =
      leaveRidePassenger(driverId,rideID);
    boolean ownerLeave =
      leaveRideOwner(driverId, rideID) ;
    return driverLeave || passengerLeave || ownerLeave;
  }

  private boolean leaveRideDriver(String driverId, String rideID) {
    System.out.println("\nChecking if user is the driver");

    ObjectId rideToLeaveId = new ObjectId(rideID);
    Document targetRideId = new Document("_id", rideToLeaveId);

    Document updateQuery = new Document();
    Document ride = rideCollection.find(targetRideId).first();

    boolean updateSuccess = false;

    String rideDriverId = ride.getString("driverID");
    System.out.println("Ride's driverId value: " + rideDriverId);

    if(rideDriverId != null) {
      System.out.println("driverId is not null");

      if(rideDriverId.equals(driverId)) {
        System.out.println("User is the driver");
        updateQuery.put("$unset", new Document("driverID", ""));
        updateSuccess = tryUpdateOne(targetRideId, updateQuery);
        updateQuery.put("$unset", new Document("driver", ""));
        updateSuccess = updateSuccess && tryUpdateOne(targetRideId, updateQuery);
        updateQuery.put("$set", new Document("seatsAvailable", 0));
        updateSuccess = updateSuccess && tryUpdateOne(targetRideId, updateQuery);
      }
    }
    return updateSuccess;
  }

  private boolean leaveRidePassenger(String driverId, String rideID) {
    System.out.println("\nChecking if user is a passenger");

    ObjectId rideToLeaveId = new ObjectId(rideID);
    Document targetRideId = new Document("_id", rideToLeaveId);

    Document fullUpdate = new Document();
    Document ride = rideCollection.find(targetRideId).first();

    List<String> passengerIds = ride.getList("passengerIds", String.class);
    List<String> passengerNames = ride.getList("passengerNames", String.class);
    boolean updateSuccess = false;

    if (passengerIds.size() > 0 && passengerNames.size() > 0) {
      System.out.println("There are passengers on this ride");

      if (passengerIds.contains(driverId)) {
        System.out.println("Found user in passengerList");
        int index = passengerIds.indexOf(driverId);
        passengerIds.remove(index);
        passengerNames.remove(index);

        fullUpdate.append("$set", new Document("passengerIds", passengerIds));
        tryUpdateOne(targetRideId, fullUpdate);
        fullUpdate.clear();
        fullUpdate.append("$set", new Document("passengerNames", passengerNames));
        fullUpdate.append("$inc", new Document("seatsAvailable", +1));

        updateSuccess = tryUpdateOne(targetRideId, fullUpdate);
      } else {
        System.out.println("The user was not in the passengerList");
      }
    }
    return updateSuccess;
  }

  private boolean leaveRideOwner(String driverId, String rideID) {
    System.out.println("\nChecking if user is the owner");

    ObjectId rideToLeaveId = new ObjectId(rideID);
    Document targetRideId = new Document("_id", rideToLeaveId);

    Document updateQuery = new Document();
    Document ride = rideCollection.find(targetRideId).first();

    boolean updateSuccess = false;

    String rideOwnerId = ride.getString("ownerID");
    System.out.println("Ride's ownerId value: " + rideOwnerId);

    if(rideOwnerId != null) {
      System.out.println("ownerId is not null");

      if (rideOwnerId.equals(driverId)) {
        System.out.println("User is the owner");
        List<String> passengerIds = ride.getList("passengerIds", String.class);
        List<String> passengerNames = ride.getList("passengerNames", String.class);

        if (passengerIds.size() > 0 && passengerNames.size() > 0) {
          System.out.println("There are more people on this ride");
          String newOwnerId = passengerIds.get(0);
          String newOwnerName = passengerNames.get(0);

          updateQuery.put("$set", new Document("ownerID", newOwnerId));
          updateSuccess = tryUpdateOne(targetRideId, updateQuery);
          updateQuery.put("$set", new Document("owner", newOwnerName));
          updateSuccess = updateSuccess & tryUpdateOne(targetRideId, updateQuery);
        } else {
          System.out.println("The ride will be deleted due to it being empty");
          deleteRide(rideID);
          updateSuccess = true;
        }
      }
    }
    return updateSuccess;
  }

  private boolean tryUpdateOne(Document filter, Document updateDoc) {

    System.out.println("We have reached tryUpdateOne in Ride Controller!!!!");
    try {
      // Call updateOne(the document to match against, and the $set + updated fields document
      UpdateResult output = rideCollection.updateOne(filter, updateDoc);
      //returns true if 1 document was updated
      return output.getModifiedCount() == 1;
    }
    catch (MongoException e) {
      e.printStackTrace();
      return false;
    }
  }

  // We should set seatsAvailable to 0 for rides requested (this is to make it less confusing for people
  // browsing the database directly.)
  private int setSeatsForRequestedRide(boolean isDriving, int seatsAvailable) {
    if (!isDriving) {
      seatsAvailable = 0;
    }
    return seatsAvailable;
  }

}
