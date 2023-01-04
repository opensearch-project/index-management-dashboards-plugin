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
  EuiFlexItem,
  EuiSpacer,
  EuiFlexGroup,
  EuiButton,
  EuiBasicTable,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiIcon,
  EuiHealth,
  EuiFormRow,
  EuiLink,
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
  const [editVisible, setEditVisible] = useState(false);
  const [editMode, setEditMode] = useState(IndicesUpdateMode.settings);
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

  useEffect(() => {
    refreshDetails();
    coreService?.chrome.setBreadcrumbs([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      {
        ...BREADCRUMBS.INDEX_DETAIL,
        href: `#${props.location.pathname}`,
      },
    ]);
  }, []);

  const indexFormCommonProps = {
    index,
    onCancel: () => setEditVisible(false),
    onSubmitSuccess: () => {
      ref.current?.refreshIndex();
      setEditVisible(false);
      fetchIndicesDetail();
    },
  };

  const indexFormReadonlyCommonProps = {
    ...indexFormCommonProps,
    hideButtons: true,
    readonly: true,
    ref,
  };

  const onEdit = (editMode: IndicesUpdateMode) => {
    setEditMode(editMode);
    setEditVisible(true);
  };

  if (!record || !detail || !finalDetail) {
    return null;
  }

  return (
    <ContentPanel
      title={
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
      }
    >
      <EuiTabbedContent
        tabs={[
          {
            id: "indexDetailModalOverview",
            name: "Overview",
            content: (
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
                        data-test-subj={`index-detail-overview-item-${item.label}`}
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
            ),
          },
          {
            id: "indexDetailModalSettings",
            name: "Settings",
            content: (
              <>
                <EuiSpacer />
                <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
                  <EuiFlexItem grow={false}>
                    <h2>Advanced index settings</h2>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton size="s" data-test-subj="detailModalEdit" onClick={() => onEdit(IndicesUpdateMode.settings)}>
                      Edit
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer />
                <IndexFormWrapper {...indexFormReadonlyCommonProps} key={IndicesUpdateMode.settings} mode={IndicesUpdateMode.settings} />
              </>
            ),
          },
          {
            id: "indexDetailModalMappings",
            name: "Mappings",
            content: (
              <>
                <EuiSpacer />
                <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
                  <EuiFlexItem grow={false}>
                    <h2>Index mappings</h2>
                    <EuiFormRow
                      fullWidth
                      helpText={
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
                      }
                    >
                      <></>
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton size="s" data-test-subj="detailModalEdit" onClick={() => onEdit(IndicesUpdateMode.mappings)}>
                      Add index mappings
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer />
                <IndexFormWrapper {...indexFormReadonlyCommonProps} key={IndicesUpdateMode.mappings} mode={IndicesUpdateMode.mappings} />
              </>
            ),
          },
          {
            id: `indexDetailModalAlias`,
            name: "Alias",
            content: (
              <>
                <EuiSpacer />
                <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
                  <EuiFlexItem grow={false}>
                    <h2>Index alias</h2>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton size="s" data-test-subj="detailModalEdit" onClick={() => onEdit(IndicesUpdateMode.alias)}>
                      Edit
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer />
                <EuiBasicTable
                  rowHeader="alias"
                  noItemsMessage="No alias found"
                  items={Object.keys(finalDetail.aliases || {}).map((item) => ({ alias: item }))}
                  columns={[
                    {
                      field: "alias",
                      name: "Alias name",
                      render: (val: string, record: { alias: string }) => (
                        <Link to={`${ROUTES.ALIASES}?search=${val}`}>
                          <span title={val}>{val}</span>
                        </Link>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
        ]}
      />
      {editVisible ? (
        <EuiFlyout data-test-subj="index-form-in-index-detail" onClose={() => null} hideCloseButton>
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="m">
              <span onClick={() => setEditVisible(false)} style={{ cursor: "pointer" }}>
                <EuiIcon type="arrowLeft" size="l" />
                Edit index {editMode}
              </span>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <IndexFormWrapper {...indexFormCommonProps} mode={editMode} />
          </EuiFlyoutBody>
        </EuiFlyout>
      ) : null}
    </ContentPanel>
  );
}
