import { onMounted } from 'vue';

export function useNotification(isShowDialog, isShowOption) {
  const displayNotifyMessage = (
    title = '警告',
    message,
    type = 'warning',
    duration = 3000,
  ) => {
    if (isShowDialog.value === true) isShowDialog.value = false;
    if (isShowOption.value === true) isShowOption.value = false;
    ElNotification({
      title: title,
      type: type,
      message: message,
      duration: duration,
    });
  };

  onMounted(() => {
    //TODO further abstraction / optional
    //监听fs错误
    window.addEventListener('fserror', () => {
      displayNotifyMessage(
        '文件系统',
        '文件写入失败, 请反馈开发者, 具体错误可至控制台查看',
        'error',
      );
    });

    window.addEventListener('wserror', () => {
      displayNotifyMessage(
        '网络错误 - 需要手动关闭 ➡️',
        '网络连接中断, 正在尝试重新连接, 如长时间无反应请重启应用',
        'error',
        0,
      );
    });

    //监听超管信息
    window.addEventListener('pg-message', (e) => {
      displayNotifyMessage(
        '超管信息 - 需要手动关闭 ➡️',
        e.detail.nn + ': ' + e.detail.txt,
        'warning',
        0,
      );
    });

    //监听处理失败未知礼物信息
    window.addEventListener('unknown-gift', (e) => {
      displayNotifyMessage(
        '未知礼物',
        '礼物ID: ' + e.detail.id + ' 获取数据失败, 已记录至日志文件',
      );
    });

    window.addEventListener('host-enter', () => {
      displayNotifyMessage(
        '主播进入房间',
        'Timecode将会被记录到弹幕日志',
        'info',
      );
    });

    window.addEventListener('tc-reset', () => {
      displayNotifyMessage('计时器重置', 'Timecode计时器已重置', 'info');
    });
  });

  return { displayNotifyMessage };
}
