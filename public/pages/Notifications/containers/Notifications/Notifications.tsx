/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useRef, useState } from "react";
import { EuiBasicTable, EuiSpacer, EuiTitle } from "@elastic/eui";
import useField from "../../../../lib/field";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { CoreStart } from "opensearch-dashboards/public";
import {
  getComputedResultFromPlainList,
  getDiffableMapFromPlainList,
  getNotifications,
  submitNotifications,
  transformConfigListToPlainList,
} from "../../hooks";
import { FieldState, ILronPlainConfig } from "../../interface";
import { ContentPanel } from "../../../../components/ContentPanel";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import { ActionType, ActionTypeMapTitle } from "../../constant";
import CustomFormRow from "../../../../components/CustomFormRow";
import ChannelSelect from "../../../../containers/ChannelSelect";
import "./index.scss";
import UnsavedChangesBottomBar from "../../../../components/UnsavedChangesBottomBar";
import { diffJson } from "../../../../utils/helpers";
import { unstable_batchedUpdates } from "react-dom";

export interface NotificationsProps {}

const Notifications = (props: NotificationsProps) => {
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const [isLoading, setIsLoading] = useState(false);
  const field = useField({
    values: {} as Partial<FieldState>,
  });
  const destroyRef = useRef<boolean>(false);
  const onSubmit = async () => {
    const { errors, values: notifications } = (await field.validatePromise()) || {};
    if (errors) {
      return;
    }
    setIsLoading(true);
    const result = await submitNotifications({
      commonService: services.commonService,
      plainConfigsPayload: notifications.dataSource || [],
    });
    if (result && result.ok) {
      coreServices.notifications.toasts.addSuccess("Notifications settings for index operations have been successfully updated.");
      reloadNotifications();
    } else {
      coreServices.notifications.toasts.addDanger(result.error);
    }
    if (destroyRef.current) {
      return;
    }
    setIsLoading(false);
  };
  const reloadNotifications = () => {
    setIsLoading(true);
    getNotifications({
      commonService: services.commonService,
    })
      .then((res) => {
        if (res.ok) {
          const plainList = transformConfigListToPlainList(res.response.lron_configs.map((item) => item.lron_config));
          const values = {
            ...getComputedResultFromPlainList(plainList),
            dataSource: plainList,
          } as FieldState;
          unstable_batchedUpdates(() => {
            field.resetValues(values);
            field.setOriginalValues(JSON.parse(JSON.stringify(values)));
          });
        }
      })
      .finally(() => {
        if (!destroyRef.current) {
          setIsLoading(false);
        }
      });
  };
  useEffect(() => {
    reloadNotifications();
    return () => {
      destroyRef.current = true;
    };
  }, []);
  const values = field.getValues();

  return (
    <>
      <EuiTitle size="l">
        <h1>Manage notifications for index operations</h1>
      </EuiTitle>
      <EuiSpacer />
      <ContentPanel title="Index operations" titleSize="s">
        <EuiSpacer />
        <EuiTitle>
          <h5 className="ISM-notifications-first-letter-uppercase">
            {Object.keys(ActionType)
              .map((item) => ActionTypeMapTitle[item])
              .join(", ")}
          </h5>
        </EuiTitle>
        <EuiSpacer />
        <CustomFormRow
          label="Send notification when"
          fullWidth
          style={{
            maxWidth: 1200,
          }}
        >
          <>
            <EuiSpacer size="s" />
            <EuiBasicTable
              items={values.dataSource || []}
              loading={isLoading}
              columns={[
                {
                  field: "title",
                  name: "Operation",
                  render: (val: string, record) => <div className="ISM-notifications-first-letter-uppercase">{val}</div>,
                },
                {
                  field: "hasFailed",
                  name: "Has failed",
                  render: (val: string, record: ILronPlainConfig) => (
                    <AllBuiltInComponents.CheckBox
                      {...field.registerField({
                        name: ["dataSource", `${record.index}`, "failure"],
                      })}
                    />
                  ),
                },
                {
                  field: "hasComplete",
                  name: "Has completed",
                  render: (val: string, record: ILronPlainConfig) => (
                    <AllBuiltInComponents.CheckBox
                      {...field.registerField({
                        name: ["dataSource", `${record.index}`, "success"],
                      })}
                    />
                  ),
                },
                {
                  field: "channels",
                  name: "Notify channels",
                  render: (val: ILronPlainConfig["channels"], record) => {
                    const { value, onChange, ...others } = field.registerField<ILronPlainConfig["channels"]>({
                      name: ["dataSource", `${record.index}`, "channels"],
                      rules: [
                        {
                          validator(rule, value) {
                            const values = field.getValues();
                            const item = values.dataSource?.[record.index];
                            if (item?.failure || item?.success) {
                              if (!value || !value.length) {
                                return Promise.reject("Enabled LRONConfig must contain at least one channel.");
                              }
                            }

                            return Promise.resolve("");
                          },
                        },
                      ],
                    });
                    return (
                      <CustomFormRow
                        isInvalid={!!field.getError(["dataSource", `${record.index}`, "channels"])}
                        error={field.getError(["dataSource", `${record.index}`, "channels"])}
                      >
                        <ChannelSelect
                          {...others}
                          value={value?.map((item) => item.id)}
                          onChange={(val, options) => {
                            onChange(
                              options.map((item) => ({
                                id: item.value || "",
                              }))
                            );
                          }}
                        />
                      </CustomFormRow>
                    );
                  },
                },
              ]}
            />
          </>
        </CustomFormRow>
      </ContentPanel>
      {diffJson(
        getDiffableMapFromPlainList(values.dataSource || []),
        getDiffableMapFromPlainList(field.getOriginalValues().dataSource || [])
      ) ? (
        <UnsavedChangesBottomBar
          unsavedCount={diffJson(
            getDiffableMapFromPlainList(values.dataSource || []),
            getDiffableMapFromPlainList(field.getOriginalValues().dataSource || [])
          )}
          onClickSubmit={onSubmit}
          // onClickCancel={onCancel}
        />
      ) : null}
    </>
  );
};

// @ts-ignore
export default Notifications;
