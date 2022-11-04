<template>
  <el-container style="-webkit-app-region: drag">
    <el-main>
      <el-row
        class="mb-1"
        :gutter="5"
      >
        <el-col :span="14">
          <el-card class="bg">
            <div class="monitor">
              <Danmaku
                :style="{ height: heightUpper + 'px' }"
                :options="options"
                :danmakuList="danmakuList"
                @addToVIP="addToVIP"
                @addToBan="addToBan"
              ></Danmaku>
            </div>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card class="bg">
            <div
              class="monitor"
              @click.right.prevent="onClickMonitor"
            >
              <Gift
                :style="{ height: heightUpper + 'px' }"
                :options="options"
                :giftList="giftList"
                :allGiftData="allGiftData"
              ></Gift>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="5">
        <el-col :span="14">
          <el-card class="bg no-drag">
            <div
              class="monitor"
              @click.right.prevent="onClickMonitor"
            >
              <Danmakuvip
                :style="{ height: heightLower + 'px' }"
                :options="options"
                :danmakuList="danmakuListVIP"
              ></Danmakuvip>
            </div>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card class="bg no-drag">
            <div
              class="monitor"
              @click.right.prevent="onClickMonitor"
            >
              <GiftUnfiltered
                :style="{ height: heightLower + 'px' }"
                :options="options"
                :giftListUnfiltered="giftListUnfiltered"
                :allGiftData="allGiftData"
              ></GiftUnfiltered>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
  <el-drawer
    v-model="isShowOption"
    direction="ltr"
    size="33%"
    custom-class="select-none"
    modal-class="no-drag"
    title="设置"
    :show-close="false"
    :with-header="false"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane name="general">
        <template #label>
          <el-icon><operation /></el-icon>
          <span>通用</span>
        </template>
        <el-form>
          <el-form-item label="面板背景颜色 & 不透明度">
            <el-color-picker
              show-alpha
              v-model="options.bgcolora"
            ></el-color-picker>
          </el-form-item>
          <el-form-item label="字号(12-30)">
            <el-input-number
              v-model="options.fontSize"
              :min="12"
              :max="30"
              controls-position="right"
              :step-strictly="true"
            >
            </el-input-number>
          </el-form-item>
          <el-form-item label="面板显示上限">
            <el-input-number
              v-model="options.threshold"
              :step="500"
              :min="500"
              controls-position="right"
              step-strictly="true"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="设置迁移">
            <el-upload
              class="mr-2"
              action="#"
              accept=".txt"
              :http-request="readOptionsFromUpload"
              :show-file-list="false"
            >
              <template #trigger>
                <el-button
                  type="primary"
                  plain
                  >导入设置</el-button
                >
              </template>
            </el-upload>
            <span>|</span>
            <el-button
              class="ml-2"
              type="primary"
              plain
              @click="saveOptionsWithDialog"
              >导出设置</el-button
            >
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane name="chat">
        <template #label>
          <el-icon><chat-dot-round /></el-icon>
          <span>弹幕</span>
        </template>
        <el-form>
          <el-form-item label="显示">
            <el-checkbox-group v-model="options.danmaku.show">
              <el-checkbox label="level">等级</el-checkbox>
              <el-checkbox label="noble">贵族</el-checkbox>
              <el-checkbox label="fans">粉丝牌</el-checkbox>
              <el-checkbox label="avatar">头像</el-checkbox>
              <el-checkbox label="roomAdmin">房管</el-checkbox>
              <el-checkbox label="diamond">钻粉</el-checkbox>
              <el-checkbox label="vip">VIP</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="记录Timecode">
            <el-switch v-model="options.log.recordTimecode" />
          </el-form-item>
          <el-form-item
            v-if="options.log.recordTimecode"
            label="TC偏移(分钟)"
          >
            <el-input-number
              v-model="options.log.timecodeOffset"
              :step="1"
              :min="-5"
              :max="5"
              controls-position="right"
              step-strictly="true"
            ></el-input-number>
          </el-form-item>
          <el-form-item
            v-if="options.log.recordTimecode"
            label="TC重置时间(小时, 下次生效)"
          >
            <el-input-number
              v-model="options.log.timecodeResetTimer"
              :step="1"
              :min="1"
              :max="12"
              controls-position="right"
              step-strictly="true"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="屏蔽等级">
            <el-input-number
              v-model="options.danmaku.ban.level"
              :step="1"
              :min="0"
              :max="150"
              controls-position="right"
              step-strictly="true"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="屏蔽关键词">
            <el-button
              type="primary"
              plain
              @click="showDialog(0)"
              :loading="isShowDialog"
              >管理</el-button
            >
          </el-form-item>
          <el-form-item label="屏蔽用户">
            <el-button
              type="primary"
              plain
              @click="showDialog(1)"
              :loading="isShowDialog"
              >管理</el-button
            >
          </el-form-item>
          <el-form-item label="特别关注">
            <el-button
              type="primary"
              plain
              @click="showDialog(2)"
              :loading="isShowDialog"
              >管理</el-button
            >
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane name="gift">
        <template #label>
          <el-icon><present /></el-icon>
          <span>礼物</span>
        </template>
        <el-form>
          <el-form-item label="显示">
            <el-checkbox-group v-model="options.gift.show">
              <el-checkbox label="giftImg">图标</el-checkbox>
              <el-checkbox label="level">等级</el-checkbox>
              <el-checkbox label="noble">贵族</el-checkbox>
              <el-checkbox label="fans">粉丝牌</el-checkbox>
              <el-checkbox label="avatar">头像</el-checkbox>
              <el-checkbox label="roomAdmin">房管</el-checkbox>
              <el-checkbox label="diamond">钻粉</el-checkbox>
              <el-checkbox label="vip">VIP</el-checkbox>
              <el-checkbox label="price">价值</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="过滤阈值">
            <el-input-number
              v-model="options.gift.ban.price"
              :min="0"
              :max="5000"
              :step="50"
              controls-position="right"
            >
            </el-input-number>
          </el-form-item>
          <el-form-item label="高亮阈值">
            <el-input-number
              v-model="options.gift.totalPrice"
              :min="0"
              :max="5000"
              :step="50"
              controls-position="right"
            >
            </el-input-number>
          </el-form-item>
          <el-form-item label="屏蔽关键词">
            <el-button
              type="primary"
              plain
              @click="showDialog(3)"
              :loading="isShowDialog"
              >管理</el-button
            >
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane name="exp">
        <template #label>
          <el-icon><MagicStick /></el-icon>
          <span>实验性功能</span>
        </template>
        <el-form>
          <el-form-item label="超粉团任务追踪">
            <el-switch v-model="options.taskTracking.enabled" />
          </el-form-item>
          <el-form-item label="单行模式">
            <el-switch v-model="options.taskTracking.inline" />
          </el-form-item>
          <el-form-item label="总是显示循环任务">
            <el-switch v-model="options.taskTracking.alwaysShowCircle" />
          </el-form-item>
          <el-form-item label="更新间隔(秒)">
            <el-input-number
              v-model="options.taskTracking.interval"
              :min="1"
              :max="60"
              :step="1"
              controls-position="right"
            >
            </el-input-number>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <div class="text-xs flex-auto">Recomposed by: 星落 | V2.3.17</div>
      <div class="text-xs flex-auto">
        Based on github: qianjiachun/douyu-monitor
      </div>
    </template>
  </el-drawer>
  <el-dialog
    v-model="isShowDialog"
    top="10vh"
  >
    <el-table
      :data="parseDialogData(dialogIndex)"
      max-height="330"
    >
      <el-table-column prop="name"></el-table-column>
      <el-table-column
        fixed="right"
        label="编辑"
        width="80"
      >
        <template #default="scope">
          <el-button
            type="text"
            size="small"
            @click="handleDeleteEl(dialogIndex, scope.row.name)"
          >
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-input
        v-model="strToAdd"
        class="w-32 mr-3 align-middle"
        placeholder="新关键词"
      >
      </el-input>
      <el-button
        class="align-middle"
        type="primary"
        plain
        @click="handleAddStr(dialogIndex)"
        >添加</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

import Danmaku from '../components/Danmaku/Danmaku.vue';
import Danmakuvip from '../components/DanmakuVIP/Danmaku.vue';
import Gift from '../components/Gift/Gift.vue';
import GiftUnfiltered from '../components/GiftUnfiltered/Gift.vue';

import {
  Operation,
  Present,
  ChatDotRound,
  MagicStick,
} from '@element-plus/icons-vue';

import { useNormalStyle } from '../hooks/useNormalStyle.js';
import { useWebsocket } from '../hooks/useWebsocket.js';
import { useOptions } from '../hooks/useOptions';
import { useFetch } from '../hooks/useFetch';
import { useNotification } from '../hooks/useNotification';

// import {
//   saveLocalData,
//   getLocalData,
//   deepCopy,
//   formatObj,
// } from '@/global/utils';
// import { defaultOptions } from '../options';

// const LOCAL_NAME = 'monitor_options';
const ipc = window.ipcRenderer;
const fs = window.fs;

const rid = 520;

let allGiftData = ref({});
let isShowOption = ref(false);
let isShowDialog = ref(false);
let superFansIntervalId = ref(0);
let desktopDir = ref('');
let dialogArrTmp = ref([]);
let dialogIndex = ref(0);
let strToAdd = ref('');
let activeTab = ref('general');

let heightDiff = ref(0);
let heightUpper = ref(0);
let heightLower = ref(0);

//let options = ref(deepCopy(defaultOptions));
let options = useOptions();
let {
  getRoomGiftData,
  getBpGiftData,
  getSingleSupplementGiftData,
  getSuperFansData,
} = useFetch(ipc, rid);
let { connectWs, danmakuList, danmakuListVIP, giftList, giftListUnfiltered } =
  useWebsocket(options, allGiftData, getSingleSupplementGiftData);
let { fontSizeStyle, avatarImgSizeStyle, bgColorValue } =
  useNormalStyle(options);

let displayNotifyMessage = useNotification(isShowDialog, isShowOption);

onMounted(async () => {
  // let localData = JSON.parse(getLocalData(LOCAL_NAME));
  // if (Object.prototype.toString.call(localData) !== '[object Object]') {
  //   localData = deepCopy(defaultOptions);
  // }
  // options.value = localData;

  // options.value = formatObj(options.value, defaultOptions);

  //窗口大小重新定位
  heightUpper.value = options.value.moduleSize.upper;
  heightLower.value = options.value.moduleSize.lower;
  window.addEventListener('resize', setNewHeight);

  // //监听fs错误
  // window.addEventListener('fserror', () => {
  //   displayNotifyMessage(
  //     '文件系统',
  //     '日志文件写入失败, 请反馈开发者, 具体错误可至控制台查看',
  //     'error',
  //   );
  // });

  // window.addEventListener('wserror', () => {
  //   displayNotifyMessage(
  //     '网络错误 - 需要手动关闭 ➡️',
  //     '网络连接中断, 正在尝试重新连接, 如长时间无反应请重启应用',
  //     'error',
  //     0,
  //   );
  // });

  // //监听超管信息
  // window.addEventListener('pg-message', (e) => {
  //   displayNotifyMessage(
  //     '超管信息 - 需要手动关闭 ➡️',
  //     e.detail.nn + ': ' + e.detail.txt,
  //     'warning',
  //     0,
  //   );
  // });

  // //监听处理失败未知礼物信息
  // window.addEventListener('unknown-gift', (e) => {
  //   displayNotifyMessage(
  //     '未知礼物',
  //     '礼物ID: ' + e.detail.id + ' 获取数据失败, 已记录至日志文件',
  //   );
  // });

  // window.addEventListener('host-enter', () => {
  //   displayNotifyMessage(
  //     '主播进入房间',
  //     'Timecode将会被记录到弹幕日志',
  //     'info',
  //   );
  // });

  // window.addEventListener('tc-reset', () => {
  //   displayNotifyMessage('计时器重置', 'Timecode计时器已重置', 'info');
  // });

  //创建日志文件夹
  await resetLogPath();
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
    console.log(err.message);
    displayNotifyMessage(
      '文件系统',
      '无法创建日志文件夹, 请反馈开发者, 具体错误可至控制台查看',
      'error',
    );
  }

  //存储桌面路径
  desktopDir.value = await ipc.invoke('get-desktop-path');

  await logInit(dirLog, dateStr, '弹幕');
  await logInit(dirLog, dateStr, '礼物');
  await logInit(dirLog, dateStr, '特殊事件');

  let data = await getRoomGiftData(rid);
  let giftData = await getBpGiftData();
  let roomGiftData = { prefix: 'https://gfs-op.douyucdn.cn/dygift' };
  if ('giftList' in data.data) {
    for (let i = 0; i < data.data.giftList.length; i++) {
      let item = data.data.giftList[i];
      roomGiftData[item.id] = {
        n: item.name,
        pic: item.basicInfo.focusPic,
        pc: item.priceInfo.price,
      };
    }
  }
  allGiftData.value = { ...roomGiftData, ...giftData };
  connectWs(rid);
});

async function resetLogPath() {
  //构建日志文件夹路径
  let parentDir = await ipc.invoke('get-doc-path');
  let dirLog = parentDir + '\\520-Logs';
  //存储路径
  options.value.log.dir = dirLog;
}

async function checkAndWriteSuperFanStatus() {
  const data = await getSuperFansData();
  const path = desktopDir.value + '\\超粉任务数据.txt';
  let taskList = data.data.superfans.tasklist;
  let filtered = taskList.filter(
    (task) =>
      (task.taskstatus.status === 0 || task.taskdesc.circleStatus === 2) &&
      !task.taskdesc.name.includes('直播间'),
  );
  let enrtires = '';
  if (
    options.value.taskTracking.alwaysShowCircle === false &&
    filtered.length > 2
  ) {
    filtered = filtered.filter((task) => task.taskdesc.circleStatus === 0);
  }
  filtered.forEach((task) => {
    if (options.value.taskTracking.inline === true) {
      enrtires += superFansEntry(task) + '  ';
    } else {
      enrtires += superFansEntry(task) + '\n';
    }
  });
  try {
    await fs.promises.truncate(path).catch((err) => {
      if (err.message.includes('ENOENT')) return;
      else throw err;
    });
    await fs.promises.appendFile(path, enrtires);
  } catch (error) {
    console.log(err.message);
    displayNotifyMessage('文件系统', '临时文件写入失败');
  }
}

function superFansEntry(task) {
  const regex = /(?<=收到)(.*?)(?=价格|或等|礼物|有价)/g;
  const rawStr = task.taskdesc.name;
  let nameRes = rawStr.match(regex)[0].replace(/(\d{2,6})/g, '');
  if (task.taskdesc.circleStatus !== 0) nameRes += '(循环)';
  return nameRes + ' - ' + task.taskstatus.cur + ' / ' + task.taskstatus.max;
}

function showDialog(index) {
  dialogIndex.value = index;
  isShowDialog.value = true;
}

function handleDeleteEl(index, item) {
  switch (index) {
    case 0:
      options.value.danmaku.ban.keywords = options.value.danmaku.ban.keywords
        .split(' ')
        .filter((e) => e !== item)
        .join(' ');
      break;
    case 1:
      options.value.danmaku.ban.nicknames = options.value.danmaku.ban.nicknames
        .split(' ')
        .filter((e) => e !== item)
        .join(' ');
      break;
    case 2:
      options.value.danmaku.vip = options.value.danmaku.vip
        .split(' ')
        .filter((e) => e !== item)
        .join(' ');
      break;
    case 3:
      options.value.gift.ban.keywords = options.value.gift.ban.keywords
        .split(' ')
        .filter((e) => e !== item)
        .join(' ');
    default:
  }
}

function handleAddStr(index) {
  switch (index) {
    case 0:
      if (options.value.danmaku.ban.keywords === '') {
        options.value.danmaku.ban.keywords += strToAdd.value;
      } else {
        options.value.danmaku.ban.keywords =
          dialogArrTmp.value
            .map((obj) => {
              return obj.name;
            })
            .join(' ') +
          ' ' +
          strToAdd.value;
      }
      strToAdd.value = '';
      break;
    case 1:
      if (options.value.danmaku.ban.nicknames === '') {
        options.value.danmaku.ban.nicknames += strToAdd.value;
      } else {
        options.value.danmaku.ban.nicknames =
          dialogArrTmp.value
            .map((obj) => {
              return obj.name;
            })
            .join(' ') +
          ' ' +
          strToAdd.value;
      }
      strToAdd.value = '';
      break;
    case 2:
      if (options.value.danmaku.vip === '') {
        options.value.danmaku.ban.vip += strToAdd.value;
      } else {
        options.value.danmaku.vip =
          dialogArrTmp.value
            .map((obj) => {
              return obj.name;
            })
            .join(' ') +
          ' ' +
          strToAdd.value;
      }
      strToAdd.value = '';
      break;
    case 3:
      if (options.value.gift.ban.keywords === '') {
        options.value.gift.ban.keywords += strToAdd.value;
      } else {
        options.value.gift.ban.keywords =
          dialogArrTmp.value
            .map((obj) => {
              return obj.name;
            })
            .join(' ') +
          ' ' +
          strToAdd.value;
      }
      strToAdd.value = '';
      break;
    default:
  }
}

function parseDialogData(index) {
  switch (index) {
    case 0:
      let res0 = options.value.danmaku.ban.keywords.split(' ').map((str) => {
        return {
          name: str,
        };
      });
      dialogArrTmp.value = res0;
      if (res0.length === 1 && res0[0].name === '') return undefined;
      return res0;
    case 1:
      let res1 = options.value.danmaku.ban.nicknames.split(' ').map((str) => {
        return {
          name: str,
        };
      });
      dialogArrTmp.value = res1;
      if (res1.length === 1 && res1[0].name === '') return undefined;
      return res1;
    case 2:
      let res2 = options.value.danmaku.vip.split(' ').map((str) => {
        return {
          name: str,
        };
      });
      dialogArrTmp.value = res2;
      if (res2.length === 1 && res2[0].name === '') return undefined;
      return res2;
    case 3:
      let res3 = options.value.gift.ban.keywords.split(' ').map((str) => {
        return {
          name: str,
        };
      });
      dialogArrTmp.value = res3;
      if (res3.length === 1 && res3[0].name === '') return undefined;
      return res3;
  }
}

// function displayNotifyMessage(
//   title = '警告',
//   message,
//   type = 'warning',
//   duration = 3000,
// ) {
//   if (isShowDialog.value === true) isShowDialog.value = false;
//   if (isShowOption.value === true) isShowOption.value = false;
//   ElNotification({
//     title: title,
//     type: type,
//     message: message,
//     duration: duration,
//   });
// }

function setNewHeight() {
  heightDiff.value = document.documentElement.clientHeight - 590;
  heightUpper.value = 260 + heightDiff.value / 2;
  heightLower.value = 200 + heightDiff.value / 2;
  options.value.moduleSize.upper = heightUpper.value;
  options.value.moduleSize.lower = heightLower.value;
}

async function logInit(dir, date, name) {
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
    displayNotifyMessage(
      '文件系统',
      '日志文件初始化失败, 请反馈开发者, 具体错误可至控制台查看',
    );
  }
}

async function saveOptionsWithDialog() {
  const winPath = await ipc.invoke('get-settings-save-path');
  if (winPath.canceled) return;
  let optionsStr = JSON.stringify(options.value, null, 2);
  try {
    await fs.promises.truncate(winPath.filePath).catch((err) => {
      if (err.message.includes('ENOENT')) return;
      else throw err;
    });
    await fs.promises.appendFile(winPath.filePath, optionsStr);
    displayNotifyMessage('导出设置成功', '设置文件已存储到指定路径', 'success');
  } catch (err) {
    displayNotifyMessage('导出设置失败', '错误信息: ' + err.message, 'error');
  }
}

async function readOptionsFromUpload(res) {
  let resStr = await res.file.text();
  try {
    let resObj = JSON.parse(resStr);
    resObj = formatObj(resObj, options.value);
    if (JSON.stringify(resObj) === JSON.stringify(options.value))
      throw new Error('导入文件结构不正确或无设置项更改');
    options.value = resObj;
    await resetLogPath();
    displayNotifyMessage('导入设置成功', '设置已生效', 'success');
  } catch (err) {
    displayNotifyMessage('导入设置失败', err.message, 'error');
  }
}

function regExExactMatch(target, toMatch) {
  const pattern = `(?<= )(${target})(?= )`;
  const reg = new RegExp(pattern, 'g');
  return reg.test(' ' + toMatch + ' ');
}

function addToVIP(nn) {
  let bef = options.value.danmaku.vip;
  let ban = options.value.danmaku.ban.nicknames;
  if (!bef && !regExExactMatch(nn, ban)) {
    ElMessageBox.confirm('确认添加 ' + nn + ' 到特别关注？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      confirmButtonClass: 'is-plain',
    })
      .then(() => {
        options.value.danmaku.vip = nn;
      })
      .catch(() => {});
  } else {
    if (regExExactMatch(nn, bef)) {
      ElMessageBox.alert(nn + ' 已存在于特别关注中', '用户已存在', {
        confirmButtonText: '确定',
        closeOnClickModal: true,
        confirmButtonClass: 'is-plain',
      })
        .then(() => {})
        .catch(() => {});
    } else if (regExExactMatch(nn, ban)) {
      ElMessageBox.alert(
        nn + ' 已存在于屏蔽名单中, 请将其先从屏蔽名单中移除',
        '用户已存在',
        {
          confirmButtonText: '确定',
          closeOnClickModal: true,
          confirmButtonClass: 'is-plain',
        },
      )
        .then(() => {})
        .catch(() => {});
    } else
      ElMessageBox.confirm('确认添加 ' + nn + ' 到特别关注？', '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        confirmButtonClass: 'is-plain',
      })
        .then(() => {
          let aft = bef.concat(' ', nn);
          options.value.danmaku.vip = aft;
        })
        .catch(() => {});
  }
}

function addToBan(nn) {
  let bef = options.value.danmaku.ban.nicknames;
  let vip = options.value.danmaku.vip;
  if (!bef && !regExExactMatch(nn, vip)) {
    ElMessageBox.confirm('确认添加 ' + nn + ' 到屏蔽名单？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      confirmButtonClass: 'is-plain',
    })
      .then(() => {
        options.value.danmaku.ban.nicknames = nn;
      })
      .catch(() => {});
  } else {
    if (regExExactMatch(nn, bef)) {
      ElMessageBox.alert(nn + ' 已存在于屏蔽名单中', '用户已存在', {
        confirmButtonText: '确定',
        closeOnClickModal: true,
        confirmButtonClass: 'is-plain',
      })
        .then(() => {})
        .catch(() => {});
    } else if (regExExactMatch(nn, vip)) {
      ElMessageBox.alert(
        nn + ' 已存在于特别关注中, 请将其先从特别关注中移除',
        '用户已存在',
        {
          confirmButtonText: '确定',
          closeOnClickModal: true,
          confirmButtonClass: 'is-plain',
        },
      )
        .then(() => {})
        .catch(() => {});
    } else
      ElMessageBox.confirm('确认添加 ' + nn + ' 到屏蔽名单？', '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        confirmButtonClass: 'is-plain',
      })
        .then(() => {
          let aft = bef.concat(' ', nn);
          options.value.danmaku.ban.nicknames = aft;
        })
        .catch(() => {});
  }
}

// function getRoomGiftData() {
//   return new Promise((resolve) => {
//     fetch('https://gift.douyucdn.cn/api/gift/v3/web/list?rid=' + rid, {
//       method: 'GET',
//     })
//       .then((res) => {
//         return res.json();
//       })
//       .then((ret) => {
//         resolve(ret);
//       })
//       .catch((err) => {
//         ipc.invoke('err-quit', err.message);
//       });
//   });
// }

// function getGiftData() {
//   return new Promise((resolve) => {
//     fetch(
//       'https://webconf.douyucdn.cn/resource/common/prop_gift_list/prop_gift_config.json',
//       {
//         method: 'GET',
//         credentials: 'include',
//       },
//     )
//       .then((res) => {
//         return res.text();
//       })
//       .then((ret) => {
//         let json = ret.substring(
//           String('DYConfigCallback(').length,
//           ret.length,
//         );
//         json = json.substring(0, json.lastIndexOf(')'));
//         json = JSON.parse(json);
//         let obj = {};
//         for (const key in json.data) {
//           let item = json.data[key];
//           obj[key] = {
//             n: item.name,
//             pic: item.himg.replace('https://gfs-op.douyucdn.cn/dygift', ''),
//             pc: item.pc,
//           };
//         }
//         return obj;
//       })
//       .then((ret) => {
//         resolve(ret);
//       })
//       .catch((err) => {
//         ipc.invoke('err-quit', err.message);
//       });
//   });
// }

// function getSuperFansData() {
//   return new Promise((resolve) => {
//     fetch(
//       'https://www.douyu.com/japi/roomtask/superfans/getTaskStatus?rid=' + rid,
//       {
//         method: 'GET',
//       },
//     )
//       .then((res) => {
//         return res.json();
//       })
//       .then((ret) => {
//         resolve(ret);
//       })
//       .catch((err) => {
//         console.log(err);
//         resolve('500');
//       });
//   });
// }

function onClickMonitor() {
  isShowOption.value = true;
}

// watch(
//   options,
//   (n) => {
//     saveLocalData(LOCAL_NAME, JSON.stringify(n));
//   },
//   { deep: true },
// );

watch(
  () => options.value.taskTracking.enabled,
  (n, o) => {
    if (n !== o && n === false) clearInterval(superFansIntervalId.value);
    else if (n !== o && n === true) {
      superFansIntervalId.value = setInterval(
        () => checkAndWriteSuperFanStatus(),
        options.value.taskTracking.interval * 1000,
      );
      checkAndWriteSuperFanStatus();
    }
  },
);

watch(
  () => options.value.taskTracking.interval,
  (n, o) => {
    if (
      n !== o &&
      superFansIntervalId.value !== 0 &&
      options.value.taskTracking.enabled === true
    ) {
      clearInterval(superFansIntervalId.value);
      superFansIntervalId.value = setInterval(
        () => checkAndWriteSuperFanStatus(),
        options.value.taskTracking.interval * 1000,
      );
    }
  },
);

watch(
  [
    () => options.value.taskTracking.inline,
    () => options.value.taskTracking.alwaysShowCircle,
  ],
  () => {
    if (
      superFansIntervalId.value !== 0 &&
      options.value.taskTracking.enabled === true
    ) {
      checkAndWriteSuperFanStatus();
    }
  },
);
</script>

<style
  lang="scss"
  scoped
>
@import '@/global/styles/themes/index.scss';

.monitor {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: v-bind(fontSizeStyle);
  user-select: none;
  -webkit-app-region: no-drag;
}

.bg {
  background-color: v-bind(bgColorValue);
}
</style>

<style lang="scss">
.no-drag {
  -webkit-app-region: no-drag;
}
.avatar {
  width: v-bind(avatarImgSizeStyle);
  height: v-bind(avatarImgSizeStyle);
  border-radius: 50%;
}
</style>
