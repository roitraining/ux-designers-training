summary: Build a Microservice from Scratch
id: microservice-from-scratch
categories: Cloud Run for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Build a Microservice from Scratch
<!-- ------------------------ -->
## Overview
Duration: 5

### What You’ll Learn
- Create a new microservice for Slick Tickets
- Use modern dev tools, such as Cloud Code
- Bonus: Add likes and/or comments to Slick Tickets

This is an extremely open-ended lab designed to be the culimation of the class and does not need to finish when the class is done. I would love to see Slick Tickets continue to grow and evolve over time as Google Cloud UX Designers take these courses and try out the skills they've learned. This is the beginning of an ongoing hackathon on the Slick Tickets project. Perhaps eventually, it can be a public living example of hypermodern best practices in utilizing Google Cloud managed services.

<!-- ------------------------ -->
## Develop Slick Tickets!
Duration: 150

### Option 1: Finish Earlier Labs
Elements of the labs in this course were very advanced, contained advanced extensions, and several of the tasks were open ended. Feel free to take this time to go back and complete anything you felt you didn't get to fully explore. If you have time, you can move on to additional tasks below. 

### Option 2: Integrate More Google Cloud Services
If there's a service you are interested in playing with, this is a good opportunity to try integrating it into Slick Tickets. The goal in structuring the labs the way they are is that you start to get comfortable going through official and unofficial documentation and tutorials. Use this as an opportunity to try that out with the support of your instructor and classmates.

### Option 3: Add Features Within Existing Slick Tickets Services
Consider improving Slick Tickets itself. You could take on something relatively simple like making the tickets look pretty, or something complex like adding a commenting feature. To add something like the commenting feature, you'll need to consider routes and each component of MVC web application development. Example, comments:
1. Routes - Add new routes to create, edit, and delete comments (you probably won't need a dedicated view route since they will likely show up under the event itself).
2. Models - This is mostly handled by Firestore, but you will need application code to CRUD events via Firestore, and relate them to the Events and Users collections. This could be a sub-collection to Events. It probably should not be just a property inside the existing Events collection because of [how Firestore is optimized](https://firebase.google.com/docs/firestore/data-model). 
3. Views - You will need to at least modify existing event views to handle comments; there may be need for some dedicated views to review all of your own comments. 
4. Controllers - Each route will need to point to a controller method which handles the logic for that route.

Here are some ideas for new features:
1. Comments.
2. Likes.
3. Better ticket printing.
4. Better flow for mailed tickets.
5. Sharing features to email events to friends or post them to social media.
6. Payment processing with PayPal, Stripe, or Braintree (will require creating logins).
7. Enhanced Admin Dashboard.
8. Event management features for while the event is running (i.e., checkin).

### Option 4: Build a Microservice from Scratch
The highest goal of this class is that attendees would create a microservice from scratch. That is not for everyone, and if you are new to MVC web application development, that will be quite a stretch in the time we have remaining. But if you are feeling ambitious, keep reading!

For this, you will need to do all the elements of routes and MVC listed above in Option 3, and in addition:
1. Create a new service, starting with the [Express Getting Started Guide](https://expressjs.com/en/starter/installing.html) and using the Events and Users services as examples.
2. Write a Dockerfile for that service and use Cloud Build to create a Docker image and store it in Container Registry. 
3. Deploy the service to Cloud Run. 
4. Update your Endpoints configuration to include the new Service. 
5. Update the existing Slick Tickets web app and/or microservices to consume the new Service. 

This will involve CRUD operations through routes, models, views, and controllers both within the new service and in the consuming services. Creating a very simple service could be possible within just a few hours, but likely this will turn into a longer project you will continue after class.

Here are some ideas for new microservices:
1. Payment processing.
2. Shipping calculator (time and cost) for mailed tickets (will require interacting with USPS/Fedex/UPS APIs).
3. Weather prediction (will require integrating with at least one weather API).
4. The admin dashboard could be a separate web app service.

<!-- ------------------------ -->
## Cleanup
Duration: 1

You can keep and delete things as you see fit, based on your plans for continued work. If you aren't going to be actively using something that involves provisioned long-term instances (Compute Engine, GKE, Cloud SQL), then those should probably be shut down or deleted. Managed services like Cloud Run fully-managed and Cloud Functions are unlikely to incur charges.
