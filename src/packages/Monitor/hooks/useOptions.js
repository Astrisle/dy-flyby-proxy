import { ref, watch } from 'vue';

import {
  saveLocalData,
  getLocalData,
  deepCopy,
  formatObj,
} from '@/global/utils';
import { defaultOptions } from '../options';

export function useOptions() {
  let options = ref(deepCopy(defaultOptions));

  const LOCAL_NAME = 'monitor_options';
  let localData = JSON.parse(getLocalData(LOCAL_NAME));
  if (Object.prototype.toString.call(localData) !== '[object Object]') {
    localData = deepCopy(defaultOptions);
  }
  options.value = localData;
  options.value = formatObj(options.value, defaultOptions);

  watch(
    options,
    (n) => {
      saveLocalData(LOCAL_NAME, JSON.stringify(n));
    },
    { deep: true },
  );

  return options;
}
