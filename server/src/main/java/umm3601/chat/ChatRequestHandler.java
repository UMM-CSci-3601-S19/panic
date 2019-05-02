package umm3601.chat;

import org.bson.Document;
import spark.Request;
import spark.Response;

import io.getstream.client.Client;
import io.getstream.core.http.Token;

import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.Map;

import com.auth0.jwt.*;
import com.auth0.jwt.algorithms.Algorithm;

public class ChatRequestHandler {

  public Token authenticateChatUser(Request req, Response res) {
    res.type("application/json");

    Document user = Document.parse(req.body());

    try {
      Client client = Client.builder("h354aemvhp72",
        "jux8wqyt428348pjuxxzykmac4fwhw278btuxfbvx6xyd39y3mk2atk89dqw3s55")
        .build();
      return client.frontendToken(user.getString("_id"));
    } catch (MalformedURLException mue) {
      System.err.println("Bad GetStream URL request was made");
    }
    return null;
  }

  public Token authenticateDevUser(Request req, Response res) {
    res.type("application/json");

    Map<String, Object> tokenHeaders = new HashMap<>();
    tokenHeaders.put("alg", "HS256");
    tokenHeaders.put("typ", "JWT");

    Algorithm signature = Algorithm.HMAC256("jux8wqyt428348pjuxxzykmac4fwhw278btuxfbvx6xyd39y3mk2atk89dqw3s55");

    String jwt = JWT.create()
      .withHeader(tokenHeaders)
      .withClaim("resource", "*")
      .withClaim("action", "*")
      .withClaim("feed_id", "*")
      .withClaim("user_id", "*")
      .sign(signature);

    return new Token(jwt);
  }
}
