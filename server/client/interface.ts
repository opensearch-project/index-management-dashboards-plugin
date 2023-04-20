import { OpenSearchDashboardsClient } from "@opensearch-project/opensearch/api/opensearch_dashboards";
import {
  CoreSetup,
  ILegacyCustomClusterClient,
  LegacyCallAPIOptions,
  Logger,
  OpenSearchDashboardsRequest,
  RequestHandlerContext,
} from "opensearch-dashboards/server";

export interface IRequestHandlerContentWithDataSource extends RequestHandlerContext {
  dataSource: {
    opensearch: {
      getClient: (dataSourceId: string) => OpenSearchDashboardsClient;
      legacy: {
        getClient: (
          dataSourceId: string
        ) => {
          callAPI: (endpoint: string, clientParams?: Record<string, any>, options?: LegacyCallAPIOptions) => Promise<unknown>;
        };
      };
    };
  };
}

export interface IGetClientProps {
  core: CoreSetup;
  /**
   * We will rewrite the asScoped method of your client
   * It would be better that create a new client before you pass in one
   */
  client: ILegacyCustomClusterClient;
  onExtendClient?: (client: OpenSearchDashboardsClient) => Record<string, any> | undefined;
  getDataSourceId?: (context: RequestHandlerContext, request: OpenSearchDashboardsRequest) => string | undefined;
  pluginId: string;
  logger: Logger;
}

export type DashboardRequestEnhancedWithContext = OpenSearchDashboardsRequest & {
  [contextKey: string]: IRequestHandlerContentWithDataSource;
};
