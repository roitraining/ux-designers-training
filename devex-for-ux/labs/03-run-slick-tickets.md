summary: Run Slick Tickets
id: run-slick-tickets
categories: DevEx for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Run Slick Tickets
<!-- ------------------------ -->
## Overview
Duration: 1

### What You’ll Learn
- Running an application built with microservice architecture
- Handling service discovery in microservice applications
- About the sample app, Slick Tickets, that we'll be using throughout the rest of this course and in the next course

<!-- ------------------------ -->
## Preparing the Environment
Duration: 10

### Clone the Repo to Cloud Shell
If you haven't already, create a Git folder in your home directory and move into it. Clone Slick Tickets:
``` bash
gcloud source repos clone slick-tickets --project=gcp-designers-development
```

Take a moment and explore the code. Read the README and take a look at the web app and at each microservice.

### Install Dependencies
Make sure that NPM is up to date:
``` bash
npm install -g npm
```

This is a strange command where NPM updates itself globally. If it is not up to date, you will get a message to run this command when running npm install.

Open two additional tabs in Cloud Shell so you can interact with the web app and each of the two microservices in separate tabs. In each tab, navigate to a different one of those folders inside of the app folder.

Follow the instructions in the README to get the environment ready to run, but read the next section before actually running the services.

<!-- ------------------------ -->
## Run the App
Duration: 15

### Service Discovery
Since we are now dealing with two microservices and a presentation tier web app, we have to concern ourselves with service discovery. How do our three components find each other?

For now, we are going to use a simple strategy of manually configured environmental variables. There are more complex methodologies, some built into Kubernetes, Istio/Anthos has its own strategy involving the Envoy Proxy, and there are others.

Also since we are running on a single VM (Cloud Shell), the three components can find each other on localhost at whatever port each is running on. The web app should run on port 8080, since that is the publically exposed piece we will preview on. The other two can run on 3001 and 3002, or any high (in the thousands) number port you choose. The key is that whatever you choose for the two microservices, the web app needs to know about it.

### Start the Services
With this in mind, adjust your .env files as needed, and run all three components. You should then be able to preview the web tier and use the application.

Follow the instructions in the README to create an account and make yourself an administrator. Then as an administrator, you can create events. Create a second account to test the end user experience, and try registering for an event and printing a ticket.

### Bonus: Add Your Own Repository and Make a Change
Create a new repository for your version of the app. Add the remotes from the root directory of the repo where you've cloned it in Cloud Shell. To add the remotes, follow [the official Git documentation](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes).

Make sure to name your new remote something that you'll remember. In the past when we've used commands like "git push origin master", the word "origin" was the name of the remote we were pushing or pulling. Now with multiple remotes, you'll be able to push and pull from either. That way you can pull updates from the main repo (origin) and push and pull to your own as well.

Create a new feature branch for the change you'd like to make, make the change, and then merge the change into master. Restart any of the three components you made a change to, and preview to see that the change worked. Make sure to push both the feature branch and master up to your remote.

### Bonus: Run Slick Tickets on Compute Engine
If you still have time, try running Slick Tickets on a VM. Combine your knowledge from the first lab where we ran a simplistic sample app and what you learned here, and run each component on a separate VM. Run the two microservices first, so you have their IP addresses handy when you run the web tier.

In this case, all three components will be running on port 80, either because you started them manually on port 80, or because you followed the nginx instructions and used nginx as a reverse proxy.

In the real world, you would run them securely on port 443 using an SSL cert.
