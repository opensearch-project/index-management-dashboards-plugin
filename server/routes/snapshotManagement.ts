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

import { schema } from "@osd/config-schema";
import { NodeServices } from "../models/interfaces";
import { IRouter } from "../../../../src/core/server";
import { NODE_API } from "../../utils/constants";

export default function (services: NodeServices, router: IRouter) {
  const { snapshotManagementService } = services;

  router.get(
    {
      path: NODE_API._SNAPSHOTS,
      validate: {},
    },
    snapshotManagementService.getAllSnapshotsWithPolicy
  );

  router.get(
    {
      path: `${NODE_API._SNAPSHOTS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          repository: schema.string(),
        }),
      },
    },
    snapshotManagementService.getSnapshot
  );

  router.delete(
    {
      path: `${NODE_API._SNAPSHOTS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          repository: schema.string(),
        }),
      },
    },
    snapshotManagementService.deleteSnapshot
  );

  router.put(
    {
      path: `${NODE_API._SNAPSHOTS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          repository: schema.string(),
        }),
        body: schema.any(),
      },
    },
    snapshotManagementService.createSnapshot
  );

  router.post(
    {
      path: `${NODE_API._SNAPSHOTS}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          repository: schema.string(),
        }),
        body: schema.any(),
      },
    },
    snapshotManagementService.restoreSnapshot
  );

  router.post(
    {
      path: `${NODE_API.SMPolicies}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        body: schema.any(),
      },
    },
    snapshotManagementService.createPolicy
  );

  router.put(
    {
      path: `${NODE_API.SMPolicies}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        query: schema.object({
          seqNo: schema.maybe(schema.number()),
          primaryTerm: schema.maybe(schema.number()),
        }),
        body: schema.any(),
      },
    },
    snapshotManagementService.updatePolicy
  );

  router.get(
    {
      path: NODE_API.SMPolicies,
      validate: {
        // for public service to pass object to server service
        query: schema.object({
          from: schema.number(),
          size: schema.number(),
          sortField: schema.string(),
          sortOrder: schema.string(),
          queryString: schema.string(),
        }),
      },
    },
    snapshotManagementService.getPolicies
  );

  router.get(
    {
      path: `${NODE_API.SMPolicies}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    snapshotManagementService.getPolicy
  );

  router.delete(
    {
      path: `${NODE_API.SMPolicies}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    snapshotManagementService.deletePolicy
  );

  router.post(
    {
      path: `${NODE_API.SMPolicies}/{id}/_start`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    snapshotManagementService.startPolicy
  );

  router.post(
    {
      path: `${NODE_API.SMPolicies}/{id}/_stop`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    snapshotManagementService.stopPolicy
  );

  router.get(
    {
      path: NODE_API._REPOSITORIES,
      validate: {},
    },
    snapshotManagementService.catRepositoriesWithSnapshotCount
  );

  router.get(
    {
      path: `${NODE_API._INDICES}/{indices}`,
      validate: {
        params: schema.object({
          indices: schema.string(),
        }),
      },
    },
    snapshotManagementService.catSnapshotIndices
  );

  router.get(
    {
      path: NODE_API._RECOVERY,
      validate: {},
    },
    snapshotManagementService.getIndexRecovery
  );

  router.delete(
    {
      path: `${NODE_API._REPOSITORIES}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    snapshotManagementService.deleteRepository
  );

  router.get(
    {
      path: `${NODE_API._REPOSITORIES}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
      },
    },
    snapshotManagementService.getRepository
  );

  router.put(
    {
      path: `${NODE_API._REPOSITORIES}/{id}`,
      validate: {
        params: schema.object({
          id: schema.string(),
        }),
        body: schema.any(),
      },
    },
    snapshotManagementService.createRepository
  );
}
