/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */
import React, { useState, ChangeEvent } from "react";

import { EuiPopoverTitle, EuiFlexItem, EuiFlexGroup, EuiPopover, EuiSelect, EuiFieldNumber, EuiExpression } from "@elastic/eui";

// Rise the popovers above GuidePageSideNav
const POPOVER_STYLE = { zIndex: "200" };

export default () => {
  const [example1, setExample1] = useState({
    isOpen: false,
    value: "min_index_age",
  });

  const [example2, setExample2] = useState({
    value: 100,
    isOpen: false,
    description: "IS",
  });

  const openExample1 = () => {
    setExample1({
      ...example1,
      isOpen: true,
    });
    setExample2({
      ...example2,
      isOpen: false,
    });
  };

  const closeExample1 = () => {
    setExample1({
      ...example1,
      isOpen: false,
    });
  };

  const openExample2 = () => {
    setExample1({
      ...example1,
      isOpen: false,
    });
    setExample2({
      ...example2,
      isOpen: true,
    });
  };

  const closeExample2 = () => {
    setExample2({
      ...example2,
      isOpen: false,
    });
  };

  const changeExample1 = (event: ChangeEvent<HTMLSelectElement>) => {
    setExample1({
      ...example1,
      value: event.target.value,
    });
  };

  const changeExample2Value = (e: ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = parseInt(e.target.value, 10);
    setExample2({
      ...example2,
      value: isNaN(sanitizedValue) ? "" : sanitizedValue,
    });
  };

  const changeExample2Description = (event) => {
    setExample2({
      ...example2,
      description: event.target.value,
    });
  };

  const renderPopover1 = () => (
    <div style={POPOVER_STYLE}>
      <EuiPopoverTitle>When</EuiPopoverTitle>
      <EuiSelect
        compressed
        value={example1.value}
        onChange={changeExample1}
        options={[
          { value: "min_index_age", text: "min_index_age" },
          { value: "min_doc_count", text: "min_doc_count" },
          { value: "min_size", text: "min_size" },
          { value: "cron", text: "cron" },
        ]}
      />
    </div>
  );

  const renderPopover2 = () => (
    <div style={POPOVER_STYLE}>
      <EuiFlexGroup gutterSize="s">
        <EuiFlexItem grow={false} style={{ width: 150 }}>
          <EuiSelect compressed value={example2.description} onChange={changeExample2Description} options={[{ value: "is", text: "is" }]} />
        </EuiFlexItem>

        <EuiFlexItem grow={false} style={{ width: 100 }}>
          <EuiFieldNumber compressed value={example2.value} onChange={changeExample2Value} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </div>
  );

  return (
    <EuiFlexGroup gutterSize="s">
      <EuiFlexItem grow={false}>
        <EuiPopover
          id="popover1"
          button={<EuiExpression description="WHEN" value={example1.value} isActive={example1.isOpen} onClick={openExample1} />}
          isOpen={example1.isOpen}
          closePopover={closeExample1}
          panelPaddingSize="s"
          anchorPosition="downLeft"
        >
          {renderPopover1()}
        </EuiPopover>
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiPopover
          id="popover2"
          panelPaddingSize="s"
          button={
            <EuiExpression description={example2.description} value={example2.value} isActive={example2.isOpen} onClick={openExample2} />
          }
          isOpen={example2.isOpen}
          closePopover={closeExample2}
          anchorPosition="downLeft"
        >
          {renderPopover2()}
        </EuiPopover>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
