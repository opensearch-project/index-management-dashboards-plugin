/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */
import { EuiSpacer } from "@elastic/eui";
import React, { useContext, useEffect, useState } from "react";
import { CatIndex } from "../../../server/models/interfaces";
import { ContentPanel } from "../../components/ContentPanel";
import { CoreServicesContext } from "../../components/core_services";
import { ServicesContext } from "../../services";
import DescriptionListHoz from "../../components/DescriptionListHoz";

export interface IIndexDetailProps {
  indices: string[];
  onGetIndicesDetail?: (args: CatIndex[]) => void;
  children?: React.ReactChild;
}

export default function IndexDetail(props: IIndexDetailProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([] as CatIndex[]);
  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext);
  useEffect(
    () => {
      (async () => {
        setLoading(true);
        const result = await services?.commonService.apiCaller<CatIndex[]>({
          endpoint: "cat.indices",
          data: {
            index: props.indices,
            format: "json",
          },
        });
        let finalResponse: CatIndex[] = [];
        if (result?.ok) {
          finalResponse = result.response;
        } else {
          coreServices?.notifications.toasts.addDanger(result?.error || "");
        }
        setItems(finalResponse);
        if (props.onGetIndicesDetail) props.onGetIndicesDetail(finalResponse);
        setLoading(false);
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.indices.join(","), setLoading, setItems, coreServices]
  );
  return (
    <ContentPanel title="Source index details" titleSize="s">
      <EuiSpacer />
      {items && items.length ? (
        <DescriptionListHoz
          listItems={[
            {
              title: "Index name",
              description: items[0].index,
            },
            {
              title: "Primary shards",
              description: items[0].pri,
            },
            {
              title: "Replica shards",
              description: items[0].rep,
            },
            {
              title: "Total index size",
              description: items[0]["store.size"],
            },
          ]}
        />
      ) : null}
      <EuiSpacer />
      {loading ? null : props.children}
    </ContentPanel>
  );
}
