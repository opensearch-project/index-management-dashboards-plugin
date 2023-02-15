import { EuiFormRowProps } from "@elastic/eui";
import { flatten } from "flat";
import { get, set } from "lodash";
import { FieldInstance, transformNameToString } from "../../lib/field";
import { TemplateItem } from "./interface";
import { transformObjectToArray } from "../../components/IndexMapping";

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
    template: {
      ...matchedTemplate.index_template.template,
      settings: flatten(matchedTemplate.index_template.template.settings || {}),
    },
  };

  set(payload, "template.mappings.properties", transformObjectToArray(get(payload, "template.mappings.properties", {})));

  field.setValues(payload);
};

export const getStringBeforeStar = (string: string) => string.replace(/^([^*]*).*$/, "$1");
