summary: Cloud Endpoints with Cloud Run
id: endpoints-with-run
categories: Cloud Run for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Cloud Endpoints with Cloud Run
<!-- ------------------------ -->
## Overview
Duration: 5

### What You’ll Learn
- Install the Cloud Endpoints control plane
- Connect it to Slick Tickets
- Create an OpenAPI definition

Spend some time reviewing the official guide we'll use throughout this lab:
[https://cloud.google.com/endpoints/docs/openapi/get-started-cloud-run](https://cloud.google.com/endpoints/docs/openapi/get-started-cloud-run).

Note that in this case, we will be using Cloud Run both to run the Cloud Endpoints control plane (ESP) and also as the underlying infrastructure/data plane (our microservices). Additionally, our web app that will consume the API gateway is itself running on Cloud Run. Each of these components could be on different infrastructure, and the great thing about Endpoints is that if we add or move microservices to different services (Compute Engine, GKE, Cloud Run for Anthos, Cloud Functions, App Engine), we would not have to change our application code that consumes those services!

<!-- ------------------------ -->
## Install and Configure Endpoints
Duration: 30

### Deplying ESPv2 Beta to Cloud Run
Follow the link in the guide for **Deploying ESPv2 Beta**, which will just drop you down the page a bit.

You can use gcloud from your local machine or Cloud Shell. In either case, you probably have already set your project, so you don't need to explicitly mention the project in the gcloud run deploy command. You can choose any reasonable name for the service, for example, "espv2" or "gateway".

As with our previous examples, you do not need to add authentication for the purposes of this lab, but in the real world, you would likely have authentication, especially for an API that is being consumed internally by your app. 

### Configuring Endpoints
Continue down the tutorial to **Configuring Endpoints**. 

Fundamentally, what we are doing here is using our hosted ESP to serve an API endpoint that maps to some underlying infrastructure, for example, our events service. So for the **host** property, you'll want to specify the URL for the ESP service you just deployed without the "https" part. And for the x-google-backend > address part, you'll want to specify your events or users service with the "https".

Here are some additional changes to make:
1. Change the title to something that makes sense for our situation, like "Slick Tickets Events API".
2. As an initial test, try exposting one simple route like /events.
3. Change the summary and operationId to something that makes sense.

### Rebuilding the ESP Image
Continue through the tutorial to rebuilding the ESP Image.

When asked to download the script, just create a text file with the specified name (and no file extension) and paste the contents in from GitHub. This is a bash script. 

To get your config ID, navigate to Cloud Endpoints in the Console, then click **Deployment History**. You should only have one so far. 

You will need to specify **ESP_PROJECT_ID** regardless of whether or not you have a default project set.

You should only need to do steps 1 and 2. Step 3 is required if you are calling the API gateway directly from client code in a browser. But since we plan to call our gateway from the web app Cloud Run service, we won't have to worry about CORS (cross-origin resource sharing). Step 4 will be required only if went beyond the basic instructions and required authentication for your events and users services. 

At this point, you should be able to test your API gateway and see it work!
```
https://ESP_HOSTNAME/events
```

It may not be immediately obvious how awesome this is, since really you just have a new URL that does the same thing as the old URL. But as systems evolve over time, abstracting the API gateway from the underlying infrastructure has myriad benefits. As mentioned at the beginning of this lab, the underlying infrastructure can change. But even if it doesn't, you may end up with multiple versions of your API, plus you now have access to all the other great Endpoints features that were discussed in class. 

<!-- ------------------------ -->
## Integrate with the Slick Tickets Web App
Duration: 20

### Complete Your API Specification
So far, we have only done one endpoint for one service. Go through and complete the API specification for each endpoint on each microservice (events and users). If you added a Cloud Function, you can put that behind the gateway as well. Follow all the steps above as you do this, including rebuilding and deploying the image. Test your endpoints. 

I recommend you add a bit to the path for each service, so instead of simply /events, do /events/events. That may seem silly, but that way everything from the events service is behind /events and everything for users is behind /users. 

### Update the Slick Tickets Application to Consume this API Gateway
Update your environmental variables to look to the API gateway for the events and users services instead of going directly to their Cloud Run deployments. That means that both services will now have the same base URL, but the events service will have /events and the users service will have /users afterward, assuming you followed the suggestion earlier to organize your gateway that way. 

Thanks to Endpoints, this may be the last time that such a configuration change is necessary. From now on, you could change how those services are hosted and implemented and then simply change your Endpoints configuration to point to the new environments. 

If you want to get fancy, and more real world, you could add /v1/ into the URL structure (example: /v1/events) using the basePath option in OpenAPI specs. See this documentation:
[https://cloud.google.com/endpoints/docs/openapi/versioning-an-api](https://cloud.google.com/endpoints/docs/openapi/versioning-an-api).

This is so that if you release a breaking change to your API (not backward-compatible), you don't break applications that consume your API. Developers of those applications can read up on your changes and migrate to the new version when they feel ready. 

<!-- ------------------------ -->
## Cleanup
Duration: 1

No special cleanup should be required in this case. You are hosting ESP on Cloud Run so the charges should be free to minimal. And as this is a cumulative project, you can just continue to use Endpoints for your project from here on out. 