/*
 *   Copyright OpenSearch Contributors
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DetailLink } from "./DetailLink";
import { ErrorToastContentForJob } from "./ErrorToastContentForJob";
import { FormatResourceWithClusterInfo, FormatResourcesWithClusterInfo } from "./FormatResourceWithClusterInfo";

describe("<DetailLink /> spec", () => {
  it("render with default props", async () => {
    const { container } = render(<DetailLink index="index" />);
    expect(container).toMatchSnapshot();
  });

  it("render with writing index", async () => {
    const { container } = render(<DetailLink index="index" writingIndex="writingIndex" />);
    expect(container).toMatchSnapshot();
  });

  it("render with cluster info", async () => {
    const { container } = render(
      <DetailLink
        index="index"
        writingIndex="writingIndex"
        clusterInfo={{
          cluster_name: "cluster_name",
        }}
      />
    );
    expect(container).toMatchSnapshot();
  });
});

describe("<ErrorToastContentForJob /> spec", () => {
  it("render with default props", async () => {
    const { container } = render(<ErrorToastContentForJob />);
    expect(container).toMatchSnapshot();
  });

  it("render with action", async () => {
    const { container, getByText, findByText } = render(<ErrorToastContentForJob shortError="shortError" fullError="fullError" />);
    expect(container).toMatchSnapshot();
    await userEvent.click(getByText("See full error"));
    await findByText("fullError");
  });
});

describe("<FormatResourceWithClusterInfo /> spec", () => {
  it("render with default props", async () => {
    const { container } = render(<FormatResourceWithClusterInfo resource="index" />);
    expect(container).toMatchSnapshot();
  });

  it("render with cluster info", async () => {
    const { container } = render(
      <FormatResourceWithClusterInfo
        resource="index"
        clusterInfo={{
          cluster_name: "cluster_name",
        }}
      />
    );
    expect(container).toMatchSnapshot();
  });
});

describe("<FormatResourcesWithClusterInfo /> spec", () => {
  it("render with default props", async () => {
    const { container } = render(<FormatResourcesWithClusterInfo resources={["index", "index1", "index2"]} />);
    expect(container).toMatchSnapshot();
  });

  it("render with cluster info", async () => {
    const { container } = render(
      <FormatResourcesWithClusterInfo
        resources={["index", "index1", "index2"]}
        clusterInfo={{
          cluster_name: "cluster_name",
        }}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
