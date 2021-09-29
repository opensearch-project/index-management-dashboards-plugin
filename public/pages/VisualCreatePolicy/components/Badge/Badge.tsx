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
