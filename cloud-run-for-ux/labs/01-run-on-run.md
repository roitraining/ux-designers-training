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
## Create New Images
Duration: 5

If you haven't already, recreate your images without the .env files. We'll handle the environmental variables through Cloud Run. After you've removed the .env files, simply run the builds submit command again for each component (remember to navigate into the folder for each before running the command):
``` bash
gcloud builds submit . -t gcr.io/[PROJECT_NAME]/[IMAGE_NAME]:[TAG]
```

<!-- ------------------------ -->
## Deploy Services to Cloud Run
Duration: 20

Here you'll get to see the beauty of Cloud Run and how simple it is compared to everything you've done in this class so far. Navigate to Cloud Run in the console and do the following steps for each component (do the web app last):
1. Create Service.
2. Give it a name, and click **Allow unauthenticated invocations**.
3. Click **Next**.
4. Select the appropriate image.
5. Click **Show Advanced Setting**.
6. Choose the **Container port** based on the port you have the component running on internally in the container.
7. Switch to the **Variables** tab and enter environmental variables.

The reason you are doing web app last is so that you have the locations of the other components to provide to the web app as environmental variables.

**Important Note:**
In the real world, you would allow unauthenticated invocations for the web app, but not for the events and users microservices. Instead you'd configure permissions to specifically allow these calls from the web app.

**BONUS: Configure Service-to-Service Authentication**<br>
To complete this bonus step, you'll need to recreate your events and users services to not allow unathenticated invocations. Next follow the instructions for [Authenticating service-to-service](https://cloud.google.com/run/docs/authenticating/service-to-service) on Cloud Run.

<!-- ------------------------ -->
## Release a Change
Duration: 10

Try making a change and redeploy a new revision through Cloud Run. The steps are pretty simple:
1. Make your changes in the application code.
2. Build a new image with Cloud Build.
3. Edit the service and choose the new image.
4. Click **Deploy** to release your new version.
5. After it has completed and shows that it is serving 100% of traffic to your new revision, check it out in the browser to make sure you see your new change.

Take a few moments to review the features and options. In particular, try clicking **Manage Traffic** under the **Revisions** tab and see that you can split traffic as you see fit. This is a great way to test two different versions of your app, either as a [Canary Release](https://martinfowler.com/bliki/CanaryRelease.html) or an A/B test. An A/B test is the same technical process as a canary release, the only difference is that you are testing different funtionality to see which you want to choose, instead of just confirming that a new release isn't problematic.

<!-- ------------------------ -->
## Cleanup
Duration: 1

Since we used the fully managed version of Cloud Run, you don't necessarily need to delete your Services. You are only charged for what you use, and even then there is a free tier. As long as you don't expect these will get called very much, you should not be charged at all. But just to be safe, if you don't plan to use them, go ahead and delete them.
