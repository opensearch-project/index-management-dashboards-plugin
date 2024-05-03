## Version 2.14.0.0 2024-05-02

Compatible with OpenSearch 2.14.0

### Enhancements

* Add MDS support for policies, policy managed indices, rollup jobs and transform jobs ([#1021](https://github.com/opensearch-project/index-management-dashboards-plugin/pull/1021))
* Interface change for MDS support and deprecating dataSourceLabel from the URL ([#1031](https://github.com/opensearch-project/index-management-dashboards-plugin/pull/1031))
* Mount MDS on the empty route ([#1039](https://github.com/opensearch-project/index-management-dashboards-plugin/pull/1039))

### Bug Fixes
* Set ActiveOption prop to undefined on first load ([#1042](https://github.com/opensearch-project/index-management-dashboards-plugin/pull/1042))
* Readonly DataSourceMenu in create rollup and create transform workflow ([#1047](https://github.com/opensearch-project/index-management-dashboards-plugin/pull/1047))
* Fix Transform job create flow where indices won't reset after change of datasource ([#1053](https://github.com/opensearch-project/index-management-dashboards-plugin/pull/1053))
