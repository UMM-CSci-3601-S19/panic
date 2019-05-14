# Readme
[![Build Status](https://travis-ci.org/UMM-CSci-3601-S19/panic.svg?branch=master)](https://travis-ci.org/UMM-CSci-3601-S19/panic)

## Team
* [Kaelan Leahy](https://github.com/leahy089)
* [Adam Schug](https://github.com/AdamSchug)
* [Roen Aronson](https://github.com/RoenAronson)
* [Nicolas Robertson](https://github.com/NicolasRobertson)
* [Joe Deglman](https://github.com/deglm006)
* [Jon Reuvers](https://github.com/JReuvers)
* [Leah Judd](https://github.com/LeahLuLu)
* [Avery Koranda](https://github.com/koran023)
* [Ananya Teklu](https://github.com/ananyateklu)

## Overview
This app was developed by the spring 2019 Software Design class at the University of Minnesota Morris. 

For Morris community members who want to carpool, MoRide is a ridesharing web app that efficiently connects riders and drivers.
Unlike the University of Minnesota Morris' Facebook forum, our product encourages sustainable transportation by providing
streamlined searching, sorting, and filtering.

## Deployment
See [DEPLOYMENT.md](deployment.md) for step-by-step instructions on deploying MoRide.

## Key Features
* Log in using Google authentication
* Create a ride posting
  * Request or offer a ride
  * User can edit rides they own
* Search and filter a list of upcoming rides
  * Filter by ride origin, destination, and various tags
  * See requests only or offers only
* Click a ride to view more information
* Request to join a ride as a passenger
  * Ride posters can accept/deny requests to join 
* Join a requested ride as a driver
* User can leave any ride they have joined
  * If user is the last person on the ride, ride posting is removed
* Carpoolers have access to a private chat for each ride they've joined
* User can view their profile page
  * View all rides they've joined and posted
  * Manage contact info
  
## Languages
* Typescript
* Javascript
* Java

## Libraries

### Client-side
* Angular Material 5
* Jasmine and Karma
* Google OAuth
* [GetStream.io](https://getstream.io)

### Server-side
* Java Spark
* JUnit
* MongoDB
* [Auth0 Java JWT](https://github.com/auth0/java-jwt)

## Tools
* Gradle
* Yarn

## Resources
### Angular 5
- [Angular 5 documentation][angular-5]
- [TypeScript documentation][typescript-doc]
- [What _is_ Angular CLI?][angular-cli]
- [What are environments in Angular CLI?][environments]
- [Testing Angular 5 with Karma/Jasmine][angular5-karma-jasmine]
- [End to end testing (e2e) with protactor and Angular CLI][e2e-testing]
- [Angular CLI commands](https://github.com/angular/angular-cli/wiki)
- [Angular Material Design][angular-md]

### SparkJava
- [Spark documentation][spark-documentation]
- [HTTP Status Codes][status-codes]
- [Other Resources][lab2]

### MongoDB
- [Mongo's Java Drivers (Mongo JDBC)][mongo-jdbc]

[angular-md]: https://material.angular.io/
[angular-cli]: https://cli.angular.io/
[typescript-doc]: https://www.typescriptlang.org/docs/home.html
[angular-5]: https://angular.io/docs
[angular5-karma-jasmine]: https://codecraft.tv/courses/angular/unit-testing/jasmine-and-karma/
[e2e-testing]: https://coryrylan.com/blog/introduction-to-e2e-testing-with-the-angular-cli-and-protractor
[environments]: http://tattoocoder.com/angular-cli-using-the-environment-option/
[bootstrap]: https://getbootstrap.com/components/
[spark-documentation]: http://sparkjava.com/documentation.html
[status-codes]: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
[lab2]: https://github.com/UMM-CSci-3601/3601-lab2_client-server/blob/master/README.md#resources
[mongo-jdbc]: https://docs.mongodb.com/ecosystem/drivers/java/
[travis]: https://travis-ci.org/
