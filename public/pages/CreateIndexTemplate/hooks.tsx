/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiFormRowProps } from "@elastic/eui";
import { FieldInstance, transformNameToString } from "../../lib/field";

export const getCommonFormRowProps = (name: string | string[], field: FieldInstance): Partial<EuiFormRowProps> => {
  return {
    isInvalid: !!field.getError(name),
    error: field.getError(name),
    "data-test-subj": `form-row-${transformNameToString(name)}`,
  };
};
