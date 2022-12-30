/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, forwardRef, useContext } from "react";
import { EuiSpacer, EuiFlexGroup, EuiFlexItem, EuiButton, EuiButtonEmpty, EuiLoadingSpinner } from "@elastic/eui";
import { get, set, differenceWith, isEqual, merge } from "lodash";
import { diffArrays } from "diff";
import flattern from "flat";
import { CoreStart } from "opensearch-dashboards/public";
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
  value?: Partial<IndexItemRemote>;
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

const findLineNumber = (regexp: RegExp, str: string): number => {
  const propertyExecResult = regexp.exec(str);
  if (propertyExecResult && propertyExecResult.indices && propertyExecResult.indices[1]) {
    const [startPosition] = propertyExecResult.indices[1];
    const cutString = str.substring(0, startPosition);
    return cutString.split("\n").length;
  }

  return 0;
};

export class IndexForm extends Component<IndexFormProps & { services: BrowserServices }, CreateIndexState> {
  static contextType = CoreServicesContext;
  /**
   * convert the mappings.properies to array
   * @param payload index detail with the mappings.properties is a map
   */
  static transformIndexDetailToLocal(payload?: Partial<IndexItemRemote>): Partial<IndexItem> {
    const newPayload = { ...payload };
    set(newPayload, "mappings.properties", transformObjectToArray(get(newPayload, "mappings.properties", {})));
    return newPayload as IndexItem;
  }
  static transformIndexDetailToRemote(payload?: Partial<IndexItem>): Partial<IndexItemRemote> {
    const newPayload = { ...payload };
    set(newPayload, "mappings.properties", transformArrayToObject(get(newPayload, "mappings.properties", {})));
    return newPayload as IndexItemRemote;
  }
  constructor(props: IndexFormProps & { services: BrowserServices }) {
    super(props);
    const isEdit = this.isEdit;
    this.state = {
      isSubmitting: false,
      indexDetail: merge({}, defaultIndexSettings, IndexForm.transformIndexDetailToLocal(props.value)),
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

  hasUnsavedChanges = (mode: IndicesUpdateMode) => this.indexDetailRef?.hasUnsavedChanges(mode);
  getValue = () => IndexForm.transformIndexDetailToRemote(this.state.indexDetail);

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
      const payload = IndexForm.transformIndexDetailToLocal({
        ...indexDetail,
        index: this.index,
      });

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
    if (!isEqual(indexDetail.mappings, oldIndexDetail?.mappings)) {
      return await this.commonService.apiCaller({
        endpoint: "indices.putMapping",
        method: "PUT",
        data: {
          index,
          body: {
            ...indexDetail.mappings,
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

  onSubmit = async (): Promise<{ ok: boolean }> => {
    const mode = this.mode;
    const { indexDetail } = this.state;
    const { index, mappings, ...others } = indexDetail;
    if (!(await this.indexDetailRef?.validate())) {
      return { ok: false };
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
              ...mappings,
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
      const mapperParseExceptionReg = /\[mapper_parsing_exception\] unknown parameter \[([^\]]+)\] on mapper \[([^\]]+)\] of type \[([^\]]+)\]/;
      const mapperTypeParseExceptionReg = /\[mapper_parsing_exception\] No handler for type \[([^\]]+)\] declared on field \[([^\]]+)\]/;
      const execResult = mapperParseExceptionReg.exec(result.error);
      const typeParseExceptionResult = mapperTypeParseExceptionReg.exec(result.error);
      let finalMessage = result.error;
      const mappingsEditorValue = this.indexDetailRef?.getMappingsJSONEditorValue() || "";
      if (execResult) {
        const jsonRegExp = new RegExp(`"${execResult[2]}":\\s*\\{[\\S\\s]*("${execResult[1]}"\\s*:)[\\S\\s]*\\}`, "d");
        if (findLineNumber(jsonRegExp, mappingsEditorValue)) {
          finalMessage = `There is a problem with the index mapping syntax. Unknown parameter "${execResult[1]}" on line ${findLineNumber(
            jsonRegExp,
            mappingsEditorValue
          )}.`;
        }
      }

      if (typeParseExceptionResult) {
        const jsonRegExp = new RegExp(
          `"${typeParseExceptionResult[2]}":\\s*\\{[\\S\\s]*("type":\\s*"${typeParseExceptionResult[1]}"\\s*)[\\S\\s]*\\}`,
          "d"
        );
        if (findLineNumber(jsonRegExp, mappingsEditorValue)) {
          finalMessage = `There is a problem with the index mapping syntax. Unsupported type "${
            typeParseExceptionResult[1]
          }" on line ${findLineNumber(jsonRegExp, mappingsEditorValue)}.`;
        }
      }
      this.context.notifications.toasts.addDanger(finalMessage);
    }
    return result;
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
                name: `*${aliasName || ""}*`,
                s: "alias:desc",
              },
            })
          }
          onSubmit={this.onSubmit}
          refreshIndex={this.refreshIndex}
          docVersion={(this.context as CoreStart).docLinks.DOC_LINK_VERSION}
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
