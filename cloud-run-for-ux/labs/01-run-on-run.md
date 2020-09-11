summary: Run Slick Tickets on Cloud Run
id: run-on-run
categories: Cloud Run for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Run Slick Tickets on Cloud Run
<!-- ------------------------ -->
## Overview
Duration: 1

### What You’ll Learn
- Deploying to Cloud Run
- Service discovery in Cloud Run
- Releasing updates with Cloud Run

<!-- ------------------------ -->
## Create New Application Docker Images
Duration: 15

We are going to continue to use the sample application from our last class, Slick Tickets. Let's start by getting signed in to Google Cloud, making sure a few required services are active, cloning the Slick Tickets Git repository, and building the application containers. 

1. Log in to [Google Cloud](https://console.cloud.google.com/) using the trial account you created for this course. You should not be using your actual work Google account. If you do, you will have security issues. 

2. Check the dropdown to the right of the main navigation (hamburger) menu and ensure you are working in an appropriate project. 

3. Use the hamburger menu to visit **Firestore**. 

4. We need to activate Firestore so it will be ready to store data when we run our application. Let's use Native mode by clicking **Select Native Mode**. Set the **Region** to `nam5 (United States)` and click **Create Database**.

5. Activate Cloud Shell using the cursor icon near the upper right corner of the Google Cloud Console. Make sure when it comes up that the current context (text at the top of the Cloud Shell tab) is the same as the project where you are working. 

6. Clone the Slick Tickets sample application into Cloud Shell:

```
git clone https://github.com/haggman/slick-tickets.git
```

7. Change into the Slick Tickets `apps` folder:

```
cd ~/slick-tickets/app/
```

8. List everything in the folder and you'll see the application is subdivided into three main services: events, users, and the web application itself. 

```
ls
```

9. Change into the `events-service` folder and build the Docker image using Cloud Build. Send the image to the Container Registry for your current project. Notice the format of the command. "DEVSHELL_PROJECT_ID" should be the current project enabled in Cloud Shell, so your project, "events-service", is the name of the folder in the Google Container Registry (GCR) where our image will be placed, and it will have the tag "v1.0" to denote the service version.  

```
cd events-service
gcloud builds submit . -t gcr.io/$DEVSHELL_PROJECT_ID/events-service:v1.0
```

10. Change up a folder and over into the `user-service` folder.

```
cd ../users-service/
```

11. Edit the "gcloud builds ..." command from above. Change the service name to `users-service` and use the command to build this second service image. 

```
gcloud builds submit . -t gcr.io/$DEVSHELL_PROJECT_ID/users-service:v1.0
```

12. Using the same steps, change up and over into the `web-app` folder and build that image as well. Once again, store it in the GCR for your project in a `web-app` folder. 

13. Switch to the Google Cloud Console in your browser and use the hamburger menu to navigate to the **Container Registry** (under **Tools**). Verify your three service image folders and if you like, drill down into them and investigate the images themselves. 


<!-- ------------------------ -->
## Deploy Services to Cloud Run
Duration: 15

Here you'll get to see the beauty of Cloud Run and how simple it is compared to other Google Cloud compute options. In the Google Cloud Console, use the hamburger to navigate to **Cloud Run**. Then, perform the following steps to create a Cloud Run service for each of our apps. Do the `web-app` last. 

1. Click **Create Service**.

2. Select **Cloud Run (fully managed)** and set the **Region** to `us-central1 (Iowa)`.

3. Give the service a name (`events-service`, `users-service`, `web-app`). 

4. Select **Allow unauthenticated invocations** to make the service anonymous access.

5. Click **Next**. 

6. Use the **Select** button and select the appropriate image from your project's Container Registry. Don't hit "Create" yet. 

7. Click the link to **Show Advanced Settings**. 

8. Set the **Container port** appropriately. 

Service name | Port
------------ | -----
events-service | 3001
users-service | 3002
web-app | 80

9. ***`web-app` only:*** Using the link at the top of the page, switch to **Variables**. Using the links you copied for the other two services, add the following variables (don't enter any port numbers):  
    * EVENTS_SERVICE=URL to your `events-service` 
    * USERS_SERVICE=URL to your `users-service` 
    * SESSION_SECRET=putwhateveryouwanthere

10. Copy the URL for each service and store them in a text file for easy access. 

11. Repeat these steps until all three services have been created. 

12. Use the link to your `web-app` to verify that the application is working. 

13. From the Slick Tickets' home page, follow the link to **Login** and **Register a new account**. Use your account to log in to the application, and make sure not to forget your credentials! 

**Important Note:**
In the real world, you would allow unauthenticated invocations for the web app, but not for the events and users microservices. Instead, you'd configure permissions to specifically allow these calls from the web app.


<!-- ------------------------ -->
## Release a Change
Duration: 10

Try making a change to your web application and then redeploy a new revision through Cloud Run. The steps are pretty simple:

1. Switch back to Cloud Shell and click **Open Editor**. 

2. Navigate and open the file `slick-tickets/app/web-app/views/layouts/main.handlebars`.

3. Locate the title tag in the HTML (this sets the label on the browser tab when viewing the page) and make a change to it, perhaps "Slick Tickets 2".

4. Switch from the editor to the Cloud Shell terminal; it will autosave the file. 

5. Navigate to the root of `web-app` and rebuild the image. Set a new version number:

```
cd ~/slick-tickets/app/web-app
gcloud builds submit . -t gcr.io/$DEVSHELL_PROJECT_ID/web-app:v1.1
```
6. Once the build completes, switch to the Google Cloud Console and use the hamburger menu to navigate to the Cloud Run home page. 

7. Click **web-app** to view its details, and then click **Edit & Deploy New Revision**. Changing the container image, or any of the other variables or settings, is accomplished by creating a new revision of the same service. 

8. Use the **Select** link to browse to your new `web-app` container image. Make sure to select the latest of the `web-app` choices, which should appear at the top of the images list. 

9. Click **Deploy** to release your new version.

10. After it has completed and shows that it is serving 100% of traffic to your new revision, check it out in the browser to make sure you see your new change. Remember, the title is just the label on the tab at the top of the page, it doesn't appear in the page text.  

Take a few moments to review the features and options. In particular, try clicking **Manage Traffic** under the **Revisions** tab and see that you can split traffic as you see fit. You might do 50% to each version and watch, as you refresh the page in the browser, for the old title to appear. This is a great way to test two different versions of your app, either as a [Canary Release](https://martinfowler.com/bliki/CanaryRelease.html) or an A/B test. An A/B test is the same technical process as a canary release, the only difference is that you are testing different functionality to see which you want to choose, instead of just confirming that a new release isn't problematic.

<!-- ------------------------ -->
## Make Yourself an Application Administrator
Duration: 15

1. Switch to the Google Cloud Console and use the hamburger menu to navigate to **Firestore**.

2. Navigate into the **users** data collection and find your user. The user id you won't recognize, but if you select the user (you probably only have one), you will be able to identify your name and email. 

3. Click **Add Field** and add a field named `isAdmin` of type `boolean` with a value of `true`. Save the field. 

4. Navigate back to Slick Tickets. Log out and back in. 

5. Investigate the new functionality. 

6. Take a moment to add at least one event. 

<!-- ------------------------ -->
## Bonus
Duration: 15

**SUPER-BONUS: Configure Service-to-Service Authentication**<br>
To complete this Bonus step, you'll need to recreate your events and users services to not allow unauthenticated invocations. Next, follow the instructions for [Authenticating service-to-service](https://cloud.google.com/run/docs/authenticating/service-to-service) on Cloud Run.
