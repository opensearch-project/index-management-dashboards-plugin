/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from "lodash";
import { RouteComponentProps } from "react-router-dom";
import React, { Component, useContext } from "react";
import queryString from "query-string";
import {
  EuiAccordion,
  EuiBasicTable,
  EuiButton,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiTableFieldDataColumnType,
  EuiText,
  EuiTitle,
  EuiHealth,
} from "@elastic/eui";
import { NotificationService, SnapshotManagementService } from "../../../../services";
import { SMMetadata, SMPolicy } from "../../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import { ContentPanel } from "../../../../components/ContentPanel";
import DeleteModal from "../../../PolicyDetails/components/DeleteModal";
import { LatestActivities } from "../../../../models/interfaces";
import { renderTimestampMillis } from "../../../SnapshotPolicies/helpers";
import { humanCronExpression, parseCronExpression } from "../../../CreateSnapshotPolicy/components/CronSchedule/helper";
import { ModalConsumer } from "../../../../components/Modal";
import InfoModal from "../../components/InfoModal";
import { getAllowPartial, getIgnoreUnavailabel, getIncludeGlobalState } from "../../../CreateSnapshotPolicy/containers/helper";
import { truncateSpan } from "../../../Snapshots/helper";
import { NotificationConfig } from "../../../../../server/models/interfaces";
import { DataSourceMenuContext, DataSourceMenuProperties } from "../../../../services/DataSourceMenuContext";
import MDSEnabledComponent from "../../../../components/MDSEnabledComponent";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";
import { TopNavControlButtonData, TopNavControlTextData, TopNavControlIconData } from "../../../../../../../src/plugins/navigation/public";

interface SnapshotPolicyDetailsProps extends RouteComponentProps, DataSourceMenuProperties {
  snapshotManagementService: SnapshotManagementService;
  notificationService: NotificationService;
}

interface SnapshotPolicyDetailsState extends DataSourceMenuProperties {
  policyId: string;
  policy: SMPolicy | null;

  metadata: SMMetadata | null;

  isDeleteModalVisible: boolean;

  channel: NotificationConfig | null;
  useNewUX: boolean;
}

export class SnapshotPolicyDetails extends MDSEnabledComponent<SnapshotPolicyDetailsProps, SnapshotPolicyDetailsState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<LatestActivities>[];

  constructor(props: SnapshotPolicyDetailsProps) {
    super(props);

    const uiSettings = getUISettings();
    const useNewUx = uiSettings.get("home:useNewHomePage");

    this.state = {
      ...this.state,
      policyId: "",
      policy: null,
      metadata: null,
      isDeleteModalVisible: false,
      channel: null,
      useNewUX: useNewUx,
    };

    this.columns = [
      {
        field: "activityType",
        name: "Activity type",
        dataType: "string",
      },
      {
        field: "status",
        name: "Status",
        dataType: "string",
      },
      {
        field: "start_time",
        name: "Time started",
        sortable: true,
        dataType: "date",
        render: renderTimestampMillis,
      },
      {
        field: "end_time",
        name: "Time completed",
        sortable: true,
        dataType: "date",
        render: renderTimestampMillis,
      },
      {
        field: "info",
        name: "Info",
        dataType: "auto",
        render: (info: object) => {
          const message = _.get(info, "message", null);
          const cause = _.get(info, "cause", null);
          let showSymbol = "-";
          if (!!message) showSymbol = "message";
          if (!!cause) showSymbol = "cause";
          return (
            <ModalConsumer>{({ onShow }) => <EuiLink onClick={() => onShow(InfoModal, { info })}>{showSymbol}</EuiLink>}</ModalConsumer>
          );
        },
      },
    ];
  }

  async componentDidMount() {
    let breadCrumbs = this.state.useNewUX
      ? [BREADCRUMBS.SNAPSHOT_POLICIES]
      : [BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOT_POLICIES];
    this.context.chrome.setBreadcrumbs(breadCrumbs);
    const { id } = queryString.parse(this.props.location.search);
    if (typeof id === "string") {
      const breadCrumbs = this.state.useNewUX
        ? [BREADCRUMBS.SNAPSHOT_POLICIES, { text: id }]
        : [BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOT_POLICIES, { text: id }];
      this.context.chrome.setBreadcrumbs(breadCrumbs);
      await this.getPolicy(id);

      const channelId = _.get(this.state.policy, "notification.channel.id");
      if (channelId) {
        this.getChannel(channelId);
      }
    } else {
      this.context.notifications.toasts.addDanger(`Invalid policy id: ${id}`);
      this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
    }
  }

  getPolicy = async (policyId: string): Promise<void> => {
    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.getPolicy(policyId);

      if (response.ok && !response.response) {
        let errorMessage = "policy doesn't exist";
        this.context.notifications.toasts.addDanger(`Could not load the policy: ${errorMessage}`);
        this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
        return;
      }
      if (response.ok && !!response.response.policy) {
        this.setState({
          policy: response.response.policy,
          policyId: response.response.id,
          metadata: response.response.metadata,
        });
      } else {
        let errorMessage = response.ok ? "Policy was empty" : response.error;
        this.context.notifications.toasts.addDanger(`Could not load the policy: ${errorMessage}`);
        this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(`Could not load the policy`);
      this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
    }
  };

  getChannel = async (channelId: string): Promise<void> => {
    try {
      const { notificationService } = this.props;
      const response = await notificationService.getChannel(channelId);

      if (response.ok) {
        const configList = response.response.config_list;
        let channel = null;
        if (configList.length == 1) channel = configList[0];
        this.setState({ channel });
      } else {
        this.context.notifications.toasts.addDanger(`Could not load notification channel: ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not load the notification channel"));
    }
  };

  onClickStop = async () => {
    const { snapshotManagementService } = this.props;
    const policyId = this.state.policyId;
    try {
      const response = await snapshotManagementService.stopPolicy(policyId);
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(`"${policyId}" successfully stopped!`);
      } else {
        this.context.notifications.toasts.addDanger(`Could not stop policy "${policyId}" :  ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not stop the policy"));
    }
    this.componentDidMount();
  };

  onClickStart = async () => {
    const { snapshotManagementService } = this.props;
    const policyId = this.state.policyId;
    try {
      const response = await snapshotManagementService.startPolicy(policyId);
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(`"${policyId}" successfully started!`);
      } else {
        this.context.notifications.toasts.addDanger(`Could not start policy "${policyId}" :  ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not start the policy"));
    }
    this.componentDidMount();
  };

  onClickPolicyStatusChange = async () => {
    return this.state.policy?.enabled ? this.onClickStop() : this.onClickStart();
  };

  onEdit = () => {
    const { policyId } = this.state;
    if (policyId) {
      this.props.history.push(`${ROUTES.EDIT_SNAPSHOT_POLICY}?id=${policyId}`);
    }
  };

  closeDeleteModal = () => {
    this.setState({ isDeleteModalVisible: false });
  };

  showDeleteModal = (): void => {
    this.setState({ isDeleteModalVisible: true });
  };

  onClickDelete = async (): Promise<void> => {
    const { snapshotManagementService } = this.props;
    const { policyId } = this.state;

    try {
      const response = await snapshotManagementService.deletePolicy(policyId);

      if (response.ok) {
        this.closeDeleteModal();
        this.context.notifications.toasts.addSuccess(`"Policy ${policyId}" successfully deleted`);
        this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
      } else {
        this.context.notifications.toasts.addDanger(`Could not delete the policy "${policyId}" : ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not delete the policy"));
    }
  };

  renderEnabledField = (enabled: boolean) => {
    if (enabled) {
      return "Enabled";
    }
    return "Disabled";
  };

  render() {
    const { policyId, policy, metadata, isDeleteModalVisible, channel } = this.state;

    if (!policy) {
      return (
        <EuiFlexGroup justifyContent="center" alignItems="center" style={{ marginTop: "100px" }}>
          <EuiLoadingSpinner size="xl" />
        </EuiFlexGroup>
      );
    }

    const policySettingItems = [
      { term: "Policy name", value: truncateSpan(policyId, 30) },
      { term: "Status", value: this.renderEnabledField(policy.enabled) },
      { term: "Last updated time", value: policy.last_updated_time },
      { term: "Indices", value: policy.snapshot_config.indices },
      { term: "Repository", value: policy.snapshot_config.repository },
      { term: "Description", value: truncateSpan(policy.description, 30) },
    ];

    const advancedSettingItems = [
      { term: "Include cluster state", value: `${getIncludeGlobalState(policy)}` },
      { term: "Ignore unavailable indices", value: `${getIgnoreUnavailabel(policy)}` },
      { term: "Allow partial snapshots", value: `${getAllowPartial(policy)}` },
      // { term: "Timestamp format", value: `${_.get(policy, "snapshot_config.date_format")}` },
      // { term: "Time zone of timestamp", value: `${_.get(policy, "snapshot_config.date_format_timezone")}` },
    ];

    const createCronExpression = policy.creation.schedule.cron.expression;
    const { minute, hour, dayOfWeek, dayOfMonth, frequencyType } = parseCronExpression(createCronExpression);
    const humanCron = humanCronExpression(
      { minute, hour, dayOfWeek, dayOfMonth, frequencyType },
      createCronExpression,
      policy.creation.schedule.cron.timezone
    );
    const snapshotScheduleItems = [
      { term: "Frequency", value: _.capitalize(frequencyType) },
      { term: "Cron schedule", value: humanCron },
      { term: "Next snapshot time", value: renderTimestampMillis(metadata?.creation?.trigger.time) },
    ];

    let retentionItems = [{ term: "Retention period", value: "Keep all snapshots" }];
    let deletionScheduleItems;
    if (policy.deletion != null) {
      retentionItems = [
        { term: "Maximum age of snapshots", value: policy.deletion?.condition?.max_age ?? "-" },
        { term: "Minimum of snapshots retained", value: `${policy.deletion?.condition?.min_count}` ?? "-" },
        { term: "Maximum of snapshots retained", value: `${policy.deletion?.condition?.max_count}` ?? "-" },
      ];
      const deleteCronExpression = policy.deletion?.schedule?.cron.expression;
      if (deleteCronExpression != null) {
        const { minute, hour, dayOfWeek, dayOfMonth, frequencyType } = parseCronExpression(deleteCronExpression);
        const humanCron = humanCronExpression(
          { minute, hour, dayOfWeek, dayOfMonth, frequencyType },
          deleteCronExpression,
          policy.deletion.schedule?.cron.timezone ?? "-"
        );

        deletionScheduleItems = [
          { term: "Frequency", value: _.capitalize(frequencyType) },
          { term: "Cron schedule", value: humanCron },
          { term: "Next retention time", value: renderTimestampMillis(metadata?.deletion?.trigger.time) },
        ];
      }
    }

    interface NotiConditions {
      [condition: string]: boolean;
    }
    const notiConditions: NotiConditions = _.get(policy, "notification.conditions");
    let notiActivities = "None";
    if (notiConditions) {
      notiActivities = Object.keys(notiConditions)
        .filter((key) => notiConditions[key])
        .join(", ");
    }

    let channelDetail = <p>None</p>;
    if (!!channel?.config.name) {
      channelDetail = (
        <EuiLink href={`notifications-dashboards#/channel-details/${channel.config_id}`} target="_blank">
          {channel?.config.name} ({channel?.config.config_type})
        </EuiLink>
      );
    }

    const notificationItems = [
      { term: "Notify on snapshot activities", value: notiActivities },
      { term: "Channel", value: channelDetail },
    ];

    let creationLatestActivity: LatestActivities = { activityType: "Creation" };
    creationLatestActivity = { ...creationLatestActivity, ...metadata?.creation?.latest_execution };
    let latestActivities: LatestActivities[] = [creationLatestActivity];
    if (metadata?.deletion?.latest_execution != null) {
      let deletionLatestActivity: LatestActivities = { activityType: "Deletion" };
      deletionLatestActivity = { ...deletionLatestActivity, ...metadata?.deletion?.latest_execution };
      latestActivities = [...latestActivities, deletionLatestActivity];
    }

    const { HeaderControl } = getNavigationUI();
    const { setAppRightControls, setAppBadgeControls } = getApplication();

    const badgeControlData = [
      {
        renderComponent: (
          <>
            <EuiHealth color={policy.enabled ? "success" : "danger"} />
            <EuiText size="s">{_.truncate(this.renderEnabledField(policy.enabled))}</EuiText>
          </>
        ),
      },
    ];

    const padding_style = this.state.useNewUX ? { padding: "0px 0px" } : { padding: "5px 50px" };
    return (
      <div style={padding_style}>
        {this.state.useNewUX ? (
          <>
            <HeaderControl
              setMountPoint={setAppRightControls}
              controls={[
                {
                  iconType: "trash",
                  testId: "deleteButton",
                  color: "danger",
                  ariaLabel: "delete",
                  run: this.showDeleteModal,
                  controlType: "icon",
                  display: "base",
                } as TopNavControlIconData,
                {
                  id: "Status",
                  label: policy.enabled ? "Disable" : "Enable",
                  testId: "editButton",
                  run: this.onClickPolicyStatusChange,
                  controlType: "button",
                } as TopNavControlButtonData,
                {
                  id: "Edit",
                  label: "Edit policy",
                  testId: "editButton",
                  run: this.onEdit,
                  fill: true,
                  controlType: "button",
                } as TopNavControlButtonData,
              ]}
            />

            <HeaderControl setMountPoint={setAppBadgeControls} controls={badgeControlData} />
          </>
        ) : (
          <>
            <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiTitle size="m">
                  <span title={policyId}>{_.truncate(policyId)}</span>
                </EuiTitle>
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center" gutterSize="s">
                  <EuiFlexItem grow={false}>
                    <EuiButton onClick={this.onEdit}>Edit</EuiButton>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton onClick={this.showDeleteModal} color="danger" data-test-subj="deleteButton">
                      Delete
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer />
          </>
        )}

        <ContentPanel title="Policy settings" titleSize="s">
          <EuiFlexGrid columns={3}>
            {policySettingItems.map((item) => (
              <EuiFlexItem key={`${item.term}`}>
                <EuiText size="s">
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>

          <EuiSpacer size="s" />

          <EuiAccordion id="advanced_settings_items" buttonContent="Advanced settings">
            <EuiSpacer size="s" />
            <EuiFlexGrid columns={3}>
              {advancedSettingItems.map((item) => (
                <EuiFlexItem key={`${item.term}`}>
                  <EuiText size="s">
                    <dt>{item.term}</dt>
                    <dd>{item.value}</dd>
                  </EuiText>
                </EuiFlexItem>
              ))}
            </EuiFlexGrid>
          </EuiAccordion>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Snapshot schedule" titleSize="s">
          <EuiFlexGrid columns={3}>
            {snapshotScheduleItems.map((item) => (
              <EuiFlexItem key={`${item.term}`}>
                <EuiText size="s">
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Snapshot retention period" titleSize="s">
          <EuiFlexGrid columns={3}>
            {retentionItems.map((item) => (
              <EuiFlexItem key={`${item.term}`}>
                <EuiText size="s">
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>

          {deletionScheduleItems != undefined && (
            <EuiFlexGrid columns={3}>
              {deletionScheduleItems.map((item) => (
                <EuiFlexItem key={`${item.term}`}>
                  <EuiText size="s">
                    <dt>{item.term}</dt>
                    <dd>{item.value}</dd>
                  </EuiText>
                </EuiFlexItem>
              ))}
            </EuiFlexGrid>
          )}
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Notifications" titleSize="s">
          <EuiFlexGrid columns={2}>
            {notificationItems.map((item) => (
              <EuiFlexItem key={`${item.term}`}>
                <EuiText size="s">
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel
          title="Last creation/deletion"
          titleSize="s"
          actions={
            <EuiButton iconType="refresh" onClick={() => this.getPolicy(policyId)} data-test-subj="refreshButton">
              Refresh
            </EuiButton>
          }
        >
          <EuiBasicTable items={latestActivities} itemId="name" columns={this.columns} />
        </ContentPanel>

        {isDeleteModalVisible && (
          <DeleteModal policyId={policyId} closeDeleteModal={this.closeDeleteModal} onClickDelete={this.onClickDelete} />
        )}
      </div>
    );
  }
}

export default function (props: Omit<SnapshotPolicyDetailsProps, keyof DataSourceMenuProperties>) {
  const dataSourceMenuProps = useContext(DataSourceMenuContext);
  useUpdateUrlWithDataSourceProperties();
  return <SnapshotPolicyDetails {...props} {...dataSourceMenuProps} />;
}
