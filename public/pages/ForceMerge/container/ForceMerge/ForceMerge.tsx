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
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import _ from "lodash";
import React, { useContext, useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { CoreStart } from "opensearch-dashboards/public";
import { CoreServicesContext } from "../../../../components/core_services";
import CustomFormRow from "../../../../components/CustomFormRow";
import { ContentPanel } from "../../../../components/ContentPanel";
import ForceMergeAdvancedOptions from "../../components/ForceMergeAdvancedOptions";
import IndexSelect from "../../components/IndexSelect";
import { checkNotReadOnlyIndexes, getIndexOptions } from "../../utils/helper";
import { BrowserServices } from "../../../../models/interfaces";
import { ServicesContext } from "../../../../services";
import useField from "../../../../lib/field";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { Modal } from "../../../../components/Modal";
import { IndexItem } from "../../../../../models/interfaces";

interface ForceMergeProps extends RouteComponentProps<{ indexes?: string }> {
  services: BrowserServices;
}

export default function ForceMergeWrapper(props: Omit<ForceMergeProps, "services">) {
  const services = useContext(ServicesContext) as BrowserServices;
  const context = useContext(CoreServicesContext) as CoreStart;
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [executing, setExecuting] = useState(false);
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

  const onCancel = () => {
    props.history.push(ROUTES.INDICES);
  };
  const onClickAction = async () => {
    const { errors, values } = await field.validatePromise();
    if (errors) {
      const errorsKey = Object.keys(errors);
      if (errorsKey.includes("max_num_segments")) {
        setAdvancedSettingsOpen(true);
      }
      return;
    }
    setExecuting(true);
    const { indexes, ...others } = values as { indexes: { label: string }[] };
    const result = await services.commonService.apiCaller<{
      _shards?: {
        successful: number;
        total: number;
        failed: number;
        failures?: string[];
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
      const { successful = 0, total = 0, failures = [] } = _shards || {};
      if (successful === total) {
        context.notifications.toasts.addSuccess("The indexes are successfully force merged.");
      } else {
        context.notifications.toasts.addWarning({
          title: "Some shards could not be force merged",
          text: ((
            <>
              <div>
                {total - successful} out of {total} could not be force merged.
              </div>
              <EuiSpacer />
              <EuiButton
                onClick={() => {
                  Modal.show({
                    locale: {
                      ok: "Close",
                    },
                    title: "Some shards could not be force merged",
                    content: (
                      <EuiText>
                        <div>
                          {total - successful} out of {total} could not be force merged. The following reasons may prevent shards from
                          performing a force merge:
                        </div>
                        <ul>
                          {failures.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                          <li>Some shards are unassigned.</li>
                          <li>
                            Insufficient disk space: Force merging requires disk space to create a new, larger segment. If the disk does not
                            have enough space, the merge process may fail.
                          </li>
                          <li>
                            Index read-only: If the index is marked as read-only, a force merge operation cannot modify the index, and the
                            merge process will fail.
                          </li>
                          <li>
                            Too many open files: The operating system may limit the number of files that a process can have open
                            simultaneously, and a force merge operation may exceed this limit, causing the merge process to fail.
                          </li>
                          <li>
                            Index corruption: If the index is corrupted or has some inconsistencies, the force merge operation may fail.
                          </li>
                        </ul>
                      </EuiText>
                    ),
                  });
                }}
                style={{ float: "right" }}
              >
                View details
              </EuiButton>
            </>
          ) as unknown) as string,
          iconType: "",
        });
      }
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
    context.chrome.setBreadcrumbs([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      { ...BREADCRUMBS.FORCE_MERGE, href: `#${props.location.pathname}` },
    ]);
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
