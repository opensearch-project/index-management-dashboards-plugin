// FILE: NotificationsModal.tsx
import React, { ReactChild, useContext, useEffect, useRef, useState } from "react";
import {
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiFlexGroup,
  EuiFlexItem,
  EuiCallOut,
  EuiSpacer,
  EuiPanel,
  EuiEmptyPrompt,
  EuiSmallButton,
} from "@elastic/eui";
import { ServicesContext } from "../../../../services";
import { BrowserServices } from "../../../../models/interfaces";
import { CoreServicesContext } from "../../../../components/core_services";
import { getUISettings, getNavigationUI, getApplication } from "../../../../services/Services";
import { CoreStart } from "../../../../../../../src/core/public";
import useField from "../../../../lib/field";
import { get } from "lodash";
import { unstable_batchedUpdates } from "react-dom";
import { diffJson } from "../../../../utils/helpers";
import {
  getDiffableMapFromPlainList,
  getNotifications,
  submitNotifications,
  transformConfigListToPlainList,
} from "../../../Notifications/hooks";
import { checkPermissionForSubmitLRONConfig } from "../../../../containers/NotificationConfig";
import { BREADCRUMBS } from "../../../../utils/constants";
import { TopNavControlButtonData } from "../../../../../../../src/plugins/navigation/public";
import { FieldState, ILronPlainConfig } from "../../../Notifications/interface";
import { AllBuiltInComponents } from "../../../../components/FormGenerator";
import CustomFormRow from "../../../../components/CustomFormRow";
import ChannelSelect from "../../../../containers/ChannelSelect";
import {
  ActionType,
  ActionTypeMapDescription,
  ActionTypeMapTitle,
  FieldEnum,
  FieldMapLabel,
  LABEL_FOR_CONDITION,
  VALIDATE_ERROR_FOR_CHANNELS,
  getKeyByValue,
} from "../../../Notifications/constant";
import UnsavedChangesButtons from "./UnsavedChangesButton";

export interface NotificationsProps {
  onClose: () => void;
  visible: boolean;
}

const Notifications = ({ onClose, visible }: NotificationsProps) => {
  const services = useContext(ServicesContext) as BrowserServices;
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const [, setIsLoading] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [noPermission, setNoPermission] = useState(false);
  const [permissionForUpdate, setPermissionForUpdate] = useState(false);
  const uiSettings = getUISettings();
  const useNewUX = uiSettings.get("home:useNewHomePage");

  const field = useField({
    values: {} as Partial<FieldState>,
    onBeforeChange(name) {
      const previousValue = field.getValues();
      if (Array.isArray(name) && name.length === 3 && parseInt(name[1]) > 0) {
        const [dataSourceStr, index] = name;
        const newProperty = [dataSourceStr, index, FieldEnum.channels];
        if (
          (name[2] === FieldEnum.success || name[2] === FieldEnum.failure) &&
          !get(previousValue, [dataSourceStr, index, FieldEnum.success]) &&
          !get(previousValue, [dataSourceStr, index, FieldEnum.failure]) &&
          (!get(previousValue, newProperty) || !get(previousValue, newProperty).length)
        ) {
          field.setValue(newProperty, field.getValue([dataSourceStr, `${(parseInt(index) as number) - 1}`, FieldEnum.channels]));
        }
      }
    },
    onChange(name, value) {
      if ((name[2] === FieldEnum.success || name[2] === FieldEnum.failure) && !value) {
        field.validatePromise();
      }
    },
  });
  const destroyRef = useRef<boolean>(false);
  const onSubmit = async (): Promise<void> => {
    if (!permissionForUpdate) {
      coreServices.notifications.toasts.addDanger({
        title: "You do not have permissions to update notification settings",
        text: "Contact your administrator to request permissions.",
      });
      return await new Promise((resolve) => setTimeout(() => resolve(undefined), 0));
    }
    const { errors, values: notifications } = (await field.validatePromise()) || {};
    setSubmitClicked(!!errors);
    if (errors) {
      return;
    }
    setIsLoading(true);
    const result = await submitNotifications({
      commonService: services.commonService,
      plainConfigsPayload: (notifications.dataSource || []).map((item) => {
        if (!item.success && !item.failure) {
          return {
            ...item,
            channels: [],
          };
        }

        return item;
      }),
    });
    if (result && result.ok) {
      coreServices.notifications.toasts.addSuccess("Notifications settings for index operations have been successfully updated.");
      reloadNotifications();
      onClose();
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
            dataSource: plainList,
          } as FieldState;
          unstable_batchedUpdates(() => {
            field.resetValues(values);
            field.setOriginalValues(JSON.parse(JSON.stringify(values)));
          });
        } else {
          if (res?.body?.status === 403) {
            setNoPermission(true);
            coreServices.notifications.toasts.addDanger({
              title: "You do not have permissions to view notification settings",
              text: "Contact your administrator to request permissions.",
            });
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
    onClose();
  };
  useEffect(() => {
    reloadNotifications();
    checkPermissionForSubmitLRONConfig({
      services,
    }).then((result) => setPermissionForUpdate(result));
    return () => {
      destroyRef.current = true;
    };
  }, []);
  const values = field.getValues();
  const allErrors = Object.entries(field.getErrors());

  if (!visible) {
    return null;
  }

  return (
    <EuiModal onClose={onClose} maxWidth={false}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>Notification settings</EuiModalHeaderTitle>
        <EuiFlexItem grow={false}>
          <EuiSmallButton iconType="popout" href="notifications-dashboards#/channels" target="_blank">
            Manage channels
          </EuiSmallButton>
        </EuiFlexItem>
      </EuiModalHeader>
      <EuiModalBody>
        <>
          {noPermission ? (
            <EuiPanel>
              <EuiEmptyPrompt
                iconType="alert"
                iconColor="danger"
                title={<h2>Error loading Notification settings</h2>}
                body={<p>You do not have permissions to view Notification settings. Contact your administrator to request permissions.</p>}
              />
            </EuiPanel>
          ) : (
            <EuiPanel>
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
                        const errorMessagePrefix = `${notificationItem.title} — ${
                          FieldMapLabel[itemField as keyof typeof FieldMapLabel]
                        }: `;
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
                      <CustomFormRow label={LABEL_FOR_CONDITION}>
                        <EuiFlexGroup alignItems="flexStart">
                          <EuiFlexItem>
                            <AllBuiltInComponents.CheckBox
                              {...field.registerField({
                                name: ["dataSource", `${record.index}`, FieldEnum.failure],
                              })}
                              data-test-subj={["dataSource", `${record.index}`, FieldEnum.failure].join(".")}
                              label="Has failed"
                            />
                          </EuiFlexItem>
                          <EuiFlexItem>
                            <AllBuiltInComponents.CheckBox
                              {...field.registerField({
                                name: ["dataSource", `${record.index}`, FieldEnum.success],
                              })}
                              data-test-subj={["dataSource", `${record.index}`, FieldEnum.success].join(".")}
                              label="Has completed"
                            />
                          </EuiFlexItem>
                        </EuiFlexGroup>
                      </CustomFormRow>
                      {field.getValue(["dataSource", `${record.index}`, FieldEnum.failure]) ||
                      field.getValue(["dataSource", `${record.index}`, FieldEnum.success]) ? (
                        <>
                          <EuiSpacer />
                          <CustomFormRow
                            label={FieldMapLabel[FieldEnum.channels]}
                            isInvalid={!!field.getError(["dataSource", `${record.index}`, FieldEnum.channels])}
                            error={field.getError(["dataSource", `${record.index}`, FieldEnum.channels])}
                            data-test-subj={["dataSource", `${record.index}`, FieldEnum.channels].join(".")}
                          >
                            <ChannelSelect {...others} value={value} onChange={onChange} />
                          </CustomFormRow>
                        </>
                      ) : null}
                    </>
                  </CustomFormRow>
                );
              })}
              <EuiSpacer />
            </EuiPanel>
          )}
        </>
      </EuiModalBody>
      <EuiModalFooter>
        <UnsavedChangesButtons
          unsavedCount={diffJson(
            getDiffableMapFromPlainList(values.dataSource || []),
            getDiffableMapFromPlainList(field.getOriginalValues().dataSource || [])
          )}
          formErrorsCount={allErrors.length}
          onClickSubmit={onSubmit}
          onClickCancel={onCancel}
          submitButtonDataTestSubj="submitNotifcationSettings"
        />
      </EuiModalFooter>
    </EuiModal>
  );
};

export default Notifications;
