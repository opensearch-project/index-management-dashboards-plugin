/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext } from "react";

const DarkModeContext = createContext({ isDarkMode: false });

const DarkModeConsumer = DarkModeContext.Consumer;

export { DarkModeConsumer, DarkModeContext };
