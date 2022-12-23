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
import { filterOverlaps } from "../../utils/helper";

interface IndexSelectProps extends Pick<_EuiComboBoxProps<IndexSelectItem>, "data-test-subj"> {
  getIndexOptions: (searchValue: string, excludeDataStreamIndex?: boolean) => Promise<EuiComboBoxOptionOption<IndexSelectItem>[]>;
  onSelectedOptions: (options: EuiComboBoxOptionOption<IndexSelectItem>[]) => void;
  singleSelect: boolean;
  selectedOption: EuiComboBoxOptionOption<IndexSelectItem>[];
  excludeDataStreamIndex?: boolean;
  excludeList?: EuiComboBoxOptionOption<IndexSelectItem>[];
}

export default function IndexSelect(props: IndexSelectProps) {
  const [indexOptions, setIndexOptions] = useState([] as EuiComboBoxOptionOption<IndexSelectItem>[]);
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  const searchIndex = (searchValue?: string) => {
    props
      .getIndexOptions(searchValue ? searchValue : "", props.excludeDataStreamIndex)
      .then((options) => {
        setIndexOptions(filterOverlaps(options, props.excludeList));
      })
      .catch((err) => {
        coreServices.notifications.toasts.addDanger(`fetch indices error ${err}`);
      });
  };

  useEffect(() => {
    searchIndex();
  }, [props.getIndexOptions, props.excludeList, props.excludeDataStreamIndex]);

  const onSearchChange = (searchValue: string) => {
    searchIndex(searchValue);
  };

  return (
    <div>
      <EuiComboBox
        data-test-subj={props["data-test-subj"]}
        placeholder="Type or select indexes,data streams or aliases"
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
