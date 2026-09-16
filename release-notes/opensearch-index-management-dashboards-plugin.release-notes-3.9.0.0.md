## Version 3.9.0 Release Notes

Compatible with OpenSearch and OpenSearch Dashboards version 3.9.0

### Features

* Add dashboard support for the `convert_index_to_remote` action, including options for `include_aliases`, `ignore_index_settings`, `number_of_replicas`, `delete_original_index`, and `rename_pattern` ([#1373](https://github.com/opensearch-project/index-management-dashboards-plugin/pull/1373))

### Maintenance

* Upgrade `qs` from 6.15.3 to 6.16.0 to address CVEs ([#1473](https://github.com/opensearch-project/index-management-dashboards-plugin/pull/1473))
* Clean up dependency resolutions and align with OpenSearch Dashboards 3.8 to address CVEs ([#1467](https://github.com/opensearch-project/index-management-dashboards-plugin/pull/1467))
