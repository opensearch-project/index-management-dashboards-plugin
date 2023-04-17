/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useContext, useEffect, useRef, useState } from "react";
import { EuiBasicTable, EuiCard, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from "@elastic/eui";
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
        } else {
          coreServices.notifications.toasts.addDanger(res.error);
        }
      })
      .finally(() => {
        if (!destroyRef.current) {
          setIsLoading(false);
        }
      });
  };
  const onCancel = () => {
    field.resetValues(field.getOriginalValues());
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
        <h1>Notifications</h1>
      </EuiTitle>
      <EuiSpacer />
      <EuiCard title="Defaults for index operations" textAlign="left">
        <EuiSpacer />
        {/* <EuiBasicTable
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
                    <ChannelSelect {...others} value={value} onChange={onChange} />
                  </CustomFormRow>
                );
              },
            },
          ]}
        /> */}
        {(values.dataSource || []).map((record) => {
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
              label={<div className="ISM-notifications-first-letter-uppercase">{record.title}</div>}
              helpText="Description"
              direction="hoz"
            >
              <>
                <div>Notify when operation</div>
                <EuiSpacer size="s" />
                <EuiFlexGroup alignItems="flexStart">
                  <EuiFlexItem>
                    <AllBuiltInComponents.CheckBox
                      {...field.registerField({
                        name: ["dataSource", `${record.index}`, "failure"],
                      })}
                      label="Has failed"
                    />
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <AllBuiltInComponents.CheckBox
                      {...field.registerField({
                        name: ["dataSource", `${record.index}`, "success"],
                      })}
                      label="Has completed"
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
                {field.getValue(["dataSource", `${record.index}`, "failure"]) ||
                field.getValue(["dataSource", `${record.index}`, "success"]) ? (
                  <>
                    <EuiSpacer size="s" />
                    <CustomFormRow
                      isInvalid={!!field.getError(["dataSource", `${record.index}`, "channels"])}
                      error={field.getError(["dataSource", `${record.index}`, "channels"])}
                    >
                      <ChannelSelect {...others} value={value} onChange={onChange} />
                    </CustomFormRow>
                  </>
                ) : null}
              </>
            </CustomFormRow>
          );
        })}
      </EuiCard>
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
          onClickCancel={onCancel}
        />
      ) : null}
    </>
  );
};

// @ts-ignore
export default Notifications;
