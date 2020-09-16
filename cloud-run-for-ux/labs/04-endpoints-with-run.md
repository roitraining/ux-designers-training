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
https://cloud.google.com/endpoints/docs/openapi/get-started-cloud-run.

Note that in this case, we will be using Cloud Run both to run the Cloud Endpoints control plane (ESP) and also as the underlying infrastructure/data plane (our microservices). Additionally, our web app that will consume the API gateway is itself running on Cloud Run. Each of these components could be on different infrastructure, and the great thing about Endpoints is that if we add or move microservices to different services (Compute Engine, GKE, Cloud Run for Anthos, Cloud Functions, App Engine), we would not have to change our application code that consumes those services!

You should also spend some time to check out the just in Beta Cloud API, which to some extent will replace Cloud Endpoints. 

<!-- ------------------------ -->
## Install and Configure Endpoints
Duration: 30

### Deploying Extensible Service Proxy V2 Beta (ESPv2 Beta) to Cloud Run

1. Take a look at the Deploying ESPv2 Beta section in the linked example above: https://cloud.google.com/endpoints/docs/openapi/get-started-cloud-run#deploy_endpoints_proxy. What we are about to do is based on this document. 

2. Locate or launch Cloud Shell and make sure you are working there (as opposed to your VM SSH window). Make sure it's associated with your working project by checking the tab at the top of the Cloud Shell interface. It should display your project name.

3. In Cloud Shell, you are already logged in and the current project should be set, so let's set the default region to `us-central1`.

```
gcloud config set run/region us-central1
```

4. Deploy an ESPv2 Beta instance to Cloud Run. 

```
gcloud run deploy esp-gateway \
    --image="gcr.io/endpoints-release/endpoints-runtime-serverless:2" \
    --allow-unauthenticated \
    --platform managed
```

5. Examine the message that is displayed when the service is created. Make note of the URL to the service at the end. 

6. Visit the URL from the last step. You should see a warning message about a missing "ENDPOINTS_SERVICE_NAME in environment variable." That is expected at this point, and is a good sign that the endpoint proxy is up and running. 


### Configuring Endpoints
We are continuing with the example linked at the beginning of our exercise. Specifically, we are now in the Configuring Endpoints section: https://cloud.google.com/endpoints/docs/openapi/get-started-cloud-run#endpoints_configure. 

Fundamentally, what we are doing here is using our hosted ESP to serve an API endpoint that maps to some underlying infrastructure, in this case, our events service. 

1. Open the Swagger definition editor here: https://editor.swagger.io/. This editor has some basic functionality that can help make it easier to create/edit OpenAPI definition files. Take a moment and explore the example they load by default. If you are a learn-by-example person, this is a great example. 

2. Copy the below OpenAPI file and replace the example file in the editor with this one: 

```
swagger: '2.0'
info:
  title: Cloud Endpoint for the Events service
  description: A quick Cloud Endpoint for our events-service
  version: 1.0.0
host: host name, without https, for your cloud endpoint here
schemes:
  - https
produces:
  - application/json
x-google-backend:
  address: Address to your events service here
  protocol: h2
paths:
  /events:
    get:
      summary: Get a list of events
      operationId: listEvents
      responses:
        200:
          description: OK
          schema:
            type: object
            properties: 
              events:
                type: array
                items:
                  $ref: "#/definitions/Event"
              
              
definitions:
  Event:
    type: object
    properties:
      name:
        type: string
      description:
        type: string
      attendees:
        type: array
        items:
          type: string
      slug:
        type: string
      
```

3. Replace the host and address with your specific values. The host should be something like:
`esp-gateway-blahblah-uc.a.run.app` (notice, no `https`, just the host). Then replace the address with the address for your events service. It will look something like this:
`https://events-service-blahblah-uc.a.run.app`.

4. Make sure the editor isn't displaying any errors. Take a moment and explore the right half of the page, which has some nice visualizations of what the file contains. Once you're satisfied, copy the modified contents of the file from the editor. 

5. Switch to your Cloud Shell window, and to open the editor, click the button that reads `Open Editor` or looks like a pencil icon. 

6. Expand `slick-tickets/app/events-service` and create a new file in that folder named `events-api.yaml`. Paste the OpenAPI file you copied a few steps ago into the new file. 

7. The Cloud Shell editor auto-saves, but if it makes you feel better, save the file. Then close the editor and switch back to the Cloud Shell terminal.

### Deploy the Endpoints Configuration
Still following the linked example, we are now in this section: 
https://cloud.google.com/endpoints/docs/openapi/get-started-cloud-run#deploy_configuration.

1. Make sure you are in the Cloud Shell terminal window.

2. Make sure you are in your `~/slick-tickets/app/events-service` folder. Also, make sure your `events-api.yaml` is in that same folder. 

```
cd ~/slick-tickets/app/events-service
ls
```

3. Upload the configuration and create the managed service. During the configuration process, you will see several messages. One warns that currently there is no key required for our service. In real life, we would want to turn on some sort of API security. 

```
gcloud endpoints services deploy events-api.yaml
```

4. In the messages after the last command, locate the one that uses the format `Service Configuration [Your config ID] uploaded for service [host name]`. Take note of the `config ID` because you'll need it in a few steps. 

### Building a New ESPv2 Beta Image
Still following the linked example, we are now in this section: 
https://cloud.google.com/endpoints/docs/openapi/get-started-cloud-run#configure_esp.

1. Follow the link above and read the Note at the top of the series of steps. This explains a bit why we are doing the next few steps. Tl;dr: Cloud Run needs the image to be standalone with the configuration built into it. 

2. In Cloud Shell, download the service builder script and make it executable.

```
curl https://raw.githubusercontent.com/GoogleCloudPlatform/esp-v2/master/docker/serverless/gcloud_build_image > gcloud_build_image
chmod +x gcloud_build_image
```

3. Run the script to build the service into a new container image, which gets uploaded to the Container Registry. Make sure to specify the `config ID` and `host name` you noted at the end of the last section. 

```
./gcloud_build_image -s hostNameHere \
    -c configIdHere -p $DEVSHELL_PROJECT_ID
```

4. When the image build completes, switch to the Google Cloud Console and look at the images in Container Registry. You should see a just deployed "endpoints-runtime-serverless". Hover over the image's name and a copy button should appear with the tool tip "Copy full image name." Copy the full name and drop it in a text document or something because you'll need it in the next step. 

5. Redeploy your "endpoints-runtime-serverless" service using your new image. You'll need to replace the image path with the one copied in the last step. Notice, this is mostly the exact same step we ran earlier to deploy the first, generic esp-gateway. `gcloud run deploy` both deploys new Cloud Run services, and updates existing. 

```
gcloud run deploy esp-gateway \
    --image="imageYouCopiedHere" \
    --allow-unauthenticated \
    --platform managed
```

6. Once the Cloud Run service successfully updates, it will display a message with the path to the service. It should take the form `https://esp-gateway-blah-uc.a.run.app`. Click the link to visit the service. At first, it will display an error message. Add `/events` to the end of the URL and the service should work. 

It may not be immediately obvious how awesome this is, since really you just have a new URL that does the same thing as the old URL. But as systems evolve over time, abstracting the API gateway from the underlying infrastructure has myriad benefits. As mentioned at the beginning of this lab, the underlying infrastructure can change. But even if it doesn't, you may end up with multiple versions of your API, plus you now have access to all the other great Cloud Endpoints features that were discussed in class. 

Cloud Endpoints also allows you to add that `yaml` description file to your service, so people can dynamically pull a description of how the service works. It also supports extra monitoring and observability, usage quotas, has a deployment history, etc. 

<!-- ------------------------ -->
## Bonus 1: Fun with the Swagger Editor
Duration: 30

### Complete Your API Specification
So far, we have only done one path, `/events`, in our Cloud Endpoints for our `events-service`. You really need to complete all of them.

1. Look at the `events-service/routes.js` file and it will show you all the paths, along with the http verb (get, post, delete, put, patch) used with each one. You will probably have to take a peek at the code, and/or invoke the methods in the browser to figure out how each one works, and how to translate that to paths and schemas in the OpenAPI file.  

2. Use the Swagger editor (https://editor.swagger.io/) to update your `events-api.yaml` file to include the various paths and, if needed, object definitions. 

**Tip:**<br>
Take a peek at the example in the editor when you first pull it up. It has a lot of good examples. I like to open it in a second tab so I can look to it for advice where needed. 


<!-- ------------------------ -->
## Bonus 2: Integrate Cloud Endpoints and Slick Tickets
Duration: 10<br>
**Note:** This will only work if you completed Bonus 1.


### Update the Slick Tickets Application to Consume This API Gateway

1. Use the Cloud Run page in the Google Cloud Console to create a new revision for your `web-app` service. Edit the services variables and update the path to the `events` service so that it runs through your Cloud Endpoints. 

As a side note, if you also updated your `users` service to run through the gateway, the base URLs for both the services would be the same. One would be `/events` and one would be `/users`. Service consumers wouldn't need to even know that they were actually different services. Another nice Cloud Endpoints feature. 

If you want to get fancy, and more real world, you could add `/v1/` into the URL structure (example: `/v1/events`) using the basePath option in OpenAPI specs. See this documentation:
https://cloud.google.com/endpoints/docs/openapi/versioning-an-api.

This is so that if you release a breaking change to your API (not backward-compatible), you don't break applications that consume your API. Developers of those applications can read up on your changes and migrate to the new version when they feel ready. 
