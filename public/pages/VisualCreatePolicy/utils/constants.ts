/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { AliasAction, AllocationAction } from "../../../../models/interfaces";

export enum ActionType {
  Alias = "alias",
  Allocation = "allocation",
  Close = "close",
  Delete = "delete",
  ForceMerge = "force_merge",
  IndexPriority = "index_priority",
  Notification = "notification",
  Open = "open",
  ReadOnly = "read_only",
  ReadWrite = "read_write",
  ReplicaCount = "replica_count",
  Rollover = "rollover",
  Rollup = "rollup",
  Shrink = "shrink",
  Snapshot = "snapshot",
}

export const DEFAULT_POLICY = {
  description: "A simple default policy that changes the replica count between hot and cold states.",
  default_state: "hot",
  states: [
    {
      name: "hot",
      actions: [{ replica_count: { number_of_replicas: 5 } }],
      transitions: [
        {
          state_name: "cold",
          conditions: { min_index_age: "30d" },
        },
      ],
    },
    {
      name: "cold",
      actions: [{ replica_count: { number_of_replicas: 2 } }],
      transitions: [],
    },
  ],
  ism_template: [],
};

export const EMPTY_DEFAULT_POLICY = {
  description: "A sample description of the policy",
  default_state: "",
  states: [],
  ism_template: [],
};

export const DEFAULT_LEGACY_ERROR_NOTIFICATION = {
  destination: {
    slack: {
      url: "<url>",
    },
  },
  message_template: {
    source: "The index {{ctx.index}} failed during policy execution.",
  },
};

export const DEFAULT_ALIAS: AliasAction = {
  alias: {
    actions: [],
  },
};

export const DEFAULT_ALLOCATION: AllocationAction = {
  allocation: {
    require: {},
    include: {},
    exclude: {},
    wait_for: false,
  },
};

export const DEFAULT_CLOSE = {
  close: {},
};
export const DEFAULT_DELETE = {
  delete: {},
};
export const DEFAULT_FORCE_MERGE = {
  force_merge: {
    max_num_segments: 1,
  },
};
export const DEFAULT_INDEX_PRIORITY = {
  index_priority: {
    priority: 1,
  },
};
export const DEFAULT_NOTIFICATION = {
  notification: {
    channel: {
      id: "",
    },
    message_template: {
      source: "",
    },
  },
};
export const DEFAULT_OPEN = {
  open: {},
};
export const DEFAULT_READ_ONLY = {
  read_only: {},
};
export const DEFAULT_READ_WRITE = {
  read_write: {},
};
export const DEFAULT_REPLICA_COUNT = {
  replica_count: {
    number_of_replicas: 1,
  },
};
export const DEFAULT_ROLLOVER = {
  rollover: {
    min_doc_count: 5,
  },
};
export const DEFAULT_ROLLUP = {
  // TODO: In future make actual UI
  rollup: {
    jsonString: JSON.stringify(
      {
        ism_rollup: {
          target_index: "rollup-nyc-taxi-data",
          description: "Example rollup job",
          page_size: 200,
          dimensions: [
            {
              date_histogram: {
                source_field: "tpep_pickup_datetime",
                fixed_interval: "1h",
                timezone: "America/Los_Angeles",
              },
            },
            {
              terms: {
                source_field: "PULocationID",
              },
            },
          ],
          metrics: [
            {
              source_field: "passenger_count",
              metrics: [
                {
                  avg: {},
                },
                {
                  sum: {},
                },
                {
                  max: {},
                },
                {
                  min: {},
                },
                {
                  value_count: {},
                },
              ],
            },
          ],
        },
      },
      null,
      4
    ),
  },
};

export const DEFAULT_SHRINK = {
  shrink: {
    percentage_of_source_shards: 0.5,
    force_unsafe: false,
    target_index_name_template: {
      source: "{{ctx.index}}_shrunken",
    },
  },
  force_unsafe_input: "no",
};

export const DEFAULT_SNAPSHOT = {
  snapshot: {
    repository: "example-repository",
    snapshot: "example-snapshot",
  },
};

export const actions = [
  DEFAULT_ALIAS,
  DEFAULT_ALLOCATION,
  DEFAULT_CLOSE,
  DEFAULT_DELETE,
  DEFAULT_FORCE_MERGE,
  DEFAULT_INDEX_PRIORITY,
  DEFAULT_NOTIFICATION,
  DEFAULT_OPEN,
  DEFAULT_READ_ONLY,
  DEFAULT_READ_WRITE,
  DEFAULT_REPLICA_COUNT,
  DEFAULT_ROLLOVER,
  DEFAULT_ROLLUP,
  DEFAULT_SHRINK,
  DEFAULT_SNAPSHOT,
];

export const ISM_TEMPLATE_INPUT_MAX_WIDTH = "400px";
