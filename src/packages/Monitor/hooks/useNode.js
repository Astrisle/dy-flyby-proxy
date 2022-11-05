import { onMounted } from 'vue';

const fs = window.fs;
const ipc = window.ipcRenderer;

export function useNode(options) {
  const updateLogPath = async () => {
    //构建日志文件夹路径
    //let parentDir = await ipc.invoke('get-doc-path');
    //let dirLog = parentDir + '\\520-Logs';
    const dirLog = (await getUserDocumentPath()) + '\\520-Logs';
    //存储路径
    options.value.log.dir = dirLog;
  };

  //记录弹幕信息到本地文件
  const logToLocalFile = async (str, fileDir) => {
    //let fileDir = getFileDir(index, true);
    //let strToWrite = getMsgStruc(data, index);
    await fs.promises.appendFile(fileDir, str + '\n').catch(async (err) => {
      if (err.message.includes('ENOENT')) {
        await createFileDir(fileDir);
        logToLocalFile(str, fileDir);
      } else {
        console.log(err);
        window.dispatchEvent(new Event('fserror'));
      }
    });
  };

  const overwriteFile = async (str, path) => {
    await fs.promises.truncate(path).catch((err) => {
      if (err.message.includes('ENOENT')) return;
      else throw err;
    });
    await fs.promises.appendFile(path, str);
  };

  const getUserDocumentPath = async () => await ipc.invoke('get-doc-path');
  const getUserDesktopPath = async () => await ipc.invoke('get-desktop-path');
  const getFileSavePath = async () =>
    await ipc.invoke('get-settings-save-path');

  //创建文件夹(如不存在)
  const createFileDir = async (fileDir) => {
    await fs.promises.mkdir(fileDir, { recursive: true }).catch((err) => {
      console.log(err);
      window.dispatchEvent(new Event('fserror'));
    });
  };

  const logInit = async (dir, date, name) => {
    let fileDir = dir + '\\' + date + '_' + name + '.txt';
    let timeStr = new Date().toLocaleTimeString(['en-GB'], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    let initLogMsg =
      '==================================================\n' +
      '[Renderer] Application launched, start logging...\n' +
      'Current time: ' +
      date +
      ' ' +
      timeStr +
      '\n' +
      '==================================================\n';
    try {
      await fs.promises.appendFile(fileDir, initLogMsg);
    } catch (err) {
      console.log(err.message);
      // displayNotifyMessage(
      //   '文件系统',
      //   '日志文件初始化失败, 请反馈开发者, 具体错误可至控制台查看',
      // );
      window.dispatchEvent('fserror');
    }
  };

  onMounted(async () => {
    await updateLogPath();
    let dirLog = options.value.log.dir;
    let date = new Date();
    let dateStr =
      String(date.getFullYear()) +
      '-' +
      String(date.getMonth() + 1) +
      '-' +
      String(date.getDate());
    dirLog = dirLog + '\\' + dateStr;
    try {
      await fs.promises.mkdir(dirLog, { recursive: true });
    } catch (err) {
      console.log('Log init', err.message);
      window.dispatchEvent('fserror');
    }

    ['弹幕', '礼物', '特殊事件'].forEach(async (el) => {
      await logInit(dirLog, dateStr, el);
    });
  });

  return {
    getUserDocumentPath,
    getUserDesktopPath,
    updateLogPath,
    logToLocalFile,
    createFileDir,
    getFileSavePath,
    overwriteFile,
  };
}
