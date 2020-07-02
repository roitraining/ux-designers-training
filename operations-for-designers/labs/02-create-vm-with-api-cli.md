summary: Create and List VMs with the CLI and API
id: create-vm-api-cli
categories: Operations for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Create and List VMs with the CLI and API
<!-- ------------------------ -->
## Create and List a VM with the CLI
Duration: 3

### Create a VM by CLI
Open Cloud Shell and run the following command:
``` bash
gcloud compute instances create cli-example-vm --zone=us-central1-a
```

### List VMs by CLI
After a minute or two, you should see your VM when listing VMs with the following command:
``` bash
gcloud compute instances list
```

### Documentation
gcloud Documentation:
[https://cloud.google.com/sdk/gcloud/reference/compute/instances/create](https://cloud.google.com/sdk/gcloud/reference/compute/instances/create)

GCE Documentation:
[https://cloud.google.com/compute/docs/instances/create-start-instance#startinstancegcloud](https://cloud.google.com/compute/docs/instances/create-start-instance#startinstancegcloud)

<!-- ------------------------ -->
## Configure NPM
Duration: 5

### Setup Your Working Directory
Open Cloud Shell, create a working directory,and move into it:
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

Just hit Return through all the prompts taking the defaults. In a real project, you would fill at least some of the fields out and probably be inside of a folder managed by Git.

Next use NPM to install the Google Cloud client libraries for Node:
``` bash
npm install --save @google-cloud/compute
npm install --save googleapis
```

<!-- ------------------------ -->
## List VMs with the API
Duration: 20

### Create a List VMs Script
Next create a JavaScript file to use for our list VMs script:
``` bash
touch list-vms.js
```

Then use Nano to edit it:
``` bash
nano list-vms.js
```

While leaving that open and ready to paste into, in a different browser tab review this page:
[https://cloud.google.com/compute/docs/tutorials/nodejs-guide](https://cloud.google.com/compute/docs/tutorials/nodejs-guide)

Read as much of it as you want, then copy the contents of "[t]he complete example" at the bottom.

Paste that into Cloud Shell where you still have Nano open and are editing list-vms.js.

Use Ctrl-O to save (write out), and hit Return when the existing filename is shown to you. Next use Ctrl-X to exit Nano.

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

After saving (Ctrl-O, then Return) and exiting Nano (Ctrl-X), use the previous bash command to again run the script with Node.js. This time, you should see an output, but it is not super helpful because the real information is hidden deep within objects and arrays whose contents are not even shown.

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
https://www.terraform.io/docs/providers/google/index.html

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
zone.createVM('api-test-vm', config).then(function(data) {
  const vm = data[0];
  const operation = data[1];
  const apiResponse = data[2];
});
```

Save and exit Nano (Ctrl-O, Return, Ctrl-X), then run your new script:
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

<!-- ------------------------ -->
## Cleanup
Duration: 1

Don't forget to delete your VMs when you are done with the lab. If you want to be able to reference it later, you can stop it instead of deleting it. You will still be charged for storing the disk, but it is a minimal charge compared to leaving a VM running. Of course, the beauty of having scripts is that you could always easily recreate the VMs in a new context!
