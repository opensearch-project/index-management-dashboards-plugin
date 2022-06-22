/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiSelectOption } from "@elastic/eui";

// "fs", "url", "repository-s3", "repository-hdfs", "repository-azure", "repository-gcs"
export const REPO_TYPES = [
  {
    label: "File system (fs)",
    value: "fs",
  },
];

export const REPO_SELECT_OPTIONS: EuiSelectOption[] = [
  {
    text: "Shared file system",
    value: "fs",
  },
  {
    text: "Custom configuration",
    value: "custom",
  },
];

export const FS_ADVANCED_SETTINGS = {
  chunk_size: null,
  compress: false,
  max_restore_bytes_per_sec: "40m",
  max_snapshot_bytes_per_sec: "40m",
  readonly: false,
};

export const CUSTOM_CONFIGURATION = {
  type: "s3",
  settings: {
    bucket: "<bucket_name>",
    base_path: "<bucket_base_path>",
  },
};
