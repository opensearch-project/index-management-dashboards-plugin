/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, forwardRef, useContext } from "react";
import { get, set } from "lodash";
import { diffArrays } from "diff";
import flattern from "flat";
import { CoreStart } from "opensearch-dashboards/public";
import IndexDetail, { IndexDetailProps, IIndexDetailRef } from "../../components/IndexDetail";
import { DiffableIndexItemRemote, IAliasAction, IndexItem, IndexItemRemote } from "../../../models/interfaces";
import { IndicesUpdateMode } from "../../utils/constants";
import { CoreServicesContext } from "../../components/core_services";
import { transformArrayToObject, transformObjectToArray } from "../../components/IndexMapping/IndexMapping";
import { ServerResponse } from "../../../server/models/types";
import { BrowserServices } from "../../models/interfaces";
import { ServicesContext } from "../../services";

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

export interface IndexFormProps extends Omit<IndexDetailProps, "refreshOptions" | "docVersion"> {
  refreshOptions?: IndexDetailProps["refreshOptions"];
}

interface CreateIndexState {}

export class IndexForm extends Component<IndexFormProps & { services: BrowserServices }, CreateIndexState> {
  static contextType = CoreServicesContext;
  /**
   * convert the mappings.properies to array
   * @param payload index detail with the mappings.properties is a map
   */
  static transformIndexDetailToLocal(payload?: Partial<IndexItemRemote>): Partial<IndexItem> {
    const newPayload = JSON.parse(JSON.stringify({ ...payload }));
    if (newPayload.mappings && newPayload.mappings.properties) {
      set(newPayload, "mappings.properties", transformObjectToArray(get(newPayload, "mappings.properties", {})));
    }
    return newPayload as IndexItem;
  }
  static transformIndexDetailToRemote(payload?: Partial<IndexItem>): Partial<IndexItemRemote> {
    const newPayload = JSON.parse(JSON.stringify({ ...payload }));
    if (newPayload.mappings && newPayload.mappings.properties) {
      set(newPayload, "mappings.properties", transformArrayToObject(get(newPayload, "mappings.properties", [])));
    }
    return newPayload as IndexItemRemote;
  }
  static transformIndexDetailToDiffableJSON(payload?: Partial<IndexItem>): Partial<DiffableIndexItemRemote> {
    const newPayload = JSON.parse(JSON.stringify({ ...payload }));
    if (newPayload.mappings && newPayload.mappings.properties) {
      set(newPayload, "mappings.properties", this.transformIndexDetailToDiffableJSON(get(newPayload, "mappings.properties", [])));
    }
    return newPayload as DiffableIndexItemRemote;
  }

  async validate() {
    const result = await this.indexDetailRef?.validate();
    if (result) {
      return "";
    } else {
      return "So fields error.";
    }
  }

  indexDetailRef: IIndexDetailRef | null = null;

  get commonService() {
    return this.props.services.commonService;
  }

  hasUnsavedChanges = (mode: IndicesUpdateMode) => this.indexDetailRef?.hasUnsavedChanges(mode);
  getValue = () => IndexForm.transformIndexDetailToRemote(JSON.parse(JSON.stringify(this.props.value)));
  simulateFromTemplate = () => this.indexDetailRef?.simulateFromTemplate();
  importSettings = (args: Parameters<IIndexDetailRef["importSettings"]>[0]) => this.indexDetailRef?.importSettings(args);

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
              settings: flattern(res.response.template?.settings || {}, {
                safe: true,
              }),
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
    return (
      <>
        <IndexDetail
          ref={(ref) => (this.indexDetailRef = ref)}
          onSimulateIndexTemplate={this.onSimulateIndexTemplate}
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
          docVersion={(this.context as CoreStart).docLinks.DOC_LINK_VERSION}
          {...this.props}
        />
      </>
    );
  }
}

export default forwardRef(function IndexFormWrapper(props: IndexFormProps, ref: React.Ref<IndexForm>) {
  const services = useContext(ServicesContext);
  return <IndexForm {...props} ref={ref} services={services as BrowserServices} />;
});
