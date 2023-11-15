/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { EuiFormRowProps } from "@elastic/eui";
import { merge, isEmpty } from "lodash";
import { FieldInstance, transformNameToString } from "../../lib/field";
import { IFormGeneratorRef } from "../../components/FormGenerator";
import { IndexForm } from "../../containers/IndexForm";
import { IRolloverRequestBody } from "./interface";
import { IndexItemRemote } from "../../../models/interfaces";
import { BrowserServices } from "../../models/interfaces";
import { Alias } from "../../../server/models/interfaces";
import { ServerResponse } from "../../../server/models/types";

export type TypeSourceType = "dataStreams" | "alias" | undefined;

export const getCommonFormRowProps = (name: string | string[], field: FieldInstance): Partial<EuiFormRowProps> => {
  return {
    isInvalid: !!field.getError(name),
    error: field.getError(name),
    "data-test-subj": `form-row-${transformNameToString(name)}`,
  };
};

export const onSubmit = async (props: {
  sourceRef: React.RefObject<IFormGeneratorRef>;
  sourceType: TypeSourceType;
  writingIndex: string;
  indexFormRef: React.RefObject<IndexForm>;
  tempValue: IRolloverRequestBody;
  services: BrowserServices;
}): Promise<
  ServerResponse<{
    new_index: string;
  }>
> => {
  const { sourceRef, sourceType, writingIndex, indexFormRef, tempValue, services } = props;
  const formGeneratersRes = await Promise.all([
    sourceRef.current?.validatePromise(),
    sourceType === "alias" && !writingIndex.match(/^.*-\d+$/)
      ? (new Promise(async (resolve) => {
          const result = await indexFormRef.current?.validate();
          if (result) {
            resolve({ errors: { targetIndex: [result] }, values: {} });
          } else {
            resolve({
              errors: null,
              values: {
                targetIndex: indexFormRef.current?.getValue() || {},
              },
            });
          }
        }) as Promise<{ errors: Record<string, string[]> | null; values: Record<string, any> }>)
      : Promise.resolve({
          errors: null,
          values: {
            targetIndex: indexFormRef.current?.getValue() || {},
          },
        }),
  ]);
  const hasError = formGeneratersRes.some((item) => item?.errors);
  if (hasError) {
    return {
      ok: false,
      error: "Some fields does not pass validation, please check fields with red underline.",
    };
  }

  const finalValues: IRolloverRequestBody = merge({}, tempValue);
  formGeneratersRes.forEach((item) => merge(finalValues, item?.values));

  const payload: {
    alias: string;
    newIndex?: string;
    body: Omit<IndexItemRemote, "index"> & { conditions?: IRolloverRequestBody["conditions"] };
  } = {
    alias: finalValues.source || "",
    body: {},
  };

  if (sourceType === "alias" && !isEmpty(finalValues.targetIndex || {})) {
    const { index, ...others } = (finalValues.targetIndex || {}) as IndexItemRemote;
    if (index) {
      payload.newIndex = index;
    }
    payload.body = others;
  }

  const result = await services.commonService.apiCaller<{
    new_index: string;
  }>({
    endpoint: "indices.rollover",
    data: payload,
  });

  return result;
};

export const submitWriteIndex = async (props: {
  services: BrowserServices;
  writeIndexValue: string;
  sourceRef: React.RefObject<IFormGeneratorRef>;
}) => {
  const { services, writeIndexValue, sourceRef } = props;
  return await services.commonService.apiCaller({
    endpoint: "indices.updateAliases",
    data: {
      body: {
        actions: [
          {
            add: {
              index: writeIndexValue,
              alias: sourceRef.current?.getValue("source"),
              is_write_index: true,
            },
          },
        ],
      },
    },
  });
};

export const getOptions = async (props: { services: BrowserServices }) => {
  const { services } = props;
  return Promise.all([
    services.commonService.apiCaller<Alias[]>({
      endpoint: "cat.aliases",
      data: {
        format: "json",
      },
    }),
    services.indexService.getDataStreams({}),
  ]).then(([aliases, dataStreams]) => {
    if (aliases.ok && dataStreams.ok) {
      const allAlias: Array<{ label: string; aliases: Alias[] }> = [];
      aliases.response.forEach((item) => {
        let findIndex;
        if (allAlias.find((alias) => alias.label === item.alias)) {
          findIndex = allAlias.findIndex((alias) => alias.label === item.alias);
        } else {
          findIndex = allAlias.length;
          allAlias.push({
            label: item.alias,
            aliases: [],
          });
        }
        allAlias[findIndex].aliases.push(item);
      });
      return {
        ok: true,
        response: {
          alias: allAlias,
          dataStreams: dataStreams.response?.dataStreams.map((item) => ({ label: item.name })) || [],
        },
      };
    }

    return {
      ok: false,
      error: aliases.error || dataStreams.error,
    };
  });
};

export const getRolloveredIndex = async (props: { alias: string; services: BrowserServices }): Promise<ServerResponse<string>> => {
  const { alias, services } = props;
  const result = await services.commonService.apiCaller<{
    new_index: string;
  }>({
    endpoint: "indices.rollover",
    data: {
      alias,
      dry_run: true,
    },
    hideLog: true,
  });
  if (result.ok) {
    return {
      ok: true,
      response: result.response.new_index,
    };
  } else if (result && result.body && result.body.error && result.body.error.index) {
    return {
      ok: true,
      response: result.body.error.index,
    };
  }

  return {
    ok: false,
    error: result.error,
  };
};

export const getIndexDetail = async ({
  services,
  indexName,
  newIndexName,
}: {
  services: BrowserServices;
  indexName: string;
  newIndexName: string;
}) => {
  const response = await services.commonService.apiCaller<Record<string, IndexItemRemote>>({
    endpoint: "indices.get",
    data: {
      index: indexName,
      flat_settings: true,
    },
  });
  if (response.ok) {
    return {
      ...response.response[indexName],
      index: newIndexName,
    };
  }

  throw new Error(response.error);
};
