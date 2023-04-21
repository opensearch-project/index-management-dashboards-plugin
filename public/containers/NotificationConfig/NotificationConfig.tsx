/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiBadge, EuiButton, EuiCallOut, EuiFlexGroup, EuiFlexItem, EuiLink, EuiSpacer, EuiTitle } from "@elastic/eui";
import ChannelSelect, { useChannels } from "../ChannelSelect";
import { AllBuiltInComponents } from "../../components/FormGenerator";
import {
  ActionType,
  FieldEnum,
  FieldMapLabel,
  LABEL_FOR_CONDITION,
  OperationType,
  OperationTypeMapTitle,
  VALIDATE_ERROR_FOR_CHANNELS,
} from "../../pages/Notifications/constant";
import { useState } from "react";
import { ROUTES } from "../../utils/constants";
import { useEffect } from "react";
import { GetLronConfig, associateWithTask, ifSetDefaultNotification } from "./hooks";
import { useContext } from "react";
import { ServicesContext } from "../../services";
import { BrowserServices } from "../../models/interfaces";
import { ILronConfig } from "../../pages/Notifications/interface";
import useField, { FieldInstance } from "../../lib/field";
import { useMemo } from "react";
import { FeatureChannelList } from "../../../server/models/interfaces";
import CustomFormRow from "../../components/CustomFormRow";
import { useImperativeHandle } from "react";
import { forwardRef } from "react";
import { CoreServicesContext } from "../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";

interface NotificationConfigProps {
  actionType: ActionType;
  operationType?: OperationType;
}

export interface NotificationConfigRef extends FieldInstance {
  associateWithTask: (props: { taskId: string }) => Promise<boolean>;
}

const NotificationConfig = ({ actionType, operationType }: NotificationConfigProps, ref: React.Ref<NotificationConfigRef>) => {
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
  });
  const [LronConfig, setLronConfig] = useState<ILronConfig | undefined>();
  const context = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  useEffect(() => {
    GetLronConfig({
      actionType,
      services: context,
    }).then((res) => {
      if (res && res.ok) {
        const lronConfig = res.response.lron_configs[0]?.lron_config;
        setLronConfig(lronConfig);
        if (!ifSetDefaultNotification(lronConfig)) {
          field.setValue("customize", true);
        }
      }
    });
  }, []);
  const selectedChannels: FeatureChannelList[] = useMemo(() => {
    return LronConfig?.channels
      .map((item) => channels.find((channel) => channel.config_id === item.id))
      .filter((item) => item) as FeatureChannelList[];
  }, [LronConfig, channels]);
  const values = field.getValues();
  useImperativeHandle(ref, () => ({
    ...field,
    associateWithTask: ({ taskId }) => {
      const { customize, ...others } = field.getValues();
      if (!customize) {
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
  return (
    <div>
      <EuiTitle size="s">
        <h5>Notify on {OperationTypeMapTitle[operationType || actionType]} status</h5>
      </EuiTitle>
      {hasDefaultNotification ? (
        <>
          <EuiSpacer size="s" />
          <EuiCallOut
            color="primary"
            iconType="iInCircle"
            title={
              <>
                Default notification settings are set for shrink operations. Configure default settings at{" "}
                <EuiLink style={{ textDecoration: "underline" }} href={`#${ROUTES.NOTIFICATIONS}`} target="_blank" external={false}>
                  Notifications
                </EuiLink>
                .
              </>
            }
          />
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
                <div>
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
      {hasDefaultNotification ? (
        <>
          <EuiSpacer />
          <AllBuiltInComponents.CheckBox
            {...field.registerField({
              name: "customize",
            })}
            label="Send additional notifications"
          />
        </>
      ) : null}
      {values.customize ? (
        <>
          <EuiSpacer />
          <CustomFormRow label={LABEL_FOR_CONDITION}>
            <>
              <AllBuiltInComponents.CheckBox
                {...field.registerField({
                  name: ["lron_condition", FieldEnum.failure],
                })}
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
          <EuiSpacer />
          <CustomFormRow
            label={FieldMapLabel[FieldEnum.channels]}
            isInvalid={!!field.getError(FieldEnum.channels)}
            error={field.getError(FieldEnum.channels)}
          >
            <EuiFlexGroup>
              <EuiFlexItem>
                <ChannelSelect
                  {...field.registerField({
                    name: "channels",
                    rules: [
                      {
                        validator(rule, value) {
                          const values = field.getValues();
                          const item = values.lron_condition;
                          if (values.customize && (item?.failure || item?.success)) {
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
                <EuiButton onClick={() => window.open("/app/notifications-dashboards#/channels")}>Manage channels</EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </CustomFormRow>
        </>
      ) : null}
    </div>
  );
};

export default forwardRef(NotificationConfig);
