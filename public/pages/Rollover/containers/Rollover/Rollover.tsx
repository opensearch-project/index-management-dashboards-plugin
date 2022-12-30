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
import IndexFormWrapper, { IndexForm } from "../../../CreateIndex/containers/IndexForm";
import { CoreServicesContext } from "../../../../components/core_services";
import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiSpacer,
  EuiTitle,
} from "@elastic/eui";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ContentPanel } from "../../../../components/ContentPanel";
import FormGenerator, { AllBuiltInComponents, IFormGeneratorRef } from "../../../../components/FormGenerator";
import { Alias } from "../../../../../server/models/interfaces";
import { IndexItemRemote } from "../../../../../models/interfaces";

export interface RolloverProps extends RouteComponentProps<{ source: string }> {}

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
  const conditionsRef = useRef<IFormGeneratorRef>(null);
  const indexFormRef = useRef<IndexForm>(null);
  const [tempValue, setValue] = useState<IRolloverRequestBody>({});
  const [flyoutVisible, setFlyoutVisible] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [writeIndexValue, setWriteIndexValue] = useState(undefined);

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
          dataStreams: dataStreams.response.dataStreams.map((item) => ({ label: item.name })),
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
    const formGeneratersRes = await Promise.all([sourceRef.current?.validatePromise(), conditionsRef.current?.validatePromise()]);
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
      payload.newIndex = index;
      payload.body = {
        ...others,
        conditions: finalValues.conditions,
      };
    } else {
      payload.body.conditions = finalValues.conditions;
    }
    setIsLoading(true);

    const result = await services.commonService.apiCaller({
      endpoint: "indices.rollover",
      data: payload,
    });

    setIsLoading(false);

    if (result.ok) {
      coreService?.notifications.toasts.addSuccess(`${payload.alias} has been rollovered successfully.`);
      props.history.replace(sourceType === "alias" ? ROUTES.ALIASES : ROUTES.INDICES);
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

  const reasons = useMemo(() => {
    let result: React.ReactChild[] = [];
    if (sourceType === "alias") {
      const findItem = options.alias.find((item) => item.label === sourceRef.current?.getValue("source"));
      if (findItem && findItem.aliases.length > 1) {
        // has to check if it has write_index
        if (findItem.aliases.every((item) => item.is_write_index !== "true")) {
          result.push(
            <>
              <EuiFlexGroup alignItems="flexEnd">
                <EuiFlexItem grow={false}>
                  Please select an index to be the write index of this alias.
                  <EuiSpacer size="s" />
                  <AllBuiltInComponents.ComboBoxSingle
                    value={writeIndexValue}
                    onChange={(val) => setWriteIndexValue(val)}
                    options={findItem.aliases.map((item) => ({ label: item.index }))}
                  />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton disabled={!writeIndexValue} fill color="primary" onClick={submitWriteIndex}>
                    Set index as write index
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </>
          );
        }
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
            <EuiCallOut color="warning" title="Please fix the issues below before rollover.">
              <ul>
                {reasons.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </EuiCallOut>
          </>
        ) : null}
      </ContentPanel>
      <EuiSpacer />
      {sourceType === "alias" ? (
        <>
          <ContentPanel title="Target index - optional" titleSize="s">
            <EuiButton onClick={() => setFlyoutVisible(true)}>Define target index</EuiButton>
          </ContentPanel>
          <EuiSpacer />
        </>
      ) : null}
      <ContentPanel title="Conditions - optional" titleSize="s">
        <FormGenerator
          ref={conditionsRef}
          formFields={[
            {
              name: ["conditions", "max_age"],
              rowProps: {
                label: "Minimum index age",
                helpText: 'The minimum age required to roll over the index. Accepts time units, e.g. "5h" or "1d".',
              },
              type: "Input",
            },
            {
              name: ["conditions", "max_docs"],
              rowProps: {
                label: "Minimum doc count",
                helpText: "The minimum number of documents required to roll over the index.",
              },
              type: "Number",
            },
            {
              name: ["conditions", "max_size"],
              rowProps: {
                label: "Minimum index size",
                helpText:
                  'The minimum size of the total primary shard storage required to roll over the index. Accepts byte units, e.g. "500mb" or "50gb".',
              },
              type: "Input",
            },
            {
              name: ["conditions", "max_primary_shard_size"],
              rowProps: {
                label: "Minimum primary shard size",
                helpText:
                  'The minimum size of a single primary shard required to roll over the index. Accepts byte units, e.g. "500mb" or "50gb".',
              },
              type: "Input",
            },
          ]}
        />
      </ContentPanel>
      <EuiSpacer />
      {flyoutVisible ? (
        <EuiFlyout hideCloseButton onClose={() => null}>
          <EuiFlyoutHeader>
            <EuiTitle>
              <h3>Define target index</h3>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <IndexFormWrapper ref={indexFormRef} value={tempValue.targetIndex} hideButtons />
          </EuiFlyoutBody>
          <EuiFlyoutFooter>
            <EuiButton
              style={{ float: "right", marginRight: 20 }}
              onClick={() => {
                setFlyoutVisible(false);
              }}
            >
              Cancel
            </EuiButton>
            <EuiButton
              style={{ float: "right", marginRight: 20 }}
              fill
              color="primary"
              onClick={() => {
                onChange({
                  targetIndex: indexFormRef.current?.getValue(),
                });
                setFlyoutVisible(false);
              }}
            >
              Save
            </EuiButton>
          </EuiFlyoutFooter>
        </EuiFlyout>
      ) : null}
      <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty
            onClick={() => {
              if (sourceType === "alias") {
                props.history.push(ROUTES.ALIASES);
              } else {
                props.history.push(ROUTES.INDICES);
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
