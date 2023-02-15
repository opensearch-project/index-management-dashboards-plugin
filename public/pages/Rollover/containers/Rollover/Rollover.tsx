/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { merge } from "lodash";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import IndexFormWrapper, { IndexForm } from "../../../../containers/IndexForm";
import { EuiButton, EuiButtonEmpty, EuiCallOut, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from "@elastic/eui";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ContentPanel } from "../../../../components/ContentPanel";
import FormGenerator, { AllBuiltInComponents, IFormGeneratorRef } from "../../../../components/FormGenerator";
import { Alias } from "../../../../../server/models/interfaces";
import { IndexItem } from "../../../../../models/interfaces";
import useField from "../../../../lib/field";
import { getOptions, onSubmit, submitWriteIndex } from "../../hooks";

export interface RolloverProps extends RouteComponentProps<{ source?: string }> {}

export interface IRolloverRequestBody {
  source?: string;
  targetIndex?: IndexItem;
  conditions?: {
    max_age?: string;
    max_docs?: number;
    max_size?: string;
    max_primary_shard_size?: string;
  };
}

export default function Rollover(props: RolloverProps) {
  const [options, setOptions] = useState<{
    alias: { label: string; aliases: Alias[] }[];
    dataStreams: { label: string }[];
  }>({
    alias: [],
    dataStreams: [],
  });
  const coreService = useContext(CoreServicesContext);
  const services = useContext(ServicesContext) as BrowserServices;
  const sourceRef = useRef<IFormGeneratorRef>(null);
  const indexFormRef = useRef<IndexForm>(null);
  const [tempValue, setValue] = useState<IRolloverRequestBody>({
    source: props.match.params.source,
  });
  const [loading, setIsLoading] = useState(false);
  const [writeIndexValue, setWriteIndexValue] = useState<string>("");
  const field = useField({
    values: {
      targetIndex: {
        settings: {
          "index.number_of_shards": 1,
          "index.number_of_replicas": 1,
          "index.refresh_interval": "1s",
        },
      },
    },
  });

  const onChange = (val?: Record<string, any>) => {
    const finalResult = merge({}, tempValue, val);
    setValue(finalResult);
  };

  const refreshOptions = async () => {
    const result = await getOptions({
      services,
    });
    if (result.ok) {
      setOptions(
        result.response || {
          alias: [],
          dataStreams: [],
        }
      );
    } else {
      coreService?.notifications.toasts.addDanger(result.error || "");
    }
  };

  useEffect(() => {
    coreService?.chrome.setBreadcrumbs([
      BREADCRUMBS.INDEX_MANAGEMENT,
      {
        ...BREADCRUMBS.ROLLOVER,
        href: `#${props.location.pathname}`,
      },
    ]);
    refreshOptions();
  }, []);

  const sourceOptions = useMemo(() => {
    return [
      {
        label: "aliases",
        options: options.alias,
      },
      {
        label: "data streams",
        options: options.dataStreams,
      },
    ];
  }, [options]);

  const initialValue = useMemo(() => {
    return {
      source: props.match.params.source,
    };
  }, [props.match.params.source]);

  const sourceType: "dataStreams" | "alias" | undefined = useMemo(() => {
    const sourceValue = sourceRef.current?.getValue("source");
    if (options.alias.find((item) => item.label === sourceValue)) {
      return "alias";
    }

    if (options.dataStreams.find((item) => item.label === sourceValue)) {
      return "dataStreams";
    }

    return;
  }, [sourceRef.current?.getValue("source")]);

  const writingIndex = (() => {
    const findItem = options.alias.find((item) => item.label === sourceRef.current?.getValue("source"));
    let writeIndex = "";
    if (findItem) {
      if (findItem.aliases.length > 1) {
        // has to check if it has write_index
        if (findItem.aliases.some((item) => item.is_write_index === "true")) {
          const indexItem = findItem.aliases.find((item) => item.is_write_index === "true");
          writeIndex = indexItem?.index || "";
        }
      } else {
        writeIndex = findItem.aliases[0].index;
      }
    }

    return writeIndex;
  })();

  useEffect(() => {}, [writingIndex]);

  const reasons = useMemo(() => {
    let result: React.ReactChild[] = [];
    if (sourceType === "alias") {
      const findItem = options.alias.find((item) => item.label === sourceRef.current?.getValue("source"));
      if (!writingIndex) {
        result.push(
          <>
            <EuiFlexGroup alignItems="flexEnd">
              <EuiFlexItem grow={false}>
                Assign a write index from this alias before performing rollover.
                <EuiSpacer size="s" />
                <CustomFormRow label="Select an index from this alias">
                  <AllBuiltInComponents.ComboBoxSingle
                    placeholder="Select an index"
                    value={writeIndexValue}
                    onChange={(val) => setWriteIndexValue(val)}
                    options={findItem?.aliases?.map((item) => ({ label: item.index }))}
                  />
                </CustomFormRow>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  disabled={!writeIndexValue}
                  fill
                  color="primary"
                  onClick={async () => {
                    const result = await submitWriteIndex({
                      services,
                      writeIndexValue: writeIndexValue,
                      sourceRef,
                    });
                    if (result.ok) {
                      coreService?.notifications.toasts.addSuccess(`Set ${writeIndexValue} as write index successfully.`);
                      refreshOptions();
                    } else {
                      coreService?.notifications.toasts.addDanger(result.error);
                    }
                  }}
                >
                  Assign as write index
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </>
        );
      }
    }

    return result;
  }, [sourceType, options, writeIndexValue]);

  return (
    <div style={{ padding: "0 50px" }}>
      <EuiTitle>
        <h1>Rollover</h1>
      </EuiTitle>
      <CustomFormRow
        helpText="Rollover a new writing index for a data stream or index alias."
        style={{
          marginBottom: 20,
        }}
      >
        <></>
      </CustomFormRow>
      <ContentPanel title="Configure source" titleSize="s">
        <FormGenerator
          value={initialValue}
          onChange={onChange}
          formFields={[
            {
              name: "source",
              rowProps: {
                label: "Specify source alias or data stream",
                helpText: "Specify one alias or data stream you want to rollover from.",
              },
              options: {
                rules: [
                  {
                    required: true,
                    message: "One alias or data stream should be specified.",
                  },
                ],
                props: {
                  options: sourceOptions,
                },
              },
              type: "ComboBoxSingle",
            },
          ]}
          ref={sourceRef}
        />
        {reasons.length ? (
          <>
            <EuiSpacer />
            <EuiCallOut color="danger" title="This alias does not contain a write index.">
              <ul>
                {reasons.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </EuiCallOut>
          </>
        ) : null}
        {(() => {
          if (sourceType === "alias" && writingIndex) {
            return (
              <>
                <EuiSpacer />
                <CustomFormRow label="Assigned write index">
                  <span>{writingIndex}</span>
                </CustomFormRow>
              </>
            );
          }

          return null;
        })()}
      </ContentPanel>
      <EuiSpacer />
      {sourceType === "alias" && writingIndex ? (
        <>
          <ContentPanel title="Configure new rollover index" titleSize="s">
            <IndexFormWrapper
              {...field.registerField({
                name: "targetIndex",
              })}
              ref={indexFormRef}
              withoutPanel
            />
          </ContentPanel>
          <EuiSpacer />
        </>
      ) : null}
      <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty
            onClick={() => {
              if (sourceType === "alias") {
                props.history.push(ROUTES.ALIASES);
              } else {
                props.history.push(ROUTES.DATA_STREAMS);
              }
            }}
            data-test-subj="rolloverCancelButton"
          >
            Cancel
          </EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            disabled={loading || (sourceType === "alias" && !writingIndex)}
            fill
            onClick={async () => {
              setIsLoading(true);
              const result = await onSubmit({
                services,
                sourceRef,
                sourceType,
                writingIndex,
                indexFormRef,
                tempValue,
              });
              setIsLoading(false);
              if (result.ok) {
                coreService?.notifications.toasts.addSuccess(`${tempValue.source} has been rollovered successfully.`);
                props.history.replace(sourceType === "alias" ? ROUTES.ALIASES : ROUTES.DATA_STREAMS);
              } else {
                coreService?.notifications.toasts.addDanger(result.error);
              }
            }}
            isLoading={loading}
            data-test-subj="rolloverSubmitButton"
          >
            Rollover
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
