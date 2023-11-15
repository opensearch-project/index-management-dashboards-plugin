/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { FieldItem, TRANSFORM_AGG_TYPE, TransformGroupItem } from "../../../../models/interfaces";
import { IntervalType } from "../../../utils/constants";

export const parseTimeunit = (timeunit: string): string => {
  if (timeunit === "ms" || timeunit === "Milliseconds") return "millisecond(s)";
  else if (timeunit === "SECONDS" || timeunit === "s" || timeunit === "Seconds") return "second(s)";
  else if (timeunit === "MINUTES" || timeunit === "m" || timeunit === "Minutes") return "minute(s)";
  else if (timeunit === "HOURS" || timeunit === "h" || timeunit === "Hours") return "hour(s)";
  else if (timeunit === "DAYS" || timeunit === "d" || timeunit === "Days") return "day(s)";
  else if (timeunit === "w") return "week";
  else if (timeunit === "M") return "month";
  else if (timeunit === "q") return "quarter";
  else if (timeunit === "y") return "year";

  return timeunit;
};

// Returns true if field type is numeric
export const isNumericMapping = (fieldType: string | undefined): boolean => {
  return (
    fieldType === "long" ||
    fieldType === "integer" ||
    fieldType === "short" ||
    fieldType === "byte" ||
    fieldType === "double" ||
    fieldType === "float" ||
    fieldType === "half_float" ||
    fieldType === "scaled_float"
  );
};

export const compareFieldItem = (itemA: FieldItem, itemB: FieldItem): boolean => {
  return itemB.label === itemA.label && itemA.type === itemB.type;
};

export const parseFieldOptions = (prefix: string, mappings: any): FieldItem[] => {
  let fieldsOption: FieldItem[] = [];
  for (const field in mappings) {
    if (mappings.hasOwnProperty(field)) {
      if (mappings[field].type !== "object" && mappings[field].type != null && mappings[field].type !== "nested")
        fieldsOption.push({ label: prefix + field, type: mappings[field].type, path: mappings[field].path });
      if (mappings[field].fields != null)
        fieldsOption = fieldsOption.concat(parseFieldOptions(prefix + field + ".", mappings[field].fields));
      if (mappings[field].properties != null)
        fieldsOption = fieldsOption.concat(parseFieldOptions(prefix + field + ".", mappings[field].properties));
    }
  }
  return fieldsOption;
};

export const createdTransformToastMessage = (transformId: string): string => {
  return `Transform job "${transformId}" successfully created.`;
};

/**
 * Searches the stringToSearch for all occurrences of the transformId,
 * and wraps each occurrence with opening and closing quotation marks.
 * @param transformId The string that serves as the transform's job name.
 * @param stringToSearch The string to search.
 * @return The stringToSearch but with any occurrences of transformId wrapped in quotation marks.
 */
export const wrapQuotesAroundTransformId = (transformId: string, stringToSearch: string): string => {
  const regex = new RegExp(transformId, "g");
  const idWrappedWithQuotes = `"${transformId}"`;
  return stringToSearch.replace(regex, idWrappedWithQuotes);
};

export const isGroupBy = (type: string): boolean => {
  return type === TRANSFORM_AGG_TYPE.histogram || type === TRANSFORM_AGG_TYPE.terms || type === TRANSFORM_AGG_TYPE.date_histogram;
};

export const getDateHistogramGroupItem = (
  name: string,
  targetFieldName: string,
  interval: number,
  timeunit: string,
  intervalType: IntervalType
): TransformGroupItem => {
  const dateHistogramInterval = `${interval}${timeunit}`;
  if (intervalType === IntervalType.CALENDAR)
    return {
      date_histogram: {
        source_field: name,
        target_field: targetFieldName,
        calendar_interval: dateHistogramInterval,
      },
    };
  else
    return {
      date_histogram: {
        source_field: name,
        target_field: targetFieldName,
        fixed_interval: dateHistogramInterval,
      },
    };
};
