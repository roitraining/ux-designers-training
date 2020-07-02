const {google} = require('googleapis');
const compute = google.compute('v1');

async function listVMs() {
  const authClient = await google.auth.getClient({
    scopes: [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/compute',
      'https://www.googleapis.com/auth/compute.readonly',
    ],
  });

  const projectId = await google.auth.getProjectId();
  const result = await compute.instances.aggregatedList({
    auth: authClient,
    project: projectId,
  });
  const vms = result.data;
  console.log('us-central1-a VMs:', vms.items['zones/us-central1-a'].instances);
}

listVMs()
