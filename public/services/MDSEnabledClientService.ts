import { HttpFetchQuery, HttpSetup } from "opensearch-dashboards/public";
import { ServerResponse } from "../../../../plugins/index-management-dashboards-plugin/server/models/types";

export abstract class MDSEnabledClientService {
  httpClient: HttpSetup;
  dataSourceId: string;
  mdsEnabled: boolean;

  constructor(httpClient: HttpSetup, dataSourceId: string = "", mdsEnabled: boolean = false) {
    this.httpClient = httpClient;
    this.dataSourceId = dataSourceId;
    this.mdsEnabled = mdsEnabled;
  }

  patchQueryObjectWithDataSourceId(queryObject?: HttpFetchQuery): HttpFetchQuery | undefined {
    if (this.mdsEnabled) {
      queryObject = queryObject || {};
      queryObject.dataSourceId = this.dataSourceId;
    }
    return queryObject;
  }

  ensureValidState(): ServerResponse<any> | null {
    if (this.mdsEnabled && this.dataSourceId === undefined) {
      return { ok: false, error: "Invalid DataSource" };
    }
    return null;
  }
}
