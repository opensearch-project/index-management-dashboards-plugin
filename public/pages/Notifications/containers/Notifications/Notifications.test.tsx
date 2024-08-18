/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MemoryRouter as Router, Route, RouteComponentProps, Switch } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Notifications from "./Notifications";
import { ServicesContext } from "../../../../services";
import { browserServicesMock, coreServicesMock } from "../../../../../test/mocks";
import { ROUTES } from "../../../../utils/constants";
import { CoreServicesContext } from "../../../../components/core_services";
import { getApplication, getNavigationUI, getUISettings } from "../../../../services/Services";

jest.mock("../../../services/Services", () => ({
  ...jest.requireActual("../../../services/Services"),
  getUISettings: jest.fn(),
  getApplication: jest.fn(),
  getNavigationUI: jest.fn(),
}));

beforeEach(() => {
  (getUISettings as jest.Mock).mockReturnValue({
    get: jest.fn().mockReturnValue(false), // or false, depending on your test case
  });
  (getApplication as jest.Mock).mockReturnValue({});

  (getNavigationUI as jest.Mock).mockReturnValue({});
});

function renderNotificationsWithRouter(initialEntries = [ROUTES.NOTIFICATIONS] as string[]) {
  return {
    ...render(
      <Router initialEntries={initialEntries}>
        <CoreServicesContext.Provider value={coreServicesMock}>
          <ServicesContext.Provider value={browserServicesMock}>
            <Switch>
              <Route path={ROUTES.NOTIFICATIONS} render={(props: RouteComponentProps) => <Notifications {...props} />} />
            </Switch>
          </ServicesContext.Provider>
        </CoreServicesContext.Provider>
      </Router>
    ),
  };
}

describe("<Notifications /> spec", () => {
  beforeEach(() => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        switch (payload.endpoint) {
          case "transport.request": {
            if (payload.data?.path?.startsWith("/_plugins/_im/lron")) {
              return {
                ok: true,
                response: {
                  lron_configs: [],
                  total_number: 0,
                },
              };
            } else {
              return {
                ok: true,
                response: {},
              };
            }
          }
        }
        return {
          ok: true,
          response: {},
        };
      }
    );
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
                name: "channel1",
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

  it("renders", async () => {
    const { container, findByText } = renderNotificationsWithRouter([ROUTES.NOTIFICATIONS]);
    await findByText("Notification settings");
    expect(container).toMatchSnapshot();
    await findByText("reindex");
  });

  it("Update notification settings", async () => {
    const { findByText, getByTestId, getByText, queryByTestId } = renderNotificationsWithRouter([ROUTES.NOTIFICATIONS]);
    await findByText("reindex");
    await userEvent.click(getByTestId("dataSource.0.failure"));
    await findByText("Save");
    await userEvent.click(getByText("Save"));
    await findByText("Address the following error(s) in the form");
    await userEvent.type(
      getByTestId("dataSource.0.channels")?.querySelector('[data-test-subj="comboBoxSearchInput"]') as Element,
      "channel1{enter}"
    );
    await userEvent.click(getByTestId("dataSource.0.failure"));
    await waitFor(
      () => {
        expect(queryByTestId("dataSource.0.channels")).toBeNull();
      },
      {
        timeout: 3000,
      }
    );
    await userEvent.click(getByTestId("dataSource.0.failure"));
    await waitFor(() => {
      expect(queryByTestId("dataSource.0.channels")).not.toBeNull();
    });

    await userEvent.click(getByText("Save"));
    await waitFor(() => {
      expect(coreServicesMock.notifications.toasts.addSuccess).toBeCalledWith(
        "Notifications settings for index operations have been successfully updated."
      );
    });
  });

  it("View without permission", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        switch (payload.endpoint) {
          case "transport.request": {
            if (payload.data?.path?.startsWith("/_plugins/_im/lron")) {
              return {
                ok: false,
                body: {
                  status: 403,
                },
              };
            } else {
              return {
                ok: true,
                response: {},
              };
            }
          }
        }
        return {
          ok: true,
          response: {},
        };
      }
    );
    const { findByText, container } = renderNotificationsWithRouter([ROUTES.NOTIFICATIONS]);
    await findByText("Error loading Notification settings");
    await waitFor(() => {
      expect(container).toMatchSnapshot();
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledWith({
        title: "You do not have permissions to view notification settings",
        text: "Contact your administrator to request permissions.",
      });
    });
  });

  it("Update without permission", async () => {
    browserServicesMock.commonService.apiCaller = jest.fn(
      async (payload): Promise<any> => {
        switch (payload.endpoint) {
          case "transport.request": {
            if (payload.data?.path?.includes("?dry_run=true")) {
              return {
                ok: false,
              };
            } else if (payload.data?.path?.startsWith("/_plugins/_im/lron")) {
              return {
                ok: true,
                response: {
                  lron_configs: [],
                  total_number: 0,
                },
              };
            } else {
              return {
                ok: true,
                response: {},
              };
            }
          }
        }
        return {
          ok: true,
          response: {},
        };
      }
    );
    const { findByText, getByTestId, getByText, queryByText } = renderNotificationsWithRouter([ROUTES.NOTIFICATIONS]);
    await findByText("reindex");
    await userEvent.click(getByTestId("dataSource.0.failure"));
    await findByText("Save");
    await userEvent.click(getByText("Save"));
    await waitFor(() =>
      expect(coreServicesMock.notifications.toasts.addDanger).toBeCalledWith({
        title: "You do not have permissions to update notification settings",
        text: "Contact your administrator to request permissions.",
      })
    );
    await userEvent.click(getByText("Cancel"));
    await waitFor(() => {
      expect(queryByText("Cancel")).toBeNull();
    });
  });

  it("Update with auto populate channels", async () => {
    const { container, findByText, getByTestId, findByTestId } = renderNotificationsWithRouter([ROUTES.NOTIFICATIONS]);
    await findByText("reindex");
    await userEvent.click(getByTestId("dataSource.0.failure"));
    await waitFor(() => {
      expect(getByTestId("dataSource.0.channels").querySelector(".euiLoadingSpinner")).toBeNull();
    });
    await userEvent.type(
      getByTestId("dataSource.0.channels")?.querySelector('[data-test-subj="comboBoxSearchInput"]') as Element,
      "channel1{enter}"
    );
    await userEvent.click(getByTestId("dataSource.1.failure"));
    await findByTestId("dataSource.1.channels");
    await waitFor(() => expect(container.querySelector(`[data-test-subj="dataSource.1.channels"] [title="channel1"]`)).toBeInTheDocument());
  });
});
