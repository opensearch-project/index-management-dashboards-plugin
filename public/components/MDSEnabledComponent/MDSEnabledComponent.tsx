import React, { useContext, useEffect } from "react";
import { DataSourceMenuContext, DataSourceMenuProperties, DataSourceProperties } from "../../services/DataSourceMenuContext";
import { useHistory } from "react-router";
import queryString from "query-string";
import { getDataSource } from "src/plugins/data_source/server/client/configure_client_utils";

export default class MDSEnabledComponent<Props extends DataSourceProperties, State extends DataSourceProperties> extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      dataSourceId: props.dataSourceId,
      multiDataSourceEnabled: props.multiDataSourceEnabled,
    } as State;
  }

  static getDerivedStateFromProps<Props extends DataSourceProperties, State extends DataSourceProperties>(
    nextProps: Props,
    prevState: State
  ) {
    // static members cannot reference class type parameters
    if (nextProps.multiDataSourceEnabled && nextProps.dataSourceId !== prevState.dataSourceId) {
      return {
        dataSourceId: nextProps.dataSourceId,
      };
    }
    return null;
  }
}

export function useUpdateUrlWithDataSourceProperties() {
  const dataSourceProps = getDataSourcePropsFromContext(useContext(DataSourceMenuContext));
  const { dataSourceId, multiDataSourceEnabled } = dataSourceProps;
  const history = useHistory();
  const currentSearch = history.location.search;
  const currentQuery = queryString.parse(currentSearch);
  useEffect(() => {
    if (multiDataSourceEnabled) {
      history.replace({
        search: queryString.stringify({
          ...currentQuery,
          dataSourceId,
        }),
      });
    }
  }, [dataSourceId, multiDataSourceEnabled]);
}

export function getDataSourcePropsFromContext<Props extends DataSourceProperties>(context: DataSourceMenuProperties): Props {
  return {
    dataSourceId: context.dataSource[0].id,
    multiDataSourceEnabled: context.multiDataSourceEnabled,
  } as Props;
}
