/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema, TypeOf } from "@osd/config-schema";
import { PluginConfigDescriptor, PluginInitializerContext } from "../../../src/core/server";
import { IndexPatternManagementPlugin } from "./plugin";

export const configSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),
});

export type IndexManagementPluginConfigType = TypeOf<typeof configSchema>;

export const config: PluginConfigDescriptor<IndexManagementPluginConfigType> = {
  exposeToBrowser: {
    enabled: true,
  },
  schema: configSchema,
};

export interface IndexManagementPluginSetup {}
export interface IndexManagementPluginStart {}

export function plugin(initializerContext: PluginInitializerContext) {
  return new IndexPatternManagementPlugin();
}
