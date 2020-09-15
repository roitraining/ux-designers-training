summary: Add Cloud Functions and Cloud Translation
id: functions-and-translate
categories: Cloud Run for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Cloud Functions and Cloud Translation
<!-- ------------------------ -->
## Overview
Duration: 1

### What You’ll Learn
- Set up a local development environment with Cloud Code
- Use Cloud Translation to translate events into different languages
- Set up an integration with Cloud Functions using Go

<!-- ------------------------ -->
## Set Up a Local Development Environment
Duration: 15

### Download and Install the Tools
Download and install VS Code:
[https://code.visualstudio.com/download](https://code.visualstudio.com/download).

Download and install Cloud Code for VS Code (including Go support):
[https://cloud.google.com/code/docs/vscode/install](https://cloud.google.com/code/docs/vscode/install).

Using the terminal window inside VS Code, install the Google Cloud SDK (CLI tools):
[https://cloud.google.com/sdk/docs/downloads-interactive](https://cloud.google.com/sdk/docs/downloads-interactive).

Make sure that when you initialize gcloud, you configure it to work with the project you are using in this class. If you already had gcloud installed, then you may need to switch the config to your project (you can use this same command to change it later):
[https://cloud.google.com/sdk/gcloud/reference/config/set](https://cloud.google.com/sdk/gcloud/reference/config/set).

The first example at the bottom of that page shows the specific command you need. 

Download and install Docker:
[https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/).

**Optional**<br>
Add the Yet Another Rest Client (YARC) extension to your Google Chrome browser for easier API testing. 


### Clone Slick Tickets Locally and Into Your Project 

1. On your local machine, open a terminal window and navigate to the base folder where you'd like the local copy of Slick Tickets stored. Then clone the repo into that folder:

```
git clone https://github.com/haggman/slick-tickets.git
```

2. In the Google Cloud Console, use the **Navigation menu** (![console_nav_small.png](img/console_nav_small.png)) to view your project's **Source Repositories**. Make sure you are in the project you've been using for this course.

2. In the top right, click the **Add repository** button. Create a new repository and name it `slick-tickets`. Place the repository in your class project. 

3. After creating the repo, follow the instructions in the Google Cloud Console and click **Push code from a local Git repository**. Use the `Google Cloud SDK` version.  

4. Refresh the page in **Source Repositories** and make sure you see your new repo. 

5. On your local machine, open Visual Studio Code and use **File > Open** or **File > Open Folder** to open your local copy of `slick-tickets`. 


With Git, you can have one local repo and many remotes. At this point, you should have the original remote that has the version of Slick Tickets that you were given to start. Now, you have a new remote named "google" that is part of your class project.  

<!-- ------------------------ -->
## Build a Test Translation App
Duration: 20

### Install and Configure the Cloud Translation Client Library for Node.js
1. In Visual Studio Code (VSC), use the **Terminal** menu to open a terminal window.

2. In the terminal window, change into the `app/events-service` folder. 

3. Find the correct npm install command from [the documentation](https://cloud.google.com/translate/docs/reference/libraries/v2/nodejs).

```
npm install --save @google-cloud/translate
```

4. Don't worry about the second part where they have you use the client library in code, instead follow the link at the bottom of the documenation to see how to [translate text](https://cloud.google.com/translate/docs/basic/translating-text#translating_text).

### Test the Client Library
Let's start with a test of the client library:

1. In the `events-service` folder, create a file called `translation-test.js`.

2. Paste in the sample code from the Google documentation on translating text from the previous section.

3. Follow the instructions to uncomment certain lines and select your language. See the [list of supported languages](https://cloud.google.com/translate/docs/languages).

4. In the terminal window, install all your application dependencies:

```
npm i
```

5. Run your sample file with Node (it will probably fail, keep reading).

```
node translate-text.js
```

6. Most likely, you got an authentication error. Code running on a remote machine, that's reaching out to Google Cloud Services, needs a way to authenticate. Either the machine has a credential, a credential is stored in an environmental variable, or a credential is directly loaded by code. Let's fix the problem using the environmental variable approach. In your Google Cloud Console for your class project, use the **Navigation menu** (![console_nav_small.png](img/console_nav_small.png)) to navigate to the **IAM & Admin > Service Accounts** page. 

7. Create a new service account. Name it `slick-remote` and click **Create**.

8. Use the **Select a role** dropdown and give the Service Account (SA) the **Project Editor** role. That will work well for us but be warned, in production the SA should have minimum permissions and Project Editor is probably not a good choice.

9. Click **Continue**, and then **Done**. 

10. Locate the new SA, click the triple-dot menu to its right, and click **Create key**.  

11. Accept the default JSON format and click **Create** to create the new key. The key will auto-download to your `downloads` folder. Rename the file `key.json`. 

12. Let's move the file closer to the app. In the folder just above where your local `slick-tickets` sits, create a folder named `credentials`. Move the key file into the new `credentials` folder. I like the key file close, but I don't want it to become part of the repository itself. You can also rename the file if you like. 

13. Switch to the VSC terminal window. 

14. Create a new environmental variable named `GOOGLE_APPLICATION_CREDENTIALS` and set it equal to the path to your key file. Below is an example, but the path will need to be updated:

```
export GOOGLE_APPLICATION_CREDENTIALS="~/Course/credentials/my-key.json"
```

15. In the terminal window, re-execute the app.

```
node translate-text.js
```

<!-- ------------------------ -->
## Test the Events Service Locally
Duration: 15

### Add the Feature to the Events Service
If you are new to MVC application development, this part will be a challenge. This is a real server-side web application development. Your instructor will help orient you and you can always ask for direction, especially in getting started. Also, consider pairing up with someone and working together. Pair programming is very common in application development. 

**Important Note:**
Remember that query string parameters are key-value pairs that come after a question mark at the end of a URL. 

Like https://www.google.com/search?q=dog.

They do not change what route you are making a request to, they simply add additional information to it. 

Our application displays a list of events. How about we want to add a translation feature that takes a query string, if present, and uses that to optionally translate events:

1. Let's take a moment to get the `events-service` running on our local machine. In VSC, create a new file in the `events-service` folder named `.env`.

2. In `.env`, add the following:

```
PORT=3001
SERVICE_ACCOUNT_FILE=key.json
```

3. Using the terminal window in VSC, make sure you are in the `events-service` folder and execute the application:

```
npm start
```

**Note:** If you see a *metadataLookupWarning*, ignore it. 

4. Test your application by opening a browser and navigating to http://localhost:3001/events, and you should see a list of your events. If you installed the YARC extension in Google Chrome, you can use that instead of the standard browser interface if you prefer. Jot down one of the event slugs and navigate directly to that event by modifying the URL: http://localhost:3001/events/your-slug. Pay attention to the format of the returned event. 

5. Now let's add our translation functionality. Use VSC to open the `events-service/routes.js` file. Notice how calls to the path `/events/:slug` are passed to `controller.getEvent`. 

6. Now open the `controller.js` file and locate the `exports.getEvent` function definition. So, this is the code that currently reads the slug and then calls the "getOneEvent" utility function to retrieve the event. 

You might have noticed when testing the app above, that a returned event takes the form:

```
{
  "name": "Cool Event",
  "attendees": [],
  "slug": "cool-event",
  "description": "Cool Description",
  "id": "7POXQHrvbfV080bfAZJX"
}
```
So, if we're doing a translation, then we really need to update the value for the name and the description. 

<!-- ------------------------ -->
## Translate Our Events to Spanish
Duration: 20

### Activate the Translation Code

Since this isn't really a programming class, the code to translate event names and descriptions has been added to our controller; we simply have to uncomment it. To facilitate this process, a series of comments have been inserted in the code using the format:

```
//TODO: #
```

1. Make sure you are in VSC and are looking at the `events-service/controller.js` file. 

2. Locate the comment `//TODO: 1` and perform the instructions you find there. Continue through `TODO: 2` and `TODO: 3`, then return to the below step. 

3. Make sure to save your edited code file.

4. In the VSC terminal window, stop the running application if needed by pressing CTRL+C. 

5. Restart the `events-service`:

```
npm start
```

6. Make sure the application is still working for non-translation events by re-invoking the service by visiting its URL, using one of your event slugs. The URL will be something like: http://localhost:3001/events/your-slug. 

7. Besides checking for proper returned data in the browser, also check the VSC terminal for error messages. 

8. If everything is looking good, then modify the URL and add a `language=es` query string, where `es` is the code for Spanish. Like: http://localhost:3001/events/your-slug?language=es.

9. Verify that the returned JSON is now displaying the translated name and description. 

<!-- ------------------------ -->
## Deploy to Google Cloud
Duration: 15

### Deploy to Cloud Run with Cloud Code

1. Hover over the icons along the left edge of VSC until you find the one for **Cloud Code - Cloud Run**, and click it. 

2. If you don't see your services, hover over the project name, click the icon with two opposing arrows, and switch to you project. 

3. Hover your pointer over your `events-service`, and click the **Deploy to Cloud Run** icon (cloud with an up arrow).

4. Wait for the configuration page to display. In **Service Settings**, verify that the `events-service`is selected. 

5. In **Revision Settings**, set the container image URL to: `gcr.io/your-class-project-name/events-service`. You may need to edit the end and change it from "slick-tickets" to "events-service".

6. Scroll to the bottom and click **Deploy**. Click **Show Detailed Logs** so you can watch the log messages in **Output** at the bottom of VSC.

7. Once the new version successfully deploys, open the Google Cloud Console for your class project. Then, use the **Navigation menu** (![console_nav_small.png](img/console_nav_small.png)) to navigate to **Container Registry**. 

8. Click your `events-service` and investigate the new image. Notice the label it added. 

9. Use the **Navigation menu** (![console_nav_small.png](img/console_nav_small.png)) to navigate to **Cloud Run**, and click your `events-service`. 

10. Click the **Details** tab and notice when the current version was deployed. It should be recently. 

11. Click the **Service** link to execute the service. You'll get an error. Add "/events/your-event-slug" to the URL and press **Enter**. It should properly return the event. 

12. Now, add `language=es` to the end of the URL and check out the new functionality. 

Great work!

Once you had your environment set up and configured, you never had to leave VS Code to write the feature, check it in with Git, create the new image, and deploy it to Cloud Run. You might not have even noticed that you created a new container image since Cloud Code did so much of the work for you. This is the bleeding edge of modern application development.


<!-- ------------------------ -->
## Super Bonus
Duration: 30

### Add the Feature to the Web App
Adding the feature to your events service is only half the battle. Next, you need to actually consume the new feature in the web app to make it available to end users. Again there are multiple approaches, but here is one possible solution:

1. In the events list, put labels for each language (start with just one); for example, FR, French, or use the country flag.

2. Consider this route in your web app: `router.get('/event/:slug', eventsController.viewEvent)`; that is, the route that gets called when a user clicks an event in the event list.

3. In the `viewEvent` controller method, again expect a query parameter specifying language, and pass that along when you make the request to your events service.

4. Finally, linkify the label or icon you used for the language, and add the query parameter to the link, so when the user clicks that button it links to the same event page, but with the appropriate language in the query parameter.

5. Run it and test it. If it all works, `git add commit` and `push` it to your origin.

6. Update your Cloud Run version of the application using Cloud Code, then test. 
