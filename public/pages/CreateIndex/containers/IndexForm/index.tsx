/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, forwardRef, useContext } from "react";
import { EuiSpacer, EuiFlexGroup, EuiFlexItem, EuiButton, EuiButtonEmpty, EuiLoadingSpinner } from "@elastic/eui";
import { get, set, differenceWith, isEqual, merge } from "lodash";
import { diffArrays } from "diff";
import flattern from "flat";
import IndexDetail, { IndexDetailProps, IIndexDetailRef, defaultIndexSettings } from "../../components/IndexDetail";
import { IAliasAction, IndexItem, IndexItemRemote, MappingsProperties } from "../../../../../models/interfaces";
import { IndicesUpdateMode } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { transformArrayToObject, transformObjectToArray } from "../../components/IndexMapping/IndexMapping";
import { ServerResponse } from "../../../../../server/models/types";
import { BrowserServices } from "../../../../models/interfaces";
import { ServicesContext } from "../../../../services";

export const getAliasActionsByDiffArray = (
  oldAliases: string[],
  newAliases: string[],
  callback: (val: string) => IAliasAction[string]
): IAliasAction[] => {
  const diffedAliasArrayes = diffArrays(oldAliases, newAliases);
  return diffedAliasArrayes.reduce((total: IAliasAction[], current) => {
    if (current.added) {
      return [
        ...total,
        ...current.value.map((item) => ({
          add: callback(item),
        })),
      ];
    } else if (current.removed) {
      return [
        ...total,
        ...current.value.map((item) => ({
          remove: callback(item),
        })),
      ];
    }

    return total;
  }, [] as IAliasAction[]);
};

export interface IndexFormProps extends Pick<IndexDetailProps, "readonly" | "sourceIndices"> {
  index?: string;
  mode?: IndicesUpdateMode;
  onCancel?: () => void;
  onSubmitSuccess?: (indexName: string) => void;
  hideButtons?: boolean;
}

interface CreateIndexState {
  indexDetail: IndexItem;
  oldIndexDetail?: IndexItem;
  isSubmitting: boolean;
  loading: boolean;
}

export class IndexForm extends Component<IndexFormProps & { services: BrowserServices }, CreateIndexState> {
  static contextType = CoreServicesContext;
  constructor(props: IndexFormProps & { services: BrowserServices }) {
    super(props);
    const isEdit = this.isEdit;
    this.state = {
      isSubmitting: false,
      indexDetail: merge({}, defaultIndexSettings),
      oldIndexDetail: undefined,
      loading: isEdit,
    };
  }

  componentDidMount(): void {
    const isEdit = this.isEdit;
    if (isEdit) {
      this.refreshIndex();
    }
  }

  indexDetailRef: IIndexDetailRef | null = null;

  get commonService() {
    return this.props.services.commonService;
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

  getIndexDetail = async (indexName: string): Promise<IndexItemRemote> => {
    const response = await this.commonService.apiCaller<Record<string, IndexItemRemote>>({
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
    return Promise.reject();
  };

  refreshIndex = async () => {
    this.setState({
      loading: true,
    });
    try {
      const indexDetail = await this.getIndexDetail(this.index as string);
      const payload = {
        ...indexDetail,
        index: this.index,
      };
      set(payload, "mappings.properties", transformObjectToArray(get(payload, "mappings.properties", {})));

      this.setState({
        indexDetail: payload as IndexItem,
        oldIndexDetail: JSON.parse(JSON.stringify(payload)),
      });
    } catch (e) {
      // do nothing
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  onCancel = () => {
    this.props.onCancel && this.props.onCancel();
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
    const aliasActions = getAliasActionsByDiffArray(
      Object.keys(oldIndexDetail?.aliases || {}),
      Object.keys(indexDetail.aliases || {}),
      (alias) => ({
        index,
        alias,
      })
    );

    if (aliasActions.length) {
      return await this.commonService.apiCaller({
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

    return await this.commonService.apiCaller({
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
      return await this.commonService.apiCaller({
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

  getOrderedJson = (json: Record<string, any>) => {
    const entries = Object.entries(json);
    entries.sort((a, b) => (a[0] < b[0] ? -1 : 1));
    return entries.reduce((total, [key, value]) => ({ ...total, [key]: value }), {});
  };

  onSubmit = async (): Promise<void> => {
    const mode = this.mode;
    const { indexDetail } = this.state;
    const { index, mappings, ...others } = indexDetail;
    if (!(await this.indexDetailRef?.validate())) {
      return;
    }
    this.setState({ isSubmitting: true });
    let result: ServerResponse<any>;
    if (this.isEdit) {
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
      result = await this.commonService.apiCaller({
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
      this.props.onSubmitSuccess && this.props.onSubmitSuccess(indexDetail.index);
    } else {
      this.context.notifications.toasts.addDanger(result.error);
    }
  };

  onSimulateIndexTemplate = (indexName: string): Promise<ServerResponse<IndexItemRemote>> => {
    return this.commonService
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
    const { hideButtons, readonly } = this.props;
    const { indexDetail, isSubmitting, oldIndexDetail, loading } = this.state;

    if (loading) {
      return <EuiLoadingSpinner size="l" />;
    }

    return (
      <>
        <IndexDetail
          readonly={readonly}
          mode={this.mode}
          ref={(ref) => (this.indexDetailRef = ref)}
          isEdit={this.isEdit}
          value={indexDetail}
          oldValue={oldIndexDetail}
          onChange={this.onDetailChange}
          onSimulateIndexTemplate={this.onSimulateIndexTemplate}
          sourceIndices={this.props.sourceIndices}
          onGetIndexDetail={this.getIndexDetail}
          refreshOptions={(aliasName) =>
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
          </>
        )}
      </>
    );
  }
}

export default forwardRef(function IndexFormWrapper(props: IndexFormProps, ref: React.Ref<IndexForm>) {
  const services = useContext(ServicesContext);
  return <IndexForm {...props} ref={ref} services={services as BrowserServices} />;
});
