#!/bin/sh
aws s3 cp s3://demo-lambda-cdk-json/cdk.json ./
# aws s3 cp s3://fido-configs/env-dev/env ./.env
ls -la
npm i
npm i --prefix lambda-layer/node-utils lambda-layer/node-utils/
npm run build
npx cdk synth
# cd lambda-layer/node-utils
# npm run migrate
