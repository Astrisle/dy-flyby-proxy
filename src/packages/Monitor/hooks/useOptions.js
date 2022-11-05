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

  const preSaveHook = (data) => {
    data = formatObj(data, options.value);
    if (JSON.stringify(data) === JSON.stringify(options.value))
      throw new Error('导入文件结构不正确或无设置项更改');
    options.value = data;
  };

  watch(
    options,
    (n) => {
      saveLocalData(LOCAL_NAME, JSON.stringify(n));
    },
    { deep: true },
  );

  return { options, preSaveHook };
}
