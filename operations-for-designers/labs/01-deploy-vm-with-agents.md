summary: Deploy a VM on GCE and install the Google Cloud Logging and Monitoring agents
id: deploy-vm-with-agents
categories: Operations for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Deploy a VM with Agents
<!-- ------------------------ -->
## Overview
Duration: 1

### What You’ll Learn
- How to create a Google Compute Engine virtual machine using the GUI
- How to install the Logging and Monitoring agents
- How to deploy a basic web application
- How to view logs and metrics

<!-- ------------------------ -->
## Create a VM
Duration: 3

Choose a Google Cloud Project to work in.
Navigate to Compute Engine Instances.
Click **Create** or **CREATE INSTANCE** (the former is if you have no VMs currently).
Name the VM 'agents-sample'.
Near the bottom of the form, check the box to **Allow HTTP traffic**.
Click **Create**.

<!-- ------------------------ -->
## Deploy a Basic Web Application
Duration: 20

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

Take the default option for index.js by simply hitting Return.

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

Type Ctrl-O and return to save and then Ctrl-X to exit the Nano text editor.

Run the application:
``` bash
sudo node index
```

Go back to the GCE GUI and click the VM's external IP address; it should be linkified if you checked the box for 'Allow HTTP Access.'

**Important Note:** Normally you would not run Node as root (sudo), we are doing that here to avoid needing to install and configure Apache or Nginx as a reverse proxy.

<!-- ------------------------ -->
## Monitoring and Logging
Duration: 10

### Monitoring
Go to **Monitoring** in the GUI.
Select **Metrics Explorer**.
Search for 'compute cpu' and try both the version from the agent and from compute. Since you have not installed the agent, you won't get any data from it.

<!-- ------------------------ -->
## Install the Monitoring Agent
Duration: 10

SSH into your VM.
Follow the [official documentation] (https://cloud.google.com/monitoring/agent/install-agent#agent-install-debian-ubuntu) for Debian (the default flavor of Linux on GCE). The notes below will help you navigate the process.
**Notes:**
* If you created the VM, you should have sudo access, which is root (admin) privilege
* To start in your home directory as recommended, type:
``` bash
cd ~
```
* On step 4, run the commands one by one.
* Review the instructions on pinning a major version for production environments, but for our purposes the final command for installing the latest version will suffice (sudo apt-get install stackdriver-agent)
* You do not need to move on to optional tasks

Wait a minute and then go to Monitoring and see if you are getting CPU utilization from the agent now.

### Logging
Go to **Logging** in the GUI.
Select your project, **'GCE Project, XXXXX'**.
You might expect a log entry for 'Example app listening at...' but you won't see it. Installing the Logging Agent would give you more system logs, but you still wouldn't see console.log from Node.js. While this would work in managed services, for GCE you would need to use an explicit logging client library. Generally you would use both the Logging agent and a logging library.

Install the Logging agent by following [the official guide](https://cloud.google.com/logging/docs/agent/installation#agent-install-debian-ubuntu) for Debian. The steps are very similar to the steps to install the Monitoring agent. However there is an extra configuration step, while either option will work choose structured logging for better organization.

Next install a logging library and connect it to Cloud Logging follow the [official guide](https://cloud.google.com/logging/docs/setup/nodejs) for Node.js. After you have the NPM package installed and you have put the configuration code near the top of index.js, you can change your app.listen callback to use the new logger:
``` javascript
app.listen(port, () => logger.info(`Example app listening at http://localhost:${port}`))
```

After making the change and starting the app, go back to Cloud Logging and you should see your log line appear. Using Node's built in console.log will only display locally for developers, but logger.info will go to the logging tool.

<!-- ------------------------ -->
## Cleanup
Duration: 1

Don't forget to delete your VM when you are done with the lab. If you want to be able to reference it later, you can stop it instead of deleting it. You will still be charged for storing the disk, but it is a minimal charge compared to leaving a VM running.
