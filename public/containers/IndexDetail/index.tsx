import { EuiSpacer, EuiDescriptionList, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import React, { useContext, useEffect, useState } from "react";
import { CatIndex } from "../../../server/models/interfaces";
import { ContentPanel } from "../../components/ContentPanel";
import { CoreServicesContext } from "../../components/core_services";
import { ServicesContext } from "../../services";

export interface IIndexDetailProps {
  indices: string[];
  onGetIndicesDetail?: (args: CatIndex[]) => void;
  children?: React.ReactChild;
}

const DisplayItem = (props: { title: string; content: string }) => {
  return (
    <EuiDescriptionList
      listItems={[
        {
          title: props.title,
          description: props.content || "-",
        },
      ]}
    />
  );
};

export default function IndexDetail(props: IIndexDetailProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([] as CatIndex[]);
  const services = useContext(ServicesContext);
  const coreServices = useContext(CoreServicesContext);
  useEffect(() => {
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
      props.onGetIndicesDetail && props.onGetIndicesDetail(finalResponse);
      setLoading(false);
    })();
  }, [props.indices.join(","), setLoading, setItems, coreServices]);
  return (
    <ContentPanel title="Source index details" titleSize="s">
      <EuiSpacer />
      {items && items.length ? (
        <EuiFlexGroup>
          <EuiFlexItem>
            <DisplayItem title="Index name" content={items[0].index} />
          </EuiFlexItem>
          <EuiFlexItem>
            <DisplayItem title="Primary shards" content={items[0].pri} />
          </EuiFlexItem>
          <EuiFlexItem>
            <DisplayItem title="Replica shards" content={items[0].rep} />
          </EuiFlexItem>
          <EuiFlexItem>
            <DisplayItem title="Total index size" content={items[0]["store.size"]} />
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : null}
      <EuiSpacer />
      {loading ? null : props.children}
    </ContentPanel>
  );
}
