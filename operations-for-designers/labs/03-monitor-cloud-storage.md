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

Bucket names in Cloud Storage must be globally unique (as opposed to org or project). Take a peak at the [Bucket and object naming guidelines](https://cloud.google.com/storage/docs/naming).

### Create a Bucket

1. Come up with a name you think will be globally unique and store it in a Cloud Shell environmental variable named BUCKET_NAME.

``` bash
BUCKET_NAME=your-cool-unique-name-here
echo $BUCKET_NAME
```

Use **gsutil** to create a new bucket using your chosen name. If this step fails with a name already exists error, choose a new name.

``` bash
gsutil mb gs://$BUCKET_NAME/
```

[documentation](https://cloud.google.com/storage/docs/creating-buckets#storage-create-bucket-gsutil)

**Notes:**

- While almost all Google Cloud CLI interaction is done through gcloud, a few products, including Cloud Storage, use a separate CLI, in this case gsutil.
- `mb` stands for make bucket.

### Put a File in the Bucket

In Cloud Shell, move into your infra-scripts folder, where we created the scripts in the last exercise. If you don't have that folder, it's fine to use any folder and simply create a sample file to upload.

Copy the **list-vms.js** file (or another file of your choosing) to your new bucket.

``` bash
gsutil cp list-vms.js gs://$BUCKET_NAME
```

[documentation](https://cloud.google.com/storage/docs/gsutil/commands/cp)

### View the File from Cloud Storage

1. To display the contexts of a text file in bash, you use the cat command. Try it now:

``` bash
cat list-vms.js
```

1. Now use the `gsutil` version of cat to display the contents of the remote version of the same file from Cloud Storage:

``` bash
gsutil cat gs://$BUCKET_NAME/list-vms.js
```

1. Delete the local version of `list-vms.js`, then download a copy from Cloud Storage.

``` bash
rm list-vms.js
gsutil cp gs://$BUCKET_NAME/list-vms.js .
ls
```

**Notes:**

- The cp command takes first a source, then a destination. That's why reversing the order of the command changed whether the remote was replaced by the local or vice versa.
- These commands are intentionally similar to bash; they feel very natural to anyone familiar with bash.
- You can also use the GUI to explore the objects and even view their contents.

## Cloud Storage Logging and Monitoring
Duration: 15

### Logging

1. In the Google Cloud Console, use the **Navigation menu** to navigate to **Logging**.

1. Just above the log query window, use the **Log name** drop menu to select the **Cloud Audit | activity** log. Make sure to **Add** it to the query. **Run Query**.

1. In the `Log fields` list, select ***GCS Bucket** to further filter the results to only display Admin Activity logs (who did what, when?) for Google Cloud Storage.

1. In the `Query results` window, expand the entry(ies) and find the one where you (check protoPayload.authenticationInfo.principalEmail) created (protoPayload.methodName) your bucket, and it's name (protoPayload.resourceName).

Hint: Expanding the entry and then clicking **Expanded nested fields** may simplify your search.

### Monitoring

1. Use the **Navigation menu** to navigate to **Monitoring**. If needed, wait while Google creates the Monitoring Workspace. Then navigate to **Metrics Explorer**

1. In the query builder, set the resource type to **GCS Bucket**.

1. Scroll through the list of presented metrics. Take a look at a few, like **Sent bytes** and **Request count**.

1. What happens if you view the **Object count** or **Total bytes** metric? Mouse over the metric and read the documentation. Notice that it's only calculated once a day, so we don't have a value at this point.

For reference, check the [documentation](https://cloud.google.com/storage/docs/getting-bucket-information)

### Total Size via gsutil

1. In Cloud Shell, use `gsutil` to get total size of your bucket:

``` bash
gsutil du -s gs://$BUCKET_NAME
```

### How to Alert Runaway GCS Bucket Size
Consider how a company would get alerts if their GCS usage was spiking. They could put a Monitoring alert on total size, but the results would only be updated once a day.

If you needed more real-time data, you could do Bytes Received. But what if many files were written and deleted? Actual total storage cost might not be high. You could run a chron job that checked every x minutes with gsutil and reported a custom metric on total size.

