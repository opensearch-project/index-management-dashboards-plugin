/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import "@testing-library/jest-dom/extend-expect";
import { configure } from "@testing-library/react";

configure({
  testIdAttribute: "data-test-subj",
  asyncUtilTimeout: 10000,
});

jest.mock("@elastic/eui/lib/eui_components/form/form_row/make_id", () => () => "some_make_id");

jest.mock("@elastic/eui/lib/services/accessibility/html_id_generator", () => ({
  htmlIdGenerator: () => {
    return () => "some_html_id";
  },
}));

// @ts-ignore
window.Worker = function () {
  this.postMessage = () => {};
  // @ts-ignore
  this.terminate = () => {};
};

// @ts-ignore
window.URL = {
  createObjectURL: () => {
    return "";
  },
};

// https://github.com/elastic/eui/issues/2530
jest.mock("@elastic/eui/lib/eui_components/icon", () => ({
  EuiIcon: () => "EuiIconMock",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  IconPropType: require("@elastic/eui/lib/eui_components/icon/icon").IconPropType,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ICON_TYPES: require("@elastic/eui/lib/eui_components/icon/icon").TYPES,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ICON_SIZES: require("@elastic/eui/lib/eui_components/icon/icon").SIZES,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ICON_COLORS: require("@elastic/eui/lib/eui_components/icon/icon").COLORS,
}));

jest.setTimeout(60000); // in milliseconds
