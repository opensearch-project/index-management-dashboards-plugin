import { EuiFormRowProps } from "@elastic/eui";
import { flatten } from "flat";
import { get, set } from "lodash";
import { FieldInstance, transformNameToString } from "../../lib/field";
import { TemplateItem } from "./interface";
import { transformObjectToArray } from "../../components/IndexMapping";
import { filterByMinimatch } from "../../../utils/helper";

export const getCommonFormRowProps = (name: string | string[], field: FieldInstance): Partial<EuiFormRowProps> => {
  return {
    isInvalid: !!field.getError(name),
    error: field.getError(name),
    "data-test-subj": `form-row-${transformNameToString(name)}`,
  };
};

export const setMatchedTemplate = ({ matchedTemplate, field }: { matchedTemplate: TemplateItem; field: FieldInstance }) => {
  const payload = {
    matchedTemplate: matchedTemplate.name,
    template: JSON.parse(
      JSON.stringify({
        ...matchedTemplate.index_template.template,
        settings: flatten(matchedTemplate.index_template.template.settings || {}),
      })
    ),
  };

  set(payload, "template.mappings.properties", transformObjectToArray(get(payload, "template.mappings.properties", {})));

  field.setValues(payload);
};

export const getStringBeforeStar = (string: string) => string.replace(/^([^*]*).*$/, "$1");

export const findPatternMatchesString = (value: string, template: TemplateItem) => {
  const { index_patterns } = template.index_template;
  // matched by wildcard
  const findMatchesPattern = index_patterns.find((item) => filterByMinimatch(value, [item]));
  // matched by letters
  const findWordLikePattern = index_patterns.find((item) => item.match(new RegExp(value, "i")));
  // exactly the same
  const findStringPattern = index_patterns.find((item) => item === value);

  return {
    findMatchesPattern,
    findWordLikePattern,
    findStringPattern,
  };
};
