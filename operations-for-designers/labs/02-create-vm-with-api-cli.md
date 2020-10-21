summary: Create and List VMs with the CLI and API
id: create-vm-api-cli
categories: Operations for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Create and List VMs with the CLI and API
<!-- ------------------------ -->
## Overview
Duration: 1

### In this lab, you will:

- Create and list VMs with Google's CLI
- Install and configure NPM
- Write code to create and list VMs using the Node.js API

<!-- ------------------------ -->
## Creating and listing VMs by CLI
Duration: 3

### Creating a VM by CLI

1. Log in to the Google Cloud trial project you created for this course and open Cloud Shell. Cloud Shell already has the Google Cloud SDK installed.

2. Use `gcloud` to create a new VM in Compute Engine named `cli-example-vm`.

``` bash
gcloud compute instances create cli-example-vm --zone=us-central1-a
```

### Listing VMs by CLI

1. After a minute or two, you should see your VM when listing VMs with the following command:

``` bash
gcloud compute instances list
```

### Documentation
gcloud documentation:
[https://cloud.google.com/sdk/gcloud/reference/compute/instances/create](https://cloud.google.com/sdk/gcloud/reference/compute/instances/create).

Compute Engine documentation:
[https://cloud.google.com/compute/docs/instances/create-start-instance#startinstancegcloud](https://cloud.google.com/compute/docs/instances/create-start-instance#startinstancegcloud).

<!-- ------------------------ -->
## Configuring NPM
Duration: 5

### Setting up your working directory

1. In Cloud Shell, create a working directory, and change into it:

``` bash
mkdir infra-scripts
cd infra-scripts
```

**Tip:**<br>
When referencing an existing file or folder in bash, you can "tab-complete" to avoid typing the entire thing. Type enough characters to be unique, then press the **TAB** key. If there are multiple items that start with those characters, the options will be displayed on the screen for you so you can complete enough characters, and then press **TAB** again.

### What's NPM?

NPM is the primary tool used with Node.js to install packages, run scripts, and more. It used to mean Node Package Manager, but like the artist formerly known as Prince, the NPM team didn't feel that adequately expressed their true nature. It no longer stands for anything in particular.

Since Cloud Shell comes with gcloud installed and configured, and Node.js and NPM installed, we can jump right to using NPM.

### `init` NPM and installing client libraries

1. To get started with NPM, `init` your current directory as an NPM project. Remember, this creates the `package.json`, a Node.js information and dependencies file. Feel free to accept the defaults.

``` bash
npm init
```

2. Next, use NPM to add a couple of Google Cloud client libraries to the application dependency list. This will also install all the dependencies into the node-modules folder.

``` bash
npm install @google-cloud/compute
npm install googleapis
```

<!-- ------------------------ -->
## Listing VMs with the API
Duration: 20

### Creating a list VMs script

1. Let's use the Compute Engine API to list the VMs, like we did earlier with the CLI. Create a file named `list-vms.js` and open it for editing.

``` bash
touch list-vms.js
edit list-vms.js
```

2. While leaving that file open and ready to paste in to, in a different browser tab review this page:
[https://cloud.google.com/compute/docs/tutorials/nodejs-guide](https://cloud.google.com/compute/docs/tutorials/nodejs-guide). There are a number of examples in this file.

3. Use the **Listing Instances** link to jump to the bottom of the guide.

4. Locate **The complete example** at the very bottom, and copy the example's code. Paste the copied code into the Cloud Shell editor, into `list-vms.js`.

### Try running your script

1. In the Cloud Shell terminal window, run the script. (**Hint:** It isn't working quite right yet.) 

``` bash
node list-vms.js
```

### Troubleshooting and improving your script

1. The script actually works fine, but it's missing a call to actually execute it. In the editor, scroll to the very bottom of the file and after the final `}`, call the function.

``` javascript
listVMs();
```

2. Re-execute the application. This time, you should see an output, but it includes a list of VMs by region, and thus includes a lot of un-needed information.

``` bash
node list-vms.js
```

3. To make the returned information more useful, edit the script again. This time, let's clean up the output a bit.

Before:

``` javascript
  const vms = result.data;
  console.log('VMs:', vms);
```

After:

``` javascript
  //Just load the us-central1-a vms
  const vms = result.data.items['zones/us-central1-a'].instances;  
  //Count them
  const instanceCount = vms.length;
  console.log(`VM instance count: ${instanceCount}. Their names: `);
  //Loop through and print the names of each
  vms.forEach(vm => {
    console.log(vm.name);
  });
```

**Note:**<br>
If you chose to change the zone where the VMs were created earlier in the labs, then you'll have to change the zone here also.

4. Save the change and execute again. The output should be much cleaner.

### Pain point!

Especially when getting started, documentation fails to produce the desired results. It can be extremely frustrating, especially in a proof of concept where devs, devops, and ops are all evaluating a platform to see if they can trust it.

Remember that to many modern IT folks, the real "GUI" is actually this documentation and these tutorials. This is the literal visual interface they use when trying to use the platform via API or CLI. If they were using an orchestration tool like Terraform, then they would use this documentation:
https://www.terraform.io/docs/providers/google/index.html.

<!-- ------------------------ -->
## Creating a VM with the API
Duration: 10

### Writing and running a script that creates a VM

1. Create a new JavaScript file and open it in the Cloud Shell editor:

``` bash
touch create-vm.js
edit create-vm.js
```

2. Into the new script file, paste in the following JavaScript. It should create a new VM named `api-test-vm`.

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

3. Save and execute the new script.

``` bash
node create-vm.js
```

4. The script kicks off the creation process, but it doesn't wait for the VM creation to complete. Give it a minute or two, then run your list script to see the new VM.

``` bash
node list-vms.js
```

5. List the VMs with the CLI as well:

``` bash
gcloud compute instances list
```

Note that our simple scripts to create and list VMs are not really more useful than the built-in gcloud CLI commands. They are just simple examples. In the real world, you'd likely use the CLI for simple commands like this, and the API for complex custom interactions. Or even more likely than both, all major infrastructure would be managed with an orchestration tool like Terraform or Deployment Manager.

### Pain point!
I could not reasonably have you use [the documentation](https://googleapis.dev/nodejs/compute/latest/VM.html#create-examples) because the sample script there required too much modification. The createVM [example](https://googleapis.dev/nodejs/compute/latest/Zone.html#createVM-examples) under Zone was closer to being directly usable, but still required some strange modification.

Most developers would be able to quickly parse the code and figure out how to properly modify it. But to a new or impatient developer it could be very frustrating, and is in general a common frustration.
