#!/bin/bash
# Shell script to build and push Docker image to Artifact Registry

IMAGE_TAG="us-west1-docker.pkg.dev/delta-trees-463916-v1/everesthood-repo/everesthood-app:latest"

echo "Building Docker image: $IMAGE_TAG"
docker build -t $IMAGE_TAG .

echo "Pushing Docker image: $IMAGE_TAG"
docker push $IMAGE_TAG 