/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem, EuiButton, EuiButtonEmpty } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { get, set, differenceWith, isEqual } from "lodash";
import { diffArrays } from "diff";
import flattern from "flat";
// eui depends on react-ace, so we can import react-ace here
import { MonacoEditorDiffReact } from "../../../../components/MonacoEditor";
import IndexDetail from "../../components/IndexDetail";
import { IAliasAction, IndexItem, IndexItemRemote, MappingsProperties } from "../../../../../models/interfaces";
import { BREADCRUMBS, IndicesUpdateMode, ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { IIndexDetailRef, IndexDetailProps } from "../../components/IndexDetail/IndexDetail";
import { transformArrayToObject, transformObjectToArray } from "../../components/IndexMapping/IndexMapping";
import { CommonService } from "../../../../services/index";
import { ServerResponse } from "../../../../../server/models/types";
import { Modal } from "../../../../components/Modal";

interface CreateIndexProps extends RouteComponentProps<{ index?: string; mode?: IndicesUpdateMode }> {
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
        "index.number_of_shards": 1,
        "index.number_of_replicas": 1,
        "index.refresh_interval": "1s",
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
    return this.props.match.params.index !== undefined;
  }

  componentDidMount = async (): Promise<void> => {
    const isEdit = this.isEdit;
    if (isEdit) {
      const response: ServerResponse<Record<string, IndexItem>> = await this.props.commonService.apiCaller({
        endpoint: "indices.get",
        data: {
          index: this.index,
          flat_settings: true,
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
        this.context.notifications.toasts.addDanger(response.error);
      }
    }
    this.context.chrome.setBreadcrumbs([
      BREADCRUMBS.INDEX_MANAGEMENT,
      BREADCRUMBS.INDICES,
      isEdit ? BREADCRUMBS.EDIT_INDEX : BREADCRUMBS.CREATE_INDEX,
    ]);
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.INDICES);
  };

  onDetailChange: IndexDetailProps["onChange"] = (value) => {
    this.setState({
      indexDetail: {
        ...this.state.indexDetail,
        ...value,
      },
    });
  };

  updateAlias = async (): Promise<ServerResponse<any>> => {
    const { indexDetail, oldIndexDetail } = this.state;
    const { index } = indexDetail;
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

    // alias may have many unexpected errors, do that before update index settings.
    if (aliasActions.length) {
      return await this.props.commonService.apiCaller({
        endpoint: "indices.updateAliases",
        method: "PUT",
        data: {
          body: {
            actions: aliasActions,
          },
        },
      });
    }

    return Promise.resolve({
      ok: true,
      response: {},
    });
  };
  updateSettings = async (): Promise<ServerResponse<any>> => {
    const { indexDetail, oldIndexDetail } = this.state;
    const { index } = indexDetail;

    const newSettings = (indexDetail?.settings || {}) as Required<IndexItem>["settings"];
    const oldSettings = (oldIndexDetail?.settings || {}) as Required<IndexItem>["settings"];
    const differences = differenceWith(Object.entries(newSettings), Object.entries(oldSettings), isEqual);
    if (!differences.length) {
      return {
        ok: true,
        response: {},
      };
    }

    const finalSettings = differences.reduce((total, current) => {
      if (newSettings[current[0]] !== undefined) {
        return {
          ...total,
          [current[0]]: newSettings[current[0]],
        };
      }

      return total;
    }, {});

    return await this.props.commonService.apiCaller({
      endpoint: "indices.putSettings",
      method: "PUT",
      data: {
        index,
        flat_settings: true,
        // In edit mode, only dynamic settings can be modified
        body: finalSettings,
      },
    });
  };
  updateMappings = async (): Promise<ServerResponse<any>> => {
    const { indexDetail, oldIndexDetail } = this.state;
    const { index } = indexDetail;
    // handle the mappings here
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

    if (newMappingFields.length) {
      return await this.props.commonService.apiCaller({
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

    return Promise.resolve({
      ok: true,
      response: {},
    });
  };

  chainPromise = async (promises: Promise<ServerResponse<any>>[]): Promise<ServerResponse<any>> => {
    const newPromises = [...promises];
    while (newPromises.length) {
      const result = (await newPromises.shift()) as ServerResponse<any>;
      if (!result?.ok) {
        return result;
      }
    }

    return {
      ok: true,
      response: {},
    };
  };

  showDiff = async (): Promise<ServerResponse<any>> => {
    return new Promise((resolve, reject) => {
      Modal.show({
        title: "Please confirm the change.",
        "data-test-subj": "change_diff_confirm",
        type: "confirm",
        content: (
          <>
            <h2>The following changes will be done once you click the confirm button, Please make sure you want to do all the changes.</h2>
            <EuiSpacer />
            <MonacoEditorDiffReact
              options={{
                readOnly: true,
              }}
              language="json"
              width="100%"
              height={600}
              original={JSON.stringify(
                {
                  ...this.state.oldIndexDetail,
                  mappings: {
                    properties: transformArrayToObject(this.state.oldIndexDetail?.mappings?.properties || []),
                  },
                } as IndexItemRemote,
                null,
                2
              )}
              modified={JSON.stringify(
                {
                  ...this.state.indexDetail,
                  mappings: {
                    properties: transformArrayToObject(this.state.indexDetail?.mappings?.properties || []),
                  },
                },
                null,
                2
              )}
            />
          </>
        ),
        onOk: () =>
          resolve({
            ok: true,
            response: {},
          }),
        onCancel: () => {
          resolve({
            ok: false,
            error: "",
          });
        },
      });
    });
  };

  onSubmit = async (): Promise<void> => {
    const { mode } = this.props.match.params;
    const { indexDetail } = this.state;
    const { index, mappings, ...others } = indexDetail;
    if (!(await this.indexDetailRef?.validate())) {
      return;
    }
    this.setState({ isSubmitting: true });
    let result: ServerResponse<any>;
    if (this.isEdit) {
      const diffConfirm = await this.showDiff();
      if (!diffConfirm.ok) {
        this.setState({ isSubmitting: false });
        return;
      }
      let chainedPromises: Promise<ServerResponse<any>>[] = [];
      if (!mode) {
        chainedPromises.push(...[this.updateMappings(), this.updateAlias(), this.updateSettings()]);
      } else {
        switch (mode) {
          case IndicesUpdateMode.alias:
            chainedPromises.push(this.updateAlias());
            break;
          case IndicesUpdateMode.settings:
            chainedPromises.push(this.updateSettings());
            break;
          case IndicesUpdateMode.mappings:
            chainedPromises.push(this.updateMappings());
            break;
        }
      }
      result = await this.chainPromise(chainedPromises);
    } else {
      result = await this.props.commonService.apiCaller({
        endpoint: "indices.create",
        method: "PUT",
        data: {
          index,
          body: {
            ...others,
            mappings: {
              properties: transformArrayToObject(mappings?.properties || []),
            },
          },
        },
      });
    }
    this.setState({ isSubmitting: false });

    // handle all the response here
    if (result && result.ok) {
      this.context.notifications.toasts.addSuccess(`${indexDetail.index} has been successfully ${this.isEdit ? "updated" : "created"}.`);
      this.props.history.push(ROUTES.INDICES);
    } else {
      this.context.notifications.toasts.addDanger(result.error);
    }
  };

  onSimulateIndexTemplate = (indexName: string): Promise<ServerResponse<IndexItemRemote>> => {
    return this.props.commonService
      .apiCaller<{ template: IndexItemRemote }>({
        endpoint: "transport.request",
        data: {
          path: `/_index_template/_simulate_index/${indexName}`,
          method: "POST",
        },
      })
      .then((res) => {
        if (res.ok && res.response && res.response.template) {
          return {
            ...res,
            response: {
              ...res.response.template,
              settings: flattern(res.response.template?.settings || {}),
            },
          };
        }

        return {
          ok: false,
          error: "",
        } as ServerResponse<IndexItemRemote>;
      });
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
          mode={this.props.match.params.mode}
          ref={(ref) => (this.indexDetailRef = ref)}
          isEdit={this.isEdit}
          value={indexDetail}
          oldValue={oldIndexDetail}
          onChange={this.onDetailChange}
          onSimulateIndexTemplate={this.onSimulateIndexTemplate}
          refreshOptions={(aliasName) =>
            this.props.commonService.apiCaller({
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
