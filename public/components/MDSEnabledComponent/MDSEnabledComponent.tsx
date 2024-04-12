import React, { useContext, useEffect } from "react";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../services/DataSourceMenuContext";
import { useHistory } from "react-router";
import queryString from "query-string";

export default class MDSEnabledComponent<
  Props extends DataSourceMenuProperties,
  State extends DataSourceMenuProperties
> extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      dataSourceId: props.dataSourceId,
      multiDataSourceEnabled: props.multiDataSourceEnabled,
    } as State;
  }

  static getDerivedStateFromProps<Props extends DataSourceMenuProperties, State extends DataSourceMenuProperties>(
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
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  const { dataSourceId, multiDataSourceEnabled } = dataSourceMenuProps;
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
