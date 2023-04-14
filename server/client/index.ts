import { get } from "lodash";
import {
  CoreSetup,
  IContextProvider,
  ILegacyCustomClusterClient,
  ILegacyScopedClusterClient,
  OpenSearchDashboardsRequest,
  RequestHandler,
  RequestHandlerContext,
} from "opensearch-dashboards/server";

type getClient = (
  dataSourceId: string
) => {
  callAPI: ILegacyScopedClusterClient["callAsCurrentUser"];
};

interface IRequestHandlerContentWithDataSource extends RequestHandlerContext {
  dataSource: {
    opensearch: {
      getClient: getClient;
      legacy: {
        getClient: getClient;
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
  pluginId: string;
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
  props.core.http.registerRouteHandlerContext(`${props.pluginId}_MDS_CTX_SUPPORT` as "core", handler);

  /**
   * it is not a good practice to rewrite the method like this
   * but JS do not support a method to copy a class instance
   */
  props.client.asScoped = function (request: OpenSearchDashboardsRequest): ILegacyScopedClusterClient {
    /**
     * asScoped can not get the context,
     * so use a map in memory to hold the context temporary.
     */
    const context = contextMap[request.id];
    delete contextMap[request.id];
    const dataSourceId = "e22a0790-cf97-11ed-acf6-ed047b89ac83";
    if (!dataSourceId) {
      return originalAsScoped.call(props.client, request);
    }
    const callApi: ILegacyScopedClusterClient["callAsCurrentUser"] = async (...args) => {
      const [endpoint, clientParams, options] = args;
      return new Promise(async (resolve, reject) => {
        try {
          /**
           * Use legacy client when request with transport.request
           */
          if (endpoint === "transport.request") {
            const legacyClient = await context.dataSource.opensearch.legacy.getClient(dataSourceId);
            const legacyResult = await legacyClient.callAPI(endpoint, clientParams, options);
            resolve(legacyResult);
            return;
          }
          const dataSourceClient2 = await context.dataSource.opensearch.getClient(dataSourceId);
          const method = get(dataSourceClient2, endpoint);
          const request = method.call(dataSourceClient2, clientParams);
          if (options?.signal) {
            options.signal.addEventListener("abort", () => {
              request.abort();
              reject(new Error("Request was aborted"));
            });
          }
          const result = await request;
          resolve(result.body);
        } catch (e) {
          reject(e);
        }
      });
    };
    const client: ILegacyScopedClusterClient = {
      callAsCurrentUser: callApi,
      callAsInternalUser: callApi,
    };
    return client;
  };
  return props.client;
};
