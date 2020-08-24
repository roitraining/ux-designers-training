summary: Use Cloud Storage and SQL from a VM
id: use-cloud-storage-sql
categories: Cloud Run for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Use Cloud Storage and SQL
<!-- ------------------------ -->
## Overview
Duration: 1

### What You’ll Learn
- Creating a VM with proper scopes for Cloud SQL and Storage
- How to interact with Cloud Storage from a VM
- How to interact with Cloud SQL from a VM

<!-- ------------------------ -->
## Create a VM with Proper Scopes
Duration: 3

### Create a VM by CLI with the Scopes We Need
Open Cloud Shell and run the following command:
``` bash
gcloud compute instances create storage-sql-example --zone=us-central1-a --scopes=sql-admin,storage-rw
```

**Important Note:**
By default, VMs on Compute Engine come with a Default Service Account that has Project Editor access. That is way overkill for a typical application, but fortunately also by default, the VM's ability to act against Google Cloud's APIs is further limited by scopes (this is only true when using the Compute Engine Default Service Account). Those scopes, by default, are set to allow writing to Cloud Operations, reading from Cloud Storage, and not much else. Here, we are specifying read/write access to Cloud Storage and access to Cloud SQL. 

It would be possible to connect to Cloud SQL without this scope, since you can whitelist your VMs IP address and then connect by normal SQL mechanisms. However, here we are going to use the Cloud SQL Proxy and authenticate through Google. You can read more about [permissions and the SQL Proxy](https://cloud.google.com/sql/docs/postgres/connect-compute-engine#gce-connect-proxy) in the documentation. 

<!-- ------------------------ -->
## Deploy a Basic Web Application
Duration: 20

Just like we did in the first lab, deploy a simple web application.

While in the SSH window for your VM, run the following commands to install Nodejs:
``` bash
sudo apt update
sudo apt install nodejs npm
node -v
```

Create a directory to run the app from and move into it:
``` bash
mkdir ~/my-app
cd ~/my-app
```

Initialize NPM (Node Package Manager):
``` bash
npm init
```

Take the default option for index.js by simply pressing ENTER.

Install Express (an MVC framework and webserver):
``` bash
npm install express --save
```

Create a very simple hello world example app:
``` bash
nano index.js
```

Paste in the following JavaScript:
``` javascript
const express = require('express')
const app = express()
const port = 80

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
```

Type CTRL-O, press ENTER to save, and then type CTRL-X to exit the Nano text editor.

Run the application:
``` bash
sudo node index
```

Go back to the Computer Engine GUI and click the VM's external IP address; it should be linkified if you checked the box for 'Allow HTTP Access.'

**Important Note:** Normally, you would not run Node as root (sudo), we are doing that here to avoid needing to install and configure Apache or Nginx as a reverse proxy.

<!-- ------------------------ -->
## Write to Cloud Storage
Duration: 30

### Create a Cloud Storage Bucket for Your Application
Choose a bucket name; it has to be globally unique in all of Cloud Storage.

Substitue in that name in the following command to create your bucket:
``` bash
gsutil mb gs://[BUCKET_NAME]/
```

### Install the Cloud Storage Client Library for Node.js
Go back to your SSH window and exit the app with CTRL-C.

While still in the root directory of your application, install the Node.js client library for Cloud Storage:
```
npm install @google-cloud/storage --save
```

Exit index.js with Nano and put the following after the port line:
```
const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket('[BUCKET_NAME]')
```

Save and exit, try running the app again, then exit it. We're just checking to make sure there are no errors. We'll actually use the bucket in the next step. 

### Set Up a Route to Add a File to Cloud Storage

Create a route and controller method for our application to write the file to Cloud Storage. Add this JavaScript below your current route, app.get('/', ...):
``` javascript
app.get('/add-file', function (req, res) {
    const fileName = req.query.fileName
    const fileContents = req.query.fileContents
    res.send(`Filename: ${fileName}, File Contents: ${fileContents}`)
})
```

We are looking for query paramters (key-value pairs that follow a URL after a question mark), then simply responding with text to show that our route and controller method are functioning in a basic form. 

Run your app again, and test out your new endpoint by visiting it in a browser like this:
```
http://[MY_VMS_IP]/add-file?fileName=hello&fileContents=world
```

You should see a response like this:
```
Filename: hello.txt, File Contents: world
```

### Create a File Locally
fs is a module built into Node.js so there's no need for you to install it, however, you do need to include it in index.js. Along with your other includes at the top, put this line:
``` javascript
const fs = require('fs')
```

Now down in your 'add-file' controller method, add the following:
``` javascript
fs.writeFile(fileName, fileContents, function (err, data) {
  if (err) return console.log(err);
  console.log(data);
})
```

Run your app, try the endpoint, then exit the app and see if your file is there locally. After confirming it is, delete it. 

### Add Your File as an Object to Cloud Storage
Use the documentation to modify your controller method so that after it creates the file, it uploads it to Cloud Storage:
[https://cloud.google.com/storage/docs/uploading-objects#storage-upload-object-nodejs](https://cloud.google.com/storage/docs/uploading-objects#storage-upload-object-nodejs).

**Tips**<br>
1. It's easier to edit the code if you use cat index.js to view the contents, copy and paste them into a text editor like Atom or VS Code. When you are done, you can copy the contents, delete index.js, and recreate it with your new contents.
2. To make sure you are uploading the file after it has been written to local disk, be sure to do the upload inside the callback of fs.writeFile.
3. Pay attention to the fact that we have already defined a bucket with a bucket name up in our configuration. So instead of storage.bucket(bucketName), we can just use bucket. Be sure to remove any reference to bucketName as we won't have that defined. 
4. Make sure to remove any unused files locally when you are done. 

If all went well, you should be able to navigate to your bucket in the Console and see your file on Cloud Storage!

<!-- ------------------------ -->
## Read Files from Cloud Storage
Duration: 20

### Prepare
Use your endpoint to create a few files. 

Create another route and controller method, this time for reading the files from your bucket. Just start with a simple temporary route to make sure you have that part set up properly:
``` javascript
app.get('/read-file', function (req, res) {
  const filename = req.query.filename
  res.send(`filename: ${filename}`)
})
```

Test it out just to make sure you get the response.

### Download File from Cloud Storage
Follow the example for downloading files from Cloud Storage:
[https://cloud.google.com/storage/docs/downloading-objects#storage-download-object-nodejs](https://cloud.google.com/storage/docs/downloading-objects#storage-download-object-nodejs).

Integrate this with your new controller method. 

**Tips**<br>
1. Create a downloads folder inside your my-app folder and prepend that to your destFilename ('./downloads/[FILENAME]').
2. Like last time, we can just use bucket.upload since we've defined bucket in the config.

### Read the Downloaded File and Respond with Its Content
Follow the example from Node.js:
[https://nodejs.dev/reading-files-with-nodejs](https://nodejs.dev/reading-files-with-nodejs).

Integrate this with your new controller method.

**Tips**<br>
1. You can use a relative filepath: ./downloads/[FILENAME], and you probably already have this available as destFilename.
2. Do this after the await line, since that will fire only after the file has been downloaded. 
3. Move your res.send to after the file has been read, and respond with the file contents (called data in the example code) instead of the filename.

If all went well, you should be able to start the app back up and use your /read-file endpoint to get the contents of a file on Cloud Storage.

<!-- ------------------------ -->
## Writing to Cloud SQL
Duration: 30

### Create a Cloud SQL Instance
Use the gcloud CLI from Cloud Shell to create a Postgres Cloud SQL instance:
``` bash
 gcloud sql instances create lab-example --database-version=POSTGRES_11 --cpu=1 --memory=3840MiB --region="us-central"
```

Use the console to create a user for yourself. Navigate to the **Users** page and create a user. 

### Install, Configure, and Execute the Cloud SQL Proxy for Linux 64-bit
Go back to your SSH session, and if you haven't already, stop the app from running.

Move back to your home folder and install wget so you can download files easily:
``` bash
sudo apt update
sudo apt install wget
```

Follow the official how-to guide:
[https://cloud.google.com/sql/docs/postgres/authorize-proxy](https://cloud.google.com/sql/docs/postgres/authorize-proxy).

**Tips**<br>
1. Your VM already has a Service Account with the Project Editor role, and when you created it you added a scope to allow Cloud SQL access, so you don't have to worry about the IAM portion. So after the installation section, you can move down the execution section.
2. When you start (execute) the proxy, use TCP and the port 5432 (standard for Postgres, though not required).
3. You can find the INSTANCE_CONNECTION_NAME in the overview of the instance in the Google Cloud Console under **Connect to this instance**.

Once you have it running, leave it running in that SSH window and open up a new one to continue working in. 

### Set Up a Database and Table
Visit your instance in the Google Cloud Console and click **Databases**, then create a database called 'communication.' 

Next go back to your new SSH session and install a Postgres client for Debian:
``` bash
sudo apt update
sudo apt install postgresql postgresql-client
psql --version
```

Connect to your Cloud SQL instance using the psql client (be sure to use the username you created earlier):
``` bash
psql "host=127.0.0.1 port=5432 sslmode=disable dbname=postgres user=[YOUR_USER_NAME]"
```

Use the following SQL query to create a table called 'messages':
``` sql
CREATE TABLE messages(
	message_id serial PRIMARY KEY,
	message_text VARCHAR (255) NOT NULL
);
```

To confirm that the table exists, you can run:
```
\dt
```

Leave that window open, and open yet another SSH window to edit your application.

### Writing to Cloud SQL from Our Application
The beauty of Cloud SQL, aside from being an easy to use managed service, is that it runs standard versions of SQL (Postgres, MySQL, and SQL Server) and offers the SQL Proxy for easy connection. That means that all we have to do now is install a standard Postgres client library and connect on localhost (127.0.0.1)! This name and IP are both ways for a computer to simply refer to itself in networking. The Cloud SQL Proxy pretends that it is a local database, but instead proxies the connections over to the remote instance. 

First, let's set up another route and controller method to test writing to Cloud SQL. Call this route '/write-sql' and have it expect a query parameter called message:
``` javascript
app.get('/add-message', function (req, res) {
  const message = req.query.message
  res.send(message)
})
```

Let's start by installing a Postgres client for Node.js. In your new SSH window, navigate back to your my-app folder then install the [client](https://www.npmjs.com/package/pg):
``` bash
npm install pg --save
```

Next, follow the [documentation](https://node-postgres.com/) to get it set up in index.js. Unless you are comfortable with async and await, I recommend you use the callback version. We'll replace the specific query in a moment. 

**Important Note:**
You are about to be instructed to put a password into application code in plain text. In the real world, you should never do that, and especially never checkin such code to Git. Also, be sure not to use any real passwords here, simple passwords like 'test' are fine for this lab. Go back to the console and change the password for your user if necessary.

Be sure to pass a configuration object when creating the client like this:
``` javascript
const client = new Client({
  host: 'localhost',
  database: 'postgres',
  port: 5432,
  user: '[MY_USERNAME]',
  password: '[MY_PASSWORD]',
})
```

Back down in the controller method, you should end up with something like this:
``` javascript
client.query(queryString, (err, res) => {
  client.end()
})
```

I defined the variable queryString up above, that's where you'll want to put your SQL query to insert this message as message_text into the messages table. If you need some help forming that query, check out a [simple tutorial](https://www.postgresqltutorial.com/postgresql-insert/).

Remember to use the message you get from the query parameter.

<!-- ------------------------ -->
## Reading from Cloud SQL
Duration: 10

At this point, you should have a sense of how to work through this process. Try going through the steps on your own:
1. Create a placeholder route and controller method for '/read-messages'.
2. Use the same SQL client to query the DB for all messages.
3. Use the res object to respond with a string that contains all messages.

If you need help forming the query, [here is another tutorial](https://www.postgresqltutorial.com/postgresql-select/). 

And of course, if you need further help, just ask your instructor. 

If you got it all working, congratulations! You can now read and write to both Cloud Storage and Cloud SQL from application code. 

If you have extra time, feel free to try out more complex queries!

<!-- ------------------------ -->
## Bonus Tasks
Duration: 20

### Move Static Assests to Cloud Storage
Create a simple logo and move that and any CSS files you have to a Cloud Storage Bucket. For this task, you do not actually need to integrate Cloud Storage and Cloud Run per se, rather in your HTML you simply link to the files on the Cloud Storage Bucket. This does make deployment more complex, as you have to make sure that updated static assets make it to the Cloud Storage Bucket. Make sure sure that the bucket has read access for all (public bucket) and never put anything that shouldn't be public on that bucket. 

### Integrate Cloud Storage with Cloud Run
A more complex task would be to actually put dyanmically generated files onto the Cloud Storage Bucket. For example, if you actually create a ticket PDF on the server, you could then store it in a private Cloud Storage Bucket using the client libraries as you did earlier in this exercise. If you don't have time to get to this now, it could be a good task to work on in the final lab where you'll have freedom to work on any feature you want. 

### Migrate from Firestore to Cloud SQL
This is a major undertaking, and would represent somewhat going backward from a serverless product (Firestore) to a less managed service (Cloud SQL), but would definitely be an interesting exercise. You would have to migrate the data model to SQL relational tables, and completely change how data is accessed. Instead of using Google's client libraries for Firestore, you'd be using standard Postgres, MySQL, or SQL Server client libraries. 

<!-- ------------------------ -->
## Cleanup
Duration: 1

Don't forget to delete your VM, Cloud SQL Instance, and Cloud Storage Bucket when you are done with the lab. If you want to be able to reference it later, you can stop the VM and Cloud SQL Instance instead of deleting them, and you can leave the Cloud Storage Bucket which will have a very minimal charge as long as you didn't put much on it.
