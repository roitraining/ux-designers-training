summary: Use Cloud Storage from a VM
id: use-cloud-storage
categories: Cloud Run for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Use Cloud Storage from a VM
<!-- ------------------------ -->
## Overview
Duration: 1

### What You’ll Learn
- Creating a VM with proper scopes for Cloud Storage
- How to interact with Cloud Storage from a VM


<!-- ------------------------ -->
## Create a VM with Proper Scopes
Duration: 5

### Create a VM Using CLI with the Scopes We Need
1. Log in to your class account and project. Near the upper right corner, click the **Activate Cloud Shell** icon, and run the following command to create a new VM named `storage-example`:

``` bash
gcloud compute instances create storage-example --zone=us-central1-a --scopes=storage-rw --tags=http-server
```

2. To allow access to our server from the web, create a firewall rule to allow incoming http traffic to any machines with the network tag `http-server`. You'll notice that's one of the options we used when creating the VM above.

``` bash
gcloud compute firewall-rules create default-allow-http --direction=INGRESS --priority=1000  --action=ALLOW --rules=tcp:80 --source-ranges=0.0.0.0/0 --target-tags=http-server
```

**Important Note:**<br>
By default, VMs on Compute Engine come with a Default Service Account that has Project Editor access. That is overkill for a typical application, but fortunately, also by default, the VM's ability to act against Google Cloud's APIs is further limited by scopes (this is only true when using the Compute Engine Default Service Account). Those scopes, by default, are set to allow writing to Cloud Operations, reading from Cloud Storage, and not much else. If you examine the above command we executed, you see we've elevated our access to read/write in Cloud Storage. An even better technique would be to create a new service account, custom tailored with the exact types of access we need. 

<!-- ------------------------ -->
## Deploy a Basic Web Application
Duration: 20

Now let's deploy a basic web application to the VM. 

1. Switch to the Google Cloud Console and use the **Navigation menu** (![console_nav_small.png](img/console_nav_small.png)) to navigate to **Compute Engine**. To open an SSH session with your new `storage-example` VM, click **SSH**.

2. If you have Cloud Shell in one tab, and the new SSH session to the VM in another tab, make sure you are in the VM SSH session tab and not in Cloud Shell. 

3. Update all the local package information for apt. Advanced Package Tool (apt) is an installation manager used on several flavors of Linux.

``` bash
sudo apt update
```

4. Next, use apt to install Node.js and npm:

``` bash
sudo apt install nodejs npm
```

5. Verify that Node is installed by checking its version:

``` bash
node -v
```

6. Now let's create a directory to run the new web app from and change into it:

``` bash
mkdir ~/my-app
cd ~/my-app
```

7. Creating a Node.js application usually starts with the creation of `package.json`, a dependency and information file. Do that now by initializing NPM. You can accept all the defaults, though feel free to change the code author:

``` bash
npm init
```

8. Install the lightweight Node.js Express web server and framework. This command adds the dependency to `package.json`, and downloads the dependency, and all its dependencies, into a `node_modules` folder:

``` bash
npm install express --save
```

9. Create a very simple "Hello World" example web app. Start by opening `index.js` in the Nano editor:

``` bash
nano index.js
```

10. Paste in the following JavaScript:

``` javascript
const express = require('express')
const app = express()
const port = 80

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
```

11. Exit Nano by pressing CTRL+X, then Y, and then ENTER to save the modified buffer.

12. Start the application:

``` bash
sudo node index.js
```

13. In the Google Cloud Console, use the **Navigation menu** (![console_nav_small.png](img/console_nav_small.png)) to navigate back to **Compute Engine**. Click your VM's external IP address; it should be linkified.

**Important Note:**<br>
Normally, you would not run Node as root (sudo), we are doing that here to avoid needing to install and configure Apache or Nginx as a reverse proxy.

<!-- ------------------------ -->
## Write to Cloud Storage
Duration: 30

### Create a Cloud Storage Bucket for Your Application

1. In the Google Cloud Console for your project, use the **Navigation menu** (![console_nav_small.png](img/console_nav_small.png)) to navigate to **Storage**. 

2. At the top of the page, click **Create Bucket** to start the creation of a new storage bucket. Storage bucket names need to be globally unique. Enter a name you think might work and click **Continue**. If the bucket name is taken, repeat this process until you find a name that works. 

3. Set the bucket's location type to `Region`, set the bucket's location to `us-central1`, and then click **Continue**. 

4. Leave the storage class as `Standard`, scroll to the bottom of the page, and then click **Create** to create the bucket. 

5. Make sure to record the name of your bucket because you'll need that in a bit. 


### Install the Cloud Storage Client Library for Node.js

1. Switch back to the SSH window for your VM. It should still be running your web application. Press CTRL+C to stop its execution. 

2. You should still be in the root directory of your `my-app` application. Use NPM to install the Node.js client library for Cloud Storage:

```
npm install @google-cloud/storage --save
```

3. Use Nano to edit `index.js` and add the following after the `const port ...` line:

``` javascript
const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket('[BUCKET_NAME]')
```

4. Edit `'[BUCKET_NAME]'` and replace it with your bucket name prefaced by `gs://`, like this: `'gs://your-bucket-name-here'`

5. Save and exit, try running the app again, then exit it. We're just checking to make sure there are no errors. We'll actually use the bucket in the next step. 

``` bash
sudo node index.js
```

6. If you get any errors, fix them. If it starts normally, stop the app again by pressing CTRL+C.

### Set Up a Route to Add a File to Cloud Storage

1. In the SSH window for your VM, open your app in Nano.

2. Create a route and controller method for our application to write the file to Cloud Storage. Add the below JavaScript just after your current route, `app.get('/', ...)`. Once you've made the change, save and exit Nano.

``` javascript
app.get('/add-file', function (req, res) {
    const fileName = req.query.fileName
    const fileContents = req.query.fileContents
    res.send(`File name: ${fileName}, File Contents: ${fileContents}`)
})
```
**Note:**<br>
A "route" in this context is a URL pattern your web application will respond to. So, if someone visits your app's `url/`, they get the Hello World message. With the above new code, if they visit your app's `url/add-file`, they get the ability to upload a file. 

Notice that in the code we are looking for query parameters (key-value pairs that follow a URL after a question mark), then (for now) simply responding with text to show that our route and controller method are functioning in a basic form. 

3. Use node to start your app again.

``` bash
sudo node index.js
```

4. Visit your application again using its external IP. Remember, that IP is easily found on the Compute Engine page. Once you receive the "Hello World!" message, edit the URL by adding `/add-file?fileName=test.txt&fileContents=Hello%20World` to the end. Your result should be a URL something like this: http://[YOUR_VMS_IP]/add-file?fileName=test.txt&fileContents=Hello%20World


5. Verify that you get a return message like this:

```
Filename: test.txt, File Contents: Hello World
```

### Create a File Locally
`fs` is a module built into Node.js that helps when working with the file system. There's no need for you to install it, however, you do need to include it in `index.js`. 

1. In your VM's SSH window, press CTRL+C to stop the running application. Then, open your `index.js` file in Nano. Just below the line where you create `bucket`, insert the following line to load `fs`.

``` javascript
const fs = require('fs')
```

2. Locate your `add-file` controller method, and add the following just above `res.send('Filename...')`:

``` javascript
fs.writeFile(fileName, fileContents, function (err, data) {
  if (err) return console.log(err);
  console.log(`writing file ${fileName}, with contents: ${fileContents}`);
});
```

3. Save the file, use Node to restart the app, and invoke it by re-visiting the `add-file` route in your browser: http://[YOUR_VMS_IP]/add-file?fileName=test.txt&fileContents=Hello%20World

4. Switch back to the SSH window. Stop the application by pressing CTRL+C, and do a directory listing of all your files. 

```
ls
```

5. You should see a new file created named `test.txt` (or whatever you specified in the `fileName` part of the URL). List the file's contents and you should see the value from the `fileContents` query string. 

```
cat test.txt
```

### Add Your File as an Object to Cloud Storage
We have the file stored locally on the web server, now let's copy that file to Cloud Storage. Information on Google's APIs can be found here: https://cloud.google.com/apis/docs/overview. Since we're using Node.js and focusing on uploading to Cloud Storage, a nice example on that can be found here: https://cloud.google.com/storage/docs/uploading-objects#storage-upload-object-nodejs. 

1. Since we've already created a Storage object, and already used it to create a bucket, all we really need to do now is use `bucket` to upload the file. Just below the `console.log...`, upload the file:

``` javascript
//__dirname is the current application folder
bucket.upload(__dirname + "/" + fileName, {});
```

2. Re-execute the web application and visit it in the browser. If all went well, you should then be able to navigate to your bucket in the Console and see your file on Cloud Storage!

<!-- ------------------------ -->
## Read Files from Cloud Storage
Duration: 20

### Prepare
Modify your application to allow the user to dynamically retrieve files from Cloud Storage. 

1. Create another route and controller method, this time retrieving files from your bucket. Just start with a simple temporary route to make sure you have that part set up properly:

``` javascript
app.get('/read-file', function (req, res) {
  const fileName = req.query.fileName
  res.send(`file name: ${fileName}`)
})
```

2. Restart your application and test it out just to make sure you get the response.

### Download File from Cloud Storage
A nice download file example can be found here:
https://cloud.google.com/storage/docs/downloading-objects#storage-download-object-nodejs. 

1. If you have your web application running, press CTRL+X to stop it. Also, verify that your command prompt is currently in the `my-app` folder of your VM SSH window.

2. Create a new folder named `downloads`. When we first pull the file back out of Cloud Storage, we will stage it here. 

```
mkdir downloads
```

3. In the `read-file` controller, just under `const fileName...`, create a variable to hold the full path to the file:

``` javascript
const fullPath = `./downloads/${fileName}`;
```

4. Next, create an options argument and specify the path to where we will write the file in `downloads`. 

``` javascript
const options = {
  // The path to which the file should be downloaded, e.g. "./file.txt"
  destination: fullPath
};
```

5. Then, download the file:

``` javascript
// Downloads the file
bucket.file(fileName).download(options);
```

6. Explore the sample code here to see how to use `fs` to read a file: https://nodejs.dev/reading-files-with-nodejs.

7. Add a block of code to read the downloaded file and return it to the web page. This will take the place of the existing `res.send...` code. 

``` javascript
fs.readFile(fullPath, 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  res.send(data);
})
```
8. Verify that the `/read-file` controller looks something like the following:

``` javascript
app.get('/read-file', function (req, res) {
  const fileName = req.query.fileName;
  const fullPath = `./downloads/${fileName}`;

  const options = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination: fullPath
  };

  // Downloads the file
  bucket.file(fileName).download(options);

 fs.readFile(fullPath, 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  res.send(`data`);
 })

})
```

9. Save your code and re-run the application. Make sure to test it on the file you stored in Cloud Storage in the last section of the exercise. If all went well, you should be able to use your `/read-file` endpoint to get the contents of a file on Cloud Storage.


Great job!
