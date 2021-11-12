/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiSteps } from "@elastic/eui";

interface CreateTransformStepsProps {
  step: number;
}

const setOfSteps = (step: number) => {
  return [
    {
      title: "Set up indices",
      children: null,
    },
    {
      title: "Define transforms",
      children: null,
      status: step < 2 ? "disabled" : null,
    },
    {
      title: "Specify schedule",
      children: null,
      status: step < 3 ? "disabled" : null,
    },
    {
      title: "Review and create",
      children: null,
      status: step < 4 ? "disabled" : null,
    },
  ];
};

const CreateTransformSteps = ({ step }: CreateTransformStepsProps) => (
  <div style={{ paddingLeft: "10px" }}>
    <EuiSteps steps={setOfSteps(step)} headingElement="h6" />
  </div>
);

export default CreateTransformSteps;
