/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const testRollup = {
  _id: "test1",
  _version: 3,
  _seq_no: 7,
  _primary_term: 1,
  rollup: {
    rollup_id: "test1",
    enabled: true,
    schedule: {
      interval: {
        period: 1,
        unit: "Minutes",
        start_time: 1602100553,
      },
    },
    last_updated_time: 1602100553,
    description: "An example job that rolls up the sample ecommerce data",
    source_index: "opensearch_dashboards_sample_data_ecommerce",
    target_index: "test_rollup",
    page_size: 1000,
    delay: 0,
    continuous: false,
    metadata_id: null,
    enabledTime: null,
    lastUpdatedTime: null,
    schemaVersion: 1,
    dimensions: [
      {
        date_histogram: {
          source_field: "order_date",
          fixed_interval: "90m",
          timezone: "America/Los_Angeles",
        },
      },
      {
        terms: {
          source_field: "customer_gender",
        },
      },
      {
        terms: {
          source_field: "geoip.city_name",
        },
      },
      {
        terms: {
          source_field: "geoip.region_name",
        },
      },
      {
        terms: {
          source_field: "day_of_week",
        },
      },
    ],
    metrics: [
      {
        source_field: "taxless_total_price",
        metrics: [{ avg: {} }, { sum: {} }, { max: {} }, { min: {} }, { value_count: {} }],
      },
      {
        source_field: "total_quantity",
        metrics: [{ avg: {} }, { max: {} }],
      },
    ],
  },
  metadata: {
    test1: {
      metadata_id: "GSCm3HUBeGRB78cDQju6",
      rollup_metadata: {
        rollup_id: "test1",
        last_updated_time: 1605724690355,
        status: "finished",
        failure_reason: null,
        stats: {
          pages_processed: 5,
          documents_processed: 4675,
          rollups_indexed: 3627,
          index_time_in_millis: 1522,
          search_time_in_millis: 1168,
        },
      },
    },
  },
};

export const testRollup2 = {
  _id: "test2",
  _version: 3,
  _seq_no: 7,
  _primary_term: 1,
  rollup: {
    rollup_id: "test2",
    enabled: false,
    schedule: {
      interval: {
        period: 1,
        unit: "Minutes",
        start_time: 1602100553,
      },
    },
    last_updated_time: 1602100553,
    description: "Another example job that rolls up the sample ecommerce data",
    source_index: "opensearch_dashboards_sample_data_ecommerce",
    target_index: "test_rollup2",
    page_size: 1000,
    delay: 0,
    continuous: false,
    dimensions: [
      {
        date_histogram: {
          source_field: "order_date",
          fixed_interval: "60m",
          timezone: "America/Los_Angeles",
        },
      },
      {
        terms: {
          source_field: "customer_gender",
        },
      },
      {
        terms: {
          source_field: "geoip.city_name",
        },
      },
      {
        terms: {
          source_field: "geoip.region_name",
        },
      },
      {
        terms: {
          source_field: "day_of_week",
        },
      },
      {
        terms: {
          source_field: "day_of_week_i",
        },
      },
    ],
    metrics: [
      {
        source_field: "taxless_total_price",
        metrics: [{ avg: {} }, { sum: {} }, { max: {} }, { min: {} }, { value_count: {} }],
      },
      {
        source_field: "total_quantity",
        metrics: [{ avg: {} }, { max: {} }],
      },
    ],
  },
  metadata: {
    test2: {
      metadata_id: "GSCm3HUBeGRB78cDQju6",
      rollup_metadata: {
        rollup_id: "test2",
        last_updated_time: 1605724690355,
        status: "failed",
        failure_reason: "Cannot create target index.",
        stats: {
          pages_processed: 0,
          documents_processed: 0,
          rollups_indexed: 0,
          index_time_in_millis: 0,
          search_time_in_millis: 0,
        },
      },
    },
  },
};

export const testTransform = {
  _id: "test1",
  _seqNo: 6,
  _primaryTerm: 1,
  transform: {
    transform_id: "test1",
    schema_version: 11,
    schedule: {
      interval: {
        start_time: 1632951884470,
        period: 1,
        unit: "Minutes",
      },
    },
    metadata_id: "tFttMG7OTAehIakVVsAA-g",
    updated_at: 1632951944840,
    enabled: false,
    enabled_at: null,
    description: "",
    source_index: "opensearch_dashboards_sample_data_ecommerce",
    data_selection_query: {
      match: {
        customer_gender: {
          query: "FEMALE",
          operator: "OR",
          prefix_length: 0,
          max_expansions: 50,
          fuzzy_transpositions: true,
          lenient: false,
          zero_terms_query: "NONE",
          auto_generate_synonyms_phrase_query: true,
          boost: 1,
        },
      },
    },
    target_index: "t",
    page_size: 1000,
    groups: [
      {
        terms: {
          source_field: "currency",
          target_field: "currency_terms",
        },
      },
    ],
    aggregations: {},
  },
  metadata: {
    test1: {
      metadata_id: "tFttMG7OTAehIakVVsAA-g",
      transform_metadata: {
        transform_id: "test1",
        last_updated_at: 1632951944827,
        status: "finished",
        failure_reason: null,
        stats: {
          pages_processed: 2,
          documents_processed: 2433,
          documents_indexed: 1,
          index_time_in_millis: 37,
          search_time_in_millis: 11,
        },
      },
    },
  },
};

export const testTransform2 = {
  _id: "test1",
  _version: 3,
  _seqNo: 7,
  _primaryTerm: 1,
  transform: {
    transform_id: "test1",
    enabled: true,
    schedule: {
      interval: {
        period: 1,
        unit: "Minutes",
        start_time: 1602100553,
      },
    },
    metadata_id: null,
    updated_at: 1619725487957,
    enabled_at: 1619725487956,
    description: "Test transform using ecommerce data",
    source_index: "opensearch_dashboards_sample_data_ecommerce",
    target_index: "test_transform",
    data_selection_query: {
      match_all: {},
    },
    page_size: 1000,
    roles: [],
    groups: [
      {
        terms: {
          source_field: "customer_gender",
          target_field: "gender",
        },
      },
      {
        terms: {
          source_field: "day_of_week",
          target_field: "day",
        },
      },
    ],
    aggregations: {
      quantity: {
        sum: {
          field: "total_quantity",
        },
      },
    },
  },
  metadata: {
    test1: {
      metadata_id: "GSCm3HUBeGRB78cDQju6",
      transform_metadata: {
        transform_id: "test1",
        last_updated_time: 1605724690355,
        status: "finished",
        failure_reason: null,
        stats: {
          pages_processed: 5,
          documents_processed: 4675,
          transforms_indexed: 3627,
          index_time_in_millis: 1522,
          search_time_in_millis: 1168,
        },
      },
    },
  },
};

export const testTransformDisabled = {
  _id: "test1",
  _version: 3,
  _seq_no: 7,
  _primary_term: 1,
  transform: {
    transform_id: "test1",
    enabled: false,
    schedule: {
      interval: {
        period: 1,
        unit: "Minutes",
        start_time: 1602100553,
      },
    },
    metadata_id: null,
    updated_at: 1619725487957,
    enabled_at: 1619725487956,
    description: "Test transform using ecommerce data",
    source_index: "opensearch_dashboards_sample_data_ecommerce",
    target_index: "test_transform",
    data_selection_query: {
      match_all: {},
    },
    page_size: 1000,
    roles: [],
    groups: [
      {
        terms: {
          source_field: "customer_gender",
          target_field: "gender",
        },
      },
      {
        terms: {
          source_field: "day_of_week",
          target_field: "day",
        },
      },
    ],
    aggregations: {
      quantity: {
        sum: {
          field: "total_quantity",
        },
      },
    },
  },
  metadata: {
    test1: {
      metadata_id: "GSCm3HUBeGRB78cDQju6",
      transform_metadata: {
        transform_id: "test1",
        last_updated_time: 1605724690355,
        status: "started",
        failure_reason: null,
        stats: {
          pages_processed: 5,
          documents_processed: 4675,
          transforms_indexed: 3627,
          index_time_in_millis: 1522,
          search_time_in_millis: 1168,
        },
      },
    },
  },
};
