import { OpenSearchDashboardsClient } from "@opensearch-project/opensearch/api/opensearch_dashboards";
import { ApiResponse, TransportRequestPromise } from "@opensearch-project/opensearch/lib/Transport";
import { get } from "lodash";
import {
  CoreSetup,
  IContextProvider,
  ILegacyCustomClusterClient,
  ILegacyScopedClusterClient,
  LegacyCallAPIOptions,
  Logger,
  OpenSearchDashboardsRequest,
  RequestHandler,
  RequestHandlerContext,
} from "opensearch-dashboards/server";

type getClient = (dataSourceId: string) => OpenSearchDashboardsClient;

interface IRequestHandlerContentWithDataSource extends RequestHandlerContext {
  dataSource: {
    opensearch: {
      getClient: getClient;
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

const contextMap: Record<string, IRequestHandlerContentWithDataSource> = {};

interface IGetClientProps {
  core: CoreSetup;
  /**
   * We will rewrite the asScoped method of your client
   * It would be better that create a new client before you pass
   */
  client: ILegacyCustomClusterClient;
  onExtendClient?: (client: OpenSearchDashboardsClient) => Record<string, any> | undefined;
  getDataSourceId?: (context: RequestHandlerContext, request: OpenSearchDashboardsRequest) => string | undefined;
  pluginId: string;
  logger: Logger;
}

export const getClientSupportMDS = (props: IGetClientProps) => {
  const originalAsScoped = props.client.asScoped;
  const handler: IContextProvider<RequestHandler<unknown, unknown, unknown>, "core"> = (
    context: RequestHandlerContext,
    request: OpenSearchDashboardsRequest
  ) => {
    contextMap[request.id] = context as IRequestHandlerContentWithDataSource;
    return {} as any;
  };

  /**
   * asScoped can not get the request context,
   * so use a map in memory to hold the context temporarily.
   */
  props.core.http.registerRouteHandlerContext(`${props.pluginId}_MDS_CTX_SUPPORT` as "core", handler);
  props.core.http.registerOnPreResponse((request, preResponse, toolkit) => {
    delete contextMap[request.id];
    return toolkit.next();
  });

  /**
   * it is not a good practice to rewrite the method like this
   * but JS does not provide a method to copy a class instance
   */
  props.client.asScoped = function (request: OpenSearchDashboardsRequest): ILegacyScopedClusterClient {
    const context = contextMap[request.id];
    const dataSourceId = props.getDataSourceId?.(context, request);

    /**
     * If no dataSourceId provided
     * use the original client
     */
    if (!dataSourceId) {
      props.logger.debug("No dataSourceId, using original client");
      return originalAsScoped.call(props.client, request);
    }

    /**
     * If the context can not be found
     * reject the request and add a log
     */
    if (!context) {
      const errorMessage = "There is some error between dashboards and your remote data source, please retry again.";
      props.logger.error(errorMessage);
      return {
        callAsCurrentUser: () => Promise.reject(errorMessage),
        callAsInternalUser: () => Promise.reject(errorMessage),
      };
    }

    const callApi: ILegacyScopedClusterClient["callAsCurrentUser"] = async (...args) => {
      const [endpoint, clientParams, options] = args;
      return new Promise(async (resolve, reject) => {
        props.logger.debug(`Call api using the data source: ${dataSourceId}`);
        try {
          const dataSourceClient = await context.dataSource.opensearch.getClient(dataSourceId);

          /**
           * extend client if needed
           **/
          Object.assign(dataSourceClient, { ...props.onExtendClient?.(dataSourceClient) });

          /**
           * Call the endpoint by providing client
           * The logic is much the same as what callAPI does in Dashboards
           */
          const clientPath = endpoint.split(".");
          const api: any = get(dataSourceClient, clientPath);
          let apiContext = clientPath.length === 1 ? dataSourceClient : get(dataSourceClient, clientPath.slice(0, -1));
          const request = api.call(apiContext, clientParams);

          /**
           * In case the request is aborted
           */
          if (options?.signal) {
            options.signal.addEventListener("abort", () => {
              request.abort();
              reject(new Error("Request was aborted"));
            });
          }
          const result = await request;
          resolve(result.body || result);
        } catch (e: TransportRequestPromise<ApiResponse> | any) {
          /**
           * TODO
           * ask dashboard team to add original error to DataSourceError
           * so that we can make the client behave exactly the same as legacy client
           */
          reject(e);
        }
      });
    };

    /**
     * Return a legacy-client-like client
     * so that the callers no need to change their code.
     */
    const client: ILegacyScopedClusterClient = {
      callAsCurrentUser: callApi,
      callAsInternalUser: callApi,
    };
    return client;
  };
  return props.client;
};
