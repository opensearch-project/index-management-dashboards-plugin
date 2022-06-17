/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from "lodash";
import queryString from "query-string";
import {
  EuiFormRow,
  EuiTextArea,
  EuiSelect,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiSwitchEvent,
  EuiTitle,
  EuiButtonEmpty,
  EuiButton,
  EuiComboBoxOptionOption,
  EuiFieldNumber,
  EuiAccordion,
  EuiRadioGroup,
  EuiText,
  EuiCheckbox,
  EuiPanel,
  EuiHorizontalRule,
  EuiButtonIcon,
} from "@elastic/eui";
import React, { ChangeEvent, Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ContentPanel } from "../../../components/ContentPanel";
import { DEFAULT_INDEX_OPTIONS, ERROR_PROMPT, getDefaultSMPolicy } from "../utils/constants";
import moment from "moment-timezone";
import CustomLabel from "../components/CustomLabel";
import CronSchedule from "../components/CronSchedule";
import { BREADCRUMBS, ROUTES } from "../../../utils/constants";
import { CoreServicesContext } from "../../../components/core_services";
import { getErrorMessage, wildcardOption } from "../../../utils/helpers";
import { IndexService, NotificationService, SnapshotManagementService } from "../../../services";
import { IndexItem, SMPolicy } from "../../../../models/interfaces";
import ChannelNotification from "../../VisualCreatePolicy/components/ChannelNotification";
import { CatRepository, CreateRepositoryBody, CreateRepositorySettings, FeatureChannelList } from "../../../../server/models/interfaces";
import SnapshotIndicesRepoInput from "../components/SnapshotIndicesRepoInput";
import { buildCronExpressionFromState, parseCronExpression } from "../utils/helpers";
import SnapshotAdvancedSettings from "../components/SnapshotAdvancedSettings";

interface CreateSMPolicyProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
  isEdit: boolean;
  notificationService: NotificationService;
  indexService: IndexService;
}

interface CreateSMPolicyState {
  policy: SMPolicy;
  policyId: string;
  policySeqNo: number | undefined;
  policyPrimaryTerm: number | undefined;

  isSubmitting: boolean;

  channels: FeatureChannelList[];
  loadingChannels: boolean;

  indexOptions: EuiComboBoxOptionOption<IndexItem>[];
  selectedIndexOptions: EuiComboBoxOptionOption<IndexItem>[];

  repositories: CatRepository[];
  selectedRepoValue: string;

  maxAgeNum: number;
  maxAgeUnit: string;

  creationScheduleStartTime: moment.Moment;
  creationScheduleFrequencyType: string;
  creationScheduleDayOfMonth: number;
  creationScheduleDayOfWeek: string;
  deletionScheduleStartTime: moment.Moment;
  deletionScheduleFrequencyType: string;
  deletionScheduleDayOfMonth: number;
  deletionScheduleDayOfWeek: string;

  deleteConditionEnabled: boolean;
  deletionScheduleEnabled: boolean;

  advancedSettingsOpen: boolean;

  showCreateRepoFlyout: boolean;

  policyIdError: string;
  minCountError: string;
  repoError: string;
}

export default class CreateSMPolicy extends Component<CreateSMPolicyProps, CreateSMPolicyState> {
  static contextType = CoreServicesContext;

  constructor(props: CreateSMPolicyProps) {
    super(props);

    console.log(`sm dev is constructor run?`);
    this.state = {
      // This component has this policy object reference saved in state
      // which doesn't necessarily need to be updated by setState
      policy: getDefaultSMPolicy(),
      policyId: "",
      policySeqNo: undefined,
      policyPrimaryTerm: undefined,

      isSubmitting: false,

      channels: [],
      loadingChannels: false,

      indexOptions: DEFAULT_INDEX_OPTIONS,
      selectedIndexOptions: [],

      repositories: [],
      selectedRepoValue: "",

      maxAgeNum: 1,
      maxAgeUnit: "d",

      creationScheduleStartTime: moment("2022-01-01 20:00"),
      creationScheduleFrequencyType: "daily",
      creationScheduleDayOfWeek: "SUN",
      creationScheduleDayOfMonth: 1,
      deletionScheduleStartTime: moment("2022-01-01 01:00"),
      deletionScheduleFrequencyType: "daily",
      deletionScheduleDayOfWeek: "SUN",
      deletionScheduleDayOfMonth: 1,

      deleteConditionEnabled: false,
      deletionScheduleEnabled: false,

      advancedSettingsOpen: false,
      showCreateRepoFlyout: false,

      policyIdError: "",
      repoError: "",
      minCountError: "",
    };
  }

  async componentDidMount() {
    console.log(`sm dev component did mount`);
    if (this.props.isEdit) {
      const { id } = queryString.parse(this.props.location.search);
      if (typeof id === "string" && !!id) {
        this.context.chrome.setBreadcrumbs([
          BREADCRUMBS.SNAPSHOT_MANAGEMENT,
          BREADCRUMBS.SNAPSHOT_POLICIES,
          BREADCRUMBS.EDIT_SNAPSHOT_POLICY,
          { text: id },
        ]);
        await this.getPolicy(id);
      } else {
        this.context.notifications.toasts.addDanger(`Invalid policy id: ${id}`);
        this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
      }
    } else {
      this.context.chrome.setBreadcrumbs([
        BREADCRUMBS.SNAPSHOT_MANAGEMENT,
        BREADCRUMBS.SNAPSHOT_POLICIES,
        BREADCRUMBS.CREATE_SNAPSHOT_POLICY,
      ]);
    }
    await this.getIndexOptions("");
    await this.getRepos();
  }

  getPolicy = async (policyId: string): Promise<void> => {
    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.getPolicy(policyId);
      console.log(`sm dev get policy ${response}`);

      if (response.ok) {
        this.populatePolicyToState(response.response.policy);

        this.setState({
          policy: response.response.policy,
          policyId: response.response.id,
          policySeqNo: response.response.seqNo,
          policyPrimaryTerm: response.response.primaryTerm,
        });
      } else {
        const errorMessage = response.ok ? "Policy was empty" : response.error;
        this.context.notifications.toasts.addDanger(`Could not load the policy: ${errorMessage}`);
        this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(`Could not load the policy`);
      this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
    }
  };

  getIndexOptions = async (searchValue: string) => {
    const { indexService } = this.props;
    this.setState({ indexOptions: DEFAULT_INDEX_OPTIONS });
    try {
      const optionsResponse = await indexService.getDataStreamsAndIndicesNames(searchValue);
      if (optionsResponse.ok) {
        // Adding wildcard to search value
        const options = searchValue.trim() ? [{ label: wildcardOption(searchValue) }, { label: searchValue }] : [];
        // const dataStreams = optionsResponse.response.dataStreams.map((label) => ({ label }));
        const indices = optionsResponse.response.indices.map((label) => ({ label }));
        // this.setState({ indexOptions: options.concat(dataStreams, indices)});
        this.setState({ indexOptions: [...this.state.indexOptions, ...options.concat(indices)] });
      } else {
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

  getRepos = async () => {
    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.catRepositories();
      if (response.ok) {
        this.setState({ repositories: response.response });
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem loading the snapshots."));
    }
  };

  createRepo = async (repoName: string, type: string, settings: CreateRepositorySettings) => {
    try {
      const { snapshotManagementService } = this.props;

      const createRepoBody: CreateRepositoryBody = {
        type: type,
        settings: settings,
      };
      const response = await snapshotManagementService.createRepository(repoName, createRepoBody);
      if (response.ok) {
        this.setState({ showCreateRepoFlyout: false });
        this.context.notifications.toasts.addSuccess(`Created repository ${repoName}.`);
        await this.getRepos();
      } else {
        this.context.notifications.toasts.addDanger(response.error);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem creating the repository."));
    }
  };

  createPolicy = async (policyId: string, policy: SMPolicy) => {
    const { snapshotManagementService } = this.props;
    try {
      const response = await snapshotManagementService.createPolicy(policyId, policy);
      this.setState({ isSubmitting: false });
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(`Created policy: ${response.response.policy.name}`);
        this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
      } else {
        this.context.notifications.toasts.addDanger(`Failed to create snapshot policy: ${response.error}`);
      }
    } catch (err) {
      this.setState({ isSubmitting: false });
      this.context.notifications.toasts.addDanger(
        `Failed to create snapshot policy: ${getErrorMessage(err, "There was a problem creating the snapshot policy.")}`
      );
    }
  };
  updatePolicy = async (policyId: string, policy: SMPolicy): Promise<void> => {
    try {
      const { snapshotManagementService } = this.props;
      const { policyPrimaryTerm, policySeqNo } = this.state;
      if (policySeqNo == null || policyPrimaryTerm == null) {
        this.context.notifications.toasts.addDanger("Could not update policy without seqNo and primaryTerm");
        return;
      }
      const response = await snapshotManagementService.updatePolicy(policyId, policy, policySeqNo, policyPrimaryTerm);
      this.setState({ isSubmitting: false });
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(`Updated policy: ${response.response.policy.name}`);
        this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
      } else {
        this.context.notifications.toasts.addDanger(`Failed to update policy: ${response.error}`);
      }
    } catch (err) {
      this.setState({ isSubmitting: false });
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "There was a problem updating the policy"));
    }
  };
  onClickCancel = (): void => {
    this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
  };

  onClickSubmit = async () => {
    this.setState({ isSubmitting: true });
    const { isEdit } = this.props;
    const { policyId, policy } = this.state;

    try {
      if (!policyId.trim()) {
        this.setState({ policyIdError: "Required" });
      }
      if (!_.get(policy, "snapshot_config.repository")) {
        this.setState({ repoError: ERROR_PROMPT.REPO });
      } else {
        const policyFromState = this.buildPolicyFromState(policy);
        if (isEdit) await this.updatePolicy(policyId, policyFromState);
        else await this.createPolicy(policyId, policyFromState);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger("Invalid Policy");
      console.error(err);
      this.setState({ isSubmitting: false });
    }
    this.setState({ isSubmitting: false });
  };

  buildPolicyFromState = (policy: SMPolicy): SMPolicy => {
    const {
      deletionScheduleEnabled,
      maxAgeNum,
      maxAgeUnit,
      creationScheduleStartTime,
      creationScheduleFrequencyType,
      creationScheduleDayOfWeek,
      creationScheduleDayOfMonth,
      deletionScheduleStartTime,
      deletionScheduleFrequencyType,
      deletionScheduleDayOfWeek,
      deletionScheduleDayOfMonth,
      deleteConditionEnabled,
    } = this.state;

    // custom type directly update state.policy corresponding field
    if (creationScheduleFrequencyType !== "custom") {
      _.set(
        policy,
        "creation.schedule.cron.expression",
        buildCronExpressionFromState(
          creationScheduleStartTime,
          creationScheduleFrequencyType,
          creationScheduleDayOfWeek,
          creationScheduleDayOfMonth
        )
      );
    }

    if (deleteConditionEnabled) {
      _.set(policy, "deletion.condition.max_age", maxAgeNum + maxAgeUnit);
    } else {
      delete policy.deletion;
    }

    if (deletionScheduleEnabled) {
      if (deletionScheduleFrequencyType !== "custom") {
        _.set(
          policy,
          "deletion.schedule.cron.expression",
          buildCronExpressionFromState(
            deletionScheduleStartTime,
            deletionScheduleFrequencyType,
            deletionScheduleDayOfWeek,
            deletionScheduleDayOfMonth
          )
        );
      }
      _.set(policy, "deletion.schedule.cron.timezone", _.get(policy, "creation.schedule.cron.timezone", "America/Los_Angeles"));
    } else {
      delete policy.deletion?.schedule;
    }

    console.log(`sm dev: build policy from state ${JSON.stringify(policy)}`);
    return policy;
  };

  onIndicesSelectionChange = (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => {
    const selectedIndexOptions = selectedOptions.map((o) => o.label);
    let newJSON = this.state.policy;
    newJSON.snapshot_config.indices = selectedIndexOptions.toString();
    this.setState({ policy: newJSON, selectedIndexOptions: selectedOptions });
  };

  onRepoSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRepo = e.target.value;
    let newJSON = this.state.policy;
    newJSON.snapshot_config.repository = selectedRepo;
    let repoError = "";
    if (!selectedRepo) {
      repoError = ERROR_PROMPT.REPO;
    }
    this.setState({ policy: newJSON, selectedRepoValue: selectedRepo, repoError });
  };

  onCreateOption = (searchValue: string, options: Array<EuiComboBoxOptionOption<IndexItem>>) => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();
    if (!normalizedSearchValue) {
      return;
    }
    const newOption = {
      label: searchValue,
    };
    // Create the option if it doesn't exist.
    if (options.findIndex((option) => option.label.trim().toLowerCase() === normalizedSearchValue) === -1) {
      this.setState({ indexOptions: [...this.state.indexOptions, newOption] });
    }

    const selectedIndexOptions = [...this.state.selectedIndexOptions, newOption];
    let newJSON = this.state.policy;
    newJSON.snapshot_config.indices = selectedIndexOptions.toString();
    this.setState({ selectedIndexOptions: selectedIndexOptions, policy: newJSON });
  };

  getChannels = async (): Promise<void> => {
    console.log(`sm dev get channels`);
    this.setState({ loadingChannels: true });
    try {
      const { notificationService } = this.props;
      const response = await notificationService.getChannels();
      if (response.ok) {
        this.setState({ channels: response.response.channel_list });
      } else {
        this.context.notifications.toasts.addDanger(`Could not load notification channels: ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not load the notification channels"));
    }
    this.setState({ loadingChannels: false });
  };

  onChangeChannelId = (e: ChangeEvent<HTMLSelectElement>): void => {
    const channelId = e.target.value;
    this.setState((state) => ({
      policy: {
        ...state.policy,
        notification: {
          channel: {
            id: channelId,
          },
        },
      },
    }));
  };

  render() {
    // console.log(`sm dev render state ${JSON.stringify(this.state)}`);

    const { isEdit } = this.props;
    const {
      policy,
      policyId,
      isSubmitting,
      channels,
      loadingChannels,
      indexOptions,
      selectedIndexOptions,
      repositories,
      selectedRepoValue,
      maxAgeNum,
      maxAgeUnit,
      creationScheduleStartTime,
      creationScheduleFrequencyType,
      creationScheduleDayOfMonth,
      creationScheduleDayOfWeek,
      deletionScheduleStartTime,
      deletionScheduleFrequencyType,
      deletionScheduleDayOfMonth,
      deletionScheduleDayOfWeek,
      deleteConditionEnabled,
      deletionScheduleEnabled,
      advancedSettingsOpen,
      showCreateRepoFlyout,
      policyIdError,
      repoError,
      minCountError,
    } = this.state;

    const repoOptions = repositories.map((r) => ({ value: r.id, text: r.id }));

    const maxAgeUnitOptions = [
      { value: "d", text: "Days" },
      { value: "h", text: "Hours" },
    ];

    const radios = [
      {
        id: "retention_disabled",
        label: "Retain all snapshots",
      },
      {
        id: "retention_enabled",
        label: "Specify retention conditions",
      },
    ];

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiTitle size="l">
          <h1>{isEdit ? "Edit" : "Create"} policy</h1>
        </EuiTitle>
        <EuiText size="s">
          <span style={{ color: "grey", fontWeight: 200, fontSize: "15px" }}>
            Snapshot policies allow you to define an automated snapshot schedule and retention period. [Learn more]
          </span>
        </EuiText>

        <EuiSpacer />

        <ContentPanel title="Policy settings" titleSize="m">
          <CustomLabel title="Policy name" />
          <EuiFormRow isInvalid={!!policyIdError} error={policyIdError}>
            <EuiFieldText placeholder="e.g. daily-snapshot" value={policyId} onChange={this.onChangePolicyName} disabled={isEdit} />
          </EuiFormRow>

          <EuiSpacer />

          <CustomLabel title="Description" isOptional={true} />
          <EuiFormRow>
            <EuiTextArea
              compressed={true}
              value={_.get(policy, "description", "")}
              onChange={this.onChangeDescription}
              data-test-subj="description"
            />
          </EuiFormRow>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Source and destination" titleSize="m">
          <SnapshotIndicesRepoInput
            indexOptions={indexOptions}
            selectedIndexOptions={selectedIndexOptions}
            onIndicesSelectionChange={this.onIndicesSelectionChange}
            getIndexOptions={this.getIndexOptions}
            onCreateOption={this.onCreateOption}
            repoOptions={repoOptions}
            selectedRepoValue={selectedRepoValue}
            onRepoSelectionChange={this.onRepoSelectionChange}
            showFlyout={showCreateRepoFlyout}
            openFlyout={() => {
              this.setState({ showCreateRepoFlyout: true });
            }}
            closeFlyout={() => {
              this.setState({ showCreateRepoFlyout: false });
            }}
            createRepo={this.createRepo}
            snapshotManagementService={this.props.snapshotManagementService}
            repoError={repoError}
          />
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Snapshot schedule" titleSize="m">
          <CronSchedule
            frequencyType={creationScheduleFrequencyType}
            onChangeFrequencyType={(e) => {
              this.setState({ creationScheduleFrequencyType: e.target.value });
            }}
            startTime={creationScheduleStartTime}
            onChangeStartTime={(date) => {
              this.setState({ creationScheduleStartTime: date ?? this.state.creationScheduleStartTime });
            }}
            timezone={_.get(policy, "creation.schedule.cron.timezone", "America/Los_Angeles")}
            onChangeTimezone={(e) => {
              this.setState({ policy: _.set(this.state.policy, "creation.schedule.cron.timezone", e.target.value) });
            }}
            cronExpression={_.get(policy, "creation.schedule.cron.expression", "")}
            onChangeCronExpression={(e) => {
              this.setState({ policy: _.set(this.state.policy, "creation.schedule.cron.expression", e.target.value) });
            }}
            dayOfWeek={creationScheduleDayOfWeek}
            onChangeDayOfWeek={(day) => {
              this.setState({ creationScheduleDayOfWeek: day });
            }}
            dayOfMonth={creationScheduleDayOfMonth}
            onChangeDayOfMonth={(day) => {
              console.log(`sm dev change month day ${day}`);
              this.setState({ creationScheduleDayOfMonth: day });
            }}
          />
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Retention period" titleSize="m">
          <EuiRadioGroup
            options={radios}
            idSelected={deleteConditionEnabled ? "retention_enabled" : "retention_disabled"}
            onChange={(id) => {
              this.setState({ deleteConditionEnabled: id === "retention_enabled" });
            }}
          />

          <EuiSpacer size="m" />

          {deleteConditionEnabled ? (
            <>
              <CustomLabel title="Maximum age of snapshots retained" />
              <EuiFlexGroup>
                <EuiFlexItem grow={false}>
                  <EuiFieldNumber
                    value={maxAgeNum}
                    min={1}
                    onChange={(e) => {
                      this.setState({ maxAgeNum: parseInt(e.target.value) });
                    }}
                  />
                </EuiFlexItem>
                <EuiFlexItem style={{ maxWidth: 100 }}>
                  <EuiSelect
                    options={maxAgeUnitOptions}
                    value={maxAgeUnit}
                    onChange={(e) => {
                      this.setState({ maxAgeUnit: e.target.value });
                    }}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiSpacer size="m" />
              <EuiAccordion id="additional_delete_conditions" buttonContent="Additional settings">
                <EuiSpacer size="m" />

                <EuiText>Number of snapshots retained</EuiText>
                <EuiSpacer size="s" />

                <EuiFlexGroup alignItems="flexStart">
                  <EuiFlexItem grow={false}>
                    <CustomLabel title="Min count" />
                    <EuiFormRow isInvalid={!!minCountError} error={minCountError}>
                      <EuiFieldNumber min={1} value={_.get(policy, "deletion.condition.min_count", "")} onChange={this.onChangeMinCount} />
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <CustomLabel title="Max count" isOptional={true} />
                    <EuiFormRow>
                      <EuiFieldNumber min={1} value={_.get(policy, "deletion.condition.max_count", "")} onChange={this.onChangeMaxCount} />
                    </EuiFormRow>
                  </EuiFlexItem>
                </EuiFlexGroup>

                <EuiSpacer size="m" />

                <EuiText>Deletion schedule</EuiText>
                <span style={{ color: "grey", fontWeight: 200, fontSize: "12px" }}>
                  Delete snapshots that are outside the retention period
                </span>

                <EuiCheckbox
                  id="delete_schedule_checkbox"
                  label="Use same schedule as snapshots"
                  checked={!deletionScheduleEnabled}
                  onChange={(e) => {
                    this.setState({ deletionScheduleEnabled: !deletionScheduleEnabled });
                  }}
                />

                {deletionScheduleEnabled ? (
                  <CronSchedule
                    frequencyType={deletionScheduleFrequencyType}
                    onChangeFrequencyType={(e) => {
                      this.setState({ deletionScheduleFrequencyType: e.target.value });
                    }}
                    startTime={deletionScheduleStartTime}
                    onChangeStartTime={(date) => {
                      this.setState({ deletionScheduleStartTime: date ?? this.state.deletionScheduleStartTime });
                    }}
                    timezone={undefined}
                    cronExpression={_.get(policy, "deletion.schedule.cron.expression", "")}
                    onChangeCronExpression={(e) => {
                      this.setState({ policy: _.set(this.state.policy, "deletion.schedule.cron.expression", e.target.value) });
                    }}
                    dayOfWeek={deletionScheduleDayOfWeek}
                    onChangeDayOfWeek={(day) => {
                      this.setState({ deletionScheduleDayOfWeek: day });
                    }}
                    dayOfMonth={deletionScheduleDayOfMonth}
                    onChangeDayOfMonth={(day) => {
                      this.setState({ deletionScheduleDayOfMonth: day });
                    }}
                  />
                ) : null}
              </EuiAccordion>{" "}
            </>
          ) : null}
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Notifications" titleSize="m">
          <ChannelNotification
            channelId=""
            channels={channels}
            loadingChannels={loadingChannels}
            onChangeChannelId={this.onChangeChannelId}
            getChannels={this.getChannels}
          />
        </ContentPanel>

        <EuiSpacer />

        {/* Advanced settings */}
        <EuiPanel style={{ paddingLeft: "0px", paddingRight: "0px" }}>
          <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="flexStart" alignItems="center" gutterSize="none">
            <EuiFlexItem grow={false}>
              <EuiButtonIcon
                iconType={advancedSettingsOpen ? "arrowDown" : "arrowRight"}
                color="text"
                onClick={() => {
                  this.setState({ advancedSettingsOpen: !this.state.advancedSettingsOpen });
                }}
                aria-label="drop down icon"
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiTitle size="m">
                <h3>Advanced settings</h3>
              </EuiTitle>
            </EuiFlexItem>
          </EuiFlexGroup>

          {advancedSettingsOpen && (
            <>
              <EuiHorizontalRule margin="xs" />
              <SnapshotAdvancedSettings
                includeGlobalState={String(_.get(policy, "snapshot_config.include_global_state", false)) == "true"}
                onIncludeGlobalStateToggle={this.onIncludeGlobalStateToggle}
                ignoreUnavailable={String(_.get(policy, "snapshot_config.ignore_unavailable", false)) == "true"}
                onIgnoreUnavailableToggle={this.onIgnoreUnavailableToggle}
                partial={String(_.get(policy, "snapshot_config.partial", false)) == "true"}
                onPartialToggle={this.onPartialToggle}
              />
            </>
          )}
        </EuiPanel>

        <EuiSpacer />

        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={this.onClickCancel}>Cancel</EuiButtonEmpty>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButton fill onClick={this.onClickSubmit} isLoading={isSubmitting}>
              {isEdit ? "Update" : "Create"}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    );
  }

  populatePolicyToState = (policy: SMPolicy) => {
    const maxAge = policy.deletion?.condition?.max_age;
    if (maxAge) {
      this.setState({
        maxAgeNum: parseInt(maxAge.substring(0, maxAge.length - 1)),
        maxAgeUnit: maxAge[maxAge.length - 1],
      });
    }

    const creationCronExpression = policy.creation.schedule.cron.expression;
    this.populateCronExpressionToState(creationCronExpression, true);

    const deletionCronExpression = policy.deletion?.schedule?.cron.expression;
    if (deletionCronExpression) {
      this.populateCronExpressionToState(deletionCronExpression, false);
    }
  };

  populateCronExpressionToState = (expression: string, creation: boolean) => {
    const { minute, hour, dayOfWeek, dayOfMonth, frequencyType } = parseCronExpression(expression);

    const timeStr = `2022-01-01 ${hour}:${minute}`;
    console.log(`sm dev time str ${timeStr}`);
    const startTime = moment(timeStr);
    if (creation) {
      this.setState({
        creationScheduleStartTime: startTime,
        creationScheduleDayOfWeek: dayOfWeek,
        creationScheduleDayOfMonth: dayOfMonth,
        creationScheduleFrequencyType: frequencyType,
      });
    } else {
      this.setState({
        deletionScheduleStartTime: startTime,
        deletionScheduleDayOfWeek: dayOfWeek,
        deletionScheduleDayOfMonth: dayOfMonth,
        deletionScheduleFrequencyType: frequencyType,
      });
    }
  };

  onChangeMaxCount = (e: ChangeEvent<HTMLInputElement>) => {
    // Received NaN for the `value` attribute. If this is expected, cast the value to a string.
    const maxCount = isNaN(parseInt(e.target.value)) ? undefined : parseInt(e.target.value);
    this.setState({ policy: _.set(this.state.policy, "deletion.condition.max_count", maxCount) });
  };

  onChangeMinCount = (e: ChangeEvent<HTMLInputElement>) => {
    const minCount = isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value);
    let isMinCountValid = "";
    if (minCount < 1) {
      isMinCountValid = "Min count should be bigger than 0.";
    }
    this.setState({ policy: _.set(this.state.policy, "deletion.condition.min_count", minCount), minCountError: isMinCountValid });
  };

  onChangePolicyName = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // let newJSON = this.state.policy;
    // newJSON.name = name;
    this.state.policy.name = name;
    // this.setState((state) => ({ policyId: name, policy:{...state.policy, name} }));
    this.setState((state) => ({ policyId: name }));
  };

  onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const description = e.target.value;
    let newJSON = this.state.policy;
    newJSON.description = description;
    this.setState({ policy: newJSON });
  };

  onChangeCreationExpression = (e: ChangeEvent<HTMLInputElement>) => {
    const expression = e.target.value;
    let newJSON = this.state.policy;
    newJSON.creation.schedule.cron.expression = expression;
    this.setState({ policy: newJSON });
  };

  onChangeDeletionExpression = (e: ChangeEvent<HTMLInputElement>) => {
    const expression = e.target.value;
    let newJSON = this.state.policy;
    _.set(newJSON, "deletion.schedule.cron.expression", expression);
    this.setState({ policy: newJSON });
  };

  onChangeCreationTimezone = (e: ChangeEvent<HTMLSelectElement>) => {
    // const timezone = e.target.value;
    // let newJSON = this.state.policy;
    // _.set(newJSON, "creation.schedule.cron.timezone", timezone);
    // this.setState({ policy: newJSON });
    console.log(`sm dev policy cron timezone: ${_.get(this.state.policy, "creation.schedule.cron.timezone")}`);
    this.setState({ policy: _.set(this.state.policy, "creation.schedule.cron.timezone", e.target.value) });
    console.log(`sm dev policy cron timezone 2: ${_.get(this.state.policy, "creation.schedule.cron.timezone")}`);
  };

  onChangeDeletionTimezone = (e: ChangeEvent<HTMLSelectElement>) => {
    const timezone = e.target.value;
    let newJSON = this.state.policy;
    _.set(newJSON, "deletion.schedule.cron.timezone", timezone);
    this.setState({ policy: newJSON });
  };

  onChangeIndices = (e: ChangeEvent<HTMLInputElement>) => {
    const indices = e.target.value;
    let newJSON = this.state.policy;
    newJSON.snapshot_config.indices = indices;
    this.setState({ policy: newJSON });
  };

  onChangeRepository = (e: ChangeEvent<HTMLInputElement>) => {
    const repository = e.target.value;
    let newJSON = this.state.policy;
    newJSON.snapshot_config.repository = repository;
    this.setState({ policy: newJSON });
  };

  onIncludeGlobalStateToggle = (event: EuiSwitchEvent) => {
    this.setState({ policy: _.set(this.state.policy, "snapshot_config.include_global_state", event.target.checked) });
  };

  onIgnoreUnavailableToggle = (event: EuiSwitchEvent) => {
    const { checked } = event.target;
    console.log(`sm dev ignore unavaliable ${checked}`);
    console.log(`sm dev ignore unavaliable ${event.target}`);
    // let newJSON = this.state.policy;
    // newJSON.snapshot_config.ignore_unavailable = checked;

    this.setState({ policy: _.set(this.state.policy, "snapshot_config.ignore_unavailable", event.target.checked) });
  };

  onPartialToggle = (event: EuiSwitchEvent) => {
    const { checked } = event.target;
    let newJSON = this.state.policy;
    newJSON.snapshot_config.partial = checked;
    this.setState({ policy: newJSON });
  };
}
