/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiButton, EuiButtonEmpty } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { get, pick, set } from "lodash";
import { diffArrays } from "diff";
import IndexDetail from "../../components/IndexDetail";
import { IAliasAction, IndexItem, MappingsProperties, MappingsPropertiesObject } from "../../../../../models/interfaces";
import { BREADCRUMBS, INDEX_DYNAMIC_SETTINGS, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { IIndexDetailRef, IndexDetailProps } from "../../components/IndexDetail/IndexDetail";
import { transformArrayToObject, transformObjectToArray } from "../../components/IndexMapping/IndexMapping";
import { CommonService } from "../../../../services/index";
import { ServerResponse } from "../../../../../server/models/types";

interface CreateIndexProps extends RouteComponentProps<{ index?: string }> {
  isEdit?: boolean;
  commonService: CommonService;
}

interface CreateIndexState {
  indexDetail: IndexItem;
  oldIndexDetail?: IndexItem;
  isSubmitting: boolean;
}

export default class CreateIndex extends Component<CreateIndexProps, CreateIndexState> {
  static contextType = CoreServicesContext;
  state: CreateIndexState = {
    isSubmitting: false,
    indexDetail: {
      index: "",
      settings: {
        index: {
          number_of_shards: 1,
          number_of_replicas: 1,
        },
      },
      mappings: {},
    },
    oldIndexDetail: undefined,
  };
  indexDetailRef: IIndexDetailRef | null = null;

  get index() {
    return this.props.match.params.index || "";
  }

  get isEdit() {
    return !!this.props.match.params.index;
  }

  componentDidMount = async (): Promise<void> => {
    const isEdit = this.isEdit;
    if (isEdit) {
      try {
        const response: ServerResponse<Record<string, IndexItem>> = await this.props.commonService.apiCaller({
          endpoint: "indices.get",
          data: {
            index: this.index,
          },
        });
        if (response.ok) {
          const payload = {
            ...response.response[this.index || ""],
            index: this.index,
          };
          set(payload, "mappings.properties", transformObjectToArray(get(payload, "mappings.properties", {})));

          this.setState({
            indexDetail: payload,
            oldIndexDetail: JSON.parse(JSON.stringify(payload)),
          });
        } else {
          throw Error(response.error);
        }
      } catch (e: any) {
        this.context.notifications.toasts.addDanger(e.message);
      }
    }
    this.context.chrome.setBreadcrumbs([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDEX_POLICIES,
      isEdit ? BREADCRUMBS.EDIT_INDEX : BREADCRUMBS.CREATE_INDEX,
    ]);
  };

  onCancel = (): void => {
    if (this.props.isEdit) this.props.history.goBack();
    else this.props.history.push(ROUTES.INDEX_POLICIES);
  };

  onDetailChange: IndexDetailProps["onChange"] = (value) => {
    this.setState({
      indexDetail: {
        ...this.state.indexDetail,
        ...value,
      },
    });
  };

  onSubmit = async (): Promise<void> => {
    const { indexDetail, oldIndexDetail } = this.state;
    const { index, ...others } = indexDetail;
    if (!(await this.indexDetailRef?.validate())) {
      return;
    }
    this.setState({ isSubmitting: true });
    try {
      let result: ServerResponse<any>;
      if (this.isEdit) {
        // handle the alias here
        const diffedAliasArrayes = diffArrays(Object.keys(oldIndexDetail?.aliases || {}), Object.keys(indexDetail.aliases || {}));
        const aliasActions: IAliasAction[] = diffedAliasArrayes.reduce((total: IAliasAction[], current) => {
          if (current.added) {
            return [
              ...total,
              ...current.value.map((item) => ({
                add: {
                  index,
                  alias: item,
                },
              })),
            ];
          } else if (current.removed) {
            return [
              ...total,
              ...current.value.map((item) => ({
                remove: {
                  index,
                  alias: item,
                },
              })),
            ];
          }

          return total;
        }, [] as IAliasAction[]);

        // handle the mappiings here
        const newMappingProperties = indexDetail?.mappings?.properties || [];
        const diffedMappingArrayes = diffArrays(
          (oldIndexDetail?.mappings?.properties || []).map((item) => item.fieldName),
          newMappingProperties.map((item) => item.fieldName)
        );
        const newMappingFields: MappingsProperties = diffedMappingArrayes
          .filter((item) => item.added)
          .reduce((total, current) => [...total, ...current.value], [] as string[])
          .map((current) => newMappingProperties.find((item) => item.fieldName === current) as MappingsProperties[number])
          .filter((item) => item);

        const newMappingSettings = transformArrayToObject(newMappingFields);

        try {
          if (newMappingFields.length) {
            result = await this.props.commonService.apiCaller({
              endpoint: "indices.putMapping",
              method: "PUT",
              data: {
                index,
                body: {
                  properties: newMappingSettings,
                },
              },
            });
          }

          // alias may have many unexpected errors, do that before update index settings.
          if (aliasActions.length) {
            result = await this.props.commonService.apiCaller({
              endpoint: "indices.updateAliases",
              method: "PUT",
              data: {
                body: {
                  actions: aliasActions,
                },
              },
            });
          }

          result = await this.props.commonService.apiCaller({
            endpoint: "indices.putSettings",
            method: "PUT",
            data: {
              index,
              // In edit mode, only dynamic settings can be modified
              body: pick(indexDetail.settings, INDEX_DYNAMIC_SETTINGS),
            },
          });
        } catch (e: any) {
          result = {
            ok: false,
            error: e.message,
          };
        }
      } else {
        try {
          result = await this.props.commonService.apiCaller({
            endpoint: "indices.create",
            method: "PUT",
            data: {
              index,
              body: others,
            },
          });
        } catch (e: any) {
          result = {
            ok: false,
            error: e.message,
          };
        }
      }

      // handle all the response here
      if (result && result.ok) {
        this.context.notifications.toasts.addSuccess(`${indexDetail.index} has been successfully ${this.isEdit ? "updated" : "created"}.`);
        this.props.history.push(ROUTES.INDICES);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      this.context.notifications.toasts.addDanger(err.message);
    }

    this.setState({ isSubmitting: false });
  };

  render() {
    const isEdit = this.isEdit;
    const { indexDetail, isSubmitting, oldIndexDetail } = this.state;

    return (
      <div style={{ padding: "0px 50px" }}>
        <EuiTitle size="l">
          <h1>{isEdit ? "Edit" : "Create"} index</h1>
        </EuiTitle>
        <EuiSpacer />
        <IndexDetail
          ref={(ref) => (this.indexDetailRef = ref)}
          isEdit={this.isEdit}
          value={indexDetail}
          oldValue={oldIndexDetail}
          onChange={this.onDetailChange}
        />
        <EuiSpacer />
        <EuiSpacer />
        <EuiFlexGroup alignItems="center" justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onCancel} data-test-subj="createIndexCancelButton">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onSubmit} isLoading={isSubmitting} data-test-subj="createIndexCreateButton">
              {isEdit ? "Update" : "Create"}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }
}
