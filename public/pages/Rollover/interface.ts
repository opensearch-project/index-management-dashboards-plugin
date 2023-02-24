/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { FieldInstance } from "../../lib/field";
import { IndexItem } from "../../models/interfaces";

export interface SubDetailProps {
  field: FieldInstance;
  sourceType?: "dataStreams" | "alias" | undefined;
  writingIndex?: string;
}

export interface IRolloverRequestBody {
  source?: string;
  targetIndex?: IndexItem;
  conditions?: {
    max_age?: string;
    max_docs?: number;
    max_size?: string;
    max_primary_shard_size?: string;
  };
}
