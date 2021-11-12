/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEFAULT_POLICY = JSON.stringify(
  {
    policy: {
      description: "A simple default policy that changes the replica count between hot and cold states.",
      default_state: "hot",
      states: [
        {
          name: "hot",
          actions: [{ replica_count: { number_of_replicas: 5 } }],
          transitions: [{ state_name: "cold", conditions: { min_index_age: "30d" } }],
        },
        {
          name: "cold",
          actions: [{ replica_count: { number_of_replicas: 2 } }],
          transitions: [],
        },
      ],
    },
  },
  null,
  4
);
