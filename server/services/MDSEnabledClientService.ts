import {
  ILegacyCustomClusterClient,
  LegacyCallAPIOptions,
  OpenSearchDashboardsRequest,
  RequestHandlerContext,
} from "opensearch-dashboards/server";

export abstract class MDSEnabledClientService {
  osDriver: ILegacyCustomClusterClient;
  dataSourceEnabled: boolean;

  constructor(osDriver: ILegacyCustomClusterClient, dataSourceEnabled: boolean = false) {
    this.osDriver = osDriver;
    this.dataSourceEnabled = dataSourceEnabled;
  }

  getClientBasedOnDataSource(
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest
  ): (endpoint: string, clientParams: Record<string, any>, options?: LegacyCallAPIOptions | undefined) => Promise<unknown> {
    const { dataSourceId = "" } = (request.query || {}) as { dataSourceId?: string };
    if (this.dataSourceEnabled && dataSourceId && dataSourceId.trim().length != 0) {
      // non-zero data source id
      return context.dataSource.opensearch.legacy.getClient(dataSourceId).callAPI;
    } else {
      // fall back to default local cluster
      return this.osDriver.asScoped(request).callAsCurrentUser;
    }
  }
}

export type DataSourceClient = ReturnType<MDSEnabledClientService["getClientBasedOnDataSource"]>;
