/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBox, EuiComboBoxOptionOption } from "@elastic/eui";
import { _EuiComboBoxProps } from "@elastic/eui/src/components/combo_box/combo_box";
import { CoreStart } from "opensearch-dashboards/public";
import React, { useContext, useEffect, useState } from "react";
import { CoreServicesContext } from "../../../../components/core_services";
import { IndexSelectItem } from "../../models/interfaces";

interface IndexSelectProps extends Pick<_EuiComboBoxProps<IndexSelectItem>, "data-test-subj"> {
  getIndexOptions: (searchValue: string, excludeDataStreamIndex?: boolean) => Promise<EuiComboBoxOptionOption<IndexSelectItem>[]>;
  onSelectedOptions: (options: EuiComboBoxOptionOption<IndexSelectItem>[]) => void;
  singleSelect: boolean;
  selectedOption: EuiComboBoxOptionOption<IndexSelectItem>[];
  excludeDataStreamIndex?: boolean;
}

export default function IndexSelect(props: IndexSelectProps) {
  const [indexOptions, setIndexOptions] = useState([] as EuiComboBoxOptionOption<IndexSelectItem>[]);
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  useEffect(() => {
    props
      .getIndexOptions("", props.excludeDataStreamIndex)
      .then((options) => {
        setIndexOptions(options);
      })
      .catch((err) => {
        coreServices.notifications.toasts.addDanger(`fetch indices error ${err}`);
      });
  }, [props.getIndexOptions]);

  const onSearchChange = async (searchValue: string) => {
    if (searchValue.trim()) {
      props.getIndexOptions(searchValue, props.excludeDataStreamIndex).then((options) => {
        setIndexOptions(options);
      });
    }
  };

  return (
    <div>
      <EuiComboBox
        data-test-subj={props["data-test-subj"]}
        placeholder="Select indexes or data streams"
        options={indexOptions}
        async
        selectedOptions={props.selectedOption}
        onChange={props.onSelectedOptions}
        onSearchChange={onSearchChange}
        isClearable={true}
        singleSelection={props.singleSelect ? { asPlainText: true } : false}
      />
    </div>
  );
}
