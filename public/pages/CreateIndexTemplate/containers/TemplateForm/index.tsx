/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiSpacer, EuiFlexGroup, EuiFlexItem, EuiButton, EuiButtonEmpty } from "@elastic/eui";
import { get, set } from "lodash";
import TemplateDetail, { TemplateDetailProps, ITemplateDetailRef } from "../../components/TemplateDetail";
import { TemplateItem, TemplateItemRemote } from "../../../../../models/interfaces";
import { BREADCRUMBS, IndicesUpdateMode } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { transformArrayToObject, transformObjectToArray } from "../../../CreateIndex/components/IndexMapping/IndexMapping";
import { CommonService } from "../../../../services/index";
import { ServerResponse } from "../../../../../server/models/types";

export interface TemplateFormProps {
  index?: string;
  mode?: IndicesUpdateMode;
  commonService: CommonService;
  onCancel?: () => void;
  onSubmitSuccess?: (indexName: string) => void;
  hideButtons?: boolean;
}

interface CreateIndexTemplateState {
  templateDetail: TemplateItem;
  oldTemplateDetail?: TemplateItem;
  isSubmitting: boolean;
}

export default class CreateIndexTemplate extends Component<TemplateFormProps, CreateIndexTemplateState> {
  static contextType = CoreServicesContext;
  state: CreateIndexTemplateState = {
    isSubmitting: false,
    templateDetail: {
      name: "",
      version: "",
      priority: "",
      settings: {
        "index.number_of_shards": 1,
        "index.number_of_replicas": 1,
        "index.refresh_interval": "1s",
      },
      mappings: {},
    },
    oldTemplateDetail: undefined,
  };

  TemplateDetailRef: ITemplateDetailRef | null = null;

  get commonService() {
    return this.props.commonService;
  }

  get index() {
    return this.props.index;
  }

  get isEdit() {
    return this.index !== undefined;
  }

  get mode() {
    return this.props.mode;
  }

  getTemplateDetail = async (indexName: string): Promise<TemplateItemRemote> => {
    const response = await this.commonService.apiCaller<Record<string, TemplateItemRemote>>({
      endpoint: "indices.get",
      data: {
        index: indexName,
        flat_settings: true,
      },
    });
    if (response.ok) {
      return response.response[indexName];
    }

    this.context.notifications.toasts.addDanger(response.error);
    return new Promise(() => {});
  };

  refreshTemplate = async () => {
    const TemplateDetail = await this.getTemplateDetail(this.index as string);
    const payload = {
      ...TemplateDetail,
      index: this.index,
    };
    set(payload, "mappings.properties", transformObjectToArray(get(payload, "mappings.properties", {})));

    this.setState({
      templateDetail: payload as TemplateItem,
      oldTemplateDetail: JSON.parse(JSON.stringify(payload)),
    });
  };

  componentDidMount = async (): Promise<void> => {
    const isEdit = this.isEdit;
    if (isEdit) {
      this.refreshTemplate();
    }
    this.context.chrome.setBreadcrumbs([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      isEdit ? BREADCRUMBS.EDIT_INDEX : BREADCRUMBS.CREATE_INDEX,
    ]);
  };

  onCancel = () => {
    this.props.onCancel && this.props.onCancel();
  };

  onDetailChange: TemplateDetailProps["onChange"] = (value) => {
    this.setState({
      templateDetail: {
        ...this.state.templateDetail,
        ...value,
      },
    });
  };

  getOrderedJson = (json: Record<string, any>) => {
    const entries = Object.entries(json);
    entries.sort((a, b) => (a[0] < b[0] ? -1 : 1));
    return entries.reduce((total, [key, value]) => ({ ...total, [key]: value }), {});
  };

  onSubmit = async (): Promise<void> => {
    const { templateDetail } = this.state;
    const { name, mappings, ...others } = templateDetail;
    if (!(await this.TemplateDetailRef?.validate())) {
      return;
    }
    this.setState({ isSubmitting: true });
    let result: ServerResponse<any>;
    result = await this.commonService.apiCaller({
      endpoint: "indices.putIndexTemplate",
      data: {
        name,
        create: !this.isEdit,
        body: {
          ...others,
          mappings: {
            properties: transformArrayToObject(mappings?.properties || []),
          },
        },
      },
    });

    this.setState({ isSubmitting: false });

    // handle all the response here
    if (result && result.ok) {
      this.context.notifications.toasts.addSuccess(
        `[${templateDetail.name}] has been successfully ${this.isEdit ? "updated" : "created"}.`
      );
      this.props.onSubmitSuccess && this.props.onSubmitSuccess(templateDetail.name);
    } else {
      this.context.notifications.toasts.addDanger(result.error);
    }
  };

  render() {
    const isEdit = this.isEdit;
    const { hideButtons } = this.props;
    const { templateDetail, isSubmitting, oldTemplateDetail } = this.state;

    return (
      <>
        <TemplateDetail
          ref={(ref) => (this.TemplateDetailRef = ref)}
          isEdit={this.isEdit}
          value={templateDetail}
          oldValue={oldTemplateDetail}
          onChange={this.onDetailChange}
          refreshOptions={(aliasName: string) =>
            this.commonService.apiCaller({
              endpoint: "cat.aliases",
              method: "GET",
              data: {
                format: "json",
                name: aliasName,
                expand_wildcards: "open",
              },
            })
          }
        />
        {hideButtons ? null : (
          <>
            <EuiSpacer />
            <EuiSpacer />
            <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty onClick={this.onCancel} data-test-subj="CreateIndexTemplateCancelButton">
                  Cancel
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton fill onClick={this.onSubmit} isLoading={isSubmitting} data-test-subj="CreateIndexTemplateCreateButton">
                  {isEdit ? "Update" : "Create"}
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </>
        )}
      </>
    );
  }
}
