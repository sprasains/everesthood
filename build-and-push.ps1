# PowerShell script to build and push Docker image to Artifact Registry
$env:IMAGE_TAG = "us-west1-docker.pkg.dev/delta-trees-463916-v1/everesthood-repo/everesthood-app:latest"

docker build -t $env:IMAGE_TAG .

docker push $env:IMAGE_TAG
