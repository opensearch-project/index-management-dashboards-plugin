/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import React, { useRef, forwardRef, useMemo, useImperativeHandle, useContext, useEffect, useState } from "react";
import { EuiBadge, EuiButton, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from "@elastic/eui";
import { CoreStart } from "opensearch-dashboards/public";
import ChannelSelect, { useChannels } from "../ChannelSelect";
import { AllBuiltInComponents } from "../../components/FormGenerator";
import {
  ActionType,
  FieldEnum,
  FieldMapLabel,
  OperationType,
  OperationTypeMapTitle,
  VALIDATE_ERROR_FOR_CHANNELS,
} from "../../pages/Notifications/constant";
import { GetLronConfig, associateWithTask, checkPermissionForSubmitLRONConfig, ifSetDefaultNotification } from "./hooks";
import { ServicesContext } from "../../services";
import { BrowserServices } from "../../models/interfaces";
import { ILronConfig } from "../../pages/Notifications/interface";
import useField, { FieldInstance } from "../../lib/field";
import { FeatureChannelList } from "../../../server/models/interfaces";
import CustomFormRow from "../../components/CustomFormRow";
import { CoreServicesContext } from "../../components/core_services";
import NotificationCallout from "./NotificationCallout";
import { ContentPanel, ContentPanelProps } from "../../components/ContentPanel";

export interface NotificationConfigProps {
  actionType: ActionType;
  operationType?: OperationType;
  withPanel?: boolean;
  panelProps?: Omit<ContentPanelProps, "children">;
}

export interface NotificationConfigRef extends FieldInstance {
  associateWithTask: (props: { taskId: string }) => Promise<boolean>;
}

const NotificationConfig = (
  { actionType, operationType, withPanel, panelProps }: NotificationConfigProps,
  ref: React.Ref<NotificationConfigRef>
) => {
  const { channels } = useChannels();
  const field = useField<
    ILronConfig & {
      customize: boolean;
    }
  >({
    onChange(name, value) {
      if ((name[1] === FieldEnum.success || name[1] === FieldEnum.failure) && !value) {
        field.validatePromise();
      }
    },
    values: {
      customize: false,
      lron_condition: {
        success: false,
        failure: false,
      },
      channels: [],
    },
  });
  const [LronConfig, setLronConfig] = useState<ILronConfig | undefined>();
  const [permissionForCreateLRON, setPermissionForCreateLRON] = useState(false);
  const [permissionForViewLRON, setPermissionForViewLRON] = useState(false);
  const context = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const stateRef = useRef<{
    permissionForCreateLRON: boolean;
  }>({
    permissionForCreateLRON,
  });
  stateRef.current.permissionForCreateLRON = permissionForCreateLRON;
  useEffect(
    () => {
      GetLronConfig({
        actionType,
        services: context,
      }).then((res) => {
        if (res && res.ok) {
          setPermissionForViewLRON(true);
          const lronConfig = res.response?.lron_configs?.[0]?.lron_config;
          setLronConfig(lronConfig);
          if (!ifSetDefaultNotification(lronConfig)) {
            field.setValue("customize", true);
          }
        } else {
          field.setValue("customize", true);
        }
      });
      checkPermissionForSubmitLRONConfig({
        services: context,
      }).then((result) => setPermissionForCreateLRON(result));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const selectedChannels: FeatureChannelList[] = useMemo(() => {
    return (LronConfig?.channels || [])
      .map((item) => channels.find((channel) => channel.config_id === item.id))
      .filter((item) => item) as FeatureChannelList[];
  }, [LronConfig, channels]);
  const values = field.getValues();
  useImperativeHandle(ref, () => ({
    ...field,
    associateWithTask: ({ taskId }) => {
      const { customize, ...others } = field.getValues();
      if (!customize || !stateRef.current.permissionForCreateLRON) {
        return Promise.resolve(true);
      }

      return associateWithTask({
        services: context,
        coreServices,
        taskId,
        lronConfig: others,
      });
    },
  }));
  const hasDefaultNotification = ifSetDefaultNotification(LronConfig);
  if (!hasDefaultNotification && !permissionForCreateLRON) {
    return null;
  }

  const content = (
    <div>
      <EuiTitle size="s">
        <h5>Notifications</h5>
      </EuiTitle>
      <NotificationCallout
        actionType={actionType}
        operationType={operationType}
        hasDefaultNotification={hasDefaultNotification}
        permissionForCreateLRON={permissionForCreateLRON}
        permissionForViewLRON={permissionForViewLRON}
      />
      {hasDefaultNotification ? (
        <>
          <EuiSpacer />
          <EuiFlexGroup>
            <EuiFlexItem>
              <CustomFormRow label="Notify when operation">
                <ul style={{ listStyle: "inside disc", textIndent: "1.5em" }}>
                  {LronConfig?.lron_condition.failure ? <li>Has failed</li> : null}
                  {LronConfig?.lron_condition.success ? <li>Has completed</li> : null}
                </ul>
              </CustomFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
              <CustomFormRow label="Channels to notify">
                <div style={{ lineHeight: 1.5 }}>
                  {selectedChannels?.map((item) => (
                    <EuiBadge color="hollow" key={item.name}>
                      {item.name} ({item.config_type})
                    </EuiBadge>
                  ))}
                </div>
              </CustomFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
      ) : null}
      {hasDefaultNotification && permissionForCreateLRON ? (
        <>
          <EuiSpacer />
          <AllBuiltInComponents.CheckBox
            {...field.registerField({
              name: "customize",
            })}
            data-test-subj="sendAddtionalNotificationsCheckBox"
            label="Send additional notifications"
          />
        </>
      ) : null}
      {values.customize && permissionForCreateLRON ? (
        <>
          <EuiSpacer />
          <CustomFormRow label="Send additional notifications when operation">
            <>
              <AllBuiltInComponents.CheckBox
                {...field.registerField({
                  name: ["lron_condition", FieldEnum.failure],
                })}
                data-test-subj="notificationCustomConditionHasFailed"
                label="Has failed / timed out"
              />
              <EuiSpacer size="s" />
              <AllBuiltInComponents.CheckBox
                {...field.registerField({
                  name: ["lron_condition", FieldEnum.success],
                })}
                label="Has completed"
              />
            </>
          </CustomFormRow>
          {values?.lron_condition?.[FieldEnum.failure] || values?.lron_condition?.[FieldEnum.success] ? (
            <>
              <EuiSpacer />
              <CustomFormRow
                label={FieldMapLabel[FieldEnum.channels]}
                isInvalid={!!field.getError(FieldEnum.channels)}
                error={field.getError(FieldEnum.channels)}
              >
                <EuiFlexGroup>
                  <EuiFlexItem>
                    <ChannelSelect
                      data-test-subj="notificationCustomChannelsSelect"
                      {...field.registerField({
                        name: "channels",
                        rules: [
                          {
                            validator(rule, value) {
                              const fieldValues = field.getValues();
                              const item = fieldValues.lron_condition;
                              if (fieldValues.customize && (item?.failure || item?.success)) {
                                if (!value || !value.length) {
                                  return Promise.reject(VALIDATE_ERROR_FOR_CHANNELS);
                                }
                              }

                              return Promise.resolve("");
                            },
                          },
                        ],
                      })}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <EuiButton onClick={() => window.open("/app/notifications-dashboards#/channels")} iconType="popout">
                      Manage channels
                    </EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </CustomFormRow>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
  return withPanel ? (
    <>
      <EuiSpacer />
      <ContentPanel accordion noExtraPadding {...panelProps}>
        <EuiSpacer size="s" />
        {content}
        <EuiSpacer size="s" />
      </ContentPanel>
    </>
  ) : (
    <>
      <EuiSpacer />
      {content}
    </>
  );
};

export default forwardRef(NotificationConfig);
