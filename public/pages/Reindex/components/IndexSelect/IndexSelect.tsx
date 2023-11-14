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

import { EuiComboBoxOptionOption } from "@elastic/eui";
import { _EuiComboBoxProps } from "@elastic/eui/src/components/combo_box/combo_box";
import { CoreStart } from "opensearch-dashboards/public";
import React, { useContext, useEffect, useState } from "react";
import ComboBoxWithoutWarning from "../../../../components/ComboBoxWithoutWarning";
import { CoreServicesContext } from "../../../../components/core_services";
import { IndexSelectItem } from "../../models/interfaces";
import { filterOverlaps } from "../../utils/helper";
import { filterByMinimatch } from "../../../../../utils/helper";
import { SYSTEM_ALIAS, SYSTEM_INDEX } from "../../../../../utils/constants";

interface IndexSelectProps extends Pick<_EuiComboBoxProps<IndexSelectItem>, "data-test-subj" | "placeholder"> {
  getIndexOptions: (searchValue: string, excludeDataStreamIndex?: boolean) => Promise<Array<EuiComboBoxOptionOption<IndexSelectItem>>>;
  onSelectedOptions: (options: Array<EuiComboBoxOptionOption<IndexSelectItem>>) => void;
  singleSelect: boolean;
  selectedOption: Array<EuiComboBoxOptionOption<IndexSelectItem>>;
  excludeDataStreamIndex?: boolean;
  excludeList?: Array<EuiComboBoxOptionOption<IndexSelectItem>>;
  excludeSystemIndex?: boolean;
}

export default function IndexSelect(props: IndexSelectProps) {
  const [indexOptions, setIndexOptions] = useState([] as Array<EuiComboBoxOptionOption<IndexSelectItem>>);
  const coreServices = useContext(CoreServicesContext) as CoreStart;

  const searchIndex = (searchValue?: string) => {
    props
      .getIndexOptions(searchValue ? searchValue : "", props.excludeDataStreamIndex)
      .then((options) => {
        if (props.excludeSystemIndex) filterSystemIndices(options);
        setIndexOptions(filterOverlaps(options, props.excludeList));
      })
      .catch((err) => {
        coreServices.notifications.toasts.addDanger(`fetch indices error ${err}`);
      });
  };

  useEffect(
    () => {
      searchIndex();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.getIndexOptions, props.excludeList, props.excludeDataStreamIndex, props.excludeSystemIndex]
  );

  const onSearchChange = (searchValue: string) => {
    searchIndex(searchValue);
  };

  const filterSystemIndices = (list: Array<EuiComboBoxOptionOption<IndexSelectItem>>) => {
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
