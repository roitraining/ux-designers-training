summary: Deploy a Virtual Machine on Google Compute Engine and install the Google Cloud Logging and Monitoring agents
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

### In this lab, you will:

- Create a machine using the GUI
- Deploy a basic we application
- Leverage monitoring and logging

<!-- ------------------------ -->
## Creating a VM
Duration: 3

1. Choose a Google Cloud Project to work in. This should be a trial account you created specifically for this course. 

**Warning:** Using your actual Google account will run you into a number of security related issues. 

2. In the Google Cloud Console window, use the **Navigation menu** (![Navigation menu](https://storage.googleapis.com/cloud-training/images/menu.png "Navigation menu")) to navigate to **Compute Engine**.

3. Click **Create** or **CREATE INSTANCE** (the former is if you have no VMs currently) to create a new VM. Name the VM `agents-sample`, and near the bottom of the form, check the box to **Allow HTTP traffic**. Take a few minutes to explore the other VM options, including those under **Management, security, disks, networking, sole tenancy**. 

4. After your perusal, click **Create**.

<!-- ------------------------ -->
## Deploying a basic web application
Duration: 20

1. Once the `agents-sample` VM finishes creating, open an SSH to it by clicking **SSH** to the right of its name. 

2. In the SSH window for your VM, run the following commands to install Node.js:

``` bash
sudo apt update
sudo apt -y install nodejs npm
```

3. Once the installation completes, verify Node's installation by checking its version:

``` bash
node -v
```

4. Create a directory for our test application:

``` bash
mkdir ~/my-app
cd ~/my-app
```

5. Node applications use a `package.json` file to house general information about the app and a list of application dependencies. Create a `package.json` for our new application interactively by executing the following command. Feel free to accept all the defaults (though you might want to add yourself as author):

``` bash
npm init
```

6. Let's add a dependency to our application for the Express webserver. This command will not only modify `package.json` but it will also download any required sub-dependencies to the current folder, and into a `node-modules` folder.

``` bash
npm install express --save
```

7. Create and open an `index.js` file to serve as the main part of our application. You are welcome to use vi or node.

``` bash
nano index.js
```

8. Into the file, paste  the following JavaScript:

``` javascript
const express = require('express')
const app = express()
const port = 80

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
```

9. Exit the editor, saving the change. In Node, you can press **CTRL+X** to exit, and then press **Y > ENTER** to save the file using the same name.

10. Run the application to test it.

``` bash
sudo node index
```

11. Switch back to the **Compute Engine** page in the Google Cloud Console. Click the VM's external IP address; it should be linkified if you checked the box for **Allow HTTP Access**.

**Important Note:**<br>
Normally, you would not run Node as root (sudo). We are doing that here to avoid needing to install and configure Apache or Nginx as a reverse proxy.

<!-- ------------------------ -->
## Monitoring and Logging
Duration: 10

### Monitoring

1. In the Google Cloud Console, use the **Navigation menu** (![Navigation menu](https://storage.googleapis.com/cloud-training/images/menu.png "Navigation menu")) to navigate to **Monitoring**. Wait while your new monitoring workspace creates.

2. Select **Metrics Explorer**, and set the resource to **VM Instance**. For the metric, enter **CPU load**, and then select the one with the 1m visibility. Do you see any data?

3. Click **Dashboards > VM Instances** to see a list of your existing (one) VMs. Is the Monitoring agent installed? That's why the last metric was blank. 

<!-- ------------------------ -->
## Installing and testing the Monitoring agent
Duration: 10

1. In the `Monitoring agent status` column, click **Not detected**. Read the information presented, then select **Install Agent**. A Cloud Shell window will launch. Accept the defaults and proceed through the installation.

2. Once the installation completes, close the Cloud Shell window and the installation dialog. Wait a couple of minutes and refresh the page. What does the `Monitoring agent status` column now display? Repeat if the status is still pending.

3. Select **Metrics Explorer**, and set the resource to **VM Instance**. For the metric, enter **CPU load**, and select the one with the 1m visibility. Do you see any data? This is now being reported from inside the VM thanks to the agent, rather than from outside the VM thanks to Google owning the hardware.

<!-- ------------------------ -->
## Bonus: Installing and testing the Logging agent
Duration: 15

Installing the Logging agent is a bit more of a manual process. The Logging agent passes log messages from code running on VMs, and from standard applications, to Google's Cloud Logging. If you would like to attempt it, please feel free to install the Logging agent using the below as a rough guide.

1. Install the Logging agent by following the steps found in [the official guide](https://cloud.google.com/logging/docs/agent/installation#agent-install-debian-ubuntu) for Debian. You will need to execute these steps in the SSH session for your VM. If that's no longer open, remember, the link may be found next to the VM name in **Compute Engine**. If it is still running the test web application, stop it by pressing **CTRL+C**.

2. To test the agent, augment your code by installing the logging library Winston and use it to record logs. Those steps can be found in this [official guide](https://cloud.google.com/logging/docs/setup/nodejs#using_winston) for Node.js. You will need to install the dependency by adding a message to the script. To add a message to the script, modify the script's final line to the following:

``` javascript
app.listen(port, () => logger.info(`Example app listening at http://localhost:${port}`))
```

3. Restart the application, run it several times, then go back to Cloud Logging and you should see your log lines appear. Using Node's built-in console.log will only display locally for developers, but logger.info will go to the logging tool.
