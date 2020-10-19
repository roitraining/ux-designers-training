summary: Use Cloud Storage and SQL from a VM
id: use-cloud-storage-sql
categories: Operations for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Use Cloud Storage and SQL
<!-- ------------------------ -->
## Overview
Duration: 1

### What you’ll learn

- Creating a VM with proper scopes for Cloud SQL and Storage
- How to interact with Cloud Storage from a VM
- How to interact with Cloud SQL from a VM

<!-- ------------------------ -->
## Creating a VM with proper scopes
Duration: 3

### Creating a VM using the CLI, and with the scopes we need

1. Open Cloud Shell, if needed, and run the following command to create a new VM.

``` bash
gcloud compute instances create storage-sql-example --tags=http-server --zone=us-central1-a --scopes=sql-admin,storage-rw
```

**Important Note:**
By default VMs on GCE come with a Default Service Account that has Project Editor access. Normally, that would be way overkill for a typical application, but fortunately also by default the VM's ability to act against Google Cloud's APIs is further limited by scopes (this is only true when using the Compute Engine Default Service Account). Those scopes, by default, are set to allow writing to Cloud Operations, reading from Cloud Storage, and not much else. Here we are specifying read/write access to Cloud Storage and access to Cloud SQL.

It would be possible to connect to Cloud SQL without this scope, since you can whitelist your VMs IP address and then connect by normal SQL mechanisms. However, here we are going to use the Cloud SQL Proxy and authenticate through Google. You can read more about [permissions and the SQL Proxy](https://cloud.google.com/sql/docs/postgres/connect-compute-engine#gce-connect-proxy) in the documentation.

<!-- ------------------------ -->
## Deploying a basic web application
Duration: 20

Just like we did in the first lab, deploy a simple web application.

1. In the Google Cloud console, use the **Navigation menu** (![Navigation menu](https://storage.googleapis.com/cloud-training/images/menu.png "Navigation menu")) to navigate to **Compute Engine** and click **SSH** next to your `storage-sql-example` machine.

2. In the `storage-sql-example` SSH session, install Node.js.

``` bash
sudo apt update
sudo apt -y install nodejs npm
node -v
```

3. Create a directory for the new app and move into it:

``` bash
mkdir ~/my-app
cd ~/my-app
```

4. Initialize NPM like we've done before. Use the defaults.

``` bash
npm init
```

5. Install Express server (an MVC framework and webserver) as a dependency of your application, and load all the dependencies.

``` bash
npm i express
```

6. Create a new **index.js** script file and open it for editing. The Cloud Shell editor won't work for this one so use Nano or vi.

``` bash
nano index.js
```

7. Paste in the following JavaScript into your new script file.

``` javascript
const express = require('express');
const app = express();
const port = 80;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
```

8. Exit your editor, saving your changes. In Nano you can **CTRL-X** to exit, **Y** to save the modified buffer, and **RETURN** to overwrite the original file.

9. Test execute the application.

``` bash
sudo node index
```

10. In the Google Cloud console, use the **Navigation menu** (![Navigation menu](https://storage.googleapis.com/cloud-training/images/menu.png "Navigation menu")) to navigate to **Compute Engine**. Click the `storage-sql-example` VM's external IP address; it should be linkified because we created it with the `http-server` network tag, thus making it accessible through the firewall. Make sure you see the "Hello World!" message.

**Important Note:** 
Normally you would not run Node as root (sudo), we are doing that here to avoid needing to install and configure Apache or Nginx as a reverse proxy.

<!-- ------------------------ -->
## Writing to Cloud Storage
Duration: 30

### Installing the Cloud Storage client library for Node.js

1. Go back to the SSH window for your VM and exit the running app with **Ctrl-C**.

2. Add Google's Cloud Storage library as an application dependency.

``` bash
npm i @google-cloud/storage
```

3. Edit index.js with Nano or vi. 

``` bash
nano index.js
```

4. Add the following after the `const port = 80;` line.

``` javascript
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('BUCKET_NAME');
```

5. Change `BUCKET_NAME` to the name of the bucket you created in an earlier exercise.

6. Save the file and exit the editor.

7. Run app, then exit it. We're just checking to make sure there are no errors. We'll actually use the bucket in the next step.

``` bash
sudo node index
```

### Seting up a route to add a file to Cloud Storage

1. Reopen your script file in your editor.

2. Create a `/add-file` route  to the application. We will eventually use it to create a new file in Cloud Storage, but for now let's just get the structure. The file name and contents will be passed into the method using query string parameters. Add the below JavaScript to the script file just after the app.get('/', ...) line.

``` javascript
app.get('/add-file', function (req, res) {
    const fileName = req.query.fileName;
    const fileContents = req.query.fileContents;
    res.send(`Filename: ${fileName}, File Contents: ${fileContents}`);
});
```

3. Save the file and run the app again.

``` bash
sudo node index.js
```

4. Test out the new endpoint by visiting it in a browser like this:

``` text
http://[MY_VMS_IP]/add-file?fileName=hello.txt&fileContents=Cool!
```

You should see a response like this:

``` text
Filename: hello.txt, File Contents: Cool!
```

### Seting up a route to add a file to Cloud Storage

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
A "route" in this context is a URL pattern your web application will respond to. So, if someone visits your app's `url/`, they get the "Hello World" message. With the above new code, if they visit your app's `url/add-file`, they get the ability to upload a file. 

Notice that in the code we are looking for query parameters (key-value pairs that follow a URL after a question mark), then (for now) simply responding with text to show that our route and controller method are functioning in a basic form. 

3. Use node to start your app again.

``` bash
sudo node index.js
```

4. Visit your application again using its external IP. Remember, that IP is easily found on the Compute Engine page. Once you receive the "Hello World" message, edit the URL by adding `/add-file?fileName=test.txt&fileContents=Hello%20World` to the end. Your result should be a URL something like this: http://[YOUR_VMS_IP]/add-file?fileName=test.txt&fileContents=Hello%20World

5. Verify that you get a return message like this:

```
Filename: test.txt, File Contents: Hello World
```

### Creating a file locally
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

### Adding your file as an object to Cloud Storage
We have the file stored locally on the web server, now let's copy that file to Cloud Storage. Information on Google's APIs can be found here: https://cloud.google.com/apis/docs/overview. Since we're using Node.js and focusing on uploading to Cloud Storage, a nice example on that can be found here: https://cloud.google.com/storage/docs/uploading-objects#storage-upload-object-nodejs. 

1. Since we've already created a Storage object, and already used it to create a bucket, all we really need to do now is use `bucket` to upload the file. Just below the `console.log...`, upload the file:

``` javascript
//__dirname is the current application folder
bucket.upload(__dirname + "/" + fileName, {});
```

2. Re-execute the web application and visit it in the browser. If all went well, you should then be able to navigate to your bucket in the Console and see your file on Cloud Storage!

<!-- ------------------------ -->
## Reading files from Cloud Storage
Duration: 20

### Preparing
Modify your application to allow the user to dynamically retrieve files from Cloud Storage. 

1. Create another route and controller method, this time retrieving files from your bucket. Just start with a simple temporary route to make sure you have that part set up properly:

``` javascript
app.get('/read-file', function (req, res) {
  const fileName = req.query.fileName
  res.send(`file name: ${fileName}`)
})
```

2. Restart your application and test it out just to make sure you get the response.

### Downloading file from Cloud Storage
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
  // The path to which the file should be downloaded, e.g., "./file.txt"
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
    // The path to which the file should be downloaded, e.g., "./file.txt"
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

<!-- ------------------------ -->
## Writing to Cloud SQL
Duration: 30

### Creating a Cloud SQL instance

1. Use the gcloud CLI from Cloud Shell to create a PostgreSQL Cloud SQL instance. Don't bother waiting for the creation to complete. 

``` bash
 gcloud sql instances create lab-example --database-version=POSTGRES_11 --cpu=1 --memory=3840MiB --region="us-central"
```

### Installing, configuring, and executing the Cloud SQL proxy for Linux 64-bit

1. Go back to your VM SSH session, and if you haven't already, stop the app from running.

2. Change into your VM user root folder and install `wget`.

``` bash
cd ~/
sudo apt update
sudo apt -y install wget
```

For reference, the official guide on installing the Cloud SQL proxy can be found here:
[https://cloud.google.com/sql/docs/postgres/authorize-proxy](https://cloud.google.com/sql/docs/postgres/authorize-proxy).

3. Download the proxy and make it executable.

``` bash
wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy
chmod +x cloud_sql_proxy
```

4. In the Google Cloud console, use the **Navigation menu** (![Navigation menu](https://storage.googleapis.com/cloud-training/images/menu.png "Navigation menu")) to navigate to **SQL**, then click your **lab-example** instance.

5. From the `Connect to this instance` section, copy the `Connection name`.

6. Switch back to your VM SSH session and create an environmental variable containing your instance name.

``` bash
I_NAME=connection_name_you_copied
echo $I_NAME
```

7. Execute the Cloud SQL Proxy.

``` bash
./cloud_sql_proxy -instances=$I_NAME=tcp:5432
```

### Setting up a database and table

1. Use the **Navigation menu** to navigate to **SQL** and click on your database, then click **Databases**. Create a database called **communication**.

2. Click on **Users** and **Add User Account**. Select **PostgreSQL** for the type, **test** for the `User name`, and enter a password of your choice. **Add** the user.

3. The Cloud SQL Proxy is now running in your original VM SSH window, so we will need a new one to modify and run our application. Open a new SSH window for the `storage-sql-example` VM.

4. Install a PostgreSQL client for Debian.

``` bash
sudo apt update
sudo apt -y install postgresql postgresql-client
psql --version
```

5. Connect to your Cloud SQL instance using the psql client. You will need the password you assigned your `test` user account. 

``` bash
psql "host=127.0.0.1 port=5432 sslmode=disable dbname=communication user=test"
```

6. Use the following SQL query to create a table called 'messages'.

``` sql
CREATE TABLE messages(
	message_id serial PRIMARY KEY,
	message_text VARCHAR (255) NOT NULL
);
```

1. To confirm that the table exists, you can run:

``` sql
\dt
```

7. Leave that window open, and open yet another SSH window to edit your application VM.

### Writing to Cloud SQL from our application

The beauty of Cloud SQL, aside from being an easy to use managed service, is that it runs standard versions of SQL (PostgreSQL, MySQL, and SQL Server) and offers the SQL Proxy for easy connection. That means that all we have to do now is install a standard PostgreSQL client library as a dependency for our code to use, and connect on localhost (127.0.0.1)! This name and IP are both ways for a computer to simply refer to itself in networking. The Cloud SQL Proxy pretends that it is a local database, but instead proxies the connections over to the remote instance.

1. In the new VM SSH window (not the one hosting the proxy, or the one that's waiting for the next `communication=>` command), change into the **my-app** folder.

``` bash
cd ~/my-app
```

2. Add a Postgres client for Node.js to the list of dependencies.

``` bash
npm i pg
```

3. Open the application for editing.

``` bash
nano index.js
```

4. Add another route named `/write-sql` to the code and have it expect a query parameter called `message`. We'll use this route to add a message to Cloud SQL. Once again, add this just above the `app.listen(....)` line.

``` javascript
app.get('/add-message', function (req, res) {
  const message = req.query.message;
  res.send(message);
});
```

Note, you can find a nice example for what we are about to do [here](https://node-postgres.com/).

5. Near the top of your code, after the line connecting to the bucket, import the `pg` client class.

``` javascript
const { Client } = require('pg');
```

6. Just below the line requiring the client, use it to create a new client object. 

``` javascript
const client = new Client({
  host: 'localhost',
  database: 'communication',
  port: 5432,
  user: 'test',
  password: 'your test user pass here',
});
```

**Important Note:**
You were just instructed to put a password into application code in plain text. In the real world, you should never do that, and especially never check in such code to some Git repo. Also, be sure not to use any real passwords here, simple passwords like 'test' are fine for this lab. Go back to the console and change the password for your user if necessary.

7. Move down the `/add-message` route and update it to look like the following.

``` javascript
app.get('/add-message', function (req, res) {
  const message = req.query.message;

  client.connect();

  client.query('INSERT INTO messages (message_text) VALUES ($1)', [message], (err, res) => {
    console.log(err ? err.stack : `Inserted the message ${message}`);
    client.end();
  });

  res.send(message);
});
```

8. Save the file, close the editor, and re run your application.

9. Test by visiting the new `add-message` route. Use a URL similar to:

``` text
http://[YOUR_VMS_IP]/add-message?message=Cool!
```

10. Check the window running the application, does it show a successful insert? If not, see if there's an error in the code. 

11. Switch to the window where you are connected to your database. At the `communication=>` prompt, run the following query and verify that your "Cool!" message was inserted. 

``` sql
select * from messages;
```

<!-- ------------------------ -->
## Bonus:Reading from Cloud SQL
Duration: 10

At this point you should have a sense of how to work through this process. If you're feeling brave, and if you have the time, try and create a new route in the application to read back the messages and display them to the page. An outline of the steps might look like:

1. Create a placeholder route and controller method for '/read-messages'.

2. Use the same SQL client to query the DB for all messages.

3. Use the res object to respond with a string that contains all messages.

If you need help forming the query, [here is another tutorial](https://www.postgresqltutorial.com/postgresql-select/). 

And of course, if you need further help, just ask your instructor. 

If you have extra time, feel free to try out more complex queries!
