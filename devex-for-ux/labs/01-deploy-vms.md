summary: Deploy VMs on GCE with the GUI, CLI and API then install the Google Cloud Logging and Monitoring agents
id: deploy-vms
categories: DevEx for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Deploy VMs
<!-- ------------------------ -->
## Overview
Duration: 1

### What You’ll Learn
- How to create a Google Compute Engine virtual machine using the GUI, CLI, and API
- How to install the Logging and Monitoring agents
- How to deploy a basic web application
- How to view logs and metrics

<!-- ------------------------ -->
## Create a VM with the GUI
Duration: 3

Choose a Google Cloud Project to work in.
Navigate to Compute Engine Instances.
Click **Create** or **CREATE INSTANCE** (the former is if you have no VMs currently).
Name the VM 'gui-example'.
Near the bottom of the form, check the box to **Allow HTTP traffic**.
Click **Create**.

## Create and List VMs with the CLI
Duration: 5

### List VMs by CLI
After a minute or two, you should see your VM when listing VMs with the following command:
``` bash
gcloud compute instances list
```

### Create a VM by CLI
Open Cloud Shell and run the following command:
``` bash
gcloud compute instances create cli-example --zone=us-central1-a
```

### List VMs by CLI
After a minute or two, you should see your VM when listing VMs with the following command:
``` bash
gcloud compute instances list
```

### Documentation
gcloud Documentation:
[https://cloud.google.com/sdk/gcloud/reference/compute/instances/create](https://cloud.google.com/sdk/gcloud/reference/compute/instances/create)

Compute Engine Documentation:
[https://cloud.google.com/compute/docs/instances/create-start-instance#startinstancegcloud](https://cloud.google.com/compute/docs/instances/create-start-instance#startinstancegcloud)

<!-- ------------------------ -->
## Configure NPM
Duration: 5

### Set Up Your Working Directory
Open Cloud Shell, create a working directory, and move into it:
``` bash
mkdir infra-scripts
cd infra-scripts
```

**Tip:** When referencing an existing file or folder in bash, you can "tab-complete" to avoid typing the entire thing. Type enough characters to be unique, then press the Tab key. If there are multiple items that start with those characters, the options will be printed on the screen for you so you can complete enough characters and then hit Tab again.

### What's NPM?
NPM is the primary tool used with Node.js to install packages, run scripts, and more. It used to mean Node Package Manager, but like the artist formerly known as Prince, the NPM team didn't feel that adequately expressed their true nature. It no longer stands for anything in particular.

Since Cloud Shell comes with gcloud installed and configured, and Node.js and NPM installed, we can jump right to using NPM.

### Init NPM and Install Client Libraries
To get started with NPM, init your current directory as an NPM project:
``` bash
npm init
```

Press ENTER through all of the prompts accepting the defaults. In a real project, you would fill out at least some of the fields and probably be inside of a folder managed by Git.

Next, use NPM to install the Google Cloud client libraries for Node:
``` bash
npm install --save @google-cloud/compute
npm install --save googleapis
```

<!-- ------------------------ -->
## List VMs with the API
Duration: 20

### Create a List VMs Script
Next, create a JavaScript file to use for our list VMs script:
``` bash
touch list-vms.js
```

Then use Nano to edit it:
``` bash
nano list-vms.js
```

While leaving that open and ready to paste into, in a different browser tab, review this page:
[https://cloud.google.com/compute/docs/tutorials/nodejs-guide](https://cloud.google.com/compute/docs/tutorials/nodejs-guide).

Read as much of it as you want, then copy the contents of "[t]he complete example" at the bottom.

Paste that into Cloud Shell where you still have Nano open and are editing list-vms.js.

Use CTRL-O to save (write out), and press ENTER when the existing filename is shown to you. Next use CTRL-X to exit Nano.

### Try Running Your Script
Finally, run your script with Node.js using the following bash command:
``` bash
node list-vms.js
```

You would expect to see a list of VMs, but you won't. This example script defines a function but it is never actually run.

### Troubleshoot and Improve Your Script
To make it run, you have to edit list-vms.js with Nano, and add this line to the bottom:
``` javascript
listVMs()
```

After saving (CTRL-O, then ENTER) and exiting Nano (CTRL-X), use the previous bash command to again run the script with Node.js. This time, you should see an output, but it is not super helpful because the real information is hidden deep within objects and arrays whose contents are not even shown.

To make it more useful, edit the script again. This time change the console log near the bottom of the script; currently it says:
``` javascript
  console.log('VMs:', vms);
```

Replace that line with this version that is more useful:
``` javascript
console.log('us-central1-a VMs:', vms.items['zones/us-central1-a'].instances);
```

**Note:** If you chose to change the zone you were using earlier in this lab, then you'll have to change the zone here also.

Save it and run it again; this time you should see a list of your VMs. It may still be difficult to read, but if you look carefully, you should see your VMs there with their names and other information.

### Pain Point!
Especially when getting started, documentation fails to produce the desired results. It can be extremely frustrating, especially in a proof of concept where devs, devops, and ops are all evaluating a platform to see if they can trust it.

Remember that to many modern IT folks, the real "GUI" is actually this documentation and these tutorials. This is the literal visual interface they use when trying to use the platform via API or CLI. If they were using an orchestration tool like Terraform, then they would use this documentation:
https://www.terraform.io/docs/providers/google/index.html.

<!-- ------------------------ -->
## Create a VM with the API
Duration: 10

### Write and Run a Script that Creates a VM
Create a new JavaScript file and edit it with Nano:
``` bash
touch create-vm.js
nano create-vm.js
```

Paste in the following JavaScript:
``` javascript
const Compute = require('@google-cloud/compute');
const compute = new Compute();
const zone = compute.zone('us-central1-a');

//-
// Create a new instance using the latest Debian version as the source image
// for a new boot disk.
//-
const config = {
  os: 'debian',
  http: true,
  tags: ['debian-server']
};

//-
// If the callback is omitted, we'll return a Promise.
//-
zone.createVM('api-example', config).then(function(data) {
  const vm = data[0];
  const operation = data[1];
  const apiResponse = data[2];
});
```

Save and exit Nano (CTRL-O, ENTER, CTRL-X), then run your new script:
``` bash
node create-vm.js
```

Give it a minute or two, then run your list script to see the new VM:
``` bash
node list-vms.js
```

List them with the CLI as well:
``` bash
gcloud compute instances list
```

Note that our simple scripts to create and list VMs are not really more useful than the built-in gcloud CLI commands. They are just simple examples. In the real world, you'd likely use the CLI for simple commands like this, and the API for complex custom interactions. Or even more likely than both, all major infrastructure would be managed with an orchestration tool like Terraform or Deployment Manager.

### Pain Point!
I could not reasonably have you use [the documentation](https://googleapis.dev/nodejs/compute/latest/VM.html#create-examples) because the sample script there required too much modification. The createVM [example](https://googleapis.dev/nodejs/compute/latest/Zone.html#createVM-examples) under Zone was closer to being directly usable, but still required some strange modification.

Most developers would be able to quickly parse the code and figure out how to properly modify it. But to a new or impatient developer it could be very frustrating, and is in general a common frustration.

### Delete the CLI and API Example VMs
Use the GUI to delete the cli-example and api-example VMs.

**Bonus:** Use the CLI to delete the cli-example, and a script to delete the api-example.

<!-- ------------------------ -->
## Deploy a Simple Web Application
Duration: 20

While in the SSH window for your VM, run the following commands to install Node.js:
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

Type CTRL-O and press ENTER to save, and then type CTRL-X to exit the Nano text editor.

Run the application:
``` bash
sudo node index
```

Go back to the Compute Engine GUI and click the VM's external IP address; it should be linkified if you checked the box for 'Allow HTTP Access.'

In the real world, you would not copy and paste code directly into a server, but rather your code would be tracked and transferred with Git. Also, in many cases, CICD tools would manage most of that process. We'll cover both in the next module and lab.

**Important Note:** Normally you would not run Node as root (sudo), we are doing that here to avoid needing to install and configure Apache or Nginx as a reverse proxy.

### Pain Point!
In most large enterprises, VMs are not allowed to have external IPs. That means that the SSH button won't work, and that the VMs can't be tested directly like this. To SSH, you'd have to use a [bastion host](https://cloud.google.com/solutions/connecting-securely#bastion) or go through a VPN to get into the internal network using a normal terminal window. For end users to access a public website, you'd put an external load balancer in front of the VM(s).

There are Google Cloud tools and solutions for this, and it is mostly just a natural consequence of the fact that security almost always comes at the cost of convenience.

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
Follow the [official documentation](https://cloud.google.com/monitoring/agent/install-agent#agent-install-debian-ubuntu) for Debian (the default flavor of Linux on Compute Engine). The notes below will help you navigate the process.
**Notes:**
* If you created the VM, you should have sudo access, which is root (admin) privilege
* To start in your home directory as recommended, type:
``` bash
cd ~
```
* On Step 4, run the commands one by one.
* Review the instructions on pinning a major version for production environments, but for our purposes the final command for installing the latest version will suffice (sudo apt-get install stackdriver-agent).
* You do not need to move on to optional tasks.

Wait a minute and then go to Monitoring and see if you are getting CPU utilization from the agent now.

### Logging
Go to **Logging** in the GUI.
Select your project, **'GCE Project, XXXXX'**.
You might expect a log entry for 'Example app listening at...' but you won't see it. Installing the Logging agent would give you more system logs, but you still wouldn't see console.log from Node.js. While this would work in managed services, for Compute Engine you would need to use an explicit logging client library. Generally, you would use both the Logging agent and a logging library.

Install the Logging agent by following [the official guide](https://cloud.google.com/logging/docs/agent/installation#agent-install-debian-ubuntu) for Debian. The steps are very similar to the steps to install the Monitoring agent, however, there is an extra configuration step. While either option will work, choose structured logging for better organization.

Next, install a logging library and connect it to Cloud Logging. Follow the [official guide](https://cloud.google.com/logging/docs/setup/nodejs) for Node.js. After you have the NPM package installed and you have put the configuration code near the top of index.js, you can change your app.listen callback to use the new logger:
``` javascript
app.listen(port, () => logger.info(`Example app listening at http://localhost:${port}`))
```

After making the change and starting the app, go back to Cloud Logging and you should see your log line appear. Using Node's built-in console.log will only display locally for developers, but logger.info will go to the logging tool.

<!-- ------------------------ -->
## Cleanup
Duration: 1

Don't forget to delete your VM when you are done with the lab. If you want to be able to reference it later, you can stop it instead of deleting it. You will still be charged for storing the disk, but it is a minimal charge compared to leaving a VM running.
