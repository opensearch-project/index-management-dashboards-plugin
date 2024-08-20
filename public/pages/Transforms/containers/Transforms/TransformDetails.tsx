/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiSpacer,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiOverlayMask,
  EuiButtonEmpty,
  EuiModalFooter,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiCodeBlock,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiTextColor,
  EuiPopover,
  EuiHealth,
  EuiText,
  EuiButtonIcon,
} from "@elastic/eui";
import { TransformService } from "../../../../services";
import { RouteComponentProps } from "react-router-dom";
import React, { Component } from "react";
import { CoreServicesContext } from "../../../../components/core_services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import queryString from "query-string";
import { getErrorMessage } from "../../../../utils/helpers";
import { DimensionItem, RollupDimensionItem, TransformMetadata } from "../../../../../models/interfaces";
import DeleteModal from "../../components/DeleteModal";
import TransformStatus from "../../components/TransformStatus";
import { EMPTY_TRANSFORM } from "../../utils/constants";
import TransformSettings from "./TransformSettings";
import GeneralInformation from "../../components/GeneralInformation";
import { buildIntervalScheduleText } from "../../../CreateRollup/utils/helpers";
import { useUpdateUrlWithDataSourceProperties } from "../../../../components/MDSEnabledComponent";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";
import { ModalConsumer } from "../../../../components/Modal";
import { ContentPanelActions } from "../../../../components/ContentPanel";

interface TransformDetailsProps extends RouteComponentProps {
  transformService: TransformService;
}

interface TransformDetailsState {
  id: string;
  description: string;
  enabled: boolean;
  enabledAt: number | null;
  updatedAt: number;
  pageSize: number;
  transformJson: any;
  continuousJob: string;
  sourceIndex: string;
  targetIndex: string;
  sourceIndexFilter: string;
  aggregationsShown: any;
  groupsShown: DimensionItem[];
  metadata: TransformMetadata | undefined;
  interval: number;
  intervalTimeUnit: string;
  cronExpression: string;
  isModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isPopOverOpen: boolean;
  useUpdatedUX: boolean;
}

export class TransformDetails extends Component<TransformDetailsProps, TransformDetailsState> {
  static contextType = CoreServicesContext;
  constructor(props: TransformDetailsProps) {
    super(props);
    const uiSettings = getUISettings();
    const useUpdatedUX = uiSettings.get("home:useNewHomePage");
    this.state = {
      id: "",
      description: "",
      enabled: false,
      enabledAt: null,
      updatedAt: 1,
      pageSize: 1000,
      transformJson: EMPTY_TRANSFORM,
      continuousJob: "no",
      sourceIndex: "",
      targetIndex: "",
      sourceIndexFilter: "",
      aggregationsShown: {},
      groupsShown: [],
      metadata: undefined,
      interval: 2,
      intervalTimeUnit: "",
      cronExpression: "",
      isModalOpen: false,
      isDeleteModalOpen: false,
      isPopOverOpen: false,
      useUpdatedUX: useUpdatedUX,
    };
  }

  componentDidMount = async (): Promise<void> => {
    const breadCrumbs = this.state.useUpdatedUX
      ? [BREADCRUMBS.TRANSFORMS, BREADCRUMBS.TRANSFORMS]
      : [BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TRANSFORMS];
    this.context.chrome.setBreadcrumbs(breadCrumbs);
    const { id } = queryString.parse(this.props.location.search);
    if (typeof id === "string") {
      const breadCrumbsUp = this.state.useUpdatedUX
        ? [BREADCRUMBS.TRANSFORMS, { text: id }]
        : [BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TRANSFORMS, { text: id }];
      this.context.chrome.setBreadcrumbs(breadCrumbsUp);
      this.props.history.push(`${ROUTES.TRANSFORM_DETAILS}?id=${id}`);
      await this.getTransform(id);
      this.forceUpdate();
    } else {
      this.context.notifications.toasts.addDanger(`Invalid transform id: ${id}`);
      this.props.history.push(ROUTES.TRANSFORMS);
    }
  };

  getTransform = async (transformId: string) => {
    try {
      const { transformService } = this.props;
      const response = await transformService.getTransform(transformId);

      if (response.ok) {
        let json = response.response;
        let aggregations = this.parseAggregations(response.response.transform.aggregations);
        let groups = this.parseGroups(response.response.transform.groups);
        this.setState({
          id: response.response._id,
          description: response.response.transform.description,
          enabled: response.response.transform.enabled,
          enabledAt: response.response.transform.enabled_at,
          updatedAt: response.response.transform.updated_at,
          pageSize: response.response.transform.page_size,
          transformJson: json,
          sourceIndex: response.response.transform.source_index,
          targetIndex: response.response.transform.target_index,
          sourceIndexFilter: JSON.stringify(response.response.transform.data_selection_query),
          aggregationsShown: aggregations,
          groupsShown: groups.slice(0, 10),
        });

        if (response.response.metadata != null) {
          this.setState({ metadata: response.response.metadata[response.response._id] });
        }
        if ("interval" in response.response.transform.schedule) {
          this.setState({
            interval: response.response.transform.schedule.interval.period,
            intervalTimeUnit: response.response.transform.schedule.interval.unit,
          });
        } else {
          this.setState({ cronExpression: response.response.transform.schedule.cron.expression });
        }
      } else {
        this.context.notifications.toasts.addDanger(`Could not load transform job ${transformId}: ${response.error}`);
        this.props.history.push(ROUTES.TRANSFORMS);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, `Could not load transform job ${transformId}`));
      this.props.history.push(ROUTES.TRANSFORMS);
    }
  };

  parseGroups = (groups: RollupDimensionItem[]): DimensionItem[] => {
    if (groups.length == 0) return [];
    // @ts-ignore
    return groups.map((group: RollupDimensionItem) => {
      let sequence = groups.indexOf(group);
      switch (true) {
        case group.date_histogram != null:
          return {
            sequence: sequence,
            aggregationMethod: "date_histogram",
            field: {
              label: group.date_histogram?.source_field,
            },
            interval: group.date_histogram?.interval,
          };
        case group.histogram != null:
          return {
            sequence: sequence,
            aggregationMethod: "histogram",
            field: {
              label: group.histogram?.source_field,
            },
            interval: group.histogram?.interval,
          };
        case group.terms != null:
          return {
            sequence: sequence,
            aggregationMethod: "terms",
            field: {
              label: group.terms?.source_field,
            },
            interval: null,
          };
      }
    });
  };

  parseAggregations = (aggregations: any): any => {
    if (aggregations.size == 0) return {};
    // @ts-ignore
    return aggregations;
  };

  render() {
    const {
      id,
      enabled,
      enabledAt,
      updatedAt,
      description,
      sourceIndex,
      targetIndex,
      sourceIndexFilter,
      interval,
      intervalTimeUnit,
      pageSize,
      metadata,
      transformJson,
      groupsShown,
      aggregationsShown,
      isDeleteModalOpen,
      isModalOpen,
      isPopOverOpen,
    } = this.state;

    let scheduleText = "";
    if (transformJson.transform != null) {
      scheduleText = buildIntervalScheduleText(transformJson.transform.continuous, interval, intervalTimeUnit);
    }
    const actionButton = (
      <EuiButton iconType="arrowDown" iconSide="right" disabled={false} onClick={this.onActionButtonClick} data-test-subj="actionButton">
        Actions
      </EuiButton>
    );

    const actionItems = [
      <EuiContextMenuItem
        key="enable"
        icon="empty"
        disabled={enabled}
        data-test-subj="enableButton"
        onClick={() => {
          this.closePopover();
          this.onEnable();
        }}
      >
        Enable job
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="disable"
        icon="empty"
        disabled={!enabled}
        data-test-subj="disableButton"
        onClick={() => {
          this.closePopover();
          this.onDisable();
        }}
      >
        Disable job
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="view"
        icon="empty"
        disabled={false}
        data-test-subj="viewButton"
        onClick={() => {
          this.closePopover();
          this.showJsonModal();
        }}
      >
        View JSON
      </EuiContextMenuItem>,
      <EuiContextMenuItem
        key="delete"
        icon="empty"
        disabled={false}
        data-test-subj="deleteButton"
        onClick={() => {
          this.closePopover();
          this.showDeleteModal();
        }}
      >
        <EuiTextColor color="danger">Delete</EuiTextColor>
      </EuiContextMenuItem>,
    ];

    const { HeaderControl } = getNavigationUI();
    const { setAppBadgeControls, setAppRightControls } = getApplication();

    const onClickEnable = () => {
      this.closePopover();
      this.onEnable();
    };

    const onClickDisable = () => {
      this.closePopover();
      this.onDisable();
    };

    const HeaderRight = [
      {
        renderComponent: (
          <>
            <EuiButtonIcon
              display="base"
              iconType="trash"
              aria-label="Delete"
              color="danger"
              onClick={() => {
                this.closePopover();
                this.showDeleteModal();
              }}
              size="s"
            />
          </>
        ),
      },
      {
        renderComponent: (
          <EuiButton size="s" onClick={() => (!this.state.enabled ? onClickEnable() : onClickDisable())}>
            {this.state.enabled ? "Disable" : "Enable"}
          </EuiButton>
        ),
      },
      {
        renderComponent: (
          <EuiButton
            size="s"
            onClick={() => {
              this.closePopover();
              this.showJsonModal();
            }}
          >
            View JSON
          </EuiButton>
        ),
      },
      {
        renderComponent: (
          <EuiFlexItem>
            <ModalConsumer>
              {() => (
                <ContentPanelActions
                  size="s"
                  actions={[
                    {
                      text: "Edit",
                      buttonProps: {
                        onClick: () => this.onEdit(),
                        fill: true,
                        style: { marginRight: 20 },
                      },
                    },
                  ]}
                />
              )}
            </ModalConsumer>
          </EuiFlexItem>
        ),
      },
    ];

    const badgeControlData = [
      {
        renderComponent: (
          <>
            <EuiHealth color={this.state.enabled ? "success" : "danger"} />
            <EuiText size="s">{this.state.enabled ? "Enabled" : "Disabled"}</EuiText>
          </>
        ),
      },
    ];

    return !this.state.useUpdatedUX ? (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup style={{ padding: "0px 10px" }} justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="m">
              <h2>{id}</h2>
            </EuiTitle>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiPopover
                  id="action"
                  button={actionButton}
                  isOpen={isPopOverOpen}
                  closePopover={this.closePopover}
                  panelPaddingSize="none"
                  anchorPosition="downLeft"
                  data-test-subj="actionPopover"
                >
                  <EuiContextMenuPanel items={actionItems} />
                </EuiPopover>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer />
        <GeneralInformation
          id={id}
          description={description}
          sourceIndex={sourceIndex}
          targetIndex={targetIndex}
          sourceIndexFilter={sourceIndexFilter}
          scheduledText={scheduleText}
          pageSize={pageSize}
          enabledAt={enabledAt}
          updatedAt={updatedAt}
          onEdit={this.onEdit}
        />
        <EuiSpacer />
        <TransformStatus metadata={metadata} />
        <EuiSpacer />
        <EuiSpacer />
        <TransformSettings
          {...this.props}
          transformService={this.props.transformService}
          transformId={id}
          sourceIndex={sourceIndex}
          transformJson={transformJson}
          groupsShown={groupsShown}
          aggregationsShown={aggregationsShown}
        />

        {isModalOpen && (
          <EuiOverlayMask>
            <EuiModal onClose={this.closeModal} style={{ padding: "5px 30px" }}>
              <EuiModalHeader>
                <EuiModalHeaderTitle>{"View JSON of " + id} </EuiModalHeaderTitle>
              </EuiModalHeader>

              <EuiModalBody>
                <EuiCodeBlock language="json" fontSize="m" paddingSize="m" overflowHeight={600} inline={false} isCopyable>
                  {JSON.stringify(transformJson, null, 4)}
                </EuiCodeBlock>
              </EuiModalBody>

              <EuiModalFooter>
                <EuiButtonEmpty onClick={this.closeModal}>Close</EuiButtonEmpty>
              </EuiModalFooter>
            </EuiModal>
          </EuiOverlayMask>
        )}

        {isDeleteModalOpen && <DeleteModal item={id} closeDeleteModal={this.closeDeleteModal} onClickDelete={this.onClickDelete} />}
      </div>
    ) : (
      <div style={{ padding: "0px 0px" }}>
        <HeaderControl setMountPoint={setAppBadgeControls} controls={badgeControlData} />
        <HeaderControl controls={HeaderRight} setMountPoint={setAppRightControls} />
        <GeneralInformation
          id={id}
          description={description}
          sourceIndex={sourceIndex}
          targetIndex={targetIndex}
          sourceIndexFilter={sourceIndexFilter}
          scheduledText={scheduleText}
          pageSize={pageSize}
          enabledAt={enabledAt}
          updatedAt={updatedAt}
          onEdit={this.onEdit}
        />
        <EuiSpacer />
        <TransformStatus metadata={metadata} />
        <EuiSpacer />
        <EuiSpacer />
        <TransformSettings
          {...this.props}
          transformService={this.props.transformService}
          transformId={id}
          sourceIndex={sourceIndex}
          transformJson={transformJson}
          groupsShown={groupsShown}
          aggregationsShown={aggregationsShown}
        />

        {isModalOpen && (
          <EuiOverlayMask>
            <EuiModal onClose={this.closeModal} style={{ padding: "5px 30px" }}>
              <EuiModalHeader>
                <EuiModalHeaderTitle>{"View JSON of " + id} </EuiModalHeaderTitle>
              </EuiModalHeader>

              <EuiModalBody>
                <EuiCodeBlock language="json" fontSize="m" paddingSize="m" overflowHeight={600} inline={false} isCopyable>
                  {JSON.stringify(transformJson, null, 4)}
                </EuiCodeBlock>
              </EuiModalBody>

              <EuiModalFooter>
                <EuiButtonEmpty onClick={this.closeModal}>Close</EuiButtonEmpty>
              </EuiModalFooter>
            </EuiModal>
          </EuiOverlayMask>
        )}

        {isDeleteModalOpen && <DeleteModal item={id} closeDeleteModal={this.closeDeleteModal} onClickDelete={this.onClickDelete} />}
      </div>
    );
  }

  onClickDelete = async () => {
    const { id } = this.state;
    const { transformService } = this.props;
    try {
      const response = await transformService.deleteTransform(id);
      if (response.ok) {
        this.closeDeleteModal();
        this.context.notifications.toasts.addSuccess(`"${id}" successfully deleted!`);
        this.props.history.push(ROUTES.TRANSFORMS);
      } else {
        this.context.notifications.toasts.addDanger(`Could not delete transform job "${id}" :  ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, "Could not delete the transform job"));
    }
  };

  onEdit = () => {
    const { id } = this.state;
    this.props.history.push(`${ROUTES.EDIT_TRANSFORM}?id=${id}`);
  };

  onEnable = async () => {
    const { id } = this.state;
    const { transformService } = this.props;
    try {
      const response = await transformService.startTransform(id);
      if (response.ok) {
        this.setState({ enabled: true });
        await this.getTransform(id);
        this.forceUpdate();
        this.context.notifications.toasts.addSuccess(`"${id}" is enabled`);
      } else {
        this.context.notifications.toasts.addDanger(`Could not enable transform job "${id}": ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, `Could not enable transform job "${id}"`));
    }
  };

  onDisable = async () => {
    const { id } = this.state;
    const { transformService } = this.props;
    try {
      const response = await transformService.stopTransform(id);
      if (response.ok) {
        this.setState({ enabled: false });
        await this.getTransform(id);
        this.forceUpdate();
        this.context.notifications.toasts.addSuccess(`"${id}" is disabled`);
      } else {
        this.context.notifications.toasts.addDanger(`Could not disable transform job "${id}": ${response.error}`);
      }
    } catch (err) {
      this.context.notifications.toasts.addDanger(getErrorMessage(err, `Could not disable transform job "${id}"`));
    }
  };

  showJsonModal = () => {
    this.setState({ isModalOpen: true });
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  showDeleteModal = () => {
    this.setState({ isDeleteModalOpen: true });
  };

  closeDeleteModal = () => {
    this.setState({ isDeleteModalOpen: false });
  };

  onActionButtonClick = () => {
    this.setState({ isPopOverOpen: !this.state.isPopOverOpen });
  };

  closePopover = () => {
    this.setState({ isPopOverOpen: false });
  };
}

export default function (props: TransformDetailsProps) {
  useUpdateUrlWithDataSourceProperties();
  return <TransformDetails {...props} />;
}
