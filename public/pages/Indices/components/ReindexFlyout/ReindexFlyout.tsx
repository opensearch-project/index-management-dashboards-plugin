/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiComboBox,
  EuiComboBoxOptionOption,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiFormRow,
  EuiSpacer,
  EuiTitle,
} from "@elastic/eui";
import _ from "lodash";
import React, { Component } from "react";
import FlyoutFooter from "../../../VisualCreatePolicy/components/FlyoutFooter";
import { CoreServicesContext } from "../../../../components/core_services";
import { CommonService, IndexService } from "../../../../services";
import { getErrorMessage } from "../../../../utils/helpers";
import { IndexItem } from "../../../../../models/interfaces";
import CustomLabel from "../../../../components/CustomLabel";
import { DarkModeConsumer } from "../../../../components/DarkMode";
import { DEFAULT_QUERY, ERROR_PROMPT } from "../../utils/constants";
import JSONEditor from "../../../../components/JSONEditor";
import { REQUEST } from "../../../../../utils/constants";

interface ReindexProps {
  commonService: CommonService;
  indexService: IndexService;
  sourceIndices: string[];
  onCloseFlyout: () => void;
}

interface ReindexState {
  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  dataStreams: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];
  jsonString: string;
  destError?: string;
  destSettingsJson?: string;
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
    await this.getIndexOptions("");
  }

  onIndicesSelectionChange = (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => {
    this.setState({
      selectedIndexOptions: selectedOptions,
      destSettingsJson: undefined,
    });
  };

  getIndexOptions = async (searchValue: string) => {
    const { indexService, sourceIndices } = this.props;
    this.setState({ indexOptions: [] });
    try {
      const optionsResponse = await indexService.getDataStreamsAndIndicesNames(searchValue);
      if (optionsResponse.ok) {
        const dataStreams = optionsResponse.response.dataStreams.map((label) => ({ label }));
        const indices = optionsResponse.response.indices
          .filter((index) => {
            return sourceIndices.indexOf(index) == -1;
          })
          .map((label) => ({ label }));
        this.setState({ indexOptions: indices });
        this.setState({ dataStreams: dataStreams });
      } else {
        // @ts-ignore
        if (optionsResponse.error.startsWith("[index_not_found_exception]")) {
          this.context.notifications.toasts.addDanger("No index available");
        } else {
          this.context.notifications.toasts.addDanger(optionsResponse.error);
        }
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem fetching index options."));
    }
  };

  onCreateOption = (searchValue: string, options: Array<EuiComboBoxOptionOption<IndexItem>>) => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();
    if (!normalizedSearchValue) {
      return;
    }
    const newOption = {
      label: searchValue,
    };

    this.setState({ selectedIndexOptions: [newOption] });

    this.populateSourceIndexSettings();
  };

  populateSourceIndexSettings = async () => {
    const { sourceIndices } = this.props;
    if (sourceIndices.length === 1) {
      const res = await this.props.commonService.apiCaller({
        endpoint: "indices.get",
        method: REQUEST.GET,
        data: {
          index: sourceIndices[0],
        },
      });
      if (res.ok) {
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
    const { sourceIndices, onCloseFlyout } = this.props;
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
        await this.props.commonService.apiCaller({
          endpoint: "indices.create",
          data: {
            index: dest,
            ...JSON.parse(destSettingsJson),
          },
        });
      }

      let res = await this.props.commonService.apiCaller({
        endpoint: "reindex",
        method: REQUEST.POST,
        data: {
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
        },
      });
      if (res.ok) {
        this.context.notifications.toasts.addSuccess(`Reindex triggered successfully with taskId ${res.response.task}`);
        onCloseFlyout();
      } else {
        this.context.notifications.toasts.addDanger(`Reindex operation error happened ${res.error}`);
      }
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
    const { indexOptions, selectedIndexOptions, jsonString, destError, destSettingsJson } = this.state;

    return (
      <EuiFlyout ownFocus={false} onClose={onCloseFlyout} maxWidth={800} size="m" hideCloseButton>
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2 id="flyoutTitle"> Reindex </h2>
          </EuiTitle>
        </EuiFlyoutHeader>

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
            helpText="Select an index from the list. If target index not created yet, create a new one."
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
          {destSettingsJson && <CustomLabel title="Dest index settings & mappings for creation" />}
          {destSettingsJson && (
            <DarkModeConsumer>
              {(isDarkMode) => (
                <JSONEditor
                  mode="json"
                  theme={isDarkMode ? "sense-dark" : "github"}
                  width="100%"
                  value={destSettingsJson}
                  onChange={this.onDestSettingsChange}
                  setOptions={{ fontSize: "14px" }}
                  aria-label="Code Editor"
                  data-test-subj="destSettingJsonEditor"
                />
              )}
            </DarkModeConsumer>
          )}

          <EuiSpacer size="m" />
          <CustomLabel title="Query expression to reindex a subset of documents" isOptional={true} />
          <DarkModeConsumer>
            {(isDarkMode) => (
              <JSONEditor
                mode="json"
                theme={isDarkMode ? "sense-dark" : "github"}
                width="100%"
                value={jsonString}
                onChange={this.onJsonChange}
                setOptions={{ fontSize: "14px" }}
                aria-label="Code Editor"
                height="200px"
                data-test-subj="queryJsonEditor"
              />
            )}
          </DarkModeConsumer>
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <FlyoutFooter edit={false} action="" text="Execute" onClickAction={this.onClickAction} onClickCancel={onCloseFlyout} />
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
