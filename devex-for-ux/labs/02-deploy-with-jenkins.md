summary: Deploy Code with Jenkins
id: deploy-with-jenkins
categories: DevEx for UX Designers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Deploy Code with Jenkins
<!-- ------------------------ -->
## Overview
Duration: 1

### What You’ll Learn
- How to use Git to track and transfer code
- How to install and configure Jenkins
- How to release updates through Jenkins

<!-- ------------------------ -->
## Create a VM
Duration: 3

Open Cloud Shell and run the following command:
``` bash
gcloud compute instances create jenkins-example --tags=http-server --zone=us-central1-a
```

Notice how we are using the CLI to create a VM with a firewall tag to allow HTTP (port 80) traffic. That has the same effect as checking the box (allow HTTP access) as we did with the GUI in the previous lab. In both cases this works because we are using the default VPC network which has a default firewall rule that allows traffic on port 80 for VMs with that tag (http-server). There is a similar default rule for HTTPS traffic (port 443) for VMs with the https-server tag.

<!-- ------------------------ -->
## Create a Sample Web App
Duration: 20

### Create a Cloud Source Repo to House the Application
This time instead of creating the application directly on the server, we are instead going to create it on Cloud Shell. We are treating Cloud Shell as a "local" development machine, which is an appropriate use for it, though most developers would actually use their local machine and a local text editor (such as Atom) or an IDE (such as VS Code).

In Cloud Shell, click **Open Editor**, then click the popout button to open it in a new window. This window will be our development machine. If you'd prefer to actually use your laptop as the development machine, just make sure to [install the Google Cloud CLI tools](https://cloud.google.com/sdk/install) and log in with:
``` bash
$ gcloud auth login --brief
```

Next go to Cloud Source Repos and create a new repo. Call the repo 'sample-app' and choose a project. In the screen that comes up after creation, leave **Clone your repository to a local Git repository** selected, but switch the tab below it to **Google Cloud SDK**. You should already have steps 1 and 2 complete, now follow the rest of the steps.

To commit some initial code do the following:
1. Create a file called README.md in the root of your sample-app directory in Cloud Shell.
2. Add any text to it, like "This is a sample app."
3. Run this command to add all new changes in the repo: git add .
4. Commit the changes to Git: git commit -m 'initial commit'
5. You are now ready to git push which is Step 5 in the Source Repos instructions.

**NOTE: You will be prompted to configure Git. You may provide fake information here if you prefer. Use the two git config commands they show you.**

Once you refresh the Source Repos page, you should see your README file. It is a time-honored tradition to have a README.md file at the root of all Git repos to explain what is in the repo, how to get it running, and usually often a bit about the tools that are used.

### Create the Sample Application
First create a text file called '.gitignore' and inside it write node_modules. This will tell Git to ignore your node_modules folder which includes your dependencies. We don't want to continually transfer the dependencies around with Git, those should come directly from NPM. You can read more about best practices for dependencies in the [corresponding twelve-factor best practice](https://12factor.net/dependencies).

Now you are ready to create your app. Since you are in Cloud Shell, Node and NPM have already been installed for you. So you can begin by going through the [Express Installation](https://expressjs.com/en/starter/installing.html). Follow the link at the bottom to get the Hello World example we used previously running. Make sure that when you install Express with NPM you do use the --save flag. This will make sure it's included as a dependency in your package.json file.

This is using port 3000 by default, which is common. To preview the app with Cloud Shell be sure to change the preview port to 3000, which is an option when you click the preview icon.

**BONUS:** Abstract the port to an environmental variable instead of hard-coding it as the sample directs. Let's say you set an environmental variable called PORT, to access that in Node.js use:
``` javascript
process.env.PORT
```

On line 3 of the Hello World application change it to:
``` javascript
const port = process.env.PORT
```

To read more on storing config in the environment read about [the twelve-factor best practice](https://12factor.net/config).

<!-- ------------------------ -->
## Deploy the App with Git
Duration: 15

### Push Your Code into the Repo
Add commit and push your changes:
``` bash
git add .
git commit -m 'created basic express sample'
git push origin master
```

In the real world, you wouldn't make changes directly to master, you would mostly likely use a feature branch, and potentially merge it into dev and even test before it got merged into master.

### Prepare the VM
SSH into your new VM, jenkins-example. Because we aren't in Cloud Shell, we'll need to install the tools we need.

Install Git and Node:
``` bash
sudo apt update
sudo apt install git-all
sudo su
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
exit
sudo apt-get install -y nodejs
```

Install gcloud by following [the official documentation](https://cloud.google.com/sdk/docs/quickstart-debian-ubuntu). You should not need to init gcloud since your Compute Engine VM comes with a default service account.


### Clone the Repo in the VM
Go back to Source Repos, click the **Clone** button, choose **gcloud**, and follow the steps. You will get an error that you have insufficient scopes. To fix that:
1. Stop the VM.
2. Edit the VM by clicking its name, then clicking the **Edit** button.
3. Go down to **Access scopes** and change it to **Set access for each API**.
4. Find the scope for **Cloud Source Repositories** and change it to **Read Only**.
5. Save the VM and start it back up, then SSH back in and try the git clone command again.

Move into the sample-app folder that was created when you cloned the repo.

Run the following command to see the contents of package.json:
``` bash
cat package.json
```

Notice that we have a dependency, Express, but if you run the ls command you'll see that we don't even have a node_modules folder, and that's where the dependencies are stored. Remember that we listed this folder in .gitignore so that it would not transfer through Git.

To install the dependencies from package.json run:
``` bash
npm install
```

### Run the App
Change your port to port 80, and run with:
``` bash
sudo node app
```

If you called your file something else, like index.js, then use that name instead. The .js part is optional.

If you get an error that the port is in use, stop Apache which may be running on that port:
``` bash
sudo /etc/init.d/apache2 stop
```

Go back to Compute Engine, click the external IP address of the VM, and you should see your app running.

<!-- ------------------------ -->
## Run the App with a Process Management Tool
Duration: 10

### Install PM2
So far you have been running the process manually, it would not keep running without you maintaining the shell session, and it would not automatically restart if the app crashed. Let's install a process management tool to handle the Node process for us.

Hit Ctrl-C to end the process, then run the following to install a Process Management tool called PM2:
``` bash
sudo npm install pm2 -g
```

Notice that unlike when we installed Express which was a dependency of the app, here we are using the -g flag instead of --save. The latter saves a reference to "express" in package.json so that anyone else who runs it gets the dependency, however, -g just installs it to this specific system globally. PM2 is not a dependency for the app to run, rather it's a tool we are using specifically on this server to manage the process.

### Run the App with PM2
Now let's start the app with PM2:
``` bash
sudo pm2 start app.js
```

If you named your file something other than app.js, just use that instead. And remember that we are using sudo because we are running the app directly on port 80. That is not how it's done in the real world, but avoids a lot of complex configuration.

**BONUS:** If you want to try running it properly, follow this commonly used [guide](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-debian-9) from Digital Ocean. It will cover a more robust use of PM2, as well as using Nginx as a reverse proxy. Notice that in their prereq's they cover how to install Nginx, you'll have to do that too.

This process is complex enough, but gets even more complex when you are using an SSL Cert so you can run on HTTPS (which is almost always required). On top of that, you may need to run multiple tiers, and multiple enviornments (prod, dev, test, stage). Hopefully this manual process illustrates how valuable managed services and automation tools are.

<!-- ------------------------ -->
## Release a Change with Git
Duration: 10

### Make a Change
Go back to Cloud Shell and make a change to your main app file, app.js or whatever you chose to call it (from here on out I'll stop calling this out specifically). Perhaps just change "Hello World" to some other message. If you want to get fancy, you could even add some HTML and CSS.

Add, commit, and push the changes:
``` bash
git add app.js
git commit -m 'updated homepage text'
git push origin masster
```

### Deploy the Changed Version
Now switch back to the SSH window, and pull the changes:
``` bash
git pull origin master
```

Go refresh the browser where you are viewing the web app, and notice that it has not changed. When you change server-side code, you need to start the process. Go back to your SSH window and run:
```
pm2 restart app
```

Now refresh your browser with the web app loaded, and you should see that the change has taken place.

These steps illustrate the manual process that we will now automate with Jenkins. Remember that in the real world, changes would not be made directly to master. They would be made on a different branch and then merged into master.

**BONUS:** Release a change through a different branch.
1. Create a new branch and check it out: git checkout -b some-feature-branch
2. Make a change, commit it, and push the new branch.
3. Checkout master.
4. Merge the changes: git merge some-feature-branch
5. Push master.

This is closer to real world, however in the real world it is typical to submit pull requests and have someone else review your code before merge.

**Pain Point!** This does not seem possible with Cloud Source Repositories. See [this Twitter thread](https://twitter.com/cohix/status/1065357109146124288) and [this Stack Overflow discussion](https://stackoverflow.com/questions/37200647/how-to-do-code-review-for-google-cloud-git-repo).

<!-- ------------------------ -->
## Set Up Jenkins
Duration: 20

### Install Jenkins
First install wget to download Jenkins, then Java to run it:
``` bash
sudo apt update
sudo apt install wget
sudo apt install default-jre
```

Next we're going to open port 8080 so we can view Jenkins from our browser:
1. Go to **VPC network -> Firewall rules** and create a new rule.
2. Call the rule 'allow-8080' and also use that as the tag to target. Set Source IP range to 0.0.0.0/0 (which is all IPv4 addresses) and under specified ports and protocols, check **TCP** and enter 8080 as the port.
3. Apply this rule to the VM by clicking it in the GUI, editing it, and then down under networking, adding the tag allow-8080.
4. Save your changes, no need to restart the VM.

Now you are ready to follow the [Jenkins getting started guide](https://www.jenkins.io/doc/pipeline/tour/getting-started/). Here are some tips for navigating the process:
1. Use wget to download: wget http://mirrors.jenkins.io/war-stable/latest/jenkins.war
2. Once Jenkins is running, leave that terminal window with it running and open a new terminal window to work from. Just click **SSH** in the GCE GUI again.
3. When the installation process asks you for the password, use the cat command to print it out in the new SSH window.
4. Choose **Install Suggested Plugins**.

### Install and Configure the Google Cloud Source Plugin
From the Jenkins dashboard, click **Manage Jenkins**, then from that list click **Manage Plugins**. Click the **Available** tab and search for **Google Authenticated Source**.

Check the box next to the **Google Authenticated Source** plugin, then click **Install without restart**. On the next page, check the box to **Restart Jenkins when installation is complete and no jobs are running**.

Next go the Google Cloud Console, go to **IAM > Service Accounts**, and find your **Compute Engine Default Service Account**. Click it, edit it, and create new key. Download the JSON key file. We'll use this to authenticate in a moment.

<!-- ------------------------ -->
## Deploy with Jenkins
Duration: 20

### Set Up a Jenkins Project
Back in the Jenkins Dashboard, click **New Item**. Give it a name and choose **Freestyle Project** and click **Okay**. Under Source Code Management, select **Git**.

In **Credentials**, click **Add**, then **Jenkins**, then switch the **Kind** dropdown to **Google Service Account from private key**. Enter your project name, and upload the JSON key file you generated earlier. Select your new credential from the **Credentials** dropdown.

Go to **Cloud Source Repositories**, go into your sample-app repository, and click **Clone**. Switch to **Manually generated credentials** and copy the URL that comes after git clone. Back in Jenkins, paste this into the **Repository URL**.

Under **Build Triggers**, click **Poll SCM** and enter five asterisks with spaces in between: __* * * * *__

This is using modified [cron syntax](https://devhints.io/cron) and using all asterisks like this means that it should check every minute of every day. This is more frequent then normal, but will make our testing faster.

Under **Build**, add a build step. Choose **Execute shell** since we'll just be doing a simple set of bash commands. Enter the following bash commands:
``` bash
cd /home/jordanmhart/sample-app
git checkout master
git pull origin master
npm install
sudo pm2 restart index
```

Click **Save**.

**Important Notes**
1. Notice you are just telling Jenkins to run the same set of commands you would normally do manually to deploy a new version.
2. We are using npm install in case any new dependencies were added.
3. This is a simplified workflow. At the least, you would usually have this as a separate bash script that itself was checked into source control. Also, you'd normally run Jenkins on a separate machine, and in most cases, you'd be building and deploying a container. You'd also have multiple steps where you build, test, and then release. In addition, you'd likely at least have a staging environment, if not also one or more dev environments and a test environment.

### Test the Project by Releasing a Change
Back in Cloud Shell, which we are using as a "local" development machine, make another change that you'll be able to confirm visually (change the text or html that is sent), but don't push it yet.

Go look at the app in a browser window, refresh the page to see that it hasn't changed. Back in Cloud Shell, add and commit your change if you haven't already, and then push it to master. Go to the Jenkins Dashboard home and refresh until you see that that project has been triggered and is completed running. If you miss it, you may just notice that the last success is very recent, a minute or two ago. Less than two minutes after you push the change, it should have successfully completed running.

Go back to the browser window showing your app and refresh the page, you should see the change has gone live! Congratulations, you just released a new version with Jenkins! Note that there is no particular CI aspect to this pipeline, as you are not automatically integrating feature branches into master. But you do have the CD aspect where changes that are pushed to master are automatically rolled out to production.

<!-- ------------------------ -->
## Cleanup
Duration: 1

Don't forget to delete your VM when you are done with the lab. If you want to be able to reference it later, you can stop it instead of deleting it. You will still be charged for storing the disk, but it is a minimal charge compared to leaving a VM running.
