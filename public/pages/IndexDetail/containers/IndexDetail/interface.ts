/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { IndexItem } from "../../../../../models/interfaces";
import { ManagedCatIndex } from "../../../../../server/models/interfaces";

export interface IFinalDetail extends Omit<ManagedCatIndex, "data_stream">, IndexItem {}
