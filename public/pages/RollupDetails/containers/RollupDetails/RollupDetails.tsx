/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from "react";
import {
  EuiSpacer,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSmallButton,
  EuiOverlayMask,
  EuiSmallButtonEmpty,
  EuiModalFooter,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiCodeBlock,
  EuiHealth,
  EuiText,
} from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import queryString from "query-string";
import { RollupService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import GeneralInformation from "../../components/GeneralInformation/GeneralInformation";
import RollupStatus from "../../components/RollupStatus/RollupStatus";
import AggregationAndMetricsSettings from "../../components/AggregationAndMetricsSettings/AggregationAndMetricsSettings";
import { parseTimeunit, buildIntervalScheduleText, buildCronScheduleText } from "../../../CreateRollup/utils/helpers";
import { DimensionItem, MetricItem, RollupDimensionItem, RollupMetadata, RollupMetricItem } from "../../../../../models/interfaces";
import { renderTime } from "../../../Rollups/utils/helpers";
import DeleteModal from "../../../Rollups/components/DeleteModal";
import { CoreServicesContext } from "../../../../components/core_services";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";
import { TopNavControlButtonData, TopNavControlTextData, TopNavControlIconData } from "../../../../../../../src/plugins/navigation/public";
import _ from "lodash";

interface RollupDetailsProps extends RouteComponentProps {
  rollupService: RollupService;
}

interface RollupDetailsState {
  rollupId: string;
  description: string;
  sourceIndex: string;
  targetIndex: string;
  rollupJSON: any;
  continuousJob: string;
  continuousDefinition: string;

  interval: number;
  intervalTimeunit: string;
  cronExpression: string;
  pageSize: number;
  delayTime: number | undefined;
  delayTimeunit: string;
  lastUpdated: string;
  metadata: RollupMetadata | undefined;

  timestamp: string;
  histogramInterval: string;
  timezone: string;
  selectedDimensionField: DimensionItem[];
  selectedMetrics: MetricItem[];
  metricsShown: MetricItem[];
  dimensionsShown: DimensionItem[];

  isModalOpen: boolean;
  enabled: boolean;
  isDeleteModalVisible: boolean;
  useNewUX: boolean;
}

export class RollupDetails extends Component<RollupDetailsProps, RollupDetailsState> {
  static contextType = CoreServicesContext;
  constructor(props: RollupDetailsProps) {
    super(props);

    const uiSettings = getUISettings();
    const useNewUx = uiSettings.get("home:useNewHomePage");

    this.state = {
      rollupId: "",
      description: "",
      sourceIndex: "",
      targetIndex: "",

      continuousJob: "no",
      continuousDefinition: "fixed",
      interval: 2,
      intervalTimeunit: "MINUTES",
      cronExpression: "",
      pageSize: 1000,
      delayTime: undefined,
      delayTimeunit: "MINUTES",
      rollupJSON: "",
      lastUpdated: "-",
      metadata: undefined,

      timestamp: "",
      histogramInterval: "",
      timezone: "UTC +0",
      selectedDimensionField: [],
      selectedMetrics: [],
      dimensionsShown: [],
      metricsShown: [],
      isModalOpen: false,
      enabled: false,
      isDeleteModalVisible: false,
      useNewUX: useNewUx,
    };
  }

  componentDidMount = async (): Promise<void> => {
    let breadCrumbs = this.state.useNewUX ? [BREADCRUMBS.ROLLUPS] : [BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS];

    this.context.chrome.setBreadcrumbs(breadCrumbs);
    const { id } = queryString.parse(this.props.location.search);
    if (typeof id === "string") {
      let newBreadCrumbs = this.state.useNewUX
        ? [BREADCRUMBS.ROLLUPS, { text: id }]
        : [BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.ROLLUPS, { text: id }];
      this.context.chrome.setBreadcrumbs(newBreadCrumbs);
      await this.getRollup(id);
      this.forceUpdate();
    } else {
      this.context.notifications.toasts.addDanger(`Invalid rollup id: ${id}`);
    }
  };

  getRollup = async (rollupId: string): Promise<void> => {
    try {
      const { rollupService } = this.props;
      const response = await rollupService.getRollup(rollupId);

      if (response.ok) {
        const newJSON = response.response;
        const selectedMetrics = this.parseMetric(response.response.rollup.metrics);
        const selectedDimensionField = this.parseDimension(response.response.rollup.dimensions);
        this.setState({
          rollupId: response.response._id,
          description: response.response.rollup.description,
          sourceIndex: response.response.rollup.source_index,
          targetIndex: response.response.rollup.target_index,
          delayTime: response.response.rollup.delay as number,
          pageSize: response.response.rollup.page_size,
          rollupJSON: newJSON,
          lastUpdated: renderTime(response.response.rollup.last_updated_time),
          timestamp: response.response.rollup.dimensions[0].date_histogram.source_field,
          histogramInterval: response.response.rollup.dimensions[0].date_histogram.fixed_interval
            ? response.response.rollup.dimensions[0].date_histogram.fixed_interval
            : response.response.rollup.dimensions[0].date_histogram.calendar_interval,
          timezone: response.response.rollup.dimensions[0].date_histogram.timezone,
          selectedDimensionField,
          selectedMetrics,
          metricsShown: selectedMetrics.slice(0, 10),
          dimensionsShown: selectedDimensionField.slice(0, 10),
          enabled: response.response.rollup.enabled,
        });
        if (response.response.metadata != null) {
          this.setState({ metadata: response.response.metadata[response.response._id] });
        }
        if ("interval" in response.response.rollup.schedule) {
          this.setState({
            interval: response.response.rollup.schedule.interval.period,
            intervalTimeunit: response.response.rollup.schedule.interval.unit,
          });
        } else {
          this.setState({ cronExpression: response.response.rollup.schedule.cron.expression });
        }
      } else {
        this.context.notifications.toasts.addDanger(`Could not load the rollup job: ${response.error}`);
        this.props.history.push(ROUTES.ROLLUPS);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not load the rollup job"));
      this.props.history.push(ROUTES.ROLLUPS);
    }
  };

  parseDimension = (dimensions: RollupDimensionItem[]): DimensionItem[] => {
    const sourceArray = dimensions.slice(1, dimensions.length);
    if (sourceArray.length == 0) return [];
    const result = sourceArray.map((dimension: RollupDimensionItem) => ({
      sequence: dimensions.indexOf(dimension),
      aggregationMethod: dimension.histogram == null ? "terms" : "histogram",
      field: dimension.histogram == null ? { label: dimension.terms?.source_field } : { label: dimension.histogram?.source_field },
      interval: dimension.histogram == null ? null : dimension.histogram?.interval,
    }));
    return result;
  };

  parseMetric = (metrics: RollupMetricItem[]): MetricItem[] => {
    if (metrics.length == 0) return [];
    const result = metrics.map((metric) => ({
      source_field: metric.source_field,
      all: false,
      min: metric.metrics.filter((item) => item.min != null).length > 0,
      max: metric.metrics.filter((item) => item.max != null).length > 0,
      sum: metric.metrics.filter((item) => item.sum != null).length > 0,
      avg: metric.metrics.filter((item) => item.avg != null).length > 0,
      value_count: metric.metrics.filter((item) => item.value_count != null).length > 0,
    }));
    return result;
  };

  onDisable = async (): Promise<void> => {
    const { rollupService } = this.props;
    const { rollupId } = this.state;
    try {
      const response = await rollupService.stopRollup(rollupId);

      if (response.ok) {
        this.setState({ enabled: false });
        //Show success message
        await this.getRollup(rollupId);
        this.forceUpdate();
        this.context.notifications.toasts.addSuccess(`${rollupId} is disabled`);
      } else {
        this.context.notifications.toasts.addDanger(`Could not stop the rollup job "${rollupId}" : ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not stop the rollup job: " + rollupId));
    }
  };

  onClickRollupStatusChange = async (): Promise<void> => {
    if (this.state.enabled) {
      return this.onDisable();
    } else {
      return this.onEnable();
    }
  };

  onEnable = async (): Promise<void> => {
    const { rollupService } = this.props;
    const { rollupId } = this.state;

    try {
      const response = await rollupService.startRollup(rollupId);

      if (response.ok) {
        this.setState({ enabled: true });
        //Show success message
        await this.getRollup(rollupId);
        this.forceUpdate();
        this.context.notifications.toasts.addSuccess(`${rollupId} is enabled`);
      } else {
        this.context.notifications.toasts.addDanger(`Could not start the rollup job "${rollupId}" : ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not start the rollup job: " + rollupId));
    }
  };

  onEdit = (): void => {
    const { rollupId } = this.state;
    if (rollupId) this.props.history.push(`${ROUTES.EDIT_ROLLUP}?id=${rollupId}`);
  };

  showModal = () => this.setState({ isModalOpen: true });

  closeModal = () => this.setState({ isModalOpen: false });

  closeDeleteModal = (): void => {
    this.setState({ isDeleteModalVisible: false });
  };

  showDeleteModal = (): void => {
    this.setState({ isDeleteModalVisible: true });
  };

  onClickDelete = async (): Promise<void> => {
    const { rollupService } = this.props;
    const { rollupId } = this.state;

    try {
      const response = await rollupService.deleteRollup(rollupId);

      if (response.ok) {
        this.closeDeleteModal();
        //Show success message
        this.context.notifications.toasts.addSuccess(`"${rollupId}" successfully deleted!`);
        this.props.history.push(ROUTES.ROLLUPS);
      } else {
        this.context.notifications.toasts.addDanger(`Could not delete the rollup job "${rollupId}" : ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not delete the rollup job"));
    }
  };

  onChangeDimensionsShown = (from: number, size: number): void => {
    const { selectedDimensionField } = this.state;
    this.setState({ dimensionsShown: selectedDimensionField.slice(from, from + size) });
  };
  onChangeMetricsShown = (from: number, size: number): void => {
    const { selectedMetrics } = this.state;
    this.setState({ metricsShown: selectedMetrics.slice(from, from + size) });
  };

  renderEnabledField = (enabled: boolean) => {
    if (enabled) {
      return "Enabled";
    }
    return "Disabled";
  };

  render() {
    const {
      rollupId,
      description,
      sourceIndex,
      targetIndex,
      continuousJob,
      continuousDefinition,
      interval,
      intervalTimeunit,
      cronExpression,
      pageSize,
      lastUpdated,
      metadata,

      timestamp,
      histogramInterval,
      timezone,
      selectedDimensionField,
      selectedMetrics,
      metricsShown,
      dimensionsShown,
      isModalOpen,
      rollupJSON,
      enabled,
      isDeleteModalVisible,
      useNewUX,
    } = this.state;

    let scheduleText = "";
    if (rollupJSON.rollup != null) {
      scheduleText =
        rollupJSON.rollup.schedule.interval != null
          ? buildIntervalScheduleText(rollupJSON.rollup.continuous, interval, intervalTimeunit)
          : buildCronScheduleText(rollupJSON.rollup.continuous, rollupJSON.rollup.schedule.cron.expression);
    }

    const { HeaderControl } = getNavigationUI();
    const { setAppRightControls, setAppBadgeControls } = getApplication();

    const padding_style = this.state.useNewUX ? { padding: "0px 0px" } : { padding: "5px 50px" };

    const controlsData = [
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
        id: "Edit",
        label: "Edit",
        testId: "editButton",
        run: this.onEdit,
        controlType: "button",
      } as TopNavControlButtonData,
      {
        id: "viewJson",
        label: "View JSON",
        testId: "viewJsonButton",
        run: this.showModal,
        controlType: "button",
        display: "base",
      } as TopNavControlButtonData,
      {
        id: "Status",
        label: enabled ? "Disable" : "Enable",
        testId: "enableButton",
        run: this.onClickRollupStatusChange,
        controlType: "button",
        display: "base",
        fill: true,
      } as TopNavControlButtonData,
    ];

    const badgeControlData = [
      {
        renderComponent: (
          <>
            <EuiHealth color={enabled ? "success" : "danger"} />
            <EuiText size="s">{_.truncate(this.renderEnabledField(enabled))}</EuiText>
          </>
        ),
      },
    ];

    return (
      <div style={padding_style}>
        {useNewUX ? (
          <>
            <HeaderControl setMountPoint={setAppRightControls} controls={controlsData} />
            <HeaderControl setMountPoint={setAppBadgeControls} controls={badgeControlData} />
          </>
        ) : (
          <>
            <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiText size="s">
                  <EuiTitle size="m">
                    <h1>{rollupId}</h1>
                  </EuiTitle>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                {enabled ? (
                  <EuiHealth color="success">{"Enabled on " + lastUpdated}</EuiHealth>
                ) : (
                  <EuiHealth color="danger">Disabled</EuiHealth>
                )}
              </EuiFlexItem>

              <EuiFlexItem grow={false}>
                <EuiFlexGroup alignItems="center" gutterSize="s">
                  <EuiFlexItem grow={false}>
                    <EuiSmallButton disabled={!enabled} onClick={this.onDisable} data-test-subj="disableButton">
                      Disable
                    </EuiSmallButton>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiSmallButton disabled={enabled} onClick={this.onEnable} data-test-subj="enableButton">
                      Enable
                    </EuiSmallButton>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiSmallButton onClick={this.showModal}>View JSON</EuiSmallButton>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiSmallButton onClick={this.showDeleteModal} color="danger" data-test-subj="deleteButton">
                      Delete
                    </EuiSmallButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer />
          </>
        )}

        <GeneralInformation
          rollupId={rollupId}
          description={description}
          sourceIndex={sourceIndex}
          targetIndex={targetIndex}
          scheduleText={scheduleText}
          pageSize={pageSize}
          lastUpdated={lastUpdated}
          onEdit={this.onEdit}
          useNewUX={useNewUX}
        />
        <EuiSpacer />
        <RollupStatus metadata={metadata} />
        <EuiSpacer />
        <AggregationAndMetricsSettings
          timestamp={timestamp}
          histogramInterval={histogramInterval}
          timezone={timezone}
          selectedDimensionField={selectedDimensionField}
          selectedMetrics={selectedMetrics}
          metricsShown={metricsShown}
          dimensionsShown={dimensionsShown}
          onChangeMetricsShown={this.onChangeMetricsShown}
          onChangeDimensionsShown={this.onChangeDimensionsShown}
        />
        <EuiSpacer />

        {isModalOpen && (
          <EuiOverlayMask>
            <EuiModal onClose={this.closeModal}>
              <EuiModalHeader>
                <EuiModalHeaderTitle>
                  {" "}
                  <EuiText size="s">
                    <h2>{"View JSON of " + rollupId}</h2>
                  </EuiText>{" "}
                </EuiModalHeaderTitle>
              </EuiModalHeader>

              <EuiModalBody>
                <EuiCodeBlock language="json" fontSize="m" paddingSize="m" overflowHeight={600} inline={false} isCopyable>
                  {JSON.stringify(rollupJSON, null, 4)}
                </EuiCodeBlock>
              </EuiModalBody>

              <EuiModalFooter>
                <EuiSmallButtonEmpty onClick={this.closeModal}>Close</EuiSmallButtonEmpty>
              </EuiModalFooter>
            </EuiModal>
          </EuiOverlayMask>
        )}

        {isDeleteModalVisible && (
          <DeleteModal rollupId={rollupId} closeDeleteModal={this.closeDeleteModal} onClickDelete={this.onClickDelete} />
        )}
      </div>
    );
  }
}

export default function (props: RollupDetailsProps) {
  useUpdateUrlWithDataSourceProperties();
  return <RollupDetails {...props} />;
}
