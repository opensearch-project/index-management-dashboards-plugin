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
  EuiHealth,
  EuiFormRow,
  EuiLink,
  EuiTabbedContentTab,
} from "@elastic/eui";
import { get } from "lodash";
import { Link, RouteComponentProps } from "react-router-dom";
import { IndexItem } from "../../../../../models/interfaces";
import IndicesActions from "../../../Indices/containers/IndicesActions";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import { BREADCRUMBS, IndicesUpdateMode, ROUTES } from "../../../../utils/constants";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import IndexFormWrapper, { IndexForm } from "../../../CreateIndex/containers/IndexForm";
import { HEALTH_TO_COLOR } from "../../../Indices/utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { ContentPanel } from "../../../../components/ContentPanel";
import { Modal } from "../../../../components/Modal";

export interface IndexDetailModalProps extends RouteComponentProps<{ index: string }> {}

interface IFinalDetail extends ManagedCatIndex, IndexItem {}

const OVERVIEW_DISPLAY_INFO: {
  label: string;
  value: string | React.FunctionComponent<{ detail: IFinalDetail }>;
}[] = [
  {
    label: "Index name",
    value: "index",
  },
  {
    label: "Health",
    value: ({ detail }) => {
      const health = detail.health;
      const color = health ? HEALTH_TO_COLOR[health] : "subdued";
      const text = health || detail.status;
      return (
        <EuiHealth color={color} className="indices-health">
          {text}
        </EuiHealth>
      );
    },
  },
  {
    label: "Status",
    value: ({ detail }) => {
      return <span className="camel-first-letter">{detail.status}</span>;
    },
  },
  {
    label: "Creation date",
    value: ({ detail }) => (
      <span>
        {detail.settings?.index?.creation_date ? new Date(parseInt(detail.settings?.index?.creation_date)).toLocaleString() : "-"}
      </span>
    ),
  },
  {
    label: "Total size",
    value: ({ detail }) => <span>{detail["store.size"]}</span>,
  },
  {
    label: "Size of primaries",
    value: ({ detail }) => <span>{detail["pri.store.size"]}</span>,
  },
  {
    label: "Total documents",
    value: ({ detail }) => <span>{detail["docs.count"]}</span>,
  },
  {
    label: "Deleted documents",
    value: ({ detail }) => <span>{detail["docs.deleted"]}</span>,
  },
  {
    label: "Primaries",
    value: "pri",
  },
  {
    label: "Replicas",
    value: "rep",
  },
  {
    label: "Index blocks",
    value: ({ detail }) => {
      const blocks = Object.entries(detail.settings?.index?.blocks || {}).filter(([key, value]) => value === "true");
      if (!blocks.length) {
        return <span>-</span>;
      }

      return (
        <ul style={{ listStyleType: "disc", listStylePosition: "inside" }}>
          {blocks.map(([key, value]) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      );
    },
  },
  {
    label: "Managed by policy",
    value: ({ detail }) => (
      <span>
        {detail.managedPolicy ? <Link to={`${ROUTES.POLICY_DETAILS}?id=${detail.managedPolicy}`}>{detail.managedPolicy}</Link> : "-"}
      </span>
    ),
  },
];

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

  const fetchIndicesDetail = () =>
    services.commonService
      .apiCaller<Record<string, IndexItem>>({
        endpoint: "indices.get",
        data: {
          index,
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

  const fetchCatIndexDetail = async (props: { showDataStreams: "true" | "false" }) => {
    const result = await services.indexService.getIndices({
      terms: index,
      from: 0,
      size: 10,
      search: index,
      sortField: "index",
      sortDirection: "desc",
      ...props,
    });
    if (result.ok) {
      const findItem = result.response.indices.find((item) => item.index === index);
      setRecord(findItem);
    } else {
      coreService?.notifications.toasts.addDanger(result.error || "");
    }
  };

  const refreshDetails = async () => {
    const result = await fetchIndicesDetail();
    if (result.ok) {
      const { data_stream } = result.response;
      const payload: { showDataStreams: "true" | "false"; search?: string; dataStreams?: string } = {
        showDataStreams: data_stream ? "true" : "false",
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
              <IndexFormWrapper {...indexFormReadonlyCommonProps} key={IndicesUpdateMode.settings} mode={IndicesUpdateMode.settings} />
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
                            Learn more.
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
              <IndexFormWrapper {...indexFormReadonlyCommonProps} key={IndicesUpdateMode.mappings} mode={IndicesUpdateMode.mappings} />
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
              <IndexFormWrapper {...indexFormReadonlyCommonProps} key={IndicesUpdateMode.alias} mode={IndicesUpdateMode.alias} />
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
          onOpen={refreshDetails}
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
