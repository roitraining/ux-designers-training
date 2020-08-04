summary: Run Slick Tickets on GKE
id: run-on-gke
categories: DevEx for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Run Slick Tickets on GKE
<!-- ------------------------ -->
## Overview
Duration: 1

### What You’ll Learn
- Containerizing a microservice application
- Running a microservice application on GKE
- Handling service discovery in Kubernetes
- Releasing changes via Docker and Kubernetes

<!-- ------------------------ -->
## Creating a Kubernetes Cluster on GKE
Duration: 2

Go to GKE in the Google Cloud Console and create a cluster. Make sure to leave it as a zonal cluster to minimize cost. Also make sure that it can access Firestore, which oddly still uses Datastore naming in many places, including scopes and permissions.

To enable access to Firestore and Datastore, open the **Node Pool** settings from the menu on the left and go to **Security** (make sure this is the Security nav item under Node Pools and not the one more generically under the cluster). Under **Access scopes**, change it to **Set access for each API** and then enable Datastore.

Click **Create**. This will take some time, so while the cluster is being provisioned, we'll move on to containering our application.

<!-- ------------------------ -->
## Containerize All Components
Duration: 15

### Create Docker Images
Create a Dockerfile in the directory of each component. Each file should look similar to this:
```
FROM node:12-slim
COPY . /app
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
```

Due to the need for Python in the web-app, use node:stretch instead of node:12-slim. If throughout these courses you add dependencies to the events or users microservices, you may need to switch to node-stretch there as well. It is heavier weight, but includes more things like Python that you may need for those dependencies.

In each folder run:
``` bash
gcloud builds submit . -t gcr.io/[PROJECT_NAME]/[IMAGE_NAME]:[TAG]
```

Substitute the appropriate values for each bracketed name. Project name needs to be the project you are working in, the image name is up to you (web-app, events-service, users-service is probably good), and the tag is also up to you (starting with v0.1 is good to start).

This convenient command accomplishes two things, Cloud Build will build the image for us, and then it will be pushed into Google Container Registry. With this one command, we are ready to deploy an image to Kubernetes.

### Try Running Locally in Cloud Shell
First, let's test this locally in Cloud Shell, like you did in the previous lab. However, instead of running the code directly, run the container instead.

Get three tabs open in Cloud Shell like before, but to run each component, use this command:
``` bash
docker run -p [PORT]:[PORT] -i [IMAGE]
```

The port should be the same port as last time; in this case, it will be the same as before and after the : though in most real-world cases they would be different. The first number is the one exposed externally, and it maps to the internal port which is listed second. Be sure to use the full image path with gcr.io/ and the tag and all. Here's an example:
``` bash
docker run -p 3001:3001 -i gcr.io/gcp-designers-development/events-service:v0.1
```

Note that the web-app should be run on port 8080 (at least externally) so that it can be easily previewed in Cloud Shell.

Preview from Cloud Shell on port 8080 and you should see the app running. You won't be able to access the database without further configuration, but that's OK for our purposes here. Just use CTRL-C to exit from each and we'll move on to GKE.

<!-- ------------------------ -->
## Deploy Your Workloads to Kubernetes
Duration: 15

### Create Deployment Manifests
Create a folder in the root of your repository for Kubernetes manifest files; it's common to call that folder K8s. Use Cloud Shell to create a deployment for each component, name them users-deployment.yaml and web-app-deployment.yaml.

Review the [documentation for K8s deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) and try to write the files yourself. The instructor will show you an example if you need a point of reference.

Consider which port your application is listening on. Use a label that makes sense in this situation; I would use the key "component" instead of "app" since our app is made up of three components. I'm also avoiding the word "service" to refer to one of the microservices since service has a specific meaning in K8s.

### Create Service Manifests
Find the documentation for Kubernetes Services and create the YAML manifests for each. For the users and events microservices, you can use the first example you find in the official documentation which doesn't specify a type. The default type is ClusterIP which is appropriate for internal services.

The web app service is a bit more complicated since we want to expose it publically. Keep scrolling down in the documentation until you find the section on LoadBalancer. This example is a bit more complex than we need, you won't need the parts about clusterIP nor the whole section on status. Port 80 is good, but for target port remember to put whatever port your app is running on internally.

### Apply Your Manifests
At this point, it is good to add and commit your files, and if you have your own repository set up, push to that remote.

Connect kubectl on Cloud Shell to your cluster. Find the cluster in the console and click the **Connect** button next to your cluster. It will give you a prefillable command to run in Cloud Shell that will connect kubectl to your cluster.

Now you are ready to apply all of the YAML files, which can be done all at once. Assuming you are in the root directory of the repo and you named your Kubernetes folder K8s, run:
``` bash
kubectl apply -f k8s/
```

This applies all Kubernetes manifests it finds in the folder, but it does not travel down into subfolders.

Spend some time inspecting what K8s are doing on your behalf. Explore the GUI by clicking **Workloads** and then **Services & Ingress**. Next, explore the CLI with these commands:
``` bash
kubectl get deployments
kubectl get services
```

Drill down further with the following commands:
``` bash
kubectl describe deployments DEPLOYMENT_NAME
```

The CLI follows this standard pattern to get, describe, and delete.

### Test the App!
Use kubectl to get the list of services. This time copy the external IP of the web app service and visit it in a browser. Unfortunately, you'll find the app is broken. Think back a moment to service discovery, how does the web app know where the events and users services are hosted on K8s? They don't! Let's fix that.

<!-- ------------------------ -->
## Fix Service Discovery
Duration: 15

### Understanding K8s and GKE Service Discovery
First read through the section on [Discovering services](https://kubernetes.io/docs/concepts/services-networking/service/#discovering-services) in the Kubernetes documentation. Then read through the [Service discovery and DNS](https://cloud.google.com/kubernetes-engine/docs/concepts/service-discovery) documentation for GKE specifically.

The net net for us on GKE is that we can simply find our services like this:
```
http://events-service
```

Pretty convenient!

### Redeploy the Web App Deployment
Let's rebuild our web app image for use in Kubernetes. Set your .env file for the web app component so that it points to the correct place for both the users and events service.

Now use the gcloud builds submit command, but this time with a new version tag.

Next, exit your K8s manifest for the web app deployment to point to the new image. Finally, reapply that file with kubectl apply and let K8s do the work for you!

Refresh your browser tab that is pointed at your web app service, and now the app should be fully functional.

**Important Note**
We are baking the environmental variables directly into the container image. That's not great, because it means the images won't necessarily play well in different environments. It's better to set those variables where it gets deployed. In the case of Kubernetes, you'd do that with a feature called ConfigMaps. Keep reading to learn about those.

### Bonus: Using ConfigMaps
If you'd like to try doing environmental variables right on K8s, delete your .env files and rebuild the images. Now they don't have those values baked in, which is good.

Read up on [K8s ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/). Note that there is a very similar feature called [Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) which is for information that should be encrypted, like API keys.

Try creating a ConfigMap for each deployment, and then attach it using the deployment manifests. Reapply the files. Use kubectl get deployments and wait until all Pods are available and up to date. Once they are, test the app to make sure it still functions properly.

### Bonus: Set Up a Build Trigger
Note this will only work if you've created your own repo.

Cloud Build and Cloud Source Repos work well together to give you elements of a CICD pipeline built in.

Read up on [Creating and managing build triggers](https://cloud.google.com/cloud-build/docs/running-builds/create-manage-triggers) and [Automating GKE Deployments](https://cloud.google.com/cloud-build/docs/deploying-builds/deploy-gke#automating_deployments).

Follow the instructions there, or simply go to the **Workloads** tab in GKE, click one of your deployments, and use the notifcation at the top to set up an automated deployment.

Once you have it set up, try making a change and pushing the repo to see if the change automatically rolls out for you. Remember, you can keep an eye on the deployment with kubectl describe deployments DEPLOYMENT_NAME to see when all pods are up to date and available.

<!-- ------------------------ -->
## Cleanup
Duration: 1

Remember to delete your cluster. Keep some notes on the settings you used to provision it (enabling Datastore). Because you have the YAML files, you can easily create a new cluster later and then reapply those files. That's the beauty of Infrastructure as Code!
