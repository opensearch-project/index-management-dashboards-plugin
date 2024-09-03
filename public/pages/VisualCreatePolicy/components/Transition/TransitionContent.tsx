/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiText } from "@elastic/eui";
import { Transition } from "../../../../../models/interfaces";
import { getConditionContent } from "../../utils/helpers";

interface TransitionContentProps {
  transition: Transition;
}

const TransitionContent = ({ transition }: TransitionContentProps) => (
  <EuiText size="s">
    <dl>
      <dt>Destination state</dt>
      <dd>{transition.state_name}</dd>
      <dt>Transition trigger logic</dt>
      <dd>{getConditionContent(transition)}</dd>
    </dl>
  </EuiText>
);

export default TransitionContent;
