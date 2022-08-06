import { onMounted, onUnmounted } from 'vue';
import { ElNotification } from 'element-plus';

function displayNotifyMessage(
  title = '警告',
  message,
  type = 'warning',
  duration = 3000,
) {
  if (isShowDialog.value === true) isShowDialog.value = false;
  if (isShowOption.value === true) isShowOption.value = false;
  ElNotification({
    title: title,
    type: type,
    message: message,
    duration: duration,
  });
}

export function useNotification() {}
