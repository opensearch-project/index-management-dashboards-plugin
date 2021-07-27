/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import { AllocationAction } from "../../../../models/interfaces";

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
  ism_template: [
    {
      index_patterns: ["logs-*"],
      priority: 5,
    },
  ],
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
    destination: {
      slack: {
        url: "",
      },
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
    min_size: "",
    min_doc_count: 5,
    min_index_age: "",
  },
};
export const DEFAULT_ROLLUP = {
  rollup: {
    // TODO: In future make actual UI
    // jsonString: ""
  },
};
export const DEFAULT_SNAPSHOT = {
  snapshot: {
    repository: "",
    snapshot: "",
  },
};

export const actions = [
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
  DEFAULT_SNAPSHOT,
];

export const ISM_TEMPLATE_INPUT_MAX_WIDTH = "400px";
