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
      dataSourceLabel: props.dataSourceLabel,
      multiDataSourceEnabled: props.multiDataSourceEnabled,
    } as State;
  }

  static getDerivedStateFromProps<Props extends DataSourceMenuProperties, State extends DataSourceMenuProperties>(
    nextProps: Props,
    prevState: State
  ) {
    // static members cannot reference class type parameters
    if (
      nextProps.multiDataSourceEnabled &&
      (nextProps.dataSourceId != prevState.dataSourceId || nextProps.dataSourceLabel != prevState.dataSourceLabel)
    ) {
      return {
        dataSourceId: nextProps.dataSourceId,
        dataSourceLabel: nextProps.dataSourceLabel,
      };
    }
    return null;
  }
}

export function useUpdateUrlWithDataSourceProperties() {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  const { dataSourceId, dataSourceLabel, multiDataSourceEnabled } = dataSourceMenuProps;
  const history = useHistory();
  useEffect(() => {
    if (multiDataSourceEnabled) {
      history.replace({
        search: queryString.stringify({
          dataSourceId,
          dataSourceLabel,
        }),
      });
    }
  }, [dataSourceId, dataSourceLabel, multiDataSourceEnabled]);
}
