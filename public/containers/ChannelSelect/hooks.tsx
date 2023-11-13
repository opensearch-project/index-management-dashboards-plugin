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

import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { ServicesContext } from "../../services";
import { BrowserServices } from "../../models/interfaces";
import { FeatureChannelList, GetChannelsResponse } from "../../../server/models/interfaces";
import { ServerResponse } from "../../../server/models/types";

let listenCount = 0;
let promise: Promise<ServerResponse<GetChannelsResponse>> | undefined;
const LISTEN_KEY = "GET_CHANNELS_LISTEN";

const getChannels = async (props: { services: BrowserServices; force?: boolean }): Promise<ServerResponse<GetChannelsResponse>> => {
  if (promise) {
    return await promise;
  }
  try {
    promise = props.services.notificationService.getChannels();
    const result = await promise;
    window.dispatchEvent(new CustomEvent(LISTEN_KEY));
    return result;
  } catch (err) {
    return Promise.reject(err);
  }
};

export const useChannels = () => {
  const services = useContext(ServicesContext) as BrowserServices;
  const [channels, setChannels] = useState<FeatureChannelList[]>([]);
  const [loading, setLoading] = useState(true);
  const destroyRef = useRef<boolean>(false);
  const refresh = useCallback(
    (force?: boolean) => {
      setLoading(true);
      getChannels({
        services,
        force,
      })
        .then((res) => {
          if (destroyRef.current) {
            return;
          }
          if (res && res.ok) {
            setChannels(res.response.channel_list);
          }
        })
        .finally(() => {
          if (destroyRef.current) {
            return;
          }
          setLoading(false);
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const listenHandler = useCallback(() => {
    refresh();
  }, [refresh]);
  useEffect(
    () => {
      refresh();
      return () => {
        destroyRef.current = true;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    window.addEventListener(LISTEN_KEY, listenHandler);
    listenCount++;
    return () => {
      window.removeEventListener(LISTEN_KEY, listenHandler);
      listenCount--;
      if (listenCount === 0) {
        promise = undefined;
      }
    };
  }, [listenHandler]);

  return {
    channels,
    loading,
    refresh,
  };
};
