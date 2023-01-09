/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiComboBoxOptionOption } from "@elastic/eui";
import { _EuiComboBoxProps } from "@elastic/eui/src/components/combo_box/combo_box";
import { CoreStart } from "opensearch-dashboards/public";
import ComboBoxWithoutWarning from "../../../../components/ComboBoxWithoutWarning";
import React, { useContext, useEffect, useState } from "react";
import { CoreServicesContext } from "../../../../components/core_services";
import { IndexSelectItem } from "../../models/interfaces";
import { filterOverlaps } from "../../utils/helper";
import { filterByMinimatch } from "../../../../../utils/helper";
import { SYSTEM_ALIAS, SYSTEM_INDEX } from "../../../../../utils/constants";

interface IndexSelectProps extends Pick<_EuiComboBoxProps<IndexSelectItem>, "data-test-subj" | "placeholder"> {
  getIndexOptions: (searchValue: string, excludeDataStreamIndex?: boolean) => Promise<EuiComboBoxOptionOption<IndexSelectItem>[]>;
  onSelectedOptions: (options: EuiComboBoxOptionOption<IndexSelectItem>[]) => void;
  singleSelect: boolean;
  selectedOption: EuiComboBoxOptionOption<IndexSelectItem>[];
  excludeDataStreamIndex?: boolean;
  excludeList?: EuiComboBoxOptionOption<IndexSelectItem>[];
  excludeSystemIndex?: boolean;
}

export default function IndexSelect(props: IndexSelectProps) {
  const [indexOptions, setIndexOptions] = useState([] as EuiComboBoxOptionOption<IndexSelectItem>[]);
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  const searchIndex = (searchValue?: string) => {
    props
      .getIndexOptions(searchValue ? searchValue : "", props.excludeDataStreamIndex)
      .then((options) => {
        props.excludeSystemIndex && filterSystemIndices(options);
        setIndexOptions(filterOverlaps(options, props.excludeList));
      })
      .catch((err) => {
        coreServices.notifications.toasts.addDanger(`fetch indices error ${err}`);
      });
  };

  useEffect(() => {
    searchIndex();
  }, [props.getIndexOptions, props.excludeList, props.excludeDataStreamIndex, props.excludeSystemIndex]);

  const onSearchChange = (searchValue: string) => {
    searchIndex(searchValue);
  };

  const filterSystemIndices = (list: EuiComboBoxOptionOption<IndexSelectItem>[]) => {
    list.map((it) => {
      it.options = it.options?.filter((item) => !filterByMinimatch(item.label, SYSTEM_ALIAS));
      it.options = it.options?.filter((item) => !filterByMinimatch(item.label, SYSTEM_INDEX));
    });
  };

  return (
    <div>
      <ComboBoxWithoutWarning
        data-test-subj={props["data-test-subj"]}
        placeholder={props.placeholder}
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
