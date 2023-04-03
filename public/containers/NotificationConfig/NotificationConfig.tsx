/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EuiBadge, EuiButton, EuiCallOut, EuiFlexGroup, EuiFlexItem, EuiLink, EuiSpacer, EuiTitle } from "@elastic/eui";
import ChannelSelect, { useChannels } from "../ChannelSelect";
import { AllBuiltInComponents } from "../../components/FormGenerator";
import { ActionType } from "../../pages/Notifications/constant";
import { useState } from "react";
import { ActionTypeMapTitle } from "../../pages/Notifications/constant";
import { ROUTES } from "../../utils/constants";
import { useEffect } from "react";
import { GetLronConfig, associateWithTask } from "./hooks";
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
}

export interface NotificationConfigRef extends FieldInstance {
  associateWithTask: (props: { taskId: string }) => Promise<boolean>;
}

const NotificationConfig = ({ actionType }: NotificationConfigProps, ref: React.Ref<NotificationConfigRef>) => {
  const { channels } = useChannels();
  const field = useField<
    ILronConfig & {
      customize: boolean;
    }
  >();
  const [LronConfig, setLronConfig] = useState<ILronConfig>();
  const context = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  useEffect(() => {
    GetLronConfig({
      actionType,
      services: context,
    }).then((res) => {
      if (res && res.ok) {
        setLronConfig(res.response.lron_configs[0]?.lron_config);
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
  return (
    <div>
      <EuiTitle size="s">
        <h5>Notify on {ActionTypeMapTitle[actionType]} status</h5>
      </EuiTitle>
      <EuiSpacer size="s" />
      <EuiCallOut color="primary" iconType="iInCircle">
        Notification settings for shrink operation is being managed by{" "}
        <EuiLink href={`#${ROUTES.NOTIFICATIONS}`} target="_blank" external={false}>
          Task management
        </EuiLink>
        .
      </EuiCallOut>
      <EuiSpacer />
      {LronConfig ? (
        <>
          <CustomFormRow label={`Send a notification when ${ActionTypeMapTitle[actionType]}`}>
            <></>
          </CustomFormRow>
          <EuiSpacer size="s" />
          <ul style={{ listStyle: "inside disc" }}>
            {LronConfig?.lron_condition.failure ? <li>Has failed</li> : null}
            {LronConfig?.lron_condition.success ? <li>Has completed</li> : null}
          </ul>
          <EuiSpacer />
          <CustomFormRow label="Channels will be notified">
            <></>
          </CustomFormRow>
          <EuiSpacer size="s" />
          <div>
            {selectedChannels?.map((item) => (
              <EuiBadge color="hollow" key={item.name}>
                {item.name} ({item.config_type})
              </EuiBadge>
            ))}
          </div>
          <EuiSpacer />
          <AllBuiltInComponents.CheckBox
            {...field.registerField({
              name: "customize",
            })}
            label="Send additional notifications"
          />
          <EuiSpacer />
          {values.customize ? (
            <>
              <CustomFormRow label="Send notification when the operation">
                <>
                  <AllBuiltInComponents.CheckBox
                    {...field.registerField({
                      name: ["lron_condition", "failure"],
                    })}
                    label="Has failed / timed out"
                  />
                  <EuiSpacer size="s" />
                  <AllBuiltInComponents.CheckBox
                    {...field.registerField({
                      name: ["lron_condition", "success"],
                    })}
                    label="Has completed"
                  />
                </>
              </CustomFormRow>
              <EuiSpacer />
              <CustomFormRow label="Send notification channels" isInvalid={!!field.getError("channels")} error={field.getError("channels")}>
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
                                  return Promise.reject("Enabled LRONConfig must contain at least one channel.");
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
              <EuiSpacer />
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default forwardRef(NotificationConfig);
