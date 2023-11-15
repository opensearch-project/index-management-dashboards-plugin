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
