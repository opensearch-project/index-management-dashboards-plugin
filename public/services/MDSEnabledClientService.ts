import { HttpFetchQuery, HttpSetup } from "opensearch-dashboards/public";

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
}
