/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from "react";
import { EuiText } from "@elastic/eui";
import { Transition } from "../../../../../models/interfaces";
import { getConditionContent } from "../../utils/helpers";

interface TransitionContentProps {
  transition: Transition;
}

const TransitionContent = ({ transition }: TransitionContentProps) => (
  <EuiText>
    <dl>
      <dt>Destination state</dt>
      <dd>{transition.state_name}</dd>
      <dt>Transition trigger logic</dt>
      <dd>{getConditionContent(transition)}</dd>
    </dl>
  </EuiText>
);

export default TransitionContent;
