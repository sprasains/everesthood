@echo off
REM Batch script to build and push Docker image to Artifact Registry
set IMAGE_TAG=us-west1-docker.pkg.dev/delta-trees-463916-v1/everesthood-repo/everesthood-app:latest

docker build -t %IMAGE_TAG% .

docker push %IMAGE_TAG%
