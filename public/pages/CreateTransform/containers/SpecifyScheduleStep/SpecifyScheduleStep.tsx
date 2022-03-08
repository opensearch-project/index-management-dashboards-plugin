/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ChangeEvent, Component } from "react";
import { EuiSpacer, EuiTitle, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { RouteComponentProps } from "react-router-dom";
import { TransformService } from "../../../../services";
import { BREADCRUMBS, ROUTES } from "../../../../utils/constants";
import { getErrorMessage } from "../../../../utils/helpers";
import { Transform } from "../../../../../models/interfaces";
import CreateTransformSteps from "../../components/CreateTransformSteps";
import Schedule from "../../components/Schedule";
import { CoreServicesContext } from "../../../../components/core_services";
import { createdTransformToastMessage } from "../../utils/helpers";

interface SpecifyScheduleStepProps extends RouteComponentProps {
  transformService: TransformService;
  currentStep: number;
  jobEnabledByDefault: boolean;
  continuousJob: string;
  interval: number;
  intervalTimeunit: string;
  intervalError: string;
  pageSize: number;
  onChangeJobEnabledByDefault: () => void;
  onChangeContinuousJob: (optionId: string) => void;
  onChangeIntervalTime: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangePage: (e: ChangeEvent<HTMLInputElement>) => void;
  onChangeIntervalTimeunit: (e: ChangeEvent<HTMLSelectElement>) => void;
}

interface SpecifyScheduleStepState {
  transformId: string;
  transformIdError: string;
  transformSeqNo: number | null;
  transformPrimaryTerm: number | null;
  submitError: string;
  isSubmitting: boolean;
  hasSubmitted: boolean;
}

export default class SpecifyScheduleStep extends Component<SpecifyScheduleStepProps, SpecifyScheduleStepState> {
  static contextType = CoreServicesContext;
  constructor(props: SpecifyScheduleStepProps) {
    super(props);

    this.state = {
      transformSeqNo: null,
      transformPrimaryTerm: null,
      transformId: "",
      transformIdError: "",
      submitError: "",
      isSubmitting: false,
      hasSubmitted: false,
    };
  }

  componentDidMount = async (): Promise<void> => {
    this.context.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.TRANSFORMS]);
  };

  onCreate = async (transformId: string, transform: Transform): Promise<void> => {
    const { transformService } = this.props;
    try {
      const response = await transformService.putTransform(transform, transformId);
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(createdTransformToastMessage(response.response._id));
        this.props.history.push(ROUTES.TRANSFORMS);
      } else {
        this.setState({ submitError: response.error });
      }
    } catch (err) {
      this.setState({ submitError: getErrorMessage(err, "There was a problem creating the transform") });
    }
  };

  onUpdate = async (transformId: string, transform: Transform): Promise<void> => {
    try {
      const { transformService } = this.props;
      const { transformPrimaryTerm, transformSeqNo } = this.state;
      if (transformSeqNo == null || transformPrimaryTerm == null) {
        this.context.notifications.toasts.addDanger("Could not update transform without seqNo and primaryTerm");
        return;
      }
      const response = await transformService.putTransform(transform, transformId, transformSeqNo, transformPrimaryTerm);
      if (response.ok) {
        this.context.notifications.toasts.addSuccess(`Updated transform: ${response.response._id}`);
        this.props.history.push(ROUTES.TRANSFORMS);
      } else {
        this.setState({ submitError: response.error });
      }
    } catch (err) {
      this.setState({ submitError: getErrorMessage(err, "There was a problem updating the transform") });
    }
  };

  onCancel = (): void => {
    this.props.history.push(ROUTES.TRANSFORMS);
  };

  onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { hasSubmitted } = this.state;
    const transformId = e.target.value;
    if (hasSubmitted) this.setState({ transformId, transformIdError: transformId ? "" : "Required" });
    else this.setState({ transformId });
  };

  render() {
    if (this.props.currentStep != 3) return null;
    const {
      jobEnabledByDefault,
      continuousJob,
      interval,
      intervalTimeunit,
      pageSize,
      onChangeJobEnabledByDefault,
      onChangeContinuousJob,
      onChangeIntervalTime,
      onChangePage,
      onChangeIntervalTimeunit,
    } = this.props;
    const { transformId, transformIdError } = this.state;
    return (
      <div style={{ padding: "5px 50px" }}>
        <EuiFlexGroup>
          <EuiFlexItem style={{ maxWidth: 300 }} grow={false}>
            <CreateTransformSteps step={3} />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTitle size="l">
              <h1>Specify Schedule</h1>
            </EuiTitle>
            <EuiSpacer />
            <Schedule
              {...this.props}
              isEdit={false}
              transformId={transformId}
              transformIdError={transformIdError}
              jobEnabledByDefault={jobEnabledByDefault}
              continuousJob={continuousJob}
              interval={interval}
              intervalTimeunit={intervalTimeunit}
              pageSize={pageSize}
              onChangeJobEnabledByDefault={onChangeJobEnabledByDefault}
              onChangeContinuousJob={onChangeContinuousJob}
              onChangeIntervalTime={onChangeIntervalTime}
              onChangeIntervalTimeunit={onChangeIntervalTimeunit}
              onChangePage={onChangePage}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer />
      </div>
    );
  }
}
