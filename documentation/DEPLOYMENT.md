# Deployment
We used a separate branch to run the droplet off of. In this branch we needed to update the port in server.java to 80 instead of 4567.
We pulled master into this branch when we wanted to update the droplet. We also needed to update the production environment in environment.prod.ts this could be done on the droplet branch or on master.
Doing it on a droplet branch would allow you to easily have multiple droplets running with different domain names and would let you compare the functionality of two versions of the code.

Next, a [Cloudflare](https://www.cloudflare.com/) account is required to have a secure site (https). 
With the Cloudflare account, we added our droplet’s IP address to the DNS page for “www” and our website domain name under: Type A and TTL Automatic. 
With whatever service we bought a domain from, we would then send the Cloudflare nameservers to; “ara.ns.cloudflare.com” and “kai.ns.cloudflare.com” both under type NS.
  

# Chat Deployment

This project uses [GetStream.io](https://getstream.io/) in its chat implementation. In order for the chat feature to work, you will need to create a (free) account with them and obtain an API key and secret.

GetStream currently offers up to 3 million free API calls per month.

## Sign up for API Key + Secret

Go to getstream.io and sign up for an account (you can use your GitHub account). Once you've created an app on their website, go to your dashboard. There you will find the following:
1. API key
2. API secret
3. App ID

## Configure GetStream's Chat Client

### Client-Side

For the client to load the chat and make calls to GetStream's API, paste your API key into the root-directory level `credentials.json` file as follows:

```
credentials.json

{
  getstream_api_key: "YOUR_API_KEY"
  ...
}
```

### Server-Side

When loading the chat, the client makes a call to the server to obtain an authorization token. To generate a token, the server needs the API secret.

In [server/ChatRequestHandler.java](https://github.com/UMM-CSci-3601-S19/panic/blob/master/server/src/main/java/umm3601/chat/ChatRequestHandler.java), the method `authenticateDevUser()` generates a JWT starting with the API secret. An example value (deactivated) is committed in the file.
When deploying, the currently hardcoded value should be updated so that the secret is added to `credentials.json` and the server reads the value from there (see issue [#96](https://github.com/UMM-CSci-3601-S19/panic/issues/96)).

# Google OAuth

Within the [google developers console](https://console.developers.google.com/apis/dashboard), we need to input the website’s domain name in the registered domains part of the consent screen. 
In order to obtain a unique Client ID, fill out the credentials out for your project and if needed download the resulting json file.
Make sure to keep the information from the credentials file a secret. 
Client id is needed in [UserRequestHandler.java](https://github.com/UMM-CSci-3601-S19/panic/blob/master/server/src/main/java/umm3601/user/UserRequestHandler.java),
[app.service.ts](https://github.com/UMM-CSci-3601-S19/panic/blob/master/client/src/app/app.service.ts),
and [index.html](https://github.com/UMM-CSci-3601-S19/panic/blob/master/client/src/index.html).
This is needed so that users can login with their google account.
