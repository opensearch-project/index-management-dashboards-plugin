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
import { EuiButton, EuiButtonEmpty, EuiCallOut, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle, EuiLink, EuiText } from "@elastic/eui";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ContentPanel } from "../../../../components/ContentPanel";
import FormGenerator, { AllBuiltInComponents, IFormGeneratorRef } from "../../../../components/FormGenerator";
import { Alias } from "../../../../../server/models/interfaces";
import useField from "../../../../lib/field";
import { getIndexDetail, getOptions, getRolloveredIndex, onSubmit, submitWriteIndex } from "../../hooks";
import { IRolloverRequestBody } from "../../interface";
import { filterByMinimatch } from "../../../../../utils/helper";
import { SYSTEM_ALIAS } from "../../../../../utils/constants";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

export interface RolloverProps extends RouteComponentProps<{ source?: string }> {}

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
  const uiSettings = getUISettings();
  const useNewUx = uiSettings.get("home:useNewHomePage");
  const [useNewUX, setUseNewUX] = useState(useNewUx);
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

  useUpdateUrlWithDataSourceProperties();

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
    let breadCrumbs = useNewUX
      ? [
          BREADCRUMBS.INDICES,
          {
            ...BREADCRUMBS.ROLLOVER,
            href: `#${props.location.pathname}`,
          },
        ]
      : [
          BREADCRUMBS.INDEX_MANAGEMENT,
          {
            ...BREADCRUMBS.ROLLOVER,
            href: `#${props.location.pathname}`,
          },
        ];
    coreService?.chrome.setBreadcrumbs(breadCrumbs);
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

  useEffect(() => {
    if (writingIndex && tempValue.source) {
      // do a dry run to get the rollovered writing index
      getRolloveredIndex({
        alias: tempValue.source,
        services,
      }).then((result) => {
        if (result && result.ok) {
          field.setValue(["targetIndex", "index"], result.response);
        } else {
          field.setValue(["targetIndex", "index"], "");
        }
      });
      indexFormRef.current?.simulateFromTemplate();
    }
  }, [writingIndex]);

  const reasons = useMemo(() => {
    let result: React.ReactChild[] = [];
    if (sourceType === "alias") {
      const findItem = options.alias.find((item) => item.label === sourceRef.current?.getValue("source"));
      if (!writingIndex) {
        result.push(
          <>
            <EuiFlexGroup alignItems="flexEnd">
              <EuiFlexItem grow={false}>
                Select a write index from this alias before performing rollover.
                <EuiSpacer size="s" />
                <CustomFormRow label="Select an index from this alias">
                  <AllBuiltInComponents.ComboBoxSingle
                    placeholder="Select an index"
                    value={writeIndexValue ? writeIndexValue : undefined}
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

  const { HeaderControl } = getNavigationUI();
  const { setAppDescriptionControls } = getApplication();

  const padding_style = useNewUX ? { padding: "0px 0px" } : { padding: "0px 50px" };

  const descriptionData = [
    {
      renderComponent: (
        <EuiText size="s" color="subdued">
          Rollover creates a new writing index for a data stream or index alias.
        </EuiText>
      ),
    },
  ];

  return (
    <div style={padding_style}>
      {useNewUX && <HeaderControl setMountPoint={setAppDescriptionControls} controls={descriptionData} />}
      {!useNewUX && (
        <>
          <EuiTitle>
            <h1>Roll over</h1>
          </EuiTitle>
          <CustomFormRow
            helpText="Rollover creates a new writing index for a data stream or index alias."
            style={{
              marginBottom: 20,
            }}
          >
            <></>
          </CustomFormRow>
        </>
      )}
      <ContentPanel title="Configure source" titleSize="s">
        {sourceType === "alias" && filterByMinimatch(tempValue.source || "", SYSTEM_ALIAS) ? (
          <>
            <EuiCallOut color="warning">
              This alias may contain critical system data. Rollovering system aliases may break OpenSearch.
            </EuiCallOut>
            <EuiSpacer />
          </>
        ) : null}
        <FormGenerator
          value={initialValue}
          onChange={onChange}
          formFields={[
            {
              name: "source",
              rowProps: {
                label: "Select an alias or data stream",
                helpText: "Select an alias or data stream to roll over.",
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
                  placeholder: "Select a alias or data stream.",
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
              {reasons.map((item, index) => (
                <div key={index}>{item}</div>
              ))}
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
          <ContentPanel
            title="Configure new rollover index"
            titleSize="s"
            actions={
              <EuiButton
                onClick={() => {
                  indexFormRef.current?.importSettings({
                    index: writingIndex,
                  });
                }}
              >
                Import from old write index
              </EuiButton>
            }
          >
            <IndexFormWrapper
              {...field.registerField({
                name: "targetIndex",
              })}
              onGetIndexDetail={async (indexName) => {
                try {
                  return await getIndexDetail({
                    services,
                    indexName,
                    newIndexName: indexFormRef.current?.getValue()?.index || "",
                  });
                } catch (e) {
                  coreService?.notifications.toasts.addDanger(e as string);
                  throw e;
                }
              }}
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
                coreService?.notifications.toasts.addSuccess({
                  title: ((
                    <>
                      <div>{tempValue.source} has been successfully rolled over.</div>
                      {result.response?.new_index ? (
                        <div>
                          <EuiLink href={`#${ROUTES.INDEX_DETAIL}/${result.response.new_index}`}>{result.response?.new_index}</EuiLink> is
                          now the latest write index.
                        </div>
                      ) : null}
                    </>
                  ) as unknown) as string,
                });
                props.history.replace(sourceType === "alias" ? ROUTES.ALIASES : ROUTES.DATA_STREAMS);
              } else {
                coreService?.notifications.toasts.addDanger(result.error);
              }
            }}
            isLoading={loading}
            data-test-subj="rolloverSubmitButton"
          >
            Roll over
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
