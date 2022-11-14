/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  EuiButtonEmpty,
  EuiCopy,
  EuiTabbedContent,
  EuiDescriptionList,
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiSpacer,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
} from "@elastic/eui";
import { get } from "lodash";
import { Link } from "react-router-dom";
import { IndexItem } from "../../../../../models/interfaces";
import IndicesActions, { IndicesActionsProps } from "../IndicesActions";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";
import { IndicesUpdateMode, ROUTES } from "../../../../utils/constants";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import IndexForm from "../../../CreateIndex/containers/IndexForm";

export interface IndexDetailModalProps extends Omit<IndicesActionsProps, "selectedItems"> {
  index: string;
  record: ManagedCatIndex;
  onUpdateIndex: () => void;
}

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
    value: "health",
  },
  {
    label: "Status",
    value: "status",
  },
  {
    label: "Creation date",
    value: ({ detail }) => <span>{new Date(parseInt(detail.settings?.index?.creation_date || "0")).toLocaleString()}</span>,
  },
  {
    label: "Total size",
    value: ({ detail }) => <span>{detail["store.size"]}</span>,
  },
  {
    label: "Primaries size",
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
  const { index, record, onUpdateIndex, ...others } = props;
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState({} as IndexItem);
  const finalDetail: IFinalDetail = useMemo(
    () => ({
      ...record,
      ...detail,
    }),
    [record, detail]
  );
  const services = useContext(ServicesContext) as BrowserServices;

  useEffect(() => {
    if (visible) {
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
          }
        });
    }
  }, [visible]);

  const onCloseFlyout = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const indexFormCommonProps = {
    index: props.index,
    commonService: services.commonService,
    onCancel: onCloseFlyout,
    onSubmitSuccess: () => {
      onCloseFlyout();
      onUpdateIndex();
    },
  };

  return (
    <>
      <EuiCopy textToCopy={index}>
        {(copy) => <EuiButtonEmpty size="xs" flush="right" iconType="copyClipboard" onClick={copy} color="text"></EuiButtonEmpty>}
      </EuiCopy>
      <EuiButtonEmpty onClick={() => setVisible(true)} data-test-subj={`view-index-detail-button-${index}`}>
        {index}
      </EuiButtonEmpty>
      {visible ? (
        <EuiFlyout onClose={onCloseFlyout} hideCloseButton>
          <EuiFlyoutHeader hasBorder>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <EuiTitle size="m">
                <span>{index}</span>
              </EuiTitle>
              <IndicesActions selectedItems={[record]} {...others} />
            </div>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiTabbedContent
              tabs={[
                {
                  id: "index-detail-modal-overview",
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
                  id: "index-detail-modal-settings",
                  name: "Settings",
                  content: (
                    <>
                      <EuiSpacer />
                      <IndexForm {...indexFormCommonProps} mode={IndicesUpdateMode.settings} />
                    </>
                  ),
                },
                {
                  id: "index-detail-modal-mappings",
                  name: "Mappings",
                  content: (
                    <>
                      <EuiSpacer />
                      <IndexForm {...indexFormCommonProps} mode={IndicesUpdateMode.mappings} />
                    </>
                  ),
                },
                {
                  id: `index-detail-modal-${IndicesUpdateMode.alias}`,
                  name: "Alias",
                  content: (
                    <>
                      <EuiSpacer />
                      <IndexForm {...indexFormCommonProps} mode={IndicesUpdateMode.alias} />
                    </>
                  ),
                },
              ]}
            />
          </EuiFlyoutBody>
        </EuiFlyout>
      ) : null}
    </>
  );
}
