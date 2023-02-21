/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DATA_STREAM_REGEX } from "./constants";
import { IndexSelectItem } from "../models/interfaces";
import { EuiComboBoxOptionOption } from "@elastic/eui";
import _ from "lodash";
import { BrowserServices } from "../../../models/interfaces";
import { CoreStart } from "opensearch-dashboards/public";
import { getErrorMessage } from "../../../utils/helpers";
import { IndexItem } from "../../../../models/interfaces";

/**
 * parse index names to extract data stream name if the index is a backing index of data stream,
 * otherwise using whatever it is
 *
 * the reason for this is that GET _cat/indices/*.ds* will not return any result, it will need data stream name
 * to pull all data stream indices
 * @param indices
 */
export const parseIndexNames = (indices: string): string[] => {
  let indexArray: string[] = [];
  indices &&
    indices.split(",").forEach((index) => {
      // need extract data stream name first
      if (DATA_STREAM_REGEX.test(index)) {
        let match = index.match(DATA_STREAM_REGEX);
        indexArray.push(match ? match[1] : index);
      } else {
        indexArray.push(index);
      }
    });
  return indexArray;
};

export const getIndexOptions = async (props: { services: BrowserServices; searchValue: string; context: CoreStart }) => {
  const { services, searchValue, context } = props;
  let options: EuiComboBoxOptionOption<IndexSelectItem>[] = [];
  try {
    let actualSearchValue = parseIndexNames(searchValue);

    const [indexResponse, dataStreamResponse, aliasResponse] = await Promise.all([
      services.indexService.getIndices({
        from: 0,
        size: 50,
        search: actualSearchValue.join(","),
        indices: [actualSearchValue.join(",")],
        sortDirection: "desc",
        sortField: "index",
        showDataStreams: true,
      }),
      services.indexService.getDataStreams({ search: searchValue.trim() }),
      services.indexService.getAliases({ search: searchValue.trim() }),
    ]);
    if (indexResponse.ok) {
      const indices = indexResponse.response.indices.map((index) => ({
        label: index.index,
        value: { isIndex: true, status: index.status, health: index.health },
      }));
      options.push({ label: "indices", options: indices });
    } else {
      context.notifications.toasts.addDanger(indexResponse.error);
    }

    if (dataStreamResponse && dataStreamResponse.ok) {
      const dataStreams = dataStreamResponse.response.dataStreams.map((ds) => ({
        label: ds.name,
        health: ds.status.toLowerCase(),
        value: {
          isDataStream: true,
          indices: ds.indices.map((item) => item.index_name),
          writingIndex: ds.indices
            .map((item) => item.index_name)
            .sort()
            .reverse()[0],
        },
      }));
      options.push({ label: "dataStreams", options: dataStreams });
    }

    if (aliasResponse && aliasResponse.ok) {
      const aliases = _.uniq(aliasResponse.response.aliases.map((alias) => alias.alias)).map((name) => {
        const indexBelongsToAlias = aliasResponse.response.aliases.filter((alias) => alias.alias === name).map((alias) => alias.index);
        let writingIndex = aliasResponse.response.aliases
          .filter((alias) => alias.alias === name && alias.is_write_index === "true")
          .map((alias) => alias.index);
        if (writingIndex.length === 0 && indexBelongsToAlias.length === 1) {
          // set writing index when there is only 1 index for alias
          writingIndex = indexBelongsToAlias;
        }
        return {
          label: name,
          value: {
            isAlias: true,
            indices: indexBelongsToAlias,
            writingIndex: writingIndex[0],
          },
        };
      });
      options.push({ label: "aliases", options: aliases });
    } else {
      context.notifications.toasts.addDanger(aliasResponse.error);
    }
  } catch (err) {
    context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem fetching index options."));
  }
  return options;
};

export const checkNotReadOnlyIndexes = async (props: {
  services: BrowserServices;
  indexes: string[];
}): Promise<
  [
    string,
    {
      settings: IndexItem["settings"];
    }
  ][]
> => {
  const { services, indexes } = props;
  const result = await services.commonService.apiCaller<
    Record<
      string,
      {
        settings: IndexItem["settings"];
      }
    >
  >({
    endpoint: "indices.getSettings",
    data: {
      flat_settings: true,
      index: indexes,
    },
  });
  if (result.ok) {
    const valueArray = Object.entries(result?.response || {});
    if (valueArray.length) {
      return valueArray.filter(([indexName, indexDetail]) => {
        let included = indexes.includes(indexName);
        if (!included) {
          return false;
        }

        return ["index.blocks.read_only", "index.blocks.read_only_allow_delete", "index.blocks.write"].every(
          (blockName) => indexDetail?.settings?.[blockName] !== "true"
        );
      });
    }
  }

  return [];
};
