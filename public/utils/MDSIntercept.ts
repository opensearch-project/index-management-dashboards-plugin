import { set } from "lodash";
import { CoreStart, HttpFetchOptionsWithPath } from "opensearch-dashboards/public";

export class MDSIntercept {
  private pluginId: string;
  private http: CoreStart["http"];
  private getDataSourceId: () => string;
  private interceptDestroyHandler: (() => void) | undefined;
  constructor(config: { pluginId: string; http: CoreStart["http"]; getDataSourceId: () => string }) {
    this.pluginId = config.pluginId;
    this.http = config.http;
    this.getDataSourceId = config.getDataSourceId;
  }
  private interceptRequest(fetchOptions: HttpFetchOptionsWithPath) {
    set(fetchOptions, `headers._${this.pluginId}_data_source_id_`, this.getDataSourceId());
    return fetchOptions;
  }
  public start() {
    this.interceptDestroyHandler = this.http.intercept({
      request: this.interceptRequest.bind(this),
    });
  }
  public destroy() {
    this.interceptDestroyHandler?.();
  }
}
