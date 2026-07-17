/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import "@testing-library/jest-dom";
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

// Only stub createObjectURL; keep the real URL constructor intact. jsdom 26 and
// query-string rely on `new URL(...)`, so replacing window.URL wholesale with a
// plain object breaks them ("URL is not a constructor").
window.URL.createObjectURL = () => "";

// https://github.com/elastic/eui/issues/2530
jest.mock("@elastic/eui/lib/eui_components/icon", () => ({
  EuiIcon: () => "EuiIconMock",
  __esModule: true,
  IconPropType: require("@elastic/eui/lib/eui_components/icon/icon").IconPropType,
  ICON_TYPES: require("@elastic/eui/lib/eui_components/icon/icon").TYPES,
  ICON_SIZES: require("@elastic/eui/lib/eui_components/icon/icon").SIZES,
  ICON_COLORS: require("@elastic/eui/lib/eui_components/icon/icon").COLORS,
}));

jest.setTimeout(60000); // in milliseconds

// jest-location-mock uses process.env.HOST as the base URL for its window.location mock.
// Set it to match testEnvironmentOptions.url so window.location.origin is 'http://localhost:5601'.
process.env.HOST = "http://localhost:5601";

// Mock window.matchMedia (used by Monaco editor and EUI). Keep configurable so
// individual tests can override it without hitting "Cannot redefine property".
Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// jsdom 26 marks window.localStorage and window.sessionStorage as non-configurable.
// Re-declare them as configurable once here so individual tests can override them
// with Object.defineProperty without hitting "Cannot redefine property" errors.
["localStorage", "sessionStorage"].forEach((key) => {
  const descriptor = Object.getOwnPropertyDescriptor(window, key);
  if (descriptor && !descriptor.configurable) {
    Object.defineProperty(window, key, {
      configurable: true,
      writable: true,
      value: descriptor.value,
    });
  }
});
