package umm3601.user;


import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.bson.Document;
import spark.Request;
import spark.Response;

import java.util.Collections;


public class UserRequestHandler {

  private final UserController userController;

  private static final String CLIENT_ID = "828151406788-7pmre36dp4bboog4j03fl3ochdc6ed8r.apps.googleusercontent.com";
  private static final String CLIENT_SECRET_FILE = "../credentials.json";

  private static NetHttpTransport transport = new NetHttpTransport();

  public UserRequestHandler(UserController userController) {
    this.userController = userController;
  }


  public String getUserJSON(Request req, Response res) {
    res.type("application/json");
    String userId = req.params("id");
    String user;
    try {
      user = userController.getUser(userId);
    } catch (IllegalArgumentException e) {
      // This is thrown if the ID doesn't have the appropriate
      // form for a Mongo Object ID.
      // https://docs.mongodb.com/manual/reference/method/ObjectId/
      res.status(400);
      res.body("The requested user userId " + userId + " wasn't a legal Mongo Object ID.\n" +
        "See 'https://docs.mongodb.com/manual/reference/method/ObjectId/' for more info.");
      return "";
    }
    if (user != null) {
      return user;
    } else {
      res.status(404);
      res.body("The requested user with userId " + userId + " was not found");
      return "";
    }
  }

  public Boolean saveProfile(Request req, Response res) {

    res.type("application/json");

    Document profileInfo = Document.parse(req.body());

    String userId = profileInfo.getString("userId");
    String phone = profileInfo.getString("phone");

    return userController.saveProfile(userId, phone);
  }

  public String login(Request req, Response res) {
    res.type("application/json");

    Document body = Document.parse(req.body());
    String token = body.getString("idToken");
    try {
      GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, JacksonFactory.getDefaultInstance())
        // Specify the CLIENT_ID of the app that accesses the backend:
        .setAudience(Collections.singletonList(CLIENT_ID))
        // Or, if multiple clients access the backend:
        //.setAudience(Arrays.asList(CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3))
        .build();
      GoogleIdToken idToken = verifier.verify(token);
      if (idToken != null) {
        GoogleIdToken.Payload payload = idToken.getPayload();
        String userId = payload.getSubject();     // Use this value as a key to identify a user.
        String email = payload.getEmail();
        boolean emailVerified = Boolean.valueOf(payload.getEmailVerified());
        String name = (String) payload.get("name");
        String pictureUrl = (String) payload.get("picture");
        String locale = (String) payload.get("locale");
        String familyName = (String) payload.get("family_name");
        String givenName = (String) payload.get("given_name");

        // Debugging Code
        System.out.println("---------------------------");
        System.out.println("UserID is " + userId);
        System.out.println("Email is " + email);
        System.out.println("Is Email verified? " + emailVerified);
        System.out.println("Name is " + name);
        System.out.println("Picture Url is " + pictureUrl);
        System.out.println("Locale is " + locale);
        System.out.println("familyName is " + familyName);
        System.out.println("givenName is " + givenName);
        System.out.println("---------------------------");

        return userController.addNewUser(userId, email, name, pictureUrl, familyName, givenName);
      }
    } catch (Exception e) {
      System.err.println("Invalid ID token");
      e.printStackTrace();
    }
    return null;
  }
}
