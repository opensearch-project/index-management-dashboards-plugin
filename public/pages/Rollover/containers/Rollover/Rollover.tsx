/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { isEmpty, merge } from "lodash";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { EuiButton, EuiButtonEmpty, EuiCallOut, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from "@elastic/eui";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ContentPanel } from "../../../../components/ContentPanel";
import FormGenerator, { AllBuiltInComponents, IFormGeneratorRef } from "../../../../components/FormGenerator";
import { Alias } from "../../../../../server/models/interfaces";
import { IndexItemRemote } from "../../../../../models/interfaces";
import IndexMappings from "../IndexMappings";
import IndexAlias from "../IndexAlias";
import IndexSettings from "../IndexSettings";
import useField from "../../../../lib/field";

export interface RolloverProps extends RouteComponentProps<{ source?: string }> {}

export interface IRolloverRequestBody {
  source?: string;
  targetIndex?: IndexItemRemote;
  conditions?: {
    max_age?: string;
    max_docs?: number;
    max_size?: string;
    max_primary_shard_size?: string;
  };
}

export default function IndexDetail(props: RolloverProps) {
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
  const [tempValue, setValue] = useState<IRolloverRequestBody>({});
  const [loading, setIsLoading] = useState(false);
  const [writeIndexValue, setWriteIndexValue] = useState(undefined);
  const field = useField({
    values: {
      targetIndex: {},
    },
  });

  const onChange = (val?: Record<string, any>) => {
    const finalResult = merge({}, tempValue, val);
    setValue(finalResult);
  };

  const refreshOptions = () =>
    Promise.all([
      services.commonService.apiCaller<Alias[]>({
        endpoint: "cat.aliases",
        data: {
          format: "json",
        },
      }),
      services.indexService.getDataStreams({}),
    ]).then(([aliases, dataStreams]) => {
      if (aliases.ok && dataStreams.ok) {
        const allAlias: { label: string; aliases: Alias[] }[] = [];
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
        setOptions({
          alias: allAlias,
          dataStreams: dataStreams.response?.dataStreams.map((item) => ({ label: item.name })) || [],
        });
      }
    });

  const submitWriteIndex = async () => {
    const result = await services.commonService.apiCaller({
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
    if (result.ok) {
      coreService?.notifications.toasts.addSuccess(`Set ${writeIndexValue} as write index successfully.`);
      refreshOptions();
    } else {
      coreService?.notifications.toasts.addDanger(result.error);
    }
  };

  const onSubmit = async () => {
    const formGeneratersRes = await Promise.all(
      [sourceRef.current?.validatePromise(), sourceType === "alias" ? field.validatePromise() : undefined].filter((item) => item)
    );
    const hasError = formGeneratersRes.some((item) => item?.errors);
    if (hasError) {
      return;
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
      const { index, ...others } = finalValues.targetIndex || {};
      if (index) {
        payload.newIndex = index;
      }
      payload.body = {
        ...others,
      };
    }
    setIsLoading(true);

    const result = await services.commonService.apiCaller({
      endpoint: "indices.rollover",
      data: payload,
    });

    setIsLoading(false);

    if (result.ok) {
      coreService?.notifications.toasts.addSuccess(`${payload.alias} has been rollovered successfully.`);
      props.history.replace(sourceType === "alias" ? ROUTES.ALIASES : ROUTES.DATA_STREAMS);
    } else {
      coreService?.notifications.toasts.addDanger(result.error);
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
                <EuiButton disabled={!writeIndexValue} fill color="primary" onClick={submitWriteIndex}>
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

  const subCompontentProps = {
    ...props,
    field,
    writingIndex,
  };

  return (
    <div style={{ padding: "0 50px" }}>
      <EuiTitle>
        <h1>Rollover</h1>
      </EuiTitle>
      <CustomFormRow
        helpText={<>Creates a new index for a data stream or index alias.</>}
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
      {sourceType === "alias" ? (
        <>
          <ContentPanel title="Configure new rollover index" titleSize="s">
            <EuiSpacer size="s" />
            <IndexAlias {...subCompontentProps} />
            <EuiSpacer />
            <IndexSettings {...subCompontentProps} />
            <EuiSpacer />
            <IndexMappings {...subCompontentProps} />
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
          <EuiButton fill onClick={onSubmit} isLoading={loading} data-test-subj="rolloverSubmitButton">
            Rollover
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
