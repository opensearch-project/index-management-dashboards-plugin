import { HttpFetchQuery, HttpSetup } from "opensearch-dashboards/public";

export abstract class MDSEnabledClientService {
  httpClient: HttpSetup;
  dataSourceId: string;

  constructor(httpClient: HttpSetup, dataSourceId: string = "") {
    this.httpClient = httpClient;
    this.dataSourceId = dataSourceId;
  }

  patchQueryObjectWithDataSourceId(queryObject: HttpFetchQuery) {
    queryObject = queryObject || {};
    queryObject.dataSourceId = this.dataSourceId;
    return queryObject;
  }
}
