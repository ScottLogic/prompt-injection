#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import "source-map-support/register";

import {
  appName,
  resourceDescription,
  stackName,
  stageName,
  ApiStack,
} from "../lib";

const app = new App();
const tags = {
  Project: appName,
  App: appName,
  Environment: stageName(app).toUpperCase(),
  IaC: "CDK",
};

const generateStackName = stackName(app);
const generateDescription = resourceDescription(app);

new ApiStack(app, generateStackName("api"), {
  tags,
  description: generateDescription("API stack"),
});
