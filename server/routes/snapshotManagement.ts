/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { NodeServices } from "../models/interfaces";
import { IRouter } from "../../../../src/core/server";
import { NODE_API } from "../../utils/constants";
import { schema } from "@osd/config-schema";

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
