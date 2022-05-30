/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import moment from "moment";

export const renderTimestampSecond = (time: number): string => {
  console.log(`render time: ${time}`);
  const momentTime = moment.unix(time).local();
  console.log(`render time: ${momentTime}`);
  if (time && momentTime.isValid()) return momentTime.format("MM/DD/YY h:mm a");
  return "-";
};
