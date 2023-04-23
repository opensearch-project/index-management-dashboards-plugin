/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactChild, useContext, useEffect, useRef, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import { EuiButton, EuiCallOut, EuiCard, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiTitle } from "@elastic/eui";
import { CoreStart } from "opensearch-dashboards/public";
import useField from "../../../../lib/field";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import {
  getComputedResultFromPlainList,
  getDiffableMapFromPlainList,
  getNotifications,
  submitNotifications,
  transformConfigListToPlainList,
} from "../../hooks";
import { FieldState, ILronPlainConfig } from "../../interface";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import CustomFormRow from "../../../../components/CustomFormRow";
import ChannelSelect from "../../../../containers/ChannelSelect";
import UnsavedChangesBottomBar from "../../../../components/UnsavedChangesBottomBar";
import { diffJson } from "../../../../utils/helpers";
import { BREADCRUMBS } from "../../../../utils/constants";
import {
  ActionType,
  ActionTypeMapDescription,
  ActionTypeMapTitle,
  FieldEnum,
  FieldMapLabel,
  LABEL_FOR_CONDITION,
  VALIDATE_ERROR_FOR_CHANNELS,
  getKeyByValue,
} from "../../constant";
import "./index.scss";

export interface NotificationsProps {}

const Notifications = (props: NotificationsProps) => {
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const [isLoading, setIsLoading] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [noPermission, setNoPermission] = useState(false);
  const field = useField({
    values: {} as Partial<FieldState>,
    onChange(name, value) {
      if ((name[2] === FieldEnum.success || name[2] === FieldEnum.failure) && !value) {
        field.validatePromise();
      }
    },
  });
  const destroyRef = useRef<boolean>(false);
  const onSubmit = async () => {
    const { errors, values: notifications } = (await field.validatePromise()) || {};
    setSubmitClicked(!!errors);
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
      const isNoPermission = result.body.some((item) => item?.error?.type === "security_exception");
      if (isNoPermission) {
        coreServices.notifications.toasts.addDanger({
          title: "You do not have permissions to update notification settings",
          text: "Contact your administrator to request permissions.",
        });
      } else {
        coreServices.notifications.toasts.addDanger(result.error);
      }
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
          if (res.body?.status === 403) {
            setNoPermission(true);
            return;
          }
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
    coreServices.chrome.setBreadcrumbs([BREADCRUMBS.INDEX_MANAGEMENT, BREADCRUMBS.NOTIFICATION_SETTINGS]);
    reloadNotifications();
    return () => {
      destroyRef.current = true;
    };
  }, []);
  const values = field.getValues();
  const allErrors = Object.entries(field.getErrors());

  return (
    <>
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem>
          <EuiTitle size="l">
            <h1>Notification settings</h1>
          </EuiTitle>
          <CustomFormRow
            fullWidth
            helpText={
              <>
                Configure the default notification settings on index operation statuses such as failed or completed. You can configure
                additional notification settings while performing an index operation.
              </>
            }
          >
            <></>
          </CustomFormRow>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton iconType="popout" href="notifications-dashboards#/channels" target="_blank">
            Manage channels
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer />
      <EuiCard title="Defaults for index operations" textAlign="left">
        {submitClicked && allErrors.length ? (
          <EuiCallOut iconType="iInCircle" color="danger" title="Address the following error(s) in the form">
            <ul>
              {allErrors.reduce((total, [key, errors]) => {
                const pattern = /^dataSource\.(\d+)\.(\w+)$/;
                const matchResult = key.match(pattern);
                if (matchResult) {
                  const index = matchResult[1];
                  const itemField = matchResult[2];
                  const notificationItem = (field.getValues().dataSource || [])[parseInt(index, 10)];
                  const errorMessagePrefix = `${notificationItem.title} - ${FieldMapLabel[itemField as keyof typeof FieldMapLabel]}: `;
                  return [
                    ...total,
                    ...(errors || []).map((item) => (
                      <li key={`${errorMessagePrefix}${item}`} className="ISM-notifications-first-letter-uppercase">
                        {errorMessagePrefix}
                        {item}
                      </li>
                    )),
                  ];
                }

                return total;
              }, [] as ReactChild[])}
            </ul>
          </EuiCallOut>
        ) : null}
        {noPermission ? (
          <EuiCallOut iconType="iInCircle" color="danger" title="You do not have permissions to view notification settings">
            Contact your administrator to request permissions.
          </EuiCallOut>
        ) : (
          <>
            <EuiSpacer />
            {(values.dataSource || []).map((record) => {
              const { value, onChange, ...others } = field.registerField<ILronPlainConfig["channels"]>({
                name: ["dataSource", `${record.index}`, FieldEnum.channels],
                rules: [
                  {
                    validator(rule, value) {
                      const values = field.getValues();
                      const item = values.dataSource?.[record.index];
                      if (item?.[FieldEnum.failure] || item?.[FieldEnum.success]) {
                        if (!value || !value.length) {
                          return Promise.reject(VALIDATE_ERROR_FOR_CHANNELS);
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
                  helpText={ActionTypeMapDescription[getKeyByValue(ActionTypeMapTitle, record.title) as ActionType]}
                  direction="hoz"
                  key={record.action_name}
                >
                  <>
                    <div>{LABEL_FOR_CONDITION}</div>
                    <EuiSpacer size="s" />
                    <EuiFlexGroup alignItems="flexStart">
                      <EuiFlexItem>
                        <AllBuiltInComponents.CheckBox
                          {...field.registerField({
                            name: ["dataSource", `${record.index}`, FieldEnum.failure],
                          })}
                          label="Has failed"
                        />
                      </EuiFlexItem>
                      <EuiFlexItem>
                        <AllBuiltInComponents.CheckBox
                          {...field.registerField({
                            name: ["dataSource", `${record.index}`, FieldEnum.success],
                          })}
                          label="Has completed"
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    {field.getValue(["dataSource", `${record.index}`, FieldEnum.failure]) ||
                    field.getValue(["dataSource", `${record.index}`, FieldEnum.success]) ? (
                      <>
                        <EuiSpacer size="s" />
                        <CustomFormRow
                          label={FieldMapLabel[FieldEnum.channels]}
                          isInvalid={!!field.getError(["dataSource", `${record.index}`, FieldEnum.channels])}
                          error={field.getError(["dataSource", `${record.index}`, FieldEnum.channels])}
                        >
                          <ChannelSelect {...others} value={value} onChange={onChange} />
                        </CustomFormRow>
                      </>
                    ) : null}
                  </>
                </CustomFormRow>
              );
            })}
          </>
        )}
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
