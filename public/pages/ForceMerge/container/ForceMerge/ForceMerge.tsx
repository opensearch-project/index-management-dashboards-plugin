/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiCallOut,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiTitle,
  EuiText,
} from "@elastic/eui";
import React, { useContext, useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { CoreStart } from "opensearch-dashboards/public";
import { CoreServicesContext } from "../../../../components/core_services";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ContentPanel } from "../../../../components/ContentPanel";
import ForceMergeAdvancedOptions from "../../components/ForceMergeAdvancedOptions";
import IndexSelect from "../../components/IndexSelect";
import { checkNotReadOnlyIndexes, getIndexOptions } from "../../utils/helper";
import { BrowserServices, ForceMergeJobMetaData } from "../../../../models/interfaces";
import { ServicesContext } from "../../../../services";
import useField from "../../../../lib/field";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { IndexItem } from "../../../../../models/interfaces";
import { jobSchedulerInstance } from "../../../../context/JobSchedulerContext";
import { ListenType } from "../../../../lib/JobScheduler";
import NotificationConfig, { NotificationConfigRef } from "../../../../containers/NotificationConfig";
import { ActionType } from "../../../Notifications/constant";
import { getClusterInfo } from "../../../../utils/helpers";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

interface ForceMergeProps extends RouteComponentProps<{ indexes?: string }> {
  services: BrowserServices;
}

export default function ForceMergeWrapper(props: Omit<ForceMergeProps, "services">) {
  const services = useContext(ServicesContext) as BrowserServices;
  const context = useContext(CoreServicesContext) as CoreStart;
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [executing, setExecuting] = useState(false);
  const uiSettings = getUISettings();
  const useNewUx = uiSettings.get("home:useNewHomePage");
  const [useNewUX, setUseNewUX] = useState(useNewUx);
  const [notReadOnlyIndexes, setNotReadOnlyIndexes] = useState<
    [
      string,
      {
        settings: IndexItem["settings"];
      }
    ][]
  >([]);
  const { indexes = "" } = props.match.params;
  const destroyedRef = useRef(false);
  const notificationRef = useRef<NotificationConfigRef | null>(null);
  const field = useField({
    values: {
      flush: true,
      indexes: indexes ? indexes.split(",") : [],
    },
  });
  const getIndexOptionsCachedRef = useRef((searchValue: string) =>
    getIndexOptions({
      services,
      searchValue,
      context,
    })
  );

  useUpdateUrlWithDataSourceProperties();
  const onCancel = () => {
    props.history.push(ROUTES.INDICES);
  };
  const onClickAction = async () => {
    const { errors, values } = await field.validatePromise();
    if (advancedSettingsOpen) {
      const notificationResult = await notificationRef.current?.validatePromise();
      if (notificationResult?.errors) {
        return;
      }
    }
    if (errors) {
      const errorsKey = Object.keys(errors);
      if (errorsKey.includes("max_num_segments")) {
        setAdvancedSettingsOpen(true);
      }
      return;
    }
    setExecuting(true);
    const { indexes, ...others } = values;
    const result = await services.commonService.apiCaller<{
      task: string;
    }>({
      endpoint: "transport.request",
      data: {
        path: `/${indexes.join(",")}/_forcemerge?wait_for_completion=false`,
        method: "POST",
        body: others,
      },
    });
    if (result && result.ok) {
      const toast = `Successfully started force merging ${indexes.join(", ")}.`;
      const toastInstance = context.notifications.toasts.addSuccess(toast, {
        toastLifeTimeMs: 1000 * 60 * 60 * 24 * 5,
      });
      if (advancedSettingsOpen) {
        notificationRef.current?.associateWithTask({
          taskId: result.response?.task,
        });
      }
      const clusterInfo = await getClusterInfo({
        commonService: services.commonService,
      });
      await jobSchedulerInstance.addJob({
        type: ListenType.FORCE_MERGE,
        extras: {
          clusterInfo,
          toastId: toastInstance.id,
          sourceIndex: indexes,
          taskId: result.response?.task,
        },
        interval: 30000,
      } as ForceMergeJobMetaData);
      props.history.push(ROUTES.INDICES);
    } else {
      context.notifications.toasts.addDanger(result.error);
    }
    if (destroyedRef.current) {
      return;
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

  useEffect(() => {
    let breadCrumbs = useNewUX
      ? [BREADCRUMBS.INDICES, { ...BREADCRUMBS.FORCE_MERGE, href: `#${props.location.pathname}` }]
      : [BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.INDICES, { ...BREADCRUMBS.FORCE_MERGE, href: `#${props.location.pathname}` }];
    context.chrome.setBreadcrumbs(breadCrumbs);
    return () => {
      destroyedRef.current = true;
    };
  }, []);

  useEffect(() => {
    checkNotReadOnlyIndexes({
      services,
      indexes: field.getValue("indexes"),
    }).then((result) => {
      setNotReadOnlyIndexes(result);
    });
  }, [field.getValue("indexes")]);

  const { HeaderControl } = getNavigationUI();
  const { setAppDescriptionControls } = getApplication();

  const descriptionData = [
    {
      renderComponent: (
        <EuiText size="s" color="subdued">
          Manually merge shards of indexes or backing indexes of data streams. You can also use force merge to clear up deleted documents
          within indexes.
        </EuiText>
      ),
    },
  ];

  const padding_style = useNewUX ? { padding: "0px 0px" } : { padding: "0px 50px" };

  return (
    <div style={padding_style}>
      {useNewUX && <HeaderControl setMountPoint={setAppDescriptionControls} controls={descriptionData} />}
      {!useNewUX && (
        <>
          <EuiTitle size="l">
            <h1>Force merge</h1>
          </EuiTitle>
          <CustomFormRow
            fullWidth
            helpText="Manually merge shards of indexes or backing indexes of data streams. You can also use force merge to clear up deleted documents within indexes."
          >
            <></>
          </CustomFormRow>
          <EuiSpacer />
        </>
      )}

      <ContentPanel title="Configure source index" titleSize="s">
        <EuiSpacer />
        <CustomFormRow
          label="Select source indexes or data streams"
          isInvalid={!!field.getError("indexes")}
          error={field.getError("indexes")}
          fullWidth
          helpText="Select one or more indexes or data streams you want to force merge."
        >
          <IndexSelect
            data-test-subj="sourceSelector"
            placeholder="Select indexes or data streams"
            getIndexOptions={getIndexOptionsCachedRef.current}
            {...field.registerField({
              name: "indexes",
              rules: [
                {
                  validator(rule, value) {
                    if (!value || !value.length) {
                      return Promise.reject("Index or data stream is required.");
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
        {notReadOnlyIndexes.length ? (
          <EuiCallOut color="warning" title="We recommend force merge with read-only indexes">
            {notReadOnlyIndexes.map((item) => item[0]).join(", ")} is not a read-only index. We recommend only performing force merge with
            read-only indexes to pervent large segments being produced.
          </EuiCallOut>
        ) : null}
      </ContentPanel>

      <EuiSpacer />

      <ContentPanel title={advanceTitle} noExtraPadding titleSize="s">
        {advancedSettingsOpen && (
          <>
            <EuiSpacer size="s" />
            <ForceMergeAdvancedOptions field={field} />
            <NotificationConfig ref={notificationRef} actionType={ActionType.FORCEMERGE} />
            <EuiSpacer size="s" />
          </>
        )}
      </ContentPanel>

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
