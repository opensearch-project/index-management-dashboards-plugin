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
  EuiLink,
  EuiComboBox,
} from "@elastic/eui";
import moment from "moment-timezone";
import React, { ChangeEvent, Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import { CoreServicesContext } from "../../../../components/core_services";
import { CatRepository, CreateRepositoryBody, CreateRepositorySettings, FeatureChannelList } from "../../../../../server/models/interfaces";
import { IndexItem, SMPolicy } from "../../../../../models/interfaces";
import { BREADCRUMBS, ROUTES, SNAPSHOT_MANAGEMENT_DOCUMENTATION_URL } from "../../../../utils/constants";
import { ContentPanel } from "../../../../components/ContentPanel";
import { IndexService, NotificationService, SnapshotManagementService } from "../../../../services";
import { getErrorMessage, wildcardOption } from "../../../../utils/helpers";
import CustomLabel from "../../../../components/CustomLabel";
import { DEFAULT_INDEX_OPTIONS, ERROR_PROMPT, getDefaultSMPolicy, maxAgeUnitOptions as MAX_AGE_UNIT_OPTIONS } from "../../constants";
import {
  getIncludeGlobalState,
  getIgnoreUnavailabel,
  getAllowPartial,
  getNotifyCreation,
  getNotifyDeletion,
  getNotifyFailure,
} from "../helper";
import { parseCronExpression } from "../../components/CronSchedule/helper";
import { TIMEZONES } from "../../components/CronSchedule/constants";
import SnapshotIndicesRepoInput from "../../components/SnapshotIndicesRepoInput";
import CronSchedule from "../../components/CronSchedule";
import SnapshotAdvancedSettings from "../../components/SnapshotAdvancedSettings";
import Notification from "../../components/Notification";

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

  creationScheduleFrequencyType: string;
  deletionScheduleFrequencyType: string;

  deleteConditionEnabled: boolean;
  deletionScheduleEnabled: boolean; // whether to use the same schedule as creation

  advancedSettingsOpen: boolean;

  showCreateRepoFlyout: boolean;

  policyIdError: string;
  minCountError: string;
  repoError: string;
  timezoneError: string;
}

export default class CreateSnapshotPolicy extends Component<CreateSMPolicyProps, CreateSMPolicyState> {
  static contextType = CoreServicesContext;

  constructor(props: CreateSMPolicyProps) {
    super(props);

    this.state = {
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

      creationScheduleFrequencyType: "daily",
      deletionScheduleFrequencyType: "daily",

      deleteConditionEnabled: false,
      deletionScheduleEnabled: false,

      advancedSettingsOpen: false,
      showCreateRepoFlyout: false,

      policyIdError: "",
      repoError: "",
      minCountError: "",
      timezoneError: "",
    };
  }

  async componentDidMount() {
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
    await this.getChannels();
  }

  getPolicy = async (policyId: string): Promise<void> => {
    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.getPolicy(policyId);

      if (response.ok) {
        // Populate policy into state
        const policy = response.response.policy;
        const indices = _.get(policy, "snapshot_config.indices", "");
        const selectedIndexOptions = indices
          .split(",")
          .filter((index: string) => !!index)
          .map((label: string) => ({ label }));
        const selectedRepoValue = _.get(policy, "snapshot_config.repository", "");

        const { frequencyType: creationScheduleFrequencyType } = parseCronExpression(_.get(policy, "creation.schedule.cron.expression"));
        const { frequencyType: deletionScheduleFrequencyType } = parseCronExpression(_.get(policy, "deletion.schedule.cron.expression"));

        let deleteConditionEnabled = false;
        let deletionScheduleEnabled = false;
        if (!!_.get(policy, "deletion")) {
          deleteConditionEnabled = true;
          const creationScheduleExpression = _.get(policy, "creation.schedule.cron.expression");
          const deletionScheduleExpression = _.get(policy, "deletion.schedule.cron.expression");
          if (creationScheduleExpression !== deletionScheduleExpression) deletionScheduleEnabled = true;
        }

        const maxAge = policy.deletion?.condition?.max_age;
        let maxAgeNum = 1;
        let maxAgeUnit = "d";
        if (maxAge) {
          maxAgeNum = parseInt(maxAge.substring(0, maxAge.length - 1));
          maxAgeUnit = maxAge[maxAge.length - 1];
        }

        this.setState({
          policy,
          policyId: response.response.id,
          policySeqNo: response.response.seqNo,
          policyPrimaryTerm: response.response.primaryTerm,
          selectedIndexOptions,
          selectedRepoValue,
          creationScheduleFrequencyType,
          deletionScheduleFrequencyType,
          deleteConditionEnabled,
          deletionScheduleEnabled,
          maxAgeNum,
          maxAgeUnit,
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
        const indices = optionsResponse.response.indices.map((label) => ({ label }));
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
        if (!this.props.isEdit) {
          const selectedRepoValue = response.response.length > 0 ? response.response[0].id : "";
          this.setState({
            repositories: response.response,
            selectedRepoValue,
            policy: this.setPolicyHelper("snapshot_config.repository", selectedRepoValue),
          });
        } else {
          this.setState({
            repositories: response.response,
          });
        }
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
        this.setState({ policyIdError: ERROR_PROMPT.NAME });
      } else if (!_.get(policy, "snapshot_config.repository")) {
        this.setState({ repoError: ERROR_PROMPT.REPO });
      } else if (!_.get(policy, "creation.schedule.cron.timezone")) {
        this.setState({ timezoneError: ERROR_PROMPT.TIMEZONE });
      } else {
        const policyFromState = this.buildPolicyFromState(policy);
        // console.log(`sm dev policy from state ${JSON.stringify(policyFromState)}`);
        if (isEdit) await this.updatePolicy(policyId, policyFromState);
        else await this.createPolicy(policyId, policyFromState);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger("Invalid Policy");
      console.error(err);
      this.setState({ isSubmitting: false });
    }
  };

  buildPolicyFromState = (policy: SMPolicy): SMPolicy => {
    const { deletionScheduleEnabled, maxAgeNum, maxAgeUnit, deleteConditionEnabled } = this.state;

    if (deleteConditionEnabled) {
      _.set(policy, "deletion.condition.max_age", maxAgeNum + maxAgeUnit);
    } else {
      delete policy.deletion;
    }

    if (deletionScheduleEnabled) {
      _.set(policy, "deletion.schedule.cron.timezone", _.get(policy, "creation.schedule.cron.timezone"));
    } else {
      delete policy.deletion?.schedule;
    }

    return policy;
  };

  onIndicesSelectionChange = (selectedOptions: EuiComboBoxOptionOption<IndexItem>[]) => {
    const selectedIndexOptions = selectedOptions.map((o) => o.label);
    this.setState({
      policy: this.setPolicyHelper("snapshot_config.indices", selectedIndexOptions.toString()),
      selectedIndexOptions: selectedOptions,
    });
  };

  onRepoSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRepo = e.target.value;
    let repoError = "";
    if (!selectedRepo) {
      repoError = ERROR_PROMPT.REPO;
    }
    this.setState({ policy: this.setPolicyHelper("snapshot_config.repository", selectedRepo), selectedRepoValue: selectedRepo, repoError });
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
    this.setState({
      selectedIndexOptions: selectedIndexOptions,
      policy: this.setPolicyHelper("snapshot_config.indices", selectedIndexOptions.toString()),
    });
  };

  getChannels = async (): Promise<void> => {
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
    this.setState({ policy: this.setPolicyHelper("notification.channel.id", channelId) });
  };

  render() {
    // console.log(`sm dev render state policy ${JSON.stringify(this.state.policy)}`);

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
      creationScheduleFrequencyType,
      deletionScheduleFrequencyType,
      deleteConditionEnabled,
      deletionScheduleEnabled,
      advancedSettingsOpen,
      showCreateRepoFlyout,
      policyIdError,
      repoError,
      minCountError,
      timezoneError,
    } = this.state;

    const repoOptions = repositories.map((r) => ({ value: r.id, text: r.id }));

    const rententionEnableRadios = [
      {
        id: "retention_disabled",
        label: "Retain all snapshots",
      },
      {
        id: "retention_enabled",
        label: "Specify retention conditions",
      },
    ];

    const subTitleText = (
      <EuiText color="subdued" size="s" style={{ padding: "5px 0px" }}>
        <p style={{ fontWeight: 200 }}>
          Snapshot policies allow you to define an automated snapshot schedule and retention period.{" "}
          <EuiLink href={SNAPSHOT_MANAGEMENT_DOCUMENTATION_URL} target="_blank">
            Learn more
          </EuiLink>
        </p>
      </EuiText>
    );

    const notifyOnCreation = getNotifyCreation(policy);
    const notifyOnDeletion = getNotifyDeletion(policy);
    const notifyOnFailure = getNotifyFailure(policy);

    let showNotificationChannel = false;
    if (notifyOnCreation || notifyOnDeletion || notifyOnFailure) {
      showNotificationChannel = true;
    }

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiTitle size="l">
          <h1>{isEdit ? "Edit" : "Create"} policy</h1>
        </EuiTitle>
        {subTitleText}

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
              placeholder="Snapshot management daily policy."
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
            showTimezone={true}
            timezone={_.get(policy, "creation.schedule.cron.timezone")}
            onChangeTimezone={(timezone: string) => {
              this.setState({ policy: this.setPolicyHelper("creation.schedule.cron.timezone", timezone) });
            }}
            timezoneError={timezoneError}
            cronExpression={_.get(policy, "creation.schedule.cron.expression", "")}
            onCronExpressionChange={(expression: string) => {
              this.setState({ policy: this.setPolicyHelper("creation.schedule.cron.expression", expression) });
            }}
          />
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Retention period" titleSize="m">
          <EuiRadioGroup
            options={rententionEnableRadios}
            idSelected={deleteConditionEnabled ? "retention_enabled" : "retention_disabled"}
            onChange={(id) => {
              this.setState({ deleteConditionEnabled: id === "retention_enabled" });
            }}
          />

          {deleteConditionEnabled ? (
            <>
              <EuiSpacer size="m" />
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
                    options={MAX_AGE_UNIT_OPTIONS}
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
                    <CustomLabel title="Minumum" />
                    <EuiFormRow isInvalid={!!minCountError} error={minCountError}>
                      <EuiFieldNumber min={1} value={_.get(policy, "deletion.condition.min_count", "")} onChange={this.onChangeMinCount} />
                    </EuiFormRow>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <CustomLabel title="Maximum" isOptional={true} />
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
                <EuiSpacer size="s" />

                <EuiCheckbox
                  id="delete_schedule_checkbox"
                  label="Use same schedule as snapshots"
                  checked={!deletionScheduleEnabled}
                  onChange={(e) => {
                    this.setState({ deletionScheduleEnabled: !deletionScheduleEnabled });
                  }}
                />
                <EuiSpacer size="s" />

                {deletionScheduleEnabled ? (
                  <CronSchedule
                    frequencyType={deletionScheduleFrequencyType}
                    onChangeFrequencyType={(e) => {
                      this.setState({ deletionScheduleFrequencyType: e.target.value });
                    }}
                    timezone={undefined}
                    cronExpression={_.get(policy, "deletion.schedule.cron.expression", "")}
                    onCronExpressionChange={(expression: string) => {
                      this.setState({ policy: this.setPolicyHelper("deletion.schedule.cron.expression", expression) });
                    }}
                  />
                ) : null}
              </EuiAccordion>
            </>
          ) : null}
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Notifications" titleSize="m">
          <div style={{ padding: "10px 10px" }}>
            <EuiText>Notify on snapshot activities</EuiText>

            <EuiSpacer size="s" />
            <EuiCheckbox
              id="notification-creation"
              label="When a snapshot has been created."
              checked={notifyOnCreation}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                this.setState({ policy: this.setPolicyHelper("notification.conditions.creation", e.target.checked) });
              }}
            />

            <EuiSpacer size="s" />

            <EuiCheckbox
              id="notification-deletion"
              label="when a snapshots has been deleted."
              checked={notifyOnDeletion}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                this.setState({ policy: this.setPolicyHelper("notification.conditions.deletion", e.target.checked) });
              }}
            />

            <EuiSpacer size="s" />

            <EuiCheckbox
              id="notification-failure"
              label="When a snapshot has failed."
              checked={notifyOnFailure}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                this.setState({ policy: this.setPolicyHelper("notification.conditions.failure", e.target.checked) });
              }}
            />
          </div>
          {showNotificationChannel ? (
            <Notification
              channelId={_.get(policy, "notification.channel.id") || ""}
              channels={channels}
              loadingChannels={loadingChannels}
              onChangeChannelId={this.onChangeChannelId}
              getChannels={this.getChannels}
            />
          ) : null}
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
                <h3>
                  Advanced settings <i>- optional</i>
                </h3>
              </EuiTitle>
            </EuiFlexItem>
          </EuiFlexGroup>

          {advancedSettingsOpen && (
            <>
              <EuiHorizontalRule margin="xs" />
              <SnapshotAdvancedSettings
                includeGlobalState={getIncludeGlobalState(policy)}
                onIncludeGlobalStateToggle={this.onIncludeGlobalStateToggle}
                ignoreUnavailable={getIgnoreUnavailabel(policy)}
                onIgnoreUnavailableToggle={this.onIgnoreUnavailableToggle}
                partial={getAllowPartial(policy)}
                onPartialToggle={this.onPartialToggle}
                width="200%"
              />

              <div style={{ padding: "0px 10px" }}>
                <EuiText size="s">
                  <h4>Snapshot naming settings</h4>
                </EuiText>
                <span style={{ fontWeight: 200, fontSize: "12px" }}>Customize the naming format of snapshots.</span>

                <EuiSpacer size="s" />

                <CustomLabel title="Timestamp format" />
                <EuiFieldText
                  placeholder="e.g., yyyy-MM-dd-HH:mm"
                  value={_.get(policy, "snapshot_config.date_format")}
                  onChange={(e) => {
                    this.setState({ policy: this.setPolicyHelper("snapshot_config.date_format", e.target.value) });
                  }}
                />

                <EuiSpacer size="s" />

                <CustomLabel title="Time zone of timestamp" />
                <EuiComboBox
                  placeholder="Select a time zone"
                  singleSelection={{ asPlainText: true }}
                  options={TIMEZONES}
                  renderOption={({ label: tz }) => `${tz} (${moment.tz(tz).format("Z")})`}
                  selectedOptions={[{ label: _.get(policy, "snapshot_config.date_format_timezone") ?? "" }]}
                  onChange={(options) => {
                    const timezone = _.first(options)?.label;
                    this.setState({ policy: this.setPolicyHelper("snapshot_config.date_format_timezone", timezone) });
                  }}
                />
              </div>
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

  onChangeMaxCount = (e: ChangeEvent<HTMLInputElement>) => {
    // Received NaN for the `value` attribute. If this is expected, cast the value to a string.
    const maxCount = isNaN(parseInt(e.target.value)) ? undefined : parseInt(e.target.value);
    this.setState({ policy: this.setPolicyHelper("deletion.condition.max_count", maxCount) });
  };

  onChangeMinCount = (e: ChangeEvent<HTMLInputElement>) => {
    const minCount = isNaN(parseInt(e.target.value)) ? undefined : parseInt(e.target.value);
    let isMinCountValid = "";
    if (!minCount || minCount < 1) {
      isMinCountValid = "Min count should be bigger than 0.";
    }
    this.setState({ policy: this.setPolicyHelper("deletion.condition.min_count", minCount), minCountError: isMinCountValid });
  };

  onChangePolicyName = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ policyId: e.target.value });
  };

  onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    this.setState({ policy: this.setPolicyHelper("description", e.target.value) });
  };

  onChangeCreationExpression = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ policy: this.setPolicyHelper("creation.schedule.cron.expression", e.target.value) });
  };

  onChangeDeletionExpression = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ policy: this.setPolicyHelper("deletion.schedule.cron.expression", e.target.value) });
  };

  onChangeCreationTimezone = (e: ChangeEvent<HTMLSelectElement>) => {
    this.setState({ policy: this.setPolicyHelper("creation.schedule.cron.timezone", e.target.value) });
  };

  onChangeDeletionTimezone = (e: ChangeEvent<HTMLSelectElement>) => {
    this.setState({ policy: this.setPolicyHelper("deletion.schedule.cron.timezone", e.target.value) });
  };

  onChangeIndices = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ policy: this.setPolicyHelper("snapshot_config.indices", e.target.value) });
  };

  onChangeRepository = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ policy: this.setPolicyHelper("snapshot_config.repository", e.target.value) });
  };

  onIncludeGlobalStateToggle = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ policy: this.setPolicyHelper("snapshot_config.include_global_state", e.target.checked) });
  };

  onIgnoreUnavailableToggle = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ policy: this.setPolicyHelper("snapshot_config.ignore_unavailable", e.target.checked) });
  };

  onPartialToggle = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ policy: this.setPolicyHelper("snapshot_config.partial", e.target.checked) });
  };

  setPolicyHelper = (path: string, newValue: any) => {
    return _.set(this.state.policy, path, newValue);
  };
}
