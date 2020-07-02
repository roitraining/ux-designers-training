summary: Deploy and Observe an App on GKE
id: deploy-and-observe-app-gke
categories: Operations for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Deploy and Observe an App on GKE
<!-- ------------------------ -->
## Interacting with Docker
Duration: 20

### Look for Local Images
Run a Docker command to see if you have any local images:
``` bash
docker images
```

Note that Docker commands, like kubectl, gcloud, and git, work out of the box with Cloud Shell because they are all preinstalled.

Unless you've already been using Docker in Cloud Shell, you probably will have an empty list of images; that's no problem! Many free images exist in public registries, such as Google Container Registry and Docker Hub.

### Run a Container in Cloud Shell
Run Google's sample Hello App container in Cloud Shell:
``` bash
docker run -p 8080:8080 gcr.io/google-samples/hello-app:2.0
```

Read the output, and notice that since there was no local copy of the image available, a remote one was pulled from GCR.

Leave the container running, and click the icon in Cloud Shell that looks like a browser window (it's next to the gear icon). Then click **Preview on port 8080**. A new browser tab should open and you should see something like this:
Hello, world!
Version: 2.0.0
Hostname: 32f6a040385c

This works because when we ran the container with the previous Docker command, we specified -p 8080:8080, which means that Docker is exposing the container externally on port 8080 (since the number before the colon is 8080). In this case, we are also mapping to port 8080 internally within the container (since the number after the colon is also 8080), but that's not necessary. Internally it could have been running on a different port.

Use Ctrl-C to exit the container. (Note that if you had used the -d flag when running the container, it would have ran in the background.)

Rerun the command to see local images:
``` bash
docker images
```

Notice that now you have a local copy of the image to run containers off of. If you were running many copies of this container (which is common on K8s), you would just need this one copy of the image.

Run the following command to see if any containers are currently running:
``` bash
docker ps
```

There shouldn't be unless you had some running prior to this lab. Run the Hello App again, but this time in the background:
``` bash
docker run -d -p 8080:8080 gcr.io/google-samples/hello-app:2.0
```

Run docker ps again and you'll see the running container.

To stop the container, copy its ID from the previous output, and modify this command with your ID:
``` bash
docker stop [CONTAINER_ID]
```

Optionally, you can run the following command to fully remove the container (the image will still be stored locally):
``` bash
docker rm [CONTAINER_ID]
```

Optionally, you can remove the image by finding its ID:
``` bash
docker images
```

Then remove the image with its ID:
``` bash
docker images rm [IMAGE_ID]
```

## Deploy App to GKE
Duration: 20

### Using the Official Quickstart
Before using the quickstart, visit GKE in the GUI to cause the API to become enabled. Once you see the option to "Create cluster", the API should be enabled and you can move on to the guide.

When creating the cluster in the next step, be sure to enable access to Firestore and Datastore. When creating the cluster, open the **Node Pool** settings from the menu on the left and go to **Security** (make sure this is the Security nav item under Node Pools and not the one more generically under the cluster). Under **Access scopes**, change it to **Set access for each API** and then enable Datastore.


Follow the [official GKE quickstart](https://cloud.google.com/kubernetes-engine/docs/quickstart) using Cloud Shell.

**Notes:**
1. In most cases, Cloud Shell will already have your project set, as long as you were in that project when you opened Cloud Shell.
2. But you will need to set the zone. In previous labs we used us-central1-a (full command: gcloud config set compute/zone us-central1-a), but you may use whatever zone you prefer.
3. Notice you are creating a one-node cluster, which is not how it would run in production, but it's a cheaper way to test out the functionality. We will add a node later.
4. The quickstart has you create deployments and Services via the "imperative method," but in the real world the "declarative method" is more common and recommended. With the declarative method, you would write YAML files to describe the things you want K8s to do, and then apply those files using kubectl, instead of using a variety of kubectl commands to give specific instructions. [Click here](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/) to read more.

## Expanding Clusters and deployments
Duration 20

### Expanding Clusters
Next we're going to add some complexity so we can make better use of Logging and Monitoring in the next section. Let's start by expanding our cluster:
``` bash
gcloud container clusters resize cluster-name --node-pool default-pool \
    --num-nodes 2
```

Just hit Return to take the default (Y / yes).

This will take a minute.

Remember that with Kubernetes there are two very distinct notions of size. We just added a node to the cluster, which makes the whole cluster bigger, but it did not actually put any of our Pods on that new node. For that we need the other type of sizing; we need to expand our deployment.

### Expanding Deployments
First let's take a look at our deployment:
``` bash
kubectl get deployments
```

Notice that we only have 1 Pod, and each Pod can only live on one given node. So to have redundancy and real load balancing, we need to spread our Pods across the nodes. For the most part, K8s takes care of that, we just need to ask it for more Pods. Run the following command to add 3 Pods to the deployment:
``` bash
kubectl scale deployment.v1.apps/hello-server --replicas=4
```

Run the get deployments command again and see that K8s is in the process of spinning up your new Pods. Wait a minute and run it again until you see all 4 Pods are healthy.

Visit the IP address of your Service again (if you need to find it, just run kubectl get services). Hit refresh several times (you may need to refresh up to 10 times, but probably only a few times) and you should see the hostname changing. That is showing you which Pod you are hitting.

To see details about those Pods, use the GKE GUI and click **Workloads**. Click your hello-server deployment and scroll down to Managed Pods. There you can see the hostnames you were seeing in your browser. You can drill further in and click a Pod to see details about it, including which node it is on.

As you poke around, take note of the monitoring that is available even here inside the GKE GUI. Feel free to explore further, perhaps taking a look at your Service.

## Run a Microservice Application
Duration: 10

### Clone the Sample App to Cloud Shell
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

## Run the App
Duration: 15

### Service Discovery
Since we are now dealing with two microservices and a presentation tier web app, we have to concern ourselves with service discovery. How do our three components find each other?

For now, we are going to use a simple strategy of manually configured environmental variables. There are more complex methodologies, some built into Kubernetes, Istio/Anthos has its own strategy involving the Envoy Proxy, and there are others.

Also, since we are running on a single VM (Cloud Shell), the three components can find each other on localhost at whatever port each is running on. The web app should run on port 8080, since that is the publically exposed piece we will preview on. The other two can run on 3001 and 3002, or any high (in the thousands) number port you choose. The key is that whatever you choose for the two microservices, the web app needs to know about it.

### Start the Services
With this in mind, adjust your .env files as needed, and run all three components. You should then be able to preview the web tier and use the application.

Follow the instructions in the README to create an account and make yourself an administrator. Then as an administrator, you can create events. Create a second account to use to test the end user experience, and try registering for an event and printing a ticket.

You can shut it down. Next we will deploy it to your GKE Cluster. 

## Containerize All Components
Duration: 15

### Create Docker Images
Create a Dockerfile in the directory of each component. Each should look about like this:
```
FROM node:12-slim
COPY . /app
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
```

However, due to the need for Python in the web-app, use node:stretch instead of node:12-slim. If throughout these courses you add dependencies to the events or users microservices, you may need to switch to node-stretch there as well. It is heavier weight, but includes more things like Python that you may need for those dependencies.

In each folder run:
``` bash
gcloud builds submit . -t gcr.io/[PROJECT_NAME]/[IMAGE_NAME]:[TAG]
```

Substitute in the appropriate values for each bracketed name. Project name needs to be the project you are working in, the image name is up to you (web-app, events-service, users-service is probably good), and the tag is also up to you (starting with v0.1 is good to start).

This convenient command accomplishes two things, Cloud Build will build the image for us, and then it will be pushed into Google Container Registry. Which means with this one command we are ready to deploy an image to Kubernetes.

### Try Running Locally in Cloud Shell
First let's test this locally in Cloud Shell, just like you did previously. However, this time instead of running the code directly, run the container instead.

Get three tabs open in Cloud Shell like before, but this time to run each component use this command:
``` bash
docker run -p [PORT]:[PORT] -i [IMAGE]
```

The port should just be the same port as last time; in this case it will be the same before and after the : though in most real-world cases they would be different. The first number is the one exposed externally, and it maps to the internal port which is listed second. Be sure to use the full image path with gcr.io/ and the tag and all. Here's an example:
``` bash
docker run -p 3001:3001 -i gcr.io/gcp-designers-development/events-service:v0.1
```

Note that the web-app should be run on port 8080 (at least externally) so that it can be easily previewed on Cloud Shell.

Now preview from Cloud Shell on port 8080 and you should see the app running. You won't be able to access the database without further configuration, but that's okay for our purposes here. Just use Ctrl-C to exit from each and we'll move on to GKE.

<!-- ------------------------ -->
## Deploy Your Workloads to Kubernetes
Duration: 15

### Create Deployment Manifests
Create a folder in the root of your repository for Kubernetes manifest files; it's common just to call that folder k8s. Use Cloud Shell to create a deployment for each component, name them simply like users-deployment.yaml and web-app-deployment.yaml.

Review the [documentation for K8s deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) and try to write the files yourself. The instructor will show you an example if you need a point of reference.

Consider which port your application is listening on. And also use a label that makes sense in this situation; I would use the key "component" instead of "app" since our app is made up of three components. I'm also avoiding the word "service" to refer to one of the microservices since service has a specific meaning in K8s.

### Create Service Manifests
Find the documentation for Kubernetes Services and create the YAML manifests for each. For the users and events microservices, you can use the first example you find in the official documentation which doesn't specify a type. The default type is ClusterIP which is appropriate for internal services.

The web app service is a bit more complicated since we want to expose it publically. Keep scrolling down in the documentation until you find the section on LoadBalancer. This example is a bit more complex than we need, you won't need the parts about clusterIP nor the whole section on status. Port 80 is good, but for target port remember to put whatever port your app is running on internally.

### Apply Your Manifests
At this point it would be good to add and commit your files, and if you have your own repository set up, you can push to that remote.

Connect kubectl on Cloud Shell to your cluster. Find the cluster in the console and click the **Connect** button next to your cluster. It will give you a prefillable command to run in Cloud Shell that will connect kubectl to your cluster.

Now you are ready to apply all of the YAML files, which can be done all at once. Assuming you are in the root directory of the repo and you named your Kubernetes folder k8s, run:
``` bash
kubectl apply -f k8s/
```

This will apply all Kubernetes manifests it finds in the folder, but it will not travel down into subfolders.

Now spend some time inspecting what K8s is doing on your behalf. You can explore through the GUI by clicking **Workloads** and then **Services & Ingress**. Next you can explore through the CLI with these commands:
``` bash
kubectl get deployments
kubectl get services
```

You can then drill down further with commands like:
``` bash
kubectl describe deployments DEPLOYMENT_NAME
```

The CLI follows this very standard pattern to get, describe, and even other things like delete.

### Test the App!
Use kubectl to get the list of services again. This time, copy the external IP of the web app service and visit it in a browser. Unfortunately, you'll find the app is broken. Think back a moment to service discovery, how does the web app know where the events and users services are hosted on K8s? They don't! Let's fix that.

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
Let's rebuild our web app image for use in Kubernetes. Go in and set your .env file for the web app component so it points to the right place for both the users and events service.

Now use the gcloud builds submit command, but this time with a new version tag.

Next exit your K8s manifest for the web app deployment to point to the new image. Finally, reapply that file with kubectl apply and let K8s do the work for you!

Refresh your browser tab that is pointed at your web app service, and now the app should be fully functional.

**Important Note**
We are baking the environmental variables directly into the container image. That's not great, because it means the images won't necessarily play well in different environments. It's better to set those variables where it gets deployed. In the case of Kubernetes, you'd do that with a feature called ConfigMaps. Keep reading to learn about those.

## Monitoring and Logging in GKE
Duration 20

### Overview
It's important to remember that GKE is for the most part GCE. Until recently there were actually no GKE-specific charges, customers paid only for the GCE VMs that are the nodes in your GKE cluster. Those VMs will emit logs and metrics just like other VMs.

However, unlike pure GCE, here in GKE the logging and monitoring agents are installed for us. Also, Kubernetes abstractions like deployment and Pod show up in Logging and Monitoring, which is awesome for analyzing K8s workloads. Let's take a look.

### Monitoring
Go to **Metrics Explorer**, and search for Pod. Click **Kubernetes Pod** and then look for Bytes transmitted. Look at the table below the chart and you'll notice your Pods, but also many system Pods. Several of those system Pods are related to monitoring and logging, such as Fluentd, Heapster (deprecated, but was still there as of this writing), Metrics Server, and a Stackdriver agent.

Now let's use Apache Bench to simulate significant traffic. First, install Apache tools in Cloud Shell:
``` bash
sudo apt update
sudo apt install apache2-utils
```

To confirm Apache Bench is installed, run:
``` bash
ab -V
```

Next you'll need the IP address of your Service. If you don't have it handy, just run:
``` bash
kubectl get services
```

Let's start with a small bit of fake load:
``` bash
ab -n 1000 -c 50 http://[SERVICE_IP_ADDRESS]
```

That did 1000 requests, with up to 50 running at a time.

Next put on some real load:
``` bash
ab -n 100000 -c 500 http://[SERVICE_IP_ADDRESS]
```

Take a 3-5 minute break to give it time to collect metrics. Now go back to **Metrics Explorer** and you should see some metrics popping off. Take a look back at Bytes transmitted. Next search for Kubernetes Container and look through the popular metrics. See what the system was doing, what sort of resources were being expended.

### Logging
Application code runs inside Pods, so one way to see application logs is to ask kubectl to give us the logs for a specific Pod.

First get a list of your Pods:
``` bash
kubectl get pods
```

Copy one of the IDs for a Pod, any one of them, and use it in the following command:
``` bash
kubectl logs [POD_ID]
```

With a real application deployed on K8s, looking at one Pod is generally not good enough. We might have 100 Pods for one Deployment, but that's where labels come in handy. Let's find a label that is common to our 4 Pods.

We know they are managed by the Deployment we used to create them, so let's inspect it. First list all Deployments:
``` bash
kubectl get deployments
```

Next get details about our Deployment:
``` bash
kubectl describe [DEPLOYMENT_NAME]
```

Look for the section titled **Pod Template** and for **Labels** inside of that. They are key-value pairs just like in Google Cloud, and they are listed as key=value. Copy the entire label, with the key, the equals sign, and the value, that you get from the Pod Template.

Now we can get the logs for an entire Deployment, since we know that the Deployment has labeled all the Pods it created this way:
``` bash
kubectl logs -l [LABEL]
```

These logs probably don't say much, as we are running a very simple "hello world app." It is basically telling us that it served a response to a request on the root route (just a "/"). If you want to see it do something different, add something to the route when you visit the IP address in your browser, like so:
http://[MY_SERVICE_IP]/someroute

Then in Cloud Shell rerun the kubetl logs command. You should see "/someroute" or whatever you put in the logs. Take note how important it is that you can get the logs for all Pods in a Deployment, or you'd be hunting through Pod by Pod looking for the one that served your response.

Of course since we're on GKE, another way to see application logs is to go to **Cloud Logging**. Head there now and from the first dropdown select the resource **Kubernetes Container**.

**Note:** With Cloud Logging there can be a ~30-sec delay before the logs show up in the GUI.

In Cloud Logging you see a lot more, because you are seeing logs from other containers running on your cluster, not just the ones in Pods that were labeled by your Deployment. To filter as we did with kubectl, follow these steps:
1. Find a log entry that matches one we saw with kubectl; it might say "Serving request: /" or something like that. Maybe it has the fake route you added like "/someroute."
2. Twirl down that log entry, and then click **Expand All**.
3. Under labels, find the same label you used with kubectl and click it.
4. Click **Show matching entries**.

Now you should see in Cloud Logging something very similar to what you saw with kubectl. You could also click **Show matching entries** after clicking where it says **ERROR**. Now you'd see only errors coming from your specific Deployment. From this you could create a custom Cloud Monitoring metric (a ["logs-based metric"](https://cloud.google.com/logging/docs/logs-based-metrics)), and from that an alert.

It is very common for tech workers to use Logging and Monitoring together to be alerted if there was a sudden spike in application errors, in this case specific to a Deployment on GKE.
