/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiButton, EuiButtonEmpty, EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from "@elastic/eui";
import _ from "lodash";
import React, { useContext, useState } from "react";
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
import { ROUTES } from "../../../../utils/constants";

interface ForceMergeProps extends RouteComponentProps<{ indexes?: string }> {
  services: BrowserServices;
}

export default function ForceMergeWrapper(props: Omit<ForceMergeProps, "services">) {
  const services = useContext(ServicesContext) as BrowserServices;
  const context = useContext(CoreServicesContext) as CoreStart;
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [executing, setExecuting] = useState(false);
  const { indexes = "" } = props.match.params;
  const field = useField({
    values: {
      indexes: indexes.split(","),
    },
  });

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
      const { successful, total } = _shards || {};
      context.notifications.toasts.addSuccess(
        total ? `${successful}/${total} shards are successfully force merged.` : `The indexes are successfully merged.`
      );
      props.history.push(ROUTES.INDICES);
    } else {
      context.notifications.toasts.addDanger(result.error);
    }
    setExecuting(false);
  };

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
            getIndexOptions={(searchValue) =>
              getIndexOptions({
                services,
                searchValue,
                context,
              })
            }
            {...field.registerField({
              name: "indexes",
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
          <EuiButton fill onClick={onClickAction} isLoading={executing} data-test-subj="reindexConfirmButton">
            Force merge
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );
}
