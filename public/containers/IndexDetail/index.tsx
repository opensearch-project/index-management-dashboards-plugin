import { EuiBasicTable, EuiSpacer } from "@elastic/eui";
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
  }, [props.indices, setLoading, setItems, coreServices]);
  return (
    <ContentPanel title="Source index details" titleSize="s">
      <EuiBasicTable
        loading={loading}
        columns={[
          {
            name: "Index name",
            field: "index",
          },
          {
            name: "Primary shards",
            field: "pri",
          },
          {
            name: "Replica shards",
            field: "rep",
          },
          {
            name: "Total index size",
            field: "store.size",
          },
        ]}
        items={items}
      />
      <EuiSpacer />
      {loading ? null : props.children}
    </ContentPanel>
  );
}
