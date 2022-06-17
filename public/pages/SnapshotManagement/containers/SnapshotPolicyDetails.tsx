/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from "lodash";
import { RouteComponentProps } from "react-router-dom";
import React, { Component } from "react";
import { CoreServicesContext } from "../../../components/core_services";
import { SnapshotManagementService } from "../../../services";
import queryString from "query-string";
import {
  EuiBasicTable,
  EuiButton,
  EuiConfirmModal,
  EuiFieldText,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiLoadingSpinner,
  EuiOverlayMask,
  EuiSpacer,
  EuiTableFieldDataColumnType,
  EuiText,
  EuiTitle,
} from "@elastic/eui";
import { BREADCRUMBS, ROUTES } from "../../../utils/constants";
import { ContentPanel } from "../../../components/ContentPanel";
import CustomLabel from "../components/CustomLabel";
import { SMMetadata, SMPolicy } from "../../../../models/interfaces";
import { ModalConsumer } from "../../../components/Modal";
import DeleteModal from "../../PolicyDetails/components/DeleteModal";
import { getErrorMessage } from "../../../utils/helpers";
import { LatestActivities } from "../models/interfaces";
import { renderTimestampMillis } from "../utils/constants";
import { parseCronExpression } from "../utils/helpers";

interface SnapshotPolicyDetailsProps extends RouteComponentProps {
  snapshotManagementService: SnapshotManagementService;
}

interface SnapshotPolicyDetailsState {
  policyId: string;
  policy: SMPolicy | null;

  metadata: SMMetadata | null;

  isDeleteModalVisible: boolean;
}

export default class SnapshotPolicyDetails extends Component<SnapshotPolicyDetailsProps, SnapshotPolicyDetailsState> {
  static contextType = CoreServicesContext;
  columns: EuiTableFieldDataColumnType<LatestActivities>[];

  constructor(props: SnapshotPolicyDetailsProps) {
    super(props);

    this.state = {
      policyId: "",
      policy: null,
      metadata: null,
      isDeleteModalVisible: false,
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
        name: "Start time",
        sortable: true,
        dataType: "date",
        render: renderTimestampMillis,
      },
      {
        field: "end_time",
        name: "Completed time",
        sortable: true,
        dataType: "date",
        render: renderTimestampMillis,
      },
      {
        field: "info",
        name: "Info",
        dataType: "auto",
      },
    ];
  }

  async componentDidMount() {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOT_POLICIES]);
    const { id } = queryString.parse(this.props.location.search);
    if (typeof id === "string") {
      this.context.chrome.setBreadcrumbs([BREADCRUMBS.SNAPSHOT_MANAGEMENT, BREADCRUMBS.SNAPSHOT_POLICIES, { text: id }]);
      await this.getPolicy(id);
    } else {
      this.context.notifications.toasts.addDanger(`Invalid policy id: ${id}`);
      this.props.history.push(ROUTES.SNAPSHOT_POLICIES);
    }
  }

  getPolicy = async (policyId: string): Promise<void> => {
    try {
      const { snapshotManagementService } = this.props;
      const response = await snapshotManagementService.getPolicy(policyId);
      console.log(`sm dev get policy ${JSON.stringify(response)}`);

      if (response.ok && !!response.response.policy) {
        this.setState({
          policy: response.response.policy,
          policyId: response.response.id,
          metadata: response.response.metadata,
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
    const { policyId, policy, metadata, isDeleteModalVisible } = this.state;

    if (!policy) {
      return (
        <EuiFlexGroup justifyContent="center" alignItems="center" style={{ marginTop: "100px" }}>
          <EuiLoadingSpinner size="xl" />
        </EuiFlexGroup>
      );
    }

    console.log(`sm dev enabled field ${policy.enabled}`);
    const policySettingItems = [
      { term: "Policy name", value: policyId },
      { term: "Status", value: this.renderEnabledField(policy.enabled) },
      { term: "Last updated time", value: policy.last_updated_time },
      { term: "Indices", value: policy.snapshot_config.indices },
      { term: "Repository", value: policy.snapshot_config.repository },
      { term: "Description", value: policy.description },
    ];

    const createCronExpression = policy.creation.schedule.cron.expression;
    const { minute, hour, dayOfWeek, dayOfMonth, frequencyType } = parseCronExpression(createCronExpression);
    let snapshotScheduleItems;
    if (frequencyType == "custom") {
      snapshotScheduleItems = [
        { term: "Frequency", value: "Custom" },
        { term: "Custom expression", value: createCronExpression },
        { term: "Next snapshot time", value: renderTimestampMillis(metadata?.creation?.trigger.time) },
      ];
    } else {
      snapshotScheduleItems = [
        { term: "Frequency", value: _.capitalize(frequencyType) },
        { term: "Start time", value: `${hour}:${minute} (${policy.creation.schedule.cron.timezone})` },
        { term: "Next snapshot time", value: renderTimestampMillis(metadata?.creation?.trigger.time) },
      ];
    }

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
        if (frequencyType == "custom") {
          deletionScheduleItems = [
            { term: "Frequency", value: "Custom" },
            { term: "Custom expression", value: deleteCronExpression },
            { term: "Next snapshot time", value: renderTimestampMillis(metadata?.deletion?.trigger.time) },
          ];
        } else {
          deletionScheduleItems = [
            { term: "Frequency", value: _.capitalize(frequencyType) },
            { term: "Start time", value: `${hour}:${minute} (${policy.deletion.schedule?.cron.timezone})` },
            { term: "Next snapshot time", value: renderTimestampMillis(metadata?.deletion?.trigger.time) },
          ];
        }
      }
    }

    const notificationItems = [
      { term: "Notify on snapshot activities", value: "Started, deleted, failed" },
      { term: "Channels", value: "IT_group_slack" },
    ];

    let creationLatestActivity: LatestActivities = { activityType: "Creation" };
    creationLatestActivity = { ...creationLatestActivity, ...metadata?.creation?.latest_execution };
    console.log(`sm dev creation latest activity ${JSON.stringify(creationLatestActivity)}`);
    let deletionLatestActivity: LatestActivities = { activityType: "Deletion" };
    deletionLatestActivity = { ...deletionLatestActivity, ...metadata?.deletion?.latest_execution };
    const latestActivities: LatestActivities[] = [creationLatestActivity, deletionLatestActivity];

    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="m">
              <h2>{policyId}</h2>
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

        <ContentPanel title="Policy settings" titleSize="m">
          <EuiFlexGrid columns={3}>
            {policySettingItems.map((item) => (
              <EuiFlexItem key={`${item.term}`}>
                <EuiText size="xs">
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Snapshot schedule" titleSize="m">
          <EuiFlexGrid columns={3}>
            {snapshotScheduleItems.map((item) => (
              <EuiFlexItem key={`${item.term}`}>
                <EuiText size="xs">
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Snapshot retention period" titleSize="m">
          <EuiFlexGrid columns={3}>
            {retentionItems.map((item) => (
              <EuiFlexItem key={`${item.term}`}>
                <EuiText size="xs">
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
                  <EuiText size="xs">
                    <dt>{item.term}</dt>
                    <dd>{item.value}</dd>
                  </EuiText>
                </EuiFlexItem>
              ))}
            </EuiFlexGrid>
          )}
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Notifications" titleSize="m">
          <EuiFlexGrid columns={2}>
            {notificationItems.map((item) => (
              <EuiFlexItem key={`${item.term}`}>
                <EuiText size="xs">
                  <dt>{item.term}</dt>
                  <dd>{item.value}</dd>
                </EuiText>
              </EuiFlexItem>
            ))}
          </EuiFlexGrid>
        </ContentPanel>

        <EuiSpacer />

        <ContentPanel title="Latest activities" titleSize="m">
          <EuiBasicTable items={latestActivities} itemId="name" columns={this.columns} />
        </ContentPanel>

        {isDeleteModalVisible && (
          <DeleteModal policyId={policyId} closeDeleteModal={this.closeDeleteModal} onClickDelete={this.onClickDelete} />
        )}
      </div>
    );
  }
}
