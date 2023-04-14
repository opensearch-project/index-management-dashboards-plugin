/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Deletes all indices in cluster
     * @example
     * cy.deleteAllIndices()
     */
    deleteAllIndices(): Chainable<any>;

    /**
     * Creates a policy
     * @example
     * cy.createPolicy("some_policy", { "policy": { ... } })
     */
    createPolicy(policyId: string, policyJSON: object): Chainable<any>;

    /**
     * Gets settings for index
     * @example
     * cy.getIndexSettings("some_index")
     */
    getIndexSettings(index: string): Chainable<any>;

    /**
     * Updates settings for index
     * @example
     * cy.updateIndexSettings("some_index", settings)
     */
    updateIndexSettings(index: string, settings: object): Chainable<any>;

    /**
     * Updated the managed index config's start time to
     * make it run in 3 seconds after calling this.
     * Note: if you are calling this then you likely are forcing
     * an ISM job to run. Make sure disableJitter is called sometime
     * before this or else the delay may cause test flakiness.
     * @example
     * cy.updateManagedIndexConfigStartTime("some_index")
     */
    updateManagedIndexConfigStartTime(index: string): Chainable<any>;

    /**
     * Creates index with policy
     * @example
     * cy.createIndex("some_index", "some_policy")
     */
    createIndex(index: string, policyID?: string, settings?: object): Chainable<any>;

    /**
     * Creates a rollup
     * @example
     * cy.createRollup("some_rollup", { "rollup": { ... } })
     */
    createRollup(policyId: string, policyJSON: object): Chainable<any>;

    /**
     * Creates an index template.
     * @example
     * cy.createIndexTemplate("some_index_template", { "index_patterns": "abc", "properties": { ... } })
     */
    createIndexTemplate(name: string, template: object): Chainable<any>;

    /**
     * Creates an index template.
     * @example
     * cy.createTemplateComponent("some_template_component", { "properties": { ... } })
     */
    createTemplateComponent(name: string, template: object): Chainable<any>;

    /**
     * Creates a data stream.
     * @example
     * cy.createDataStream("some_data_stream")
     */
    createDataStream(name: string): Chainable<any>;

    /**
     * Deletes one or more data streams (comma-separated).
     * @example
     * cy.deleteDataStreams("logs-*,metrics-*")
     */
    deleteDataStreams(names: string): Chainable<any>;

    /**
     * Rollovers the given target (alias or a data stream).
     * @example
     * cy.rollover("some_rollover_target")
     */
    rollover(target: string): Chainable<any>;

    /**
     * Creates a transform
     * @example
     * cy.createTransform("some_transform", { "transform": { ... } })
     */
    createTransform(transformId: string, transformJSON: object): Chainable<any>;

    /**
     * Disables jitter on a cluster. The jitter is used in
     * index state management to add a randomized delay to the start
     * time of jobs. This helps spread the resource load when there are
     * many jobs scheduled for the same time, but can cause flakiness in tests.
     * @example
     * cy.disableJitter()
     */
    disableJitter(): Chainable<any>;

    /**
     * Delete template
     * @example
     * cy.deleteTemplate("some_template")
     */
    deleteTemplate(name: string);

    /**
     * Delete template
     * @example
     * cy.deleteTemplate("some_template")
     */
    deleteTemplateComponents(name: string);

    /**
     * Create a ingest pipeline
     * @example
     * cy.createPipeline("pipelineId", {"description": "sample description", "processors": []})
     */
    createPipeline(pipelineId: string, pipeline: object);
    addIndexAlias(alias: string, index: string);
    removeIndexAlias(alias: string);
  }
}
