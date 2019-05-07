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
                   String departureDate, String departureTime, Boolean roundTrip, Boolean nonSmoking)
  {

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

  boolean driveRide(String rideId, String driverId, String driverName) {

    ObjectId objId = new ObjectId(rideId);
    Document filter = new Document("_id", objId);

    System.out.println(driverId);
    Document updateQuery = new Document();
    updateQuery.append("$set", new Document().append("driverId", driverId));
    tryUpdateOne(filter, updateQuery);
    Document updateQuerytwo = new Document();
    updateQuerytwo.append("$set", new Document().append("driverName", driverName));
    return tryUpdateOne(filter, updateQuerytwo);

  }



  boolean requestRide(String rideId, String passengerId, String passengerName) {

    ObjectId objId = new ObjectId(rideId); // _id must be formatted like this for the match to work
    Document filter = new Document("_id", objId); // Here is the actual document we match against

    // Create an empty document that will contain our full update
    Document fullUpdate = new Document();

    // This line creates: {"seatsAvailable":-1}
    Document incrementFields = new Document("seatsAvailable", -1);

    // These two lines create: {"passengerIds": passengerId, "passengerNames": passengerName}
    Document pushFields = new Document("passengerIds", passengerId);
    pushFields.append("passengerNames", passengerName);

    // Appending the previous document gives us
    // {$inc: {seatsAvailable=-1}, $push: {"passengerIds":passengerId, "passengerNames":passengerName}}}
    fullUpdate.append("$inc", incrementFields);
    fullUpdate.append("$push", pushFields);

    // Now pass the full update in with the filter and update the record it matches.
    return tryUpdateOne(filter, fullUpdate);

  }

  boolean leaveRide(String userID, String rideID) {
    leaveRideDriver(userID,rideID);
    leaveRidePassenger(userID,rideID);
    leaveRideOwner(userID, rideID) ;
    return true;
  }

  boolean leaveRideDriver(String userID, String rideID){
    ObjectId objId = new ObjectId(rideID); // _id must be formatted like this for the match to work
    Document filter = new Document("_id", objId);
    Document updateQuery = new Document();
    Document ride = rideCollection.find(filter).first();
    Boolean a = true;
    System.out.println(ride.getString("driverId")+"abc");
    if(ride.getString("driverId")!=null){
      System.out.println(ride.getString("driverId")+"abcssss");
      if(ride.getString("driverId").equals(userID)) {

        updateQuery.put("$unset", new Document("driverId", ""));
        a= a & tryUpdateOne(filter, updateQuery);
        updateQuery.put("$unset", new Document("driverName",""));
        a= a & tryUpdateOne(filter, updateQuery);
      }
    }

    return a;
  }
  boolean leaveRideOwner(String userID, String rideID) {
    ObjectId objId = new ObjectId(rideID); // _id must be formatted like this for the match to work
    Document filter = new Document("_id", objId);
    Document updateQuery = new Document();
    Document ride = rideCollection.find(filter).first();
    Boolean a = true;
    System.out.println(ride.getString("ownerId")+"adfkfj");
    if(ride.getString("ownerId")!=null) {
      System.out.println(ride.getString("ownerId")+"abcdddd");
      if (ride.getString("ownerId").equals(userID)) {
        updateQuery.put("$unset", new Document("ownerId", ""));
        a = a & tryUpdateOne(filter, updateQuery);
        updateQuery.put("$unset", new Document("ownerName", ""));
        a = a & tryUpdateOne(filter, updateQuery);

      }
    }
      return a;
  }

  boolean leaveRidePassenger(String userID, String rideID) {

    ObjectId objId = new ObjectId(rideID); // _id must be formatted like this for the match to work
    Document filter = new Document("_id", objId); // Here is the actual document we match against

    // Create an empty document that will contain our full update
    Document fullUpdate = new Document();

    // This line creates: {"seatsAvailable":+1}
    Document incrementFields = new Document("seatsAvailable", +1);

    // These two lines create: {"passengerIds": passengerId, "passengerNames": passengerName}
    Document pullFields = new Document("passengerIds", userID);
    String fullName = userController.getStringField(userID, "fullName");
    System.out.println(fullName);
    pullFields.append("passengerNames", fullName);
    // Appending the previous document gives us
    // {$inc: {seatsAvailable=-1}, $push: {"passengerIds":passengerId, "passengerNames":passengerName}}}
    fullUpdate.append("$inc", incrementFields);
    fullUpdate.append("$pull", pullFields);
    System.out.println(fullName);

    // Now pass the full update in with the filter and update the record it matches.
    return tryUpdateOne(filter, fullUpdate);

  }

  private boolean tryUpdateOne(Document filter, Document updateDoc) {
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
