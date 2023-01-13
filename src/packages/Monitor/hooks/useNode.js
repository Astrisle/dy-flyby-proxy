import { onMounted } from 'vue';

const fs = window.fs;
const ipc = window.ipcRenderer;

export function useNode(options) {
  const updateLogPath = async () => {
    const dirLog = (await getUserDocumentPath()) + '\\520-Logs';
    options.value.log.dir = dirLog;
  };

  //记录弹幕信息到本地文件
  const logToLocalFile = async (str, pathObj) => {
    const path = pathObj.path;
    const fileName = pathObj.fileName;
    const fullPath = path + '\\' + fileName;

    await fs.promises.appendFile(fullPath, str + '\n').catch(async (err) => {
      if (err.message.includes('ENOENT')) {
        await createFileDir(path);
        logToLocalFile(str, pathObj);
      } else {
        console.log('ERR::LOG::IO - ', err, ', Target:', pathObj);
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

  const getUserDocumentPath = () => ipc.invoke('get-doc-path');
  const getUserDesktopPath = () => ipc.invoke('get-desktop-path');
  const getFileSavePath = () => ipc.invoke('get-settings-save-path');

  //创建文件夹(如不存在)
  const createFileDir = async (fileDir) => {
    await fs.promises.mkdir(fileDir, { recursive: true }).catch((err) => {
      console.log('ERR::ROOT::MD - ', err, ', Target: ', fileDir);
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
      console.log('ERR::OM::IO - ', err.message, ', Target: ', fileDir);
      window.dispatchEvent(new Event('fserror'));
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
      console.log('ERR::OM::MD - ', err.message, ', Target: ', dirLog);
      window.dispatchEvent(new Event('fserror'));
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
