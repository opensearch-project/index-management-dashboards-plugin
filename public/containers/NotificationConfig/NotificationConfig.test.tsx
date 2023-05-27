/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import "@testing-library/jest-dom/extend-expect";
import NotificationConfig, { NotificationConfigProps, NotificationConfigRef } from "./NotificationConfig";
import { render, waitFor } from "@testing-library/react";
import { browserServicesMock, coreServicesMock } from "../../../test/mocks";
import { ServicesContext } from "../../services";
import { CoreServicesContext } from "../../components/core_services";
import { ActionType, OperationType, VALIDATE_ERROR_FOR_CHANNELS } from "../../pages/Notifications/constant";
import { IAPICaller } from "../../../models/interfaces";
import userEvent from "@testing-library/user-event";
import { EuiButton } from "@elastic/eui";

const WrappedComponent = (
  props: NotificationConfigProps & {
    hasButton?: boolean;
  }
) => {
  const ref = useRef<NotificationConfigRef>(null);
  return (
    <>
      <NotificationConfig {...props} ref={ref} />
      {props.hasButton ? (
        <EuiButton
          data-test-subj="submit"
          onClick={async () => {
            const { errors } = (await ref.current?.validatePromise()) || {};
            if (errors) {
              return;
            }
            ref.current?.associateWithTask({
              taskId: "1",
            });
          }}
        >
          send additional notification
        </EuiButton>
      ) : null}
    </>
  );
};

function renderWithServiceAndCore(
  props: NotificationConfigProps & {
    hasButton?: boolean;
  }
) {
  return {
    ...render(
      <CoreServicesContext.Provider value={coreServicesMock}>
        <ServicesContext.Provider value={browserServicesMock}>
          <WrappedComponent {...props} />
        </ServicesContext.Provider>
      </CoreServicesContext.Provider>
    ),
  };
}

const chainRules = (args: any[], ...funs: ((...args: any[]) => void | any)[]) => {
  const findItem = funs.find((item) => item(...args) !== undefined);
  return findItem?.(...args);
};

const rulesForHasUpdatePermission = (payload: IAPICaller) =>
  payload.endpoint === "transport.request" && payload.data?.path?.includes("?dry_run=true")
    ? {
        ok: true,
      }
    : undefined;

const rulesForNoUpdatePermission = (payload: IAPICaller) =>
  payload.endpoint === "transport.request" && payload.data?.path?.includes("?dry_run=true")
    ? {
        ok: false,
      }
    : undefined;

const rulesForHasDefaultNotificationAndViewPermission = (payload: IAPICaller) =>
  payload.endpoint === "transport.request" && payload.data?.path?.startsWith("/_plugins/_im/lron")
    ? {
        ok: true,
        response: {
          lron_configs: [
            {
              lron_config: {
                lron_condition: {
                  success: true,
                  failure: true,
                },
                channels: [
                  {
                    id: "1",
                  },
                ],
              },
              id: "1",
            },
          ],
          total_number: 0,
        },
      }
    : undefined;

const rulesForNoDefaultNotificationHasViewPermission = (payload: IAPICaller) =>
  payload.endpoint === "transport.request" && payload.data?.path?.startsWith("/_plugins/_im/lron")
    ? {
        ok: true,
        response: {
          lron_configs: [
            {
              lron_config: {
                lron_condition: {},
                channels: [
                  {
                    id: "1",
                  },
                ],
              },
              id: "1",
            },
          ],
          total_number: 0,
        },
      }
    : undefined;

const rulesForNoViewPermission = (payload: IAPICaller) =>
  payload.endpoint === "transport.request" && payload.data?.path?.startsWith("/_plugins/_im/lron") ? { ok: false } : undefined;

const rulesForHasViewPermission = (payload: IAPICaller) =>
  payload.endpoint === "transport.request" && payload.data?.path?.startsWith("/_plugins/_im/lron")
    ? {
        ok: true,
        response: {
          lron_configs: [
            {
              lron_config: {
                lron_condition: {
                  success: true,
                  failure: true,
                },
                channels: [
                  {
                    id: "1",
                  },
                ],
              },
              id: "1",
            },
          ],
          total_number: 0,
        },
      }
    : undefined;

const rulesForBackup = () => ({ ok: true });

/**
 * xyz
 * x has view permission
 * y has create permission
 * z has default notification
 * all the combos:
 * 000, 010, 100, 101, 110, 111
 */
describe("<ChannelNotification /> spec", () => {
  beforeEach(() => {
    browserServicesMock.notificationService.getChannels = jest.fn(
      async (): Promise<any> => {
        return {
          ok: true,
          response: {
            start_index: 0,
            total_hits: 1,
            total_hit_relation: "eq",
            channel_list: [
              {
                config_id: "1",
                name: "1",
                description: "2",
                config_type: "chime",
                is_enabled: true,
              },
            ],
          },
        };
      }
    );
  });

  /**
   * 000
   */
  it("renders with no permission and no default notification", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => chainRules([payload], rulesForNoUpdatePermission, rulesForNoViewPermission, rulesForBackup)
    );
    const { container } = renderWithServiceAndCore({
      actionType: ActionType.RESIZE,
      operationType: OperationType.SHRINK,
    });
    await waitFor(() => expect(container.firstChild).toBeNull());
  });

  /**
   * 010
   */
  it("renders with create permission and no default notification", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => chainRules([payload], rulesForHasUpdatePermission, rulesForNoViewPermission, rulesForBackup)
    );
    const { container, queryByTestId, findByText } = renderWithServiceAndCore({
      actionType: ActionType.RESIZE,
      operationType: OperationType.SHRINK,
    });
    await waitFor(() => {
      expect(queryByTestId("sendAddtionalNotificationsCheckBox")).toBeNull();
    });
    await findByText("Send additional notifications when operation");
    expect(container).toMatchSnapshot();
  });

  /**
   * 100
   */
  it("renders with view permission and no default notification", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> =>
        chainRules([payload], rulesForNoUpdatePermission, rulesForNoDefaultNotificationHasViewPermission, rulesForBackup)
    );
    const { container } = renderWithServiceAndCore({
      actionType: ActionType.RESIZE,
      operationType: OperationType.SHRINK,
    });
    await waitFor(() => expect(container.firstChild).toBeNull());
  });

  /**
   * 101
   */
  it("renders with view permission and default notification", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> =>
        chainRules([payload], rulesForNoUpdatePermission, rulesForHasDefaultNotificationAndViewPermission, rulesForBackup)
    );
    const { container, queryByTestId, findByText } = renderWithServiceAndCore({
      actionType: ActionType.RESIZE,
      operationType: OperationType.SHRINK,
    });
    await waitFor(() => expect(queryByTestId("sendAddtionalNotificationsCheckBox")).toBeNull());
    await findByText("Notify when operation");
    expect(container).toMatchSnapshot();
  });

  /**
   * 110
   */
  it("renders with full permission and no default notification", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => chainRules([payload], rulesForHasUpdatePermission, rulesForNoViewPermission, rulesForBackup)
    );
    const { container, queryByTestId, queryByText, findByText, getByTestId, findByTestId } = renderWithServiceAndCore({
      actionType: ActionType.RESIZE,
      operationType: OperationType.SHRINK,
      hasButton: true,
    });
    await waitFor(() => expect(queryByTestId("sendAddtionalNotificationsCheckBox")).toBeNull());
    await waitFor(() => expect(queryByText("Notify when operation")).toBeNull());
    await findByText("Send additional notifications when operation");
    expect(container).toMatchSnapshot();

    await userEvent.click(getByTestId("notificationCustomConditionHasFailed"));
    await findByTestId("notificationCustomChannelsSelect");
    await userEvent.click(getByTestId("submit"));
    await findByText(VALIDATE_ERROR_FOR_CHANNELS);
    await userEvent.click(getByTestId("notificationCustomConditionHasFailed"));
    await waitFor(() => expect(queryByText(VALIDATE_ERROR_FOR_CHANNELS)).toBeNull());
  });

  /**
   * 111
   */
  it("renders with full permission and default notification", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => chainRules([payload], rulesForHasUpdatePermission, rulesForHasViewPermission, rulesForBackup)
    );
    const { container, findByText, findByTestId, queryByText, getByTestId } = renderWithServiceAndCore({
      actionType: ActionType.RESIZE,
      operationType: OperationType.SHRINK,
      hasButton: true,
    });
    await findByText("Notify when operation");
    await findByTestId("sendAddtionalNotificationsCheckBox");
    await waitFor(() => expect(queryByText("Send additional notifications when operation")).toBeNull());
    expect(container).toMatchSnapshot();

    await userEvent.click(getByTestId("sendAddtionalNotificationsCheckBox"));
    await findByText("Send additional notifications when operation");
    await userEvent.click(getByTestId("notificationCustomConditionHasFailed"));
    await findByTestId("notificationCustomChannelsSelect");
    await userEvent.type(
      getByTestId("notificationCustomChannelsSelect").querySelector('[data-test-subj="comboBoxSearchInput"]') as Element,
      "1{enter}"
    );
    await userEvent.click(getByTestId("submit"));
    await waitFor(() =>
      expect(browserServicesMock.commonService.apiCaller).toBeCalledWith({
        endpoint: "transport.request",
        data: {
          body: {
            lron_config: {
              lron_condition: {
                failure: true,
                success: false,
              },
              channels: [
                {
                  id: "1",
                },
              ],
              task_id: "1",
            },
          },
          method: "PUT",
          path: "/_plugins/_im/lron/LRON%3A1",
        },
      })
    );
  });
});
