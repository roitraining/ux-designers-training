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

**Optional**
Download and install Postman for more robust testing of API endpoints:
[https://www.postman.com/downloads/](https://www.postman.com/downloads/).

### Cloud the Repo
1. Navigate to Cloud Source Repos.
2. Find the Slick Tickets repo (or your copy of it if you made one).
3. Click **Clone** in the top right.
4. Select **Google Cloud SDK**.
5. Using terminal in VS Code, find a place where you want to put the repo. I recommend creating a Git folder in your home folder, then moving inside of it. 
6. Paste the clone command given to you from Cloud Source Repos.
7. CD Inside of it.

### Make Your Own Repo
If you haven't already, create your own version of the Slick Tickets repo so you can push changes:
1. In Cloud Source Repos, use the button in the top right to create a new repo.
2. After creating the repo, follow the instructions to **Push code from a local Git repository**.
3. You do not need to run git config.
4. You may name the remote something other than google, perhaps use your own name.

With Git, you can have one repo and may remotes. You will have the original remote that has the version of Slick Tickets that you were given to start. And now you will have a new remote that is all yours. You will name that remote when pushing and pulling, as shown in the example you are following. 

If all was successful, you should see the Slick Tickets code in your new repo. You may also follow these steps to connect your remote to your Cloud Shell environment so you can capture any changes you've made there. Just add, commit, and push your remote after you've added it to Cloud Shell. From your local machine in VS Code, you can do a git pull [MY_REMOTE_NAME] to get those changes locally. 

Congratulations! You now have a local development environment setup and you are ready to develop locally. 

<!-- ------------------------ -->
## Add Cloud Translation to Slick Tickets
Duration: 45

### Install and Configure the Cloud Translation Client Library for Node.js
1. In your local terminal in VS Code, navigate to the events-service folder.
2. Find the correct npm install command from [the documentation](https://cloud.google.com/translate/docs/reference/libraries/v2/nodejs).
3. Don't worry about the second part where they have you use the client library in code, instead follow the link to see how to **translating text**. 

### Test the Client Library
Let's start with a simple test of the client library:
1. In the events-service folder, create a file called translation-test.js.
2. Paste in the sample code from the Google documentation on translating text from the previous section.
3. Follow the instructions to uncomment certain lines and select your language. See the [list of supported languages](https://cloud.google.com/translate/docs/languages).
4. Try running your sample file with Node (it will probably fail, keep reading).

Most likely you got an authentication error. Follow these instructions and then try again:
[https://cloud.google.com/docs/authentication/getting-started](https://cloud.google.com/docs/authentication/getting-started).

Most likely it will fail again. Check the console output and you should see information about enabling the API, including a direct link to do so. Follow that link and enable the Cloud Translate API. 

Try again, this time it should succeed. This is why we start with simple test code before trying to integrate something into our application. It helps isolate potential issues so we can troubleshoot general things like this first before we have to troubleshoot inside the complexity of our application code. 

### Add the Feature to the Events Service
If you are new to MVC application development, this part will be a challenge. This is real server-side web application development. Your instructor will help orient you, you can always ask for direction especially in getting started, and also consider pairing up with someone and working together. Pair programming is very common in application development. Also if time is short, or this task proves too frustrating, feel free to skip ahead to the Cloud Funtions exercise below. You'll have time at the end of class to come back to this translation feature if you'd like.

When you go to add a feature in an MVC application you have to consider the route, model, view, and controller. In our case, we don't have true models since we are relying on Firestore to handle the database interactions. Also, our views are only in the web app, so for the events service we need only consider route and controller. When we integrate with the web app we'll need to consider its route, view, and controller. 

**Important Note**
Remember that query parameters are key-value pairs that come after a question mark at the end of a URL. They do not change what route you are making a request to, they simply add additional information to it. 

There are multiple ways you could approach this, but here is one possible solution. Start by adding the functionality to the events service:
1. Add the functionality to this route (see routes.js): router.get('/events/:slug', controller.getEvent).
2. Expect a query parameter specifying a language other than English if desired, example: https://www.slicktickets.com/events/my-event-slug?language=fr.
3. You can pull that information in the controller method (getEvent) using: req.query.language
4. If that is defined, then before returning the event text, make the call to the Translation API to translate the event body text according to the language specified (target).
5. You will need to modify the example function you were given to take in the event body text and target language. You do not need to console.log the translated text, rather you will respond with it. 

**Important Note**
In Express, as in most web frameworks, you may not try to respond twice. Be sure to have an 'if' statement that checks to see if req.query.language is defined, and if its not, just respond as you have been. In the 'else', you can respond with the translated text. That way you don't try to respond both ways and cause an error. 

You can test your new endpoint in a browser, or in Postman. Simply run the service locally with Node.js (node server) and make a request to the URL. Example:
```
http://localhost:3000/get-events/[MY_EVENT_SLUG]?language=fr
```

You will probably get errors when you first try to run one of the services locally. Go through the README file for Slick Tickets and configure your service account and environment variables as it instructs. If you have trouble, just ask your instructor right away rather than spend time debugging the setup. 

### Add the Feature to the Web App
Adding the feature to your events service is only half the battle. Next, you need to actually consume the new feature in the web app to make it available to end users. Again there are multiple approaches, but here is only example:
1. In the events list, put labels for each language (start with just one); i.e., FR, French, or use the country flag.
2. Consider this route in your web app: router.get('/event/:slug', eventsController.viewEvent); that is the route that gets called when a user clicks an event in the event list.
3. In the viewEvent controller method, again expect a query parameter specifying language, and pass that along when you make the request to your events service.
4. Finally, linkify the label or icon you used for the language, and add the query parameter to the link, so when the user clicks that button it links to the same event page, but with the appropriate language in the query parameter
5. Run it and test it. If it all works, git add commit and push it (to your origin).
6. Build a new container image and deploy it with Cloud Run, but instead of doing it the way you did before, this time try using Cloud Code (instructions follow).

### Deploy to Cloud Run with Cloud Code
1. Click the **Cloud Code - Cloud Run** icon to the left.
2. If you don't see your services, hover over the project name, click the icon with two opposing arrows, and switch to you project.
3. Hover over your events service and click the deploy icon (cloud with an up arrow).
4. Fill out the information, make sure to reference the correct image name, and hit **Deploy**.
5. While it's deploying, click the **Show Detailed Logs** button and when it says 'successful', go try it out. It may keep acting like it's in process even after it's done. 

That's it! Once you had your environment setup and configured, you never had to leave VS Code to write the feature, check it in with Git, create the new image, and deploy it to Cloud Run. You might not have even noticed that you created a new container image since Cloud Code did so much of the work for you. This is the bleeding edge of modern application development.

<!-- ------------------------ -->
## Add a Go Cloud Function to Slick Tickets
Duration: 30

### Create a Simple Go Cloud Function
Create a simple test Cloud Function using the GUI. The GUI is a great place to try something out for the first time and see the options that are available without needing to reference documentation. Later, when doing a task routinely or in real environments, you'd be more likely to use the CLI or something like Terraform. 

Take the default options except check the box to **Allow unauthenticated invocations** and switch the runtime to Go 1.11. 

After it's running, click the trigger and you'll see that it says "Hello World." 

Feel free to take some time and try modifying it and getting comfortable with Go before moving on. As an example, you could change line 18 to this:
``` go
fmt.Fprint(w, r.URL.Query()["message"])
```

That way, if it doesn't find a message on the body, it will pull the message from a query parameter (?message=some-message). 

### Create a Go Cloud Function for Use with Slick Tickets
Choose some small bit of functionality you'd like to pull into a Cloud Function. Maybe something simple and not very practical, like counting the number of events. You could in that case pass it the number of events, or you could have it integrate with Firestore directly. A slightly more realistic application would be to have it generate HTML for a printed ticket. A very realisitic task would be something CPU intensive that occurred irregularly, for example, a customer generating some report on years of their purchase history. 

Whether you choose something simple or complex, you are going to have inputs and outputs. That is to say, you are going to need to send some information to the Cloud Function, and you are going to expect it to return things to you. Here is a slightly more robust version of the sample code that responds with errors if they occur, and handles multiple inputs:
``` go
// Package p contains an HTTP Cloud Function.
package p

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Message struct {
    Title string
    Body  string
}

func HelloWorld(w http.ResponseWriter, r *http.Request) {
    var m Message

    // Try to decode the request body into the struct. If there is an error,
    // respond to the client with the error message and a 400 status code.
    err := json.NewDecoder(r.Body).Decode(&m)
    if err != nil {
        http.Error(w, fmt.Sprintf("error: %s", err.Error()), http.StatusBadRequest)
        return
    }

    // Respond with a JSON string containing the message.
    fmt.Fprintf(w, `{"message": {"title": "%s", "body": "%s"}}`, m.Title, m.Body)
}
```

There are two especially key lines here. First, let's consider this one:
``` go
err := json.NewDecoder(r.Body).Decode(&m)
```

In this line, an err variable is declared and assigned simulatenously using the := operator; we hope that this will come back defined as nil, which it will as long as there is no error in decoding. We are using the standard package json, a method on it called NewDecoder, passing in the body off the request (r, similar to req in Node and Express), and then running the Decode method off of that, and providing a pointer to our variable 'm' we created earier. Ideally, our decoder methods will find appropriate values on the body and populate the struct m with them. 

Here's another key line where the response occurs:
``` go
fmt.Fprintf(w, `{"message": {"title": "%s", "body": "%s"}}`, m.Title, m.Body)
```

Here, we are using another standard library built into Go, fmt, for formating and writing text. In this case, we want to write down the socket to the client who made the request to our server. We are passing "w" which is the response writer (similar to res in Node and Express), the string to be written, and then some variable values to substitute into the string. They simply happen in order, so m.Title will substitute in for the first %s and m.Body will substitute in for the second %s. This is called string interpolation, and will tend to look a bit stranger in strongly typed languages like Go vs. dynamically typed languages like Python and JavaScript where we don't have to worry about specifying type. In this case with Go and %s, the 's' stands for string. 

That should give you enough to at least do a super simple Go Cloud Function that takes in some inputs on the body, does something with them like forming a new string, and responds with that new string back to the client (which in this context will probably be a Cloud Run service). 

To test your function, you can use Postman. Be sure to use a **POST** request on the **raw** option for body, and put the body in JSON format using double quotes for all properties and values. Example:
``` json
{"title": "Greetings!", "body": "Hope you are well."}
```

As an alternative to Postman, you could simply use curl from Cloud Shell or your local machine:
[https://www.educative.io/edpresso/how-to-perform-a-post-request-using-curl](https://www.educative.io/edpresso/how-to-perform-a-post-request-using-curl).

### Consume the Cloud Function from Cloud Run
Your Cloud Function is just another microservice to be consumed by the web app, events service, or users service in Slick Tickets. So as an example, review how the web app consumes the events service or users service. Look inside the web app folder, then in the controllers folder, and review the events controller. In particular, look at how fetch is used to make requests to the events service. Here's an example:
``` javascript
exports.listEvents = function (req, res) {
  fetch(`${eventsService}/events`)
    .then(serviceRes => serviceRes.json())
    .then(json => res.render('list-events', json))
    .catch(err => res.redirect('/events'))
}
```

Remember that this is using simple one-line arrow function syntax, but almost the exact same thing could be coded in an expanded way like this:
``` javascript
exports.listEvents = function (req, res) {
  fetch(`${eventsService}/events`)
    .then(serviceRes => serviceRes.json())
    .then(function (json) {
      // can do more here
      res.render('list-events', json)
      // or even here if you want
    })
    .catch(err => res.redirect('/events'))
}
```

This opens up more lines for doing more things as noted in the comments. 

Try writing your own fetch call somewhere in this controller, or another, that interacts with your Cloud Function. If you are new to coding, you may not have time to complete the integration, but will have more time at the end of class to come back to it if you wish. As you do work on challenging labs like this, be sure to reach out to your instructor for support when you get stuck; don't spend more than 5 minutes stuck on any one bug or being unsure of what step to take next. 

<!-- ------------------------ -->
## Cleanup
Duration: 1

No special cleanup should be required in this case. You can delete the things you've created, but they should not incur charges as they are serverless products that have a free tier and are only used when accessed. 