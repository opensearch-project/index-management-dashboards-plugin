/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiButtonEmpty, EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from "@elastic/eui";
import _ from "lodash";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { CoreStart } from "opensearch-dashboards/public";
import { CoreServicesContext } from "../../../../components/core_services";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ContentPanel } from "../../../../components/ContentPanel";
import ForceMergeAdvancedOptions from "../../components/ForceMergeAdvancedOptions";
import IndexSelect from "../../components/IndexSelect";
import { getIndexOptions } from "../../utils/helper";
import { BrowserServices } from "../../../../models/interfaces";
import { ServicesContext } from "../../../../services";
import useField from "../../../../lib/field";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";

interface ForceMergeProps extends RouteComponentProps<{ indexes?: string }> {
  services: BrowserServices;
}

export default function ForceMergeWrapper(props: Omit<ForceMergeProps, "services">) {
  const services = useContext(ServicesContext) as BrowserServices;
  const context = useContext(CoreServicesContext) as CoreStart;
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [executing, setExecuting] = useState(false);
  const { indexes = "" } = props.match.params;
  const destroyedRef = useRef(false);
  const field = useField({
    values: {
      flush: true,
      indexes: indexes ? indexes.split(",") : [],
    },
  });
  const getIndexOptionsCached = useCallback(
    (searchValue) =>
      getIndexOptions({
        services,
        searchValue,
        context,
      }),
    []
  );

  const onCancel = () => {
    props.history.push(ROUTES.INDICES);
  };
  const onClickAction = async () => {
    const { errors, values } = await field.validatePromise();
    if (errors) {
      return;
    }
    setExecuting(true);
    const { indexes, ...others } = values as { indexes: { label: string }[] };
    const result = await services.commonService.apiCaller<{
      _shards?: {
        successful: number;
        total: number;
        failed: number;
      };
    }>({
      endpoint: "indices.forcemerge",
      data: {
        index: indexes,
        ...others,
      },
    });
    if (result && result.ok) {
      const { _shards } = result.response || {};
      const { successful, total, failed } = _shards || {};
      context.notifications.toasts.addSuccess(
        failed
          ? `${successful}/${total} shards are successfully force merged and ${failed}/${total} shards failed to merge.`
          : `The indexes are successfully force merged.`
      );
      props.history.push(ROUTES.INDICES);
    } else {
      context.notifications.toasts.addDanger(result.error);
    }
    if (destroyedRef.current) {
      return;
    }
    setExecuting(false);
  };

  useEffect(() => {
    return () => {
      destroyedRef.current = true;
    };
  }, []);

  const advanceTitle = (
    <EuiFlexGroup gutterSize="none" justifyContent="flexStart" alignItems="center">
      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          iconType={advancedSettingsOpen ? "arrowDown" : "arrowRight"}
          color="text"
          data-test-subj="advanceOptionToggle"
          onClick={() => {
            setAdvancedSettingsOpen(!advancedSettingsOpen);
          }}
          aria-label="drop down icon"
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h3>Advanced settings</h3>
        </EuiTitle>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  useEffect(() => {
    context.chrome.setBreadcrumbs([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      { ...BREADCRUMBS.FORCE_MERGE, href: `#${props.location.pathname}` },
    ]);
  }, []);

  return (
    <div style={{ padding: "0px 50px" }}>
      <EuiTitle size="l">
        <h1>Force merge</h1>
      </EuiTitle>
      <EuiSpacer />

      <ContentPanel title="Configure source index" titleSize="s">
        <EuiSpacer />
        <CustomFormRow
          label="Specify source indexes or data streams"
          isInvalid={!!field.getError("indexes")}
          error={field.getError("indexes")}
          fullWidth
          helpText="Specify one or more indexes or data streams you want to force merge."
        >
          <IndexSelect
            data-test-subj="sourceSelector"
            placeholder="Select indexes or data streams"
            getIndexOptions={getIndexOptionsCached}
            {...field.registerField({
              name: "indexes",
              rules: [
                {
                  validator(rule, value) {
                    if (!value || !value.length) {
                      return Promise.reject("Indexes is required.");
                    } else {
                      return Promise.resolve("");
                    }
                  },
                },
              ],
            })}
            singleSelect={false}
          />
        </CustomFormRow>

        <EuiSpacer />
      </ContentPanel>

      <EuiSpacer />

      <ContentPanel title={advanceTitle}>{advancedSettingsOpen && <ForceMergeAdvancedOptions field={field} />}</ContentPanel>

      <EuiSpacer />

      <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty onClick={onCancel} data-test-subj="reindexCancelButton">
            Cancel
          </EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton fill onClick={onClickAction} isLoading={executing} data-test-subj="forceMergeConfirmButton">
            Force merge
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
