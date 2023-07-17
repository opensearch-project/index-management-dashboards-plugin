import ReactDOM from "react-dom";
import React from "react";
import { DataSourceSelector } from "./DataSourceSelector";
import { CoreStart } from "opensearch-dashboards/public";
import { CoreServicesContext } from "../../components/core_services";

export const mountDataSourceSelector = (props: { element: HTMLElement; coreStart: CoreStart }) => {
  ReactDOM.render(
    <CoreServicesContext.Provider value={props.coreStart}>
      <DataSourceSelector />
    </CoreServicesContext.Provider>,
    props.element
  );
  return () => {
    ReactDOM.unmountComponentAtNode(props.element);
  };
};
