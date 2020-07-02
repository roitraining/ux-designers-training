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
