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

import { EuiComboBoxOptionOption } from "@elastic/eui";
import { _EuiComboBoxProps } from "@elastic/eui/src/components/combo_box/combo_box";
import { CoreStart } from "opensearch-dashboards/public";
import { debounce } from "lodash";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import ComboBoxWithoutWarning from "../../../../components/ComboBoxWithoutWarning";
import { CoreServicesContext } from "../../../../components/core_services";
import { IndexSelectItem } from "../../models/interfaces";
import { filterByMinimatch } from "../../../../../utils/helper";
import { SYSTEM_ALIAS, SYSTEM_INDEX } from "../../../../../utils/constants";

interface IndexSelectProps extends Pick<_EuiComboBoxProps<IndexSelectItem>, "data-test-subj" | "placeholder"> {
  getIndexOptions: (searchValue: string) => Promise<Array<EuiComboBoxOptionOption<IndexSelectItem>>>;
  onChange: (options: string[]) => void;
  singleSelect: boolean;
  value?: string[];
  excludeSystemIndex?: boolean;
}

export default function IndexSelect(props: IndexSelectProps) {
  const [indexOptions, setIndexOptions] = useState([] as Array<EuiComboBoxOptionOption<IndexSelectItem>>);
  const coreServices = useContext(CoreServicesContext) as CoreStart;
  const destroyRef = useRef(false);

  const searchIndex = (searchValue?: string) => {
    props
      .getIndexOptions(searchValue ? searchValue : "")
      .then((options) => {
        if (props.excludeSystemIndex) filterSystemIndices(options);
        if (!destroyRef.current) {
          setIndexOptions(options);
        }
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
    [props.getIndexOptions, props.excludeSystemIndex]
  );

  useEffect(() => {
    return () => {
      destroyRef.current = true;
    };
  }, []);

  const onSearchChangeRef = useRef(
    debounce(
      (searchValue: string) => {
        searchIndex(searchValue);
      },
      200,
      {
        leading: true,
      }
    )
  );

  const filterSystemIndices = (list: Array<EuiComboBoxOptionOption<IndexSelectItem>>) => {
    list.map((it) => {
      it.options = it.options?.filter((item) => !filterByMinimatch(item.label, SYSTEM_ALIAS));
      it.options = it.options?.filter((item) => !filterByMinimatch(item.label, SYSTEM_INDEX));
    });
  };

  const flattenedOptions = useMemo(
    () =>
      indexOptions.reduce(
        (total, current) => [...total, ...(current.options || [])],
        [] as Array<EuiComboBoxOptionOption<IndexSelectItem>>
      ),
    [indexOptions]
  );

  const finalSelectedOptions: Array<EuiComboBoxOptionOption<IndexSelectItem>> =
    props.value
      ?.map((item) => flattenedOptions.find((option) => option.label === item) as EuiComboBoxOptionOption<IndexSelectItem>)
      .filter((item) => item) || [];

  return (
    <div>
      <ComboBoxWithoutWarning
        data-test-subj={props["data-test-subj"]}
        placeholder={props.placeholder}
        options={indexOptions}
        async
        selectedOptions={finalSelectedOptions}
        onChange={(selectedOptions) => props.onChange(selectedOptions.map((item) => item.label))}
        onSearchChange={onSearchChangeRef.current}
        isClearable={true}
        singleSelection={props.singleSelect ? { asPlainText: true } : false}
      />
    </div>
  );
}
