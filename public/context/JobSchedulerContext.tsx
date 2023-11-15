/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { JobScheduler } from "../lib/JobScheduler";

const jobSchedulerInstance = new JobScheduler({
  callbacks: [],
});

jobSchedulerInstance.init();

export { jobSchedulerInstance };

export const JobSchedulerContext = React.createContext(jobSchedulerInstance);
