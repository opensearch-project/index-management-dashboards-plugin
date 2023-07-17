import { EuiComboBox } from "@elastic/eui";
import React, { useContext, useEffect, useState } from "react";
import { CoreServicesContext } from "../../components/core_services";
import "./DataSourceSelector.scss";
import { getDataSource, setDataSource } from "./utils";

interface IDataSourceSelectorProps {}

export const DataSourceSelector = (props: IDataSourceSelectorProps) => {
  const coreStart = useContext(CoreServicesContext);
  const [selected] = useState<string>(getDataSource());
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    (async () => {
      const findResp = await coreStart?.savedObjects.client.find<{ title: string }>({
        type: "data-source",
        fields: ["id", "description", "title"],
        perPage: 10000,
      });
      if (findResp && findResp.savedObjects) {
        setOptions(
          findResp.savedObjects?.map((item) => ({
            label: item.attributes.title,
            value: item.id,
          }))
        );
      }
    })();
  }, []);
  return (
    <div className="ism-data-source-selector-section">
      <div className="content">
        <EuiComboBox
          singleSelection={{ asPlainText: true }}
          compressed
          fullWidth={false}
          placeholder="Select a data source"
          prepend="DataSource"
          style={{ width: 300 }}
          options={options}
          selectedOptions={
            selected && options.find((item) => item.value === selected)
              ? [options.find((item) => item.value === selected) as typeof options[number]]
              : []
          }
          onChange={async (item) => {
            const result = await coreStart?.overlays.openConfirm(
              "Switch data source may lead to failure in your current operation and requires a reload on your browser.",
              {
                title: "Are you sure to continue?",
                confirmButtonText: "Yes, I want to switch data source",
              }
            );
            if (result) {
              setDataSource(item?.[0]?.value || "");
              window.location.reload();
            }
          }}
        ></EuiComboBox>
      </div>
    </div>
  );
};
