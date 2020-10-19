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

1. Open your class trial project and navigate to Cloud Shell. 

1. In Cloud Shell, run a Docker command to see if you have any local images.

``` bash
docker images
```

Note that Docker commands, like kubectl, gcloud, and git, work out of the box with Cloud Shell because they are all preinstalled.

Unless you've already been using Docker in Cloud Shell, you probably will have an empty list of images; that's no problem! Many free images exist in public registries, such as Google Container Registry and Docker Hub.

### Run a Container in Cloud Shell

1. Google has a basic application they use in some demos. Let's run Google's sample Hello App container in Cloud Shell.

``` bash
docker run -p 8080:8080 gcr.io/google-samples/hello-app:2.0
```

Read the output, and notice that since there was no local copy of the image available, a remote one was pulled from the Google Container Registry (GCR).

For more information on the docker command, see the [Docker cheat sheet](https://www.docker.com/sites/default/files/d8/2019-09/docker-cheat-sheet.pdf)

1. Leave the container running, and click the **Web preview** button near the top right corner of Cloud Shell (it's next to the gear icon). Then select **Preview on port 8080**. A new browser tab should open and you should see the response from your running docker container. Something like:

```
Hello, world!
Version: 2.0.0
Hostname: 32f6a040385c
```

This works because when we ran the container with the previous Docker command, we specified -p 8080:8080, which means that Docker is exposing the container externally on port 8080 (since the number before the colon is 8080). In this case, we are also mapping to port 8080 internally within the container (since the number after the colon is also 8080), but that's not necessary. Internally it could have been running on a different port.

1. In Cloud Shell, use **Ctrl-C** to exit the container. (Note that if you had used the -d flag when running the container, it would have executed in the background.)

1. Rerun the command to see local images:

``` bash
docker images
```

Notice that now you have a local copy of the image to run containers off of. If you were running many copies of this container (which is common on K8s), you would just need this one copy of the image.

1. Run the following command to see if any containers are currently running:

``` bash
docker ps
```

1. There shouldn't be unless you had some running prior to this lab. Run the Hello App again, but this time as a background process.

``` bash
docker run -d -p 8080:8080 gcr.io/google-samples/hello-app:2.0
```

1. Run docker ps again and you'll see the running container.

1. To stop the container, copy its ID from the previous output, and modify this command with your ID:

``` bash
docker stop [CONTAINER_ID]
```

1. Optionally, you can run the following command to fully remove the container (the image will still be stored locally):

``` bash
docker rm [CONTAINER_ID]
```

1. Optionally, you can remove the image by finding its ID:

``` bash
docker images
```

1. Then remove the image with its ID:

``` bash
docker images rm [IMAGE_ID]
```

# Interacting with GKE
<!-- ------------------------ -->

## Deploy an App to GKE
Duration: 20

### Building a new GKE cluster with the CLI

1. In Cloud Shell, use `gcloud` to create a new 3 node cluster.

``` bash
gcloud container clusters create demo-cluster --num-nodes=3 --zone=us-central1-a
```

### Deploy a simple testing application

2. Enable the Cloud Build API as it is needed it in a few steps.

``` bash
gcloud services enable cloudbuild.googleapis.com
```

3. Make sure you are in the root of your user folder then clone the `https://github.com/haggman/HelloLoggingNodeJS.git` repo.

``` bash
cd ~/
git clone https://github.com/haggman/HelloLoggingNodeJS.git
```

4. This repository contains a basic Node.js web application that is used for testing. Change into the `HelloLoggingNodeJS` folder and open the **index.js** in the Cloud Shell editor.

``` bash
cd HelloLoggingNodeJS
edit index.js
```

5. Take a few minutes to peruse the code.

6. In the editor, also take a look at the `package.json` file which contains the dependencies, and the `Dockerfile` which plans the Docker container we generate and deploy to GKE.

7. Submit the Dockerfile to Google's Cloud Build to generate a container and store it in your Container Registry. Cloud Build can create new images either simply by using a Dockerfile in the current folder, or by being passed a cloudbuild.yaml of steps. In this example, we will simply use the local Dockerfile.

``` bash
gcloud builds submit --tag gcr.io/$DEVSHELL_PROJECT_ID/hello-logging-js .
```

8. Open the `k8sapp.yaml` file in the Cloud Shell editor and explore the instructions. The first part of the file instructs  Kubernetes to create three hello-logging pods. The second major portion contains a LoadBalancer service which will expose the application to the outside world through a Google Cloud global HTTP load balancer.

9. In the `k8sapp.yaml` file, change the `replicas` to **1** and replace the **$GCLOUD_PROJECT** with your actual project ID. Remember, your project ID is located on the Home page of your Google Cloud Console and in Qwiklabs just below your temporary Google Cloud password.

10. Use the **Navigation menu** to navigate to **Kubernetes Engine**. Click **Connect** next to your cluster, and then copy the command line to configure `kubectl`.

11. Switch back to Cloud Shell and execute the command.

12. Use `kubectl` to apply your k8sapp.yaml.

``` bash
kubectl apply -f k8sapp.yaml
```

13. Get a list of the pods in the default namespace and make sure your hello-logging-js-deployment-*** is running.

``` bash
kubectl get pod
```

14. Get a list of your services. It may take a minute or two for the new `hello-logging-service` to appear, and for it to get an External IP.

```bash
kubectl get services
```

15. Once the service appears with the external IP, copy the external IP value.

16. Open a tab in the browser and paste in the IP. Make sure you see the `Hello World` message.

17. Copy the page URL from the browser and switch back to Cloud Shell. Update the URL environmental variable and start a `while` loop to apply some load on the application. In this case we will generate a request every 1/10th of a second. Make sure you are seeing the `Hello World` responses.

``` bash
URL=url_to_k8s_app
while true; do curl -s $URL -w "\n"; sleep .1s;done
```

18. Navigate to the **Monitoring | Dashboards** and open the **GKE** dashboard.

19. On the `Infrastructure` tab, expand **gke-cluster**. If all of the small charts are reading *No Data,* refresh the page until they start showing readings for CPU and Memory Utilization. You might also want to toggle **Off** to **On** to enable auto-refresh of the data.

20. If you expand and examine the different cluster nodes, you see the various workloads and with a little looking, will find the hello-logging pod.

20. Switch to the **Workloads** tab and drill down. This is focused on the deployed workloads, grouped by namespace.

21. Finally, switch to the **SERVICES** tab and expand **gke-cluster | default | hello-logging-service**. This view is more about how services relate to their pods.

22. In any of the views, if you drill all the way down to one of our hello-logging-js-containers, a right-hand window appears with details. Investigate Incidents, Metrics, and Logs.

### Expand the deployment

23. Swap back to your Cloud Shell terminal window. Use the down arrow next to + to create a new tab/session. From the down menu select your test project, so the context in the new terminal will be set correctly. 

24. Change into the HelloLoggingNodeJS folder and re-open the `k8sapp.yaml` for editing.

``` bash
cd ~/HelloLoggingNodeJS/
edit k8sapp.yaml
```

25. Change the `replicas` count to **3**.

26. Deploy the change.

``` bash
kubectl apply -f k8sapp.yaml
```

27. Check to see if the two new pods are running. Don't move on until they are.

``` bash
kubectl get pod
```

28. In the Google Cloud Console, navigate back to the GKE dashboard's infrastructure tab. Can you locate the two new pods? Did Kubernetes place them on the same node?

# Logging and Monitoring
<!-- ------------------------ -->

## Logging and Monitoring
Duration: 20

### Monitoring

1. Swap to the Cloud Shell tab running the while loop and use **CTRL-C** to break it.

1. In the Google Cloud console, use the **Navigation menu** to navigate to the **Monitoring | Metrics explorer** page.

1. The Metrics explorer allows you to explore any of Google's default metrics, or any metrics which were created using custom code. In the `Build Your Query` interface, set the `Resource type` to **VM Instance**, then select the **CPU utilization** metric.

1. Take a moment an explore the resulting chart. Notice, here we see not only the VMs that comprise our GKE cluster, but also those created in other class exercises. You may see a slight down turn to the chart for the cluster since we disabled the loop applying load, but there wasn't enough load to make much of a difference.

1. If you like, explore some of the other VM metrics.

1. To see the drop in load, one other metric you might want to examine is `Resource type` **Kubernetes Container**, `Metric` **CPU usage time**. It will be even clearer if you apply the filter **pod_name=~hello-.\*** and apply an aggregator function.

### Logging

1. In Cloud Shell, use kubectl to pull a list of services, like you did before, so you can get the external IP of your LoadBalancer service.

``` bash
kubectl get svc
```

1. Visit the external IP in the external IP address in the browser and confirm that you see the "Hello World!" message.

1. Modify the URL by adding **/log** to the end. Refresh the page several times.

1. Modify the URL by removing `/log` and replacing it with **/score**. Again, refresh the page several times.

1. One more time, modify the URL by removing `/score` and replacing it with **/error**. Again, refresh the page several times.

1. In the Google Cloud console, use the **Navigation menu** to navigate to **Logging**. Is it easy to find any of the logs you just generated by simply scrolling through the entries? Sometimes it is, sometimes there is so much logging data being generated it becomes a needle in a haystack problem.

1. In the `Query builder` interface. Enter the query "/score" and then **Run Query**. If you know a distinctive bit of text, though it's slow, using a text query may be helpful.

1. Delete the existing query then from the **Resource** drop menu choose **GKE Cluster Operations > demo-cluster**"** and **Add** it to the query. 

1. From the the **Log name** drop menu from under the `Cloud Audit` section, check **activity** and **Add** it to the query. Expand the entries and see if you can find where your cluster was created at the beginning of this exercise.

1. If you're feeling adventurous, switch back to Cloud Shell, open the **index.js** file for editing, and examine the other routes you executed while interacting with this script. See if you can find the logs for /score, /log, and /error.

