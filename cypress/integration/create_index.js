/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { PLUGIN_NAME } from "../support/constants";

const SAMPLE_INDEX = "index-specific-index";

describe("Create Index", () => {
  before(() => {
    // Set welcome screen tracking to false
    localStorage.setItem("home:welcome:show", "false");
    cy.deleteAllIndices();
    cy.deleteTemplate("index-common-template");
    cy.deleteTemplate("index-specific-template");
    cy.createIndexTemplate("index-common-template", {
      index_patterns: ["index-*"],
      template: {
        aliases: {
          alias_for_common_1: {},
          alias_for_common_2: {},
        },
        settings: {
          number_of_shards: 2,
          number_of_replicas: 1,
        },
      },
    });
    cy.createIndexTemplate("index-specific-template", {
      index_patterns: ["index-specific-*"],
      priority: 1,
      template: {
        aliases: {
          alias_for_specific_1: {},
        },
        settings: {
          number_of_shards: 3,
          number_of_replicas: 2,
        },
        mappings: {
          properties: {
            text: {
              type: "text",
            },
          },
        },
      },
    });
  });

  describe("can be created and updated", () => {
    beforeEach(() => {
      // Visit ISM OSD
      cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/indices`);
      cy.contains("Rows per page", { timeout: 60000 });
    });

    it("Create a index successfully", () => {
      // enter create page
      cy.get('[data-test-subj="Create IndexButton"]').click();
      cy.contains("Create index");

      // type field name
      cy.get('[placeholder="Specify a name for the new index."]').type(SAMPLE_INDEX).blur();

      cy.wait(1000);

      cy.get('[data-test-subj="comboBoxSearchInput"]').get('[title="alias_for_specific_1"]').should("exist");

      cy.get('[data-test-subj="comboBoxSearchInput"]').type("some_test_alias{enter}");

      cy.get('[data-test-subj="editorTypeJsonEditor"]').click().end();

      cy.get('[data-test-subj="mappingsJsonEditorFormRow"] [data-test-subj="jsonEditor-valueDisplay"]').should(($editor) => {
        expect(JSON.parse($editor.val())).to.deep.equal({
          properties: {
            text: {
              type: "text",
            },
          },
        });
      });

      cy.get('[data-test-subj="mappingsJsonEditorFormRow"] .ace_text-input')
        .focus()
        .clear({ force: true })
        .type(
          JSON.stringify({
            properties: {
              text: {
                type: "text",
              },
            },
            dynamic: true,
          }),
          { parseSpecialCharSequences: false, force: true }
        )
        .end()
        .wait(1000)
        .get('[data-test-subj="editorTypeVisualEditor"]')
        .click()
        .end();

      // add a field
      cy.get('[data-test-subj="createIndexAddFieldButton"]').click().end();
      cy.get('[data-test-subj="mapping-visual-editor-1-field-name"]').type("text_mappings");

      // click create
      cy.get('[data-test-subj="createIndexCreateButton"]').click({ force: true });

      // The index should exist
      cy.get(`#_selection_column_${SAMPLE_INDEX}-checkbox`).should("have.exist");

      // check the index detail
      cy.visit(`${Cypress.env("opensearch_dashboards")}/app/${PLUGIN_NAME}#/create-index/${SAMPLE_INDEX}`);

      // index name and alias should exist
      cy.get(`[title="${SAMPLE_INDEX}"]`)
        .should("have.exist")
        .end()
        .get('[title="some_test_alias"]')
        .should("have.exist")
        .end()
        .get('[data-test-subj="mapping-visual-editor-0-field-type"]')
        .should("have.attr", "title", "text")
        .end()
        .get('[data-test-subj="mapping-visual-editor-1-field-name"]')
        .should("have.attr", "title", "text_mappings")
        .end()
        .get('[data-test-subj="editorTypeJsonEditor"]')
        .click()
        .end()
        .get('[data-test-subj="mappingsJsonEditorFormRow"] [data-test-subj="jsonEditor-valueDisplay"]')
        .should(($editor) => {
          expect(JSON.parse($editor.val())).to.deep.equal({
            dynamic: "true",
            properties: {},
          });
        });
    });

    it("Update alias successfully", () => {
      cy.get(`[data-test-subj="viewIndexDetailButton-${SAMPLE_INDEX}"]`).click().get("#indexDetailModalAlias").click();

      // add a alias and remove the exist alias
      cy.get('[data-test-subj="comboBoxSearchInput"]')
        .type("some_new_test_alias{enter}")
        .end()
        .get('[title="some_test_alias"] .euiBadge__iconButton')
        .click()
        .end()
        .get('[data-test-subj="createIndexCreateButton"]')
        .click({ force: true })
        .end();

      cy.get('[title="some_test_alias"]').should("not.exist").end().get('[title="some_new_test_alias"]').should("exist").end();
    });

    it("Update settings successfully", () => {
      cy.get(`[data-test-subj="viewIndexDetailButton-${SAMPLE_INDEX}"]`).click().get("#indexDetailModalSettings").click();

      cy.get('[aria-controls="accordionForCreateIndexSettings"]')
        .click()
        .end()
        .get(".ace_text-input")
        .focus()
        .clear({ force: true })
        .type('{ "index.blocks.write": true, "index.number_of_shards": 2, "index.number_of_replicas": 3 }', {
          parseSpecialCharSequences: false,
          force: true,
        })
        .blur();

      cy.get('[data-test-subj="createIndexCreateButton"]').click({ force: true });

      cy.contains(`Can't update non dynamic settings`).should("exist");

      cy.get(".ace_text-input")
        .focus()
        .clear({ force: true })
        .type('{ "index.blocks.write": true, "index.number_of_shards": "3" }', { parseSpecialCharSequences: false, force: true })
        .end()
        .wait(1000)
        .get('[placeholder="The number of replica shards each primary shard should have."]')
        .clear()
        .type(2)
        .end();

      cy.get('[data-test-subj="createIndexCreateButton"]').click({ force: true });

      cy.wait(1000).get('[data-test-subj="form-name-index.number_of_replicas"] input').should("have.value", "2");
    });

    it("Update mappings successfully", () => {
      cy.get(`[data-test-subj="viewIndexDetailButton-${SAMPLE_INDEX}"]`).click().get("#indexDetailModalMappings").click();

      cy.get('[data-test-subj="createIndexAddFieldButton"]')
        .click()
        .end()
        .get('[data-test-subj="mapping-visual-editor-2-field-name"]')
        .type("text_mappings_2")
        .end()
        .get('[data-test-subj="createIndexCreateButton"]')
        .click({ force: true });

      cy.get('[data-test-subj="mapping-visual-editor-2-field-type"]').should("have.attr", "title", "text").end();

      cy.get('[data-test-subj="editorTypeJsonEditor"]')
        .click()
        .end()
        .get(".ace_text-input")
        .focus()
        .clear({ force: true })
        .type('{ "dynamic": true }', { parseSpecialCharSequences: false, force: true })
        .blur()
        .end()
        .wait(1000)
        .get('[data-test-subj="createIndexCreateButton"]')
        .click({ force: true });

      cy.wait(1000)
        .get('[data-test-subj="editorTypeJsonEditor"]')
        .click()
        .end()
        .get('[data-test-subj="previousMappingsJsonButton"]')
        .click()
        .end()
        .get('[data-test-subj="previousMappingsJsonModal"] [data-test-subj="jsonEditor-valueDisplay"]')
        .should(
          "have.text",
          JSON.stringify(
            {
              dynamic: "true",
              properties: {
                text: {
                  type: "text",
                },
                text_mappings: {
                  type: "text",
                },
                text_mappings_2: {
                  type: "text",
                },
              },
            },
            null,
            2
          )
        );
    });
  });

  after(() => {
    cy.deleteTemplate("index-common-template");
    cy.deleteTemplate("index-specific-template");
  });
});
