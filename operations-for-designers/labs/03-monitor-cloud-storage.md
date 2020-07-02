summary: Monitor Cloud Storage
id: monitor-cloud-storage
categories: Operations for UXers
tags: Google Cloud
status: Draft
authors: Jordan Hart
Feedback Link: https://docs.google.com/forms/d/e/1FAIpQLSdakXkk5FhNFFFRnda391WO8-__5eUreZE7EcgqawcjJLaiQQ/viewform

# Monitor Cloud Storage
<!-- ------------------------ -->
## Interacting with Cloud Storage
Duration: 20

### Naming a Bucket
Bucket names on Cloud Storage must be globally unique among all users. Therefore, you must choose your bucket name and replace "[BUCKET_NAME]" with the name of your choice.

Here is the documentation on [Bucket and object naming guidelines](https://cloud.google.com/storage/docs/naming).

### Create a Bucket
Open Cloud Shell and run the following command:
``` bash
gsutil mb gs://[BUCKET_NAME]/
```
[documentation](https://cloud.google.com/storage/docs/creating-buckets#storage-create-bucket-gsutil)

**Notes:**
1. While almost all Google Cloud CLI interaction is done through gcloud, a few products, including Cloud Storage, use a separate CLI, in this case gsutil.
2. mb stands for make bucket.

### Put a File on the Bucket
Move into the directory of your choice. You can use the ls command to see the contents of the current directory, and cd to move into a directory. cd.. will move you up one level.

Create a file and edit it with Nano:
``` bash
touch sample-file.txt
nano sample-file.txt
```

Enter whatever text you would like into Nano, then save and close the file (Ctrl-O, Return, Ctrl-X).

Move the file to Cloud Storage (remember to substitute in your Bucket's name):
``` bash
gsutil cp sample-file.txt gs://[BUCKET_NAME]
```
[documentation](https://cloud.google.com/storage/docs/gsutil/commands/cp)

### View the File on Cloud Storage
To display the contexts of a text file in bash, you use the cat command. Try it now:
``` bash
cat sample-file.txt
```

That displays your local copy of the file. Edit the file with Nano, change some text, and then cat it again to see the change.

Now use the gsutil version of cat to display the contents of the remote version of the file that's on Cloud Storage:
``` bash
gsutil cat gs://[BUCKET_NAME]/sample-file.txt
```

Notice that is the old version of the file. Technically, objects on Cloud Storage are immutable (not able to be changed), however, they can be replaced. Run your copy command again and you replace the remote version with your local version (or vice versa if you prefer).

Replace remote copy with the local copy:
``` bash
gsutil cp sample-file.txt gs://[BUCKET_NAME]
```

Replace local copy with the remote one:
``` bash
gsutil cp gs://[BUCKET_NAME] sample-file.txt
```

Use cat (both your local bash version, as well as the gsutil version) to see that the changes happened correctly.

**Notes:**
1. The cp command takes first a source, then a destination. That's why reversing the order of the command changed whether the remote was replaced by the local or vice versa.
2. These commands are intentionally similar to bash; they feel very natural to anyone familiar with bash.
3. You can also use the GUI to explore the objects and even view their contents.

## Cloud Storage Logging and Monitoring
Duration: 15

### Logging
Go to **Logging** and see the entry for bucket creation. Twirl down for details, and click **Expand all** to see all the information.

### Monitoring
Go to **Monitoring** and **Metrics Explorer**, search GCS and look at some of the available metrics.

### Pain Point!
Notice that Bytes Sent and Bytes Received works right away, but Total Bytes shows up empty! This confounded me for a bit until I found this in the [documentation](https://cloud.google.com/storage/docs/getting-bucket-information):
"Note: Cloud Monitoring measures bucket size once a day. To measure bucket size at a given moment, use gsutil instead."

### Total Size via gsutil
Run the gsutil command to get total size of a bucket:
``` bash
gsutil du -s gs://[BUCKET_NAME]
```

The results come back as an integer with a number of bytes. Divide by 1024 to get the number of KB, then divide again by 1024 to get the number of MB.

### How to Alert Runaway GCS Bucket Size
Consider how a company would get alerts if their GCS usage was spiking. They could put a Monitoring alert on total size, but the results would only be updated once a day.

If you needed more real-time data, you could do Bytes Received. But what if many files were written and deleted? Actual total storage cost might not be high. You could run a chron job that checked every x minutes with gsutil and reported a custom metric on total size.

## Cleanup
Duration: 1

Delete any files you uploaded that you no longer need. Optionally, you may delete the bucket itself. Though as a serverless product, GCS does not charge for just having an empty bucket, rather you are charged for storage and transfer.
