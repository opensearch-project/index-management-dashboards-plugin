/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiText, EuiNotificationBadge, EuiTextColor } from "@elastic/eui";

interface BadgeProps {
  text: string;
  number: number;
  color?: "subdued" | "accent" | undefined;
}

const Badge = ({ text, number, color = "subdued" }: BadgeProps) => (
  <EuiText size="xs" textAlign="center">
    <EuiTextColor color={color}>
      <p>
        {text}{" "}
        <EuiNotificationBadge size="s" color={color}>
          {number}
        </EuiNotificationBadge>
      </p>
    </EuiTextColor>
  </EuiText>
);

export default Badge;
