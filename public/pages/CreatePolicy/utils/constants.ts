/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEFAULT_POLICY = JSON.stringify(
  {
    policy: {
      description: "A simple default policy that changes the replica count between hot and cold states.",
      default_state: "example_hot_state",
      states: [
        {
          name: "example_hot_state",
          actions: [{ replica_count: { number_of_replicas: 5 } }],
          transitions: [{ state_name: "example_cold_state", conditions: { min_index_age: "30d" } }],
        },
        {
          name: "example_cold_state",
          actions: [{ replica_count: { number_of_replicas: 2 } }],
          transitions: [],
        },
      ],
      ism_template: {
        index_patterns: ["example-index-*"],
      },
    },
  },
  null,
  4
);
