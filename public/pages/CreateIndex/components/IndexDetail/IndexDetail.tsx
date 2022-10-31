/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { EuiSpacer, EuiFormRow, EuiFieldText, EuiFieldNumber, EuiAccordion, EuiLink } from "@elastic/eui";
import { set, get, merge } from "lodash";
import { ContentPanel } from "../../../../components/ContentPanel";
import JSONEditor from "../../../../components/JSONEditor";
import AliasSelect, { AliasSelectProps } from "../AliasSelect";
import IndexMapping from "../IndexMapping";
import { IndexItem, IndexItemRemote } from "../../../../../models/interfaces";
import { ServerResponse } from "../../../../../server/models/types";
import { Ref } from "react";
import { INDEX_DYNAMIC_SETTINGS, IndicesUpdateMode } from "../../../../utils/constants";
import { Modal } from "../../../../components/Modal";
import { transformArrayToObject, transformObjectToArray } from "../IndexMapping/IndexMapping";

export interface IndexDetailProps {
  value?: Partial<IndexItem>;
  oldValue?: Partial<IndexItem>;
  onChange: (value: IndexDetailProps["value"]) => void;
  isEdit?: boolean;
  refreshOptions: AliasSelectProps["refreshOptions"];
  mode?: IndicesUpdateMode;
  onSimulateIndexTemplate?: (indexName: string) => Promise<ServerResponse<IndexItemRemote>>;
}

export interface IIndexDetailRef {
  validate: () => Promise<boolean>;
}

const IndexDetail = (
  { value, onChange, isEdit, oldValue, refreshOptions, mode, onSimulateIndexTemplate }: IndexDetailProps,
  ref: Ref<IIndexDetailRef>
) => {
  const hasEdit = useRef(false);
  const onValueChange = useCallback(
    (name: string, val) => {
      let finalValue = value || {};
      set(finalValue, name, val);
      onChange(finalValue);
      if (name !== "index") {
        hasEdit.current = true;
      }
    },
    [onChange, value]
  );
  const [errors, setErrors] = useState({} as Record<string, string>);
  const finalValue = value || {};
  const indexSettings = get(value, "settings.index");
  const restSettingValue = useMemo(() => {
    const hiddenList = ["number_of_replicas", "number_of_shards"];
    return Object.entries(indexSettings || {}).reduce((total, current) => {
      if (hiddenList.includes(current[0])) {
        return total;
      }
      return {
        ...total,
        [current[0]]: current[1],
      };
    }, {});
  }, [indexSettings]);
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (!value?.index) {
        setErrors({
          index: "Index name can not be null.",
        });
        return Promise.resolve(false);
      }
      setErrors({});
      return Promise.resolve(true);
    },
  }));
  const onIndexInputBlur = useCallback(async () => {
    if (finalValue.index && onSimulateIndexTemplate) {
      const result = await onSimulateIndexTemplate(finalValue.index);
      if (result && result.ok) {
        let onChangePromise: Promise<IndexItemRemote>;
        if (hasEdit.current) {
          onChangePromise = new Promise((resolve) => {
            Modal.show({
              title: "Confirm",
              content: "The index name has matched one or more index templates, please choose which way to go on",
              locale: {
                ok: "Overwrite",
                cancel: "Merge the template",
              },
              type: "confirm",
              onOk: () => resolve(result.response),
              onCancel: () => {
                const formatValue: IndexItemRemote = {
                  index: "",
                  ...finalValue,
                  mappings: {
                    properties: transformArrayToObject(finalValue.mappings?.properties || []),
                  },
                };
                const mergedValue: IndexItemRemote = {
                  index: finalValue.index || "",
                };
                merge(mergedValue, result.response, formatValue);
                resolve(mergedValue);
              },
            });
          });
        } else {
          onChangePromise = Promise.resolve(result.response);
        }
        onChangePromise.then((data) => {
          onChange({
            ...data,
            mappings: {
              properties: transformObjectToArray(data?.mappings?.properties || {}),
            },
          });
          hasEdit.current = false;
        });
      }
    }
  }, [finalValue.index, onSimulateIndexTemplate]);
  return (
    <>
      {isEdit && mode && mode !== IndicesUpdateMode.alias ? null : (
        <>
          <ContentPanel title="Define index" titleSize="s">
            <div style={{ paddingLeft: "10px" }}>
              <EuiFormRow
                label="Index name"
                helpText="Some reestrictrion text on domain"
                isInvalid={!!errors["index"]}
                error={errors["index"]}
              >
                <EuiFieldText
                  placeholder="Please enter the name for your index"
                  value={finalValue.index}
                  onChange={(e) => onValueChange("index", e.target.value)}
                  onBlur={onIndexInputBlur}
                  disabled={isEdit}
                />
              </EuiFormRow>
              <EuiFormRow label="Index alias  - optional" helpText="Select existing aliases or specify a new alias">
                <AliasSelect
                  refreshOptions={refreshOptions}
                  value={finalValue.aliases}
                  onChange={(value) => onValueChange("aliases", value)}
                />
              </EuiFormRow>
            </div>
          </ContentPanel>
          <EuiSpacer />
        </>
      )}
      {isEdit && mode && mode !== IndicesUpdateMode.settings ? null : (
        <>
          <ContentPanel title="Index settings" titleSize="s">
            <div style={{ paddingLeft: "10px" }}>
              <EuiFormRow label="Number of shards" helpText="The number of primary shards in the index. Default is 1.">
                <EuiFieldNumber
                  disabled={isEdit && !INDEX_DYNAMIC_SETTINGS.includes("index.number_of_shards")}
                  placeholder="The number of primary shards in the index. Default is 1."
                  value={finalValue?.settings?.index?.number_of_shards}
                  onChange={(e) => onValueChange("settings.index.number_of_shards", e.target.value)}
                />
              </EuiFormRow>
              <EuiFormRow label="Number of replicas" helpText="The number of replica shards each primary shard should have.">
                <EuiFieldNumber
                  disabled={isEdit && !INDEX_DYNAMIC_SETTINGS.includes("index.number_of_replicas")}
                  placeholder="The number of replica shards each primary shard should have."
                  value={finalValue?.settings?.index?.number_of_replicas}
                  onChange={(e) => onValueChange("settings.index.number_of_replicas", e.target.value)}
                />
              </EuiFormRow>
              <EuiSpacer size="m" />
              <EuiAccordion id="accordion_for_create_index_settings" buttonContent={<h4>Advanced settings</h4>}>
                <EuiSpacer size="m" />
                <EuiFormRow
                  label="Specify advanced index settings"
                  helpText={
                    <>
                      Specify a comma-delimited list of settings.
                      <EuiLink
                        href="https://opensearch.org/docs/latest/opensearch/rest-api/index-apis/create-index/#index-settings"
                        target="_blank"
                      >
                        View index settings
                      </EuiLink>
                    </>
                  }
                >
                  <JSONEditor
                    value={JSON.stringify(restSettingValue)}
                    onChange={(val: string) =>
                      onValueChange("settings.index", {
                        ...get(value, "settings.index"),
                        ...JSON.parse(val),
                      })
                    }
                  />
                </EuiFormRow>
              </EuiAccordion>
            </div>
          </ContentPanel>
          <EuiSpacer />
        </>
      )}
      {isEdit && mode && mode !== IndicesUpdateMode.mappings ? null : (
        <ContentPanel title="Index mappings - optional" titleSize="s">
          <div style={{ paddingLeft: "10px" }}>
            <EuiFormRow fullWidth>
              <IndexMapping
                isEdit={isEdit}
                value={finalValue?.mappings?.properties}
                oldValue={oldValue?.mappings?.properties}
                onChange={(val) => onValueChange("mappings.properties", val)}
              />
            </EuiFormRow>
          </div>
        </ContentPanel>
      )}
    </>
  );
};

// @ts-ignore
export default forwardRef(IndexDetail);
