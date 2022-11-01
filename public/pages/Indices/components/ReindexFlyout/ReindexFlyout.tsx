/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiCallOut,
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiLink,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import _ from "lodash";
import React, { Component } from "react";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import { CoreServicesContext } from "../../../../components/core_services";
import { getErrorMessage } from "../../../../utils/helpers";
import { IndexItem } from "../../../../../models/interfaces";
import CustomLabel from "../../../../components/CustomLabel";
import { DarkModeConsumer } from "../../../../components/DarkMode";
import { DEFAULT_QUERY, ERROR_PROMPT } from "../../utils/constants";
import JSONEditor from "../../../../components/JSONEditor";
import { REQUEST } from "../../../../../utils/constants";
import { ReindexRequest } from "../../models/interfaces";
import { DSL_DOCUMENTATION_URL } from "../../../../utils/constants";
import { BrowserServices } from "../../../../models/interfaces";

interface ReindexProps {
  services: BrowserServices;
  sourceIndices: string[];
  onCloseFlyout: () => void;
  onReindexConfirm: (request: ReindexRequest) => void;
}

interface ReindexState {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  dataStreams: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];
  jsonString: string;
  destError?: string;
  destSettingsJson?: string;
  sourceErr?: string[];
}

export default class ReindexFlyout extends Component<ReindexProps, ReindexState> {
  static contextType = CoreServicesContext;
  constructor(props: ReindexProps) {
    super(props);

    this.state = {
      indexOptions: [],
      dataStreams: [],
      selectedIndexOptions: [],
      jsonString: DEFAULT_QUERY,
    };
  }

  async componentDidMount() {
    // check _source enabled for source
    const { sourceIndices } = this.props;
    await this.isSourceEnabled(sourceIndices);
    await this.getIndexOptions("");
  }

  isSourceEnabled = async (sourceIndices: string[]) => {
    // sourceIndices
    const {
      services: { commonService },
    } = this.props;

    const res = await commonService.apiCaller({
      endpoint: "indices.getFieldMapping",
      data: {
        fields: "_source",
        index: sourceIndices.join(","),
      },
    });
    if (res.ok) {
      let err = [];
      for (let index of sourceIndices) {
        const enabled = _.get(res.response, [index, "mappings", "_source", "mapping", "_source", "enabled"]);
        if (enabled === false) {
          err.push(`${index} didn't store _source`);
        }
      }
      if (err.length > 0) {
        this.setState({ sourceErr: err });
      }
    } else {
      // let reindex api to do the check
    }
  };

  onIndicesSelectionChange = (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => {
    this.setState({
      selectedIndexOptions: selectedOptions,
      destSettingsJson: undefined,
    });
  };

  getIndexOptions = async (searchValue: string) => {
    const {
      services: { indexService },
      sourceIndices,
    } = this.props;
    this.setState({ indexOptions: [] });
    try {
      const res = await indexService.getDataStreamsAndIndicesNames(searchValue);
      if (res.ok) {
        const dataStreams = res.response.dataStreams.map((label) => ({ label }));
        const indices = res.response.indices
          .filter((index) => {
            return sourceIndices.indexOf(index) == -1;
          })
          .map((label) => ({ label }));
        this.setState({
          indexOptions: [
            { label: "indices", options: indices },
            { label: "dataStreams", options: dataStreams },
          ],
        });
        this.setState({ dataStreams: dataStreams });
      } else {
        if (res.error.startsWith("[index_not_found_exception]")) {
          this.context.notifications.toasts.addDanger("No index available");
        } else {
          this.context.notifications.toasts.addDanger(res.error);
        }
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem fetching index options."));
    }
  };

  onCreateOption = (searchValue: string, options: EuiComboBoxOptionOption<IndexItem>[]) => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();
    if (!normalizedSearchValue) {
      return;
    }
    const newOption = {
      label: normalizedSearchValue,
    };

    if (options.findIndex((option) => option.label.trim().toLowerCase() === normalizedSearchValue) === -1) {
      this.populateSourceIndexSettings(searchValue);
    }

    this.setState({ selectedIndexOptions: [newOption] });
  };

  populateSourceIndexSettings = async (dest: string) => {
    const {
      services: { commonService },
      sourceIndices,
    } = this.props;
    if (sourceIndices.length === 1 && sourceIndices[0] != dest) {
      const res = await commonService.apiCaller({
        endpoint: "indices.get",
        method: REQUEST.GET,
        data: {
          index: sourceIndices[0],
        },
      });
      if (res.ok) {
        // @ts-ignore
        let index = res.response[sourceIndices[0]];
        _.unset(index.settings, "aliases");
        _.unset(index.settings, "index.provided_name");
        _.unset(index.settings, "index.creation_date");
        _.unset(index.settings, "index.uuid");
        _.unset(index.settings, "index.version");
        this.setState({ destSettingsJson: JSON.stringify(index, null, 4) });
      }
    }
  };

  onClickAction = async () => {
    const {
      sourceIndices,
      onReindexConfirm,
      services: { commonService },
    } = this.props;
    const { jsonString, selectedIndexOptions, dataStreams, destSettingsJson } = this.state;

    if (!selectedIndexOptions || selectedIndexOptions.length != 1) {
      this.setState({ destError: ERROR_PROMPT.DEST_REQUIRED });
      return;
    }
    let [dest] = selectedIndexOptions.map((op) => op.label);
    let invalidDest: boolean = sourceIndices.indexOf(dest) !== -1;
    if (invalidDest) {
      this.setState({ destError: ERROR_PROMPT.DEST_DIFF_WITH_SOURCE });
      return;
    }

    let isDestAsDataStream = dataStreams.map((ds) => ds.label).indexOf(dest) !== -1;

    try {
      if (destSettingsJson) {
        // create dest index first
        const createRes = await commonService.apiCaller({
          endpoint: "indices.create",
          method: REQUEST.PUT,
          data: {
            index: dest,
            body: {
              ...JSON.parse(destSettingsJson),
            },
          },
        });
        if (createRes.error) {
          this.context.notifications.toasts.addDanger(`Create dest index ${dest} with error ${createRes.error}`);
          return;
        }
      }

      onReindexConfirm({
        waitForCompletion: false,
        body: {
          source: {
            index: sourceIndices.join(","),
            ...JSON.parse(jsonString),
          },
          dest: {
            index: selectedIndexOptions.map((op) => op.label)[0],
            op_type: isDestAsDataStream ? "create" : "index",
          },
        },
      });
    } catch (error) {
      this.context.notifications.toasts.addDanger(`Reindex operation error happened ${error}`);
    }
  };

  onJsonChange = (value: string) => {
    this.setState({ jsonString: value });
  };

  onDestSettingsChange = (value: string) => {
    const parsedJSON = JSON.parse(value);
    this.setState({ destSettingsJson: JSON.stringify(parsedJSON, null, 4) });
  };

  render() {
    const { onCloseFlyout, sourceIndices } = this.props;
    const { indexOptions, selectedIndexOptions, jsonString, destError, destSettingsJson, sourceErr } = this.state;

    return (
      <EuiFlyout ownFocus={false} onClose={onCloseFlyout} maxWidth={600} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle"> Reindex </h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        {sourceErr && sourceErr.length > 0 && (
          <EuiCallOut title="Sorry, there was an error" color="danger" iconType="alert">
            <ul>
              {sourceErr.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </EuiCallOut>
        )}

        <EuiFlyoutBody>
          <CustomLabel title="Source indices" />
          <EuiFormRow>
            <EuiComboBox
              options={indexOptions}
              selectedOptions={sourceIndices.map((index) => ({ label: index }))}
              isDisabled
              data-test-subj="sourceIndicesComboInput"
            />
          </EuiFormRow>

          <EuiSpacer size="m" />

          <CustomLabel title="Destination index" />
          <EuiFormRow
            isInvalid={!!destError}
            error={destError}
            helpText="Select an index from the list. If target index not exists, will create a new one based on source"
          >
            <EuiComboBox
              placeholder="Select dest index"
              options={indexOptions}
              async
              selectedOptions={selectedIndexOptions}
              onChange={this.onIndicesSelectionChange}
              onSearchChange={this.getIndexOptions}
              onCreateOption={this.onCreateOption}
              isClearable={true}
              singleSelection={{ asPlainText: true }}
              data-test-subj="destIndicesComboInput"
              customOptionText="Create {searchValue} as your dest index"
            />
          </EuiFormRow>

          <EuiSpacer size="m" />
          {destSettingsJson && <CustomLabel title="Dest index configuration" />}
          {destSettingsJson && (
            <DarkModeConsumer>
              {(isDarkMode) => (
                <JSONEditor
                  mode="json"
                  theme={isDarkMode ? "sense-dark" : "github"}
                  width="100%"
                  value={destSettingsJson}
                  onChange={this.onDestSettingsChange}
                  aria-label="Code Editor"
                  data-test-subj="destSettingJsonEditor"
                />
              )}
            </DarkModeConsumer>
          )}

          <EuiSpacer size="m" />
          <CustomLabel title="Query expression to reindex a subset of documents" isOptional={true} />
          <EuiText size="xs">
            <EuiLink href={DSL_DOCUMENTATION_URL} target="_blank" rel="noopener noreferrer">
              see Full-text queries
            </EuiLink>
          </EuiText>
          <DarkModeConsumer>
            {(isDarkMode) => (
              <JSONEditor
                mode="json"
                theme={isDarkMode ? "sense-dark" : "github"}
                width="100%"
                value={jsonString}
                onChange={this.onJsonChange}
                aria-label="Code Editor"
                height="200px"
                data-test-subj="queryJsonEditor"
              />
            )}
          </DarkModeConsumer>
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <FlyoutFooter
            edit={false}
            action=""
            disabledAction={sourceErr && sourceErr.length > 0}
            text="Execute"
            onClickAction={this.onClickAction}
            onClickCancel={onCloseFlyout}
          />
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
