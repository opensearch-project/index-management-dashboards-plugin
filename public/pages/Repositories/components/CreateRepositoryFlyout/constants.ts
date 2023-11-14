/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
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
