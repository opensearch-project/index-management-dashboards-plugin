/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  EuiTabbedContent,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiSpacer,
  EuiTitle,
  EuiFormRow,
  EuiLink,
  EuiTabbedContentTab,
} from "@elastic/eui";
import { get } from "lodash";
import { RouteComponentProps } from "react-router-dom";
import { IndexItem } from "../../../../../models/interfaces";
import IndicesActions from "../../../Indices/containers/IndicesActions";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import { BREADCRUMBS, IndicesUpdateMode, ROUTES } from "../../../../utils/constants";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import IndexFormWrapper, { IndexForm } from "../../../CreateIndex/containers/IndexForm";
import { CoreServicesContext } from "../../../../components/core_services";
import { ContentPanel } from "../../../../components/ContentPanel";
import { Modal } from "../../../../components/Modal";
import { IFinalDetail } from "./interface";
import { OVERVIEW_DISPLAY_INFO } from "./constants";
import { EVENT_MAP, destroyListener, listenEvent } from "../../../../JobHandler";
import { DataSourceMenuContext } from "../../../../services/DataSourceMenuContext";
import { useHistory } from "react-router";

export interface IndexDetailModalProps extends RouteComponentProps<{ index: string }> {}

export default function IndexDetail(props: IndexDetailModalProps) {
  const { index } = props.match.params;
  const [record, setRecord] = useState<ManagedCatIndex | undefined>(undefined);
  const [detail, setDetail] = useState({} as IndexItem);
  const ref = useRef<IndexForm>(null);
  const coreService = useContext(CoreServicesContext);
  const finalDetail: IFinalDetail | undefined = useMemo(() => {
    if (!detail || !record) {
      return undefined;
    }

    return {
      ...record,
      ...detail,
    };
  }, [record, detail]);
  const services = useContext(ServicesContext) as BrowserServices;
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  const { dataSourceId, dataSourceLabel, multiDataSourceEnabled } = dataSourceMenuProps;
  if (multiDataSourceEnabled) {
    // mds flag can't change while the app is loaded
    const history = useHistory();
    useEffect(() => {
      history.replace({
        search: `?dataSourceId=${dataSourceId}&dataSourceLabel=${dataSourceLabel}`,
      });
    }, [dataSourceId, dataSourceLabel]);
  }

  const fetchIndicesDetail = () =>
    services.commonService
      .apiCaller<Record<string, IndexItem>>({
        endpoint: "indices.get",
        data: {
          index,
          dataSourceId,
        },
      })
      .then((res) => {
        if (!res.ok) {
          return res;
        }

        return {
          ...res,
          response: res.response[index],
        };
      })
      .then((res) => {
        if (res && res.ok) {
          setDetail(res.response);
        } else {
          coreService?.notifications.toasts.addDanger(res.error || "");
          props.history.replace(ROUTES.INDICES);
        }

        return res;
      });

  const fetchCatIndexDetail = async (params: { showDataStreams: "true" | "false" }) => {
    const result = await services.indexService.getIndices({
      terms: index,
      from: 0,
      size: 10,
      search: index,
      sortField: "index",
      sortDirection: "desc",
      expandWildcards: "all",
      ...params,
    });
    if (result.ok) {
      const findItem = result.response.indices.find((item) => item.index === index);
      if (findItem) {
        setRecord(findItem);
      } else {
        coreService?.notifications.toasts.addDanger(`[index_not_found_exception] no such index [${index}]`);
        props.history.replace(ROUTES.INDICES);
      }
    } else {
      coreService?.notifications.toasts.addDanger(result.error || "");
      props.history.replace(ROUTES.INDICES);
    }
  };

  const refreshDetails = async () => {
    const result = await fetchIndicesDetail();
    if (result.ok) {
      const { data_stream } = result.response;
      const payload: { showDataStreams: "true" | "false"; search?: string; dataStreams?: string; exactSearch?: string } = {
        showDataStreams: data_stream ? "true" : "false",
        exactSearch: index,
      };
      if (data_stream) {
        payload.search = `data_streams: (${result.response.data_stream})`;
        payload.dataStreams = data_stream;
      }

      fetchCatIndexDetail(payload);
    }
  };

  const indexFormCommonProps = {
    index,
    onSubmitSuccess: () => {
      refreshDetails();
    },
  };

  const indexFormReadonlyCommonProps = {
    ...indexFormCommonProps,
    hideButtons: true,
    ref,
  };

  const tabs = useMemo(
    () => [
      {
        id: "indexDetailModalSettings",
        name: "Settings",
        mode: IndicesUpdateMode.settings,
        content: (
          <>
            <EuiSpacer />
            <ContentPanel title="Index settings" titleSize="s">
              <EuiSpacer size="s" />
              <IndexFormWrapper
                {...indexFormReadonlyCommonProps}
                key={IndicesUpdateMode.settings}
                mode={IndicesUpdateMode.settings}
                dataSourceId={dataSourceId}
              />
            </ContentPanel>
          </>
        ),
      },
      {
        id: "indexDetailModalMappings",
        name: "Mappings",
        mode: IndicesUpdateMode.mappings,
        content: (
          <>
            <EuiSpacer />
            <ContentPanel
              title={
                <>
                  <EuiTitle size="s">
                    <span>Index mappings</span>
                  </EuiTitle>
                  <EuiFormRow
                    fullWidth
                    helpText={
                      <>
                        <div>
                          Define how documents and their fields are stored and indexed.{" "}
                          <EuiLink
                            target="_blank"
                            external
                            href={`https://opensearch.org/docs/${coreService?.docLinks.DOC_LINK_VERSION}/opensearch/mappings/`}
                          >
                            Learn more
                          </EuiLink>
                        </div>
                        <div>Mappings and field types cannot be changed once they have been added.</div>
                      </>
                    }
                  >
                    <></>
                  </EuiFormRow>
                </>
              }
            >
              <EuiSpacer size="s" />
              <IndexFormWrapper
                {...indexFormReadonlyCommonProps}
                key={IndicesUpdateMode.mappings}
                mode={IndicesUpdateMode.mappings}
                dataSourceId={dataSourceId}
              />
            </ContentPanel>
          </>
        ),
      },
      {
        id: `indexDetailModalAlias`,
        name: "Alias",
        mode: IndicesUpdateMode.alias,
        content: (
          <>
            <EuiSpacer />
            <ContentPanel title="Index alias" titleSize="s">
              <EuiSpacer size="s" />
              <IndexFormWrapper
                {...indexFormReadonlyCommonProps}
                key={IndicesUpdateMode.alias}
                mode={IndicesUpdateMode.alias}
                dataSourceId={dataSourceId}
              />
            </ContentPanel>
          </>
        ),
      },
    ],
    []
  );

  const [selectedTab, setSelectedTab] = useState<EuiTabbedContentTab & { mode: IndicesUpdateMode }>(tabs[0]);

  useEffect(() => {
    refreshDetails();
    coreService?.chrome.setBreadcrumbs([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      {
        text: index,
        href: `#${props.location.pathname}`,
      },
    ]);
  }, []);

  useEffect(() => {
    listenEvent(EVENT_MAP.OPEN_COMPLETE, refreshDetails);
    return () => {
      destroyListener(EVENT_MAP.OPEN_COMPLETE, refreshDetails);
    };
  }, [refreshDetails]);

  if (!record || !detail || !finalDetail) {
    return null;
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <EuiTitle size="m">
          <span>{index}</span>
        </EuiTitle>
        <IndicesActions
          selectedItems={[record]}
          history={props.history}
          onDelete={() => props.history.replace(ROUTES.INDICES)}
          onClose={refreshDetails}
          onShrink={() => props.history.replace(ROUTES.INDICES)}
          getIndices={async () => {}}
        />
      </div>
      <EuiSpacer />
      <ContentPanel title="Overview" titleSize="s">
        <EuiDescriptionList>
          <EuiSpacer />
          <div>
            {OVERVIEW_DISPLAY_INFO.map((item) => {
              let valueContent = null;
              if (typeof item.value === "string") {
                valueContent = <span>{get(finalDetail, item.value)}</span>;
              } else {
                const ValueComponent = item.value;
                valueContent = <ValueComponent detail={finalDetail} />;
              }
              return (
                <div
                  style={{ display: "inline-block", width: "33%", verticalAlign: "top", marginBottom: "20px", padding: "0 1%" }}
                  key={item.label}
                  data-test-subj={`indexDetailOverviewItem-${item.label}`}
                >
                  <EuiDescriptionListTitle>{item.label}</EuiDescriptionListTitle>
                  <EuiDescriptionListDescription style={{ wordBreak: item.label === "Index name" ? "break-word" : undefined }}>
                    {valueContent}
                  </EuiDescriptionListDescription>
                </div>
              );
            })}
          </div>
        </EuiDescriptionList>
      </ContentPanel>
      <EuiSpacer />
      <EuiTabbedContent
        selectedTab={selectedTab}
        onTabClick={(tab) => {
          if (ref.current?.hasUnsavedChanges?.(selectedTab.mode)) {
            Modal.show({
              title: "You have unsaved changes.",
              content: "Are you sure you want to leave this tab?",
              type: "confirm",
              locale: {
                confirm: "Stay",
                cancel: "Leave without changes",
              },
              onCancel: () => {
                setSelectedTab(tab as any);
              },
              footer: ["cancel", "confirm"],
            });
          } else {
            setSelectedTab(tab as any);
          }
        }}
        tabs={tabs}
      />
    </>
  );
}
