/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IComposableTemplateRemote } from "../../../models/interfaces";

export interface ICatComposableTemplate {
  name: string;
  component_template: IComposableTemplateRemote;
  usedBy: string[];
  associatedCount: number;
}
