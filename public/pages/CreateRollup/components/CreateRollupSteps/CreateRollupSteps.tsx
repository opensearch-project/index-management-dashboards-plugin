/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { EuiSteps } from "@elastic/eui";

interface CreateRollupStepsProps {
  step: number;
}

const setOfSteps = (step: number) => {
  return [
    {
      title: "Set up indices",
      children: <></>,
    },
    {
      title: "Define aggregations and metrics",
      children: <></>,
      status: step < 2 ? "disabled" : null,
    },
    {
      title: "Specify schedule",
      children: <></>,
      status: step < 3 ? "disabled" : null,
    },
    {
      title: "Review and create",
      children: <></>,
      status: step < 4 ? "disabled" : null,
    },
  ];
};
const CreateRollupSteps = ({ step }: CreateRollupStepsProps) => (
  <div style={{ paddingLeft: "10px" }}>
    <EuiSteps steps={setOfSteps(step)} headingElement="h6" />
  </div>
);

export default CreateRollupSteps;
