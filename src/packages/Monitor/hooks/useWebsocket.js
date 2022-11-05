import { ref } from 'vue';
import { Ex_WebSocket_UnLogin } from '@/global/utils/websocket.js';
import { STT } from '@/global/utils/stt.js';
import { getStrMiddle } from '@/global/utils';
import { nobleData } from '@/global/utils/dydata/nobleData.js';

const fs = window.fs;

export function useWebsocket(options, allGiftData, missingGiftFetch, logging) {
  let ws = null;
  let stt = new STT();
  let danmakuList = ref([]);
  let danmakuListVIP = ref([]);
  let giftList = ref([]);
  let giftListUnfiltered = ref([]);
  let targetRid = '520';
  let timeCodeStart = 0;

  const connectWs = (rid) => {
    if (rid === '') {
      return;
    }
    ws = new Ex_WebSocket_UnLogin(
      rid,
      (msg) => {
        handleMsg(msg);
      },
      () => {
        // 重连
        window.dispatchEvent(new Event('wserror'));
        ws = null;
        connectWs(rid);
      },
    );
  };

  const handleMsg = (msg) => {
    let msgType = getStrMiddle(msg, 'type@=', '/');
    if (!msgType) {
      return;
    }
    //debug
    // let excludes = [
    //   'anbc',
    //   'rnewbc',
    //   'uenter',
    //   'chatmsg',
    //   'dgb',
    //   'odfbc',
    //   'rndfbc',
    //   'spbc',
    //   'synexp',
    //   'dfrank',
    //   'noble_num_info',
    //   'qausrespond',
    //   'ranklist',
    //   'fswrank',
    //   'srres',
    //   'rtss_update',
    //   'framl',
    //   'rri',
    //   'tsboxb',
    //   'rankup',
    //   'upgrade',
    //   'frank',
    //   'blab',
    //   'tsgs',
    //   'wiru',
    //   'lucky_wheel_star_pool',
    //   'cthn',
    //   'wirt',
    //   'defAltLogin',
    //   'dealtarlock',
    //   'yinpinshejiao',
    //   'qzs202207s2info',
    //   'anchorclub',
    //   'qzs202207',
    //   '202207_camp',
    //   'diamondfansv2',
    //   'gbroadcast',
    //   'rdfpbc',
    //   'musicopen',
    //   'voicelevel',
    //   'ro_date_succ',
    //   'romantic_screen',
    // ];

    // if (!excludes.includes(msgType)) {
    //   console.log(msgType);
    //   console.log(msg);
    //   let dataObj = stt.deserialize(msg);
    //   console.log(dataObj);
    // }

    if (msgType === 'chatmsg') {
      let data = stt.deserialize(msg);
      if (data.pg == '5') {
        window.dispatchEvent(
          new CustomEvent('pg-message', {
            detail: {
              nn: data.nn,
              txt: data.txt,
            },
          }),
        );
        logToLocalFile(
          {
            nn: data.nn,
            msg: '超管信息: ' + data.txt,
            dt: new Date().toLocaleTimeString(['en-GB'], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          },
          '特殊事件',
        );
        return;
      }
      logToLocalFile(data, '弹幕');
      if (!checkDanmakuValid(data)) {
        return;
      }
      let obj = {
        nn: data.nn, // 昵称
        avatar: data.ic, // 头像地址 https://apic.douyucdn.cn/upload/ + avatar + _small.jpg
        lv: data.level, // 等级
        txt: data.txt, // 弹幕内容
        //color: data.col, // 弹幕颜色 undefine就是普通弹幕 2蓝色 3绿色 6粉色 4橙色 5紫色 1红色
        fansName: data.bnn, // 粉丝牌名字
        fansLv: data.bl, // 粉丝牌等级
        diamond: data.diaf, // 是否是钻粉
        noble: data.nl, // 贵族等级
        //nobleC: data.nc, // 贵族弹幕是否开启，1开
        roomAdmin: data.rg, // 房管，data.rg为4则是房管
        //super: data.pg, // 超管，data.pg为5则为超管
        vip: data.ail
          ? data.ail.includes('/453/') || data.ail.includes('/454/')
          : undefined, // vip，如果是 453/则为vip  454/则为超级vip
        key: data.cid, // 时间戳
        dt: new Date().toLocaleTimeString(['en-GB'], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };
      if (danmakuList.value.length + 1 > options.value.threshold) {
        danmakuList.value.shift();
      }
      danmakuList.value.push(obj);
      if (checkDanmakuIsVIP(data)) {
        if (danmakuListVIP.value.length + 1 > options.value.threshold) {
          danmakuListVIP.value.shift();
        }
        danmakuListVIP.value.push(obj);
      }
    }

    if (
      [
        'dgb',
        'odfbc',
        'rndfbc',
        'anbc',
        'rnewbc',
        'blab',
        'fansupgradebroadcast',
        'professgiftsrc',
      ].includes(msgType)
    ) {
      let data = stt.deserialize(msg);
      let obj = {};
      switch (msgType) {
        case 'dgb':
          // 正常礼物
          handleNormalGifts(data);
          break;
        case 'odfbc':
          // 开通钻粉
          obj = {
            type: '钻粉',
            msg: '开通钻石粉丝',
            nn: data.nick,
            lv: data.level,
            gfid: '0',
            gfcnt: data.mn,
            hits: '1',
            avatar: data.icon, //头像
            fansName: data.bn, // 粉丝牌名字
            fansLv: data.fl, // 粉丝牌等级
            noble: data.nl !== '0' ? data.nl : undefined, // 贵族等级
            key: new Date().getTime() + Math.random(),
            dt: new Date().toLocaleTimeString(['en-GB'], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          };
          logToLocalFile(obj, '特殊事件');
          if (giftList.value.length + 1 > options.value.threshold) {
            giftList.value.shift();
          }
          giftList.value.push(obj);
          break;
        case 'rndfbc':
          // 续费钻粉
          obj = {
            type: '钻粉',
            msg: '续费钻石粉丝',
            nn: data.nick,
            lv: data.level,
            gfid: '0',
            gfcnt: data.mn,
            hits: '1',
            avatar: data.icon, //头像
            fansName: data.bn, // 粉丝牌名字
            fansLv: data.fl, // 粉丝牌等级
            noble: data.nl !== '0' ? data.nl : undefined, // 贵族等级
            key: new Date().getTime() + Math.random(),
            dt: new Date().toLocaleTimeString(['en-GB'], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          };
          logToLocalFile(obj, '特殊事件');
          if (giftList.value.length + 1 > options.value.threshold) {
            giftList.value.shift();
          }
          giftList.value.push(obj);
          break;
        case 'anbc':
          //开通贵族
          if (data.drid !== targetRid) return;
          obj = {
            type: '贵族',
            msg: '开通了 ' + nobleData[data.nl].name,
            nn: data.unk,
            nlv: data.nl,
            gfid: '0',
            gfcnt: '1',
            hits: '1',
            avatar: data.uic, //头像
            key: new Date().getTime() + Math.random(),
            dt: new Date().toLocaleTimeString(['en-GB'], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          };
          logToLocalFile(obj, '特殊事件');
          if (giftList.value.length + 1 > options.value.threshold) {
            giftList.value.shift();
          }
          giftList.value.push(obj);
          break;
        case 'rnewbc':
          //续费贵族
          if (data.drid !== targetRid) return;
          obj = {
            type: '贵族',
            msg: '续费了 ' + nobleData[data.nl].name,
            nn: data.unk,
            nlv: data.nl,
            gfid: '0',
            gfcnt: '1',
            hits: '1',
            key: new Date().getTime() + Math.random(),
            dt: new Date().toLocaleTimeString(['en-GB'], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          };
          logToLocalFile(obj, '特殊事件');
          if (giftList.value.length + 1 > options.value.threshold) {
            giftList.value.shift();
          }
          giftList.value.push(obj);
          break;
        case 'blab':
          //粉丝牌升级
          if (data.rid !== targetRid) return;
          if (data.bl >= 15) {
            obj = {
              type: '粉丝牌升级',
              msg: '粉丝牌升到 ' + String(data.bl) + ' 级',
              nn: data.nn,
              blv: data.bl,
              gfid: '0',
              gfcnt: '1',
              hits: '1',
              key: new Date().getTime() + Math.random(),
              dt: new Date().toLocaleTimeString(['en-GB'], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }),
            };
            logToLocalFile(obj, '特殊事件');
            giftList.value.push(obj);
          }
          break;
        case 'fansupgradebroadcast':
          //粉丝牌30以上升级
          //由于斗鱼的在configscreen下播报30级以上粉丝牌升级, 且存在名为"btype@="的子分类
          //因此getStrMiddle会将子分类解析为msgType, 针对30级以上粉丝牌升级的子分类为"fansupgradebroadcast"
          if (data.rid !== targetRid) return;
          obj = {
            type: '粉丝牌升级',
            msg: '粉丝牌升到 ' + String(data.otherContent) + ' 级',
            nn: data.userName,
            blv: data.otherContent,
            gfid: '0',
            gfcnt: '1',
            hits: '1',
            key: new Date().getTime() + Math.random(),
            dt: new Date().toLocaleTimeString(['en-GB'], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          };
          logToLocalFile(obj, '特殊事件');
          giftList.value.push(obj);
          break;
        //btype@=professgiftsrc/blackCate2s@=/avatar@=https:@S@Sapic.douyucdn.cn@Supload@Savatar_v3@S202110@S820640f2a68b47d8b7d1778abf894ce1_big.jpg/blackUids@=/type@=configscreen/rid@=520/userName@=AL丶星落/anchorName@=/blackRids@=/gbtemp@=1060/nrt@=0/txt2@=/txt3@=115963292/userLevelMin@=0/now@=1641916136386/txt1@=/blackCate1s@=/vsrc@=/otherContent@=test/
        case 'professgiftsrc':
          //告白烟花消息
          if (data.rid !== targetRid) return;
          obj = {
            type: '特殊礼物消息',
            msg:
              '特殊礼物消息: ' +
              (data.txt1 ? data.otherContent + data.txt1 : data.otherContent),
            nn: data.userName,
            rawmsg: data.txt1
              ? data.otherContent + data.txt1
              : data.otherContent,
            gfid: '0',
            gfcnt: '1',
            hits: '1',
            key: new Date().getTime() + Math.random(),
            dt: new Date().toLocaleTimeString(['en-GB'], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          };
          logToLocalFile(obj, '特殊事件');
          giftList.value.push(obj);
          break;
        default:
          break;
      }
    }
    if (msgType === 'uenter') {
      let data = stt.deserialize(msg);
      if (
        data.nn === '阿冷aleng丶' &&
        timeCodeStart === 0 &&
        options.value.log.recordTimecode
      ) {
        timeCodeStart = Date.now();
        setTimeout(() => {
          timeCodeStart = 0;
          window.dispatchEvent(new Event('tc-reset'));
        }, options.value.log.timecodeResetTimer * 3600 * 1000);
        window.dispatchEvent(new Event('host-enter'));
      }
      if (!checkDanmakuIsVIP(data)) {
        return;
      }
      let obj = {
        nn: data.nn, // 昵称
        avatar: data.ic, // 头像地址 https://apic.douyucdn.cn/upload/ + avatar + _small.jpg
        lv: data.level, // 等级
        txt: '进入了直播间', // 弹幕内容
        key: new Date().getTime() + Math.random(), // 时间戳
        dt: new Date().toLocaleTimeString(['en-GB'], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };
      if (danmakuListVIP.value.length + 1 > options.value.threshold) {
        danmakuListVIP.value.shift();
      }
      danmakuListVIP.value.push(obj);
    }
  };

  //记录弹幕信息到本地文件
  const logToLocalFile = async (data, index) => {
    let fileDir = getFileDir(index, true);
    let strToWrite = getMsgStruc(data, index);
    await logging(strToWrite, fileDir);
    // await fs.promises
    //   .appendFile(fileDir, strToWrite + '\n')
    //   .catch(async (err) => {
    //     if (err.message.includes('ENOENT')) {
    //       await createFileDir(getFileDir());
    //       logToLocalFile(data, index);
    //     } else {
    //       console.log(err);
    //       window.dispatchEvent(new Event('fserror'));
    //     }
    //   });
  };

  //根据日期以及父目录生成路径与文件名
  const getFileDir = (index = undefined, isFullPath = false) => {
    let dir = options.value.log.dir;
    let date = new Date();
    let dateStr =
      String(date.getFullYear()) +
      '-' +
      String(date.getMonth() + 1) +
      '-' +
      String(date.getDate());
    dir = dir + '\\' + dateStr;
    if (isFullPath === true && !!index)
      return dir + '\\' + dateStr + '_' + index + '.txt';
    else return dir;
  };

  //创建文件夹(如不存在)
  // const createFileDir = async (fileDir) => {
  //   await fs.promises.mkdir(fileDir, { recursive: true }).catch((err) => {
  //     console.log(err);
  //     window.dispatchEvent(new Event('fserror'));
  //   });
  // };

  //生成日志消息本体
  const getMsgStruc = (data, index) => {
    let timeStr = null;
    let userNameStr = null;
    let fansDisplayStr = null;
    let msgContentStr = null;
    let giftIdStr = null;
    let giftNameStr = null;
    let giftCountStr = null;
    let giftPriceStr = null;
    let giftHits = null;
    let msgContent = null;
    let arrConcat = null;
    let strToWrite = null;
    switch (index) {
      case '弹幕':
        timeStr = new Date().toLocaleTimeString(['en-GB'], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        if (timeCodeStart !== 0 && options.value.log.recordTimecode) {
          let offset =
            Date.now() -
            timeCodeStart +
            options.value.log.timecodeOffset * 60 * 1000;
          if (offset >= 0) {
            let offsetStr = new Date(offset).toISOString().slice(11, 19);
            timeStr += ` / +${offsetStr}`;
          }
        }
        userNameStr = data.nn;
        msgContentStr = data.txt;
        fansDisplayStr = data.bnn ? '[' + data.bnn + '/' + data.bl + ']' : '';
        arrConcat = [
          timeStr,
          ' - ',
          fansDisplayStr,
          userNameStr,
          ': ',
          msgContentStr,
        ];
        strToWrite = ''.concat(...arrConcat);
        return strToWrite;
      //break not required
      case '礼物':
        let giftData = allGiftData.value[data.gfid];
        timeStr = data.dt;
        giftNameStr = giftData ? giftData.n : '未知礼物';
        userNameStr = data.nn;
        giftIdStr = data.gfid;
        giftCountStr = data.gfcnt;
        giftPriceStr = giftData
          ? giftData.pc
            ? giftData.pc / 100
            : 'N/A'
          : '未知';
        giftHits = data.hits;

        arrConcat = [
          timeStr,
          ' - ',
          '用户名: ',
          userNameStr,
          ' / ',
          '礼物ID: ',
          giftIdStr,
          ' / ',
          '礼物名: ',
          giftNameStr,
          ' / ',
          '礼物价值: ',
          giftPriceStr,
          ' / ',
          '礼物数量: ',
          giftCountStr,
          ' / ',
          '礼物连击数: ',
          giftHits,
        ];
        strToWrite = ''.concat(...arrConcat);
        return strToWrite;
      case '特殊事件':
        timeStr = data.dt;
        userNameStr = data.nn;
        if (data.type === '钻粉') msgContent = `${data.msg}*${data.gfcnt}`;
        else msgContent = data.msg;
        arrConcat = [timeStr, ' - ', userNameStr, ' - ', msgContent];
        strToWrite = ''.concat(...arrConcat);
        return strToWrite;
      default:
        break;
    }
  };

  const checkDanmakuValid = (data) => {
    // 判断屏蔽等级
    if (Number(data.level) <= Number(options.value.danmaku.ban.level)) {
      return false;
    }
    // 判断关键词
    let keywords = options.value.danmaku.ban.keywords
      ? options.value.danmaku.ban.keywords.trim()
      : '';
    if (keywords !== '') {
      let arr = keywords.split(' ');
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== '' && data.txt.indexOf(arr[i]) !== -1) {
          return false;
        }
      }
    }
    // 判断关键昵称
    let nicknames = options.value.danmaku.ban.nicknames
      ? options.value.danmaku.ban.nicknames.trim()
      : '';
    if (nicknames !== '') {
      let arr = nicknames.split(' ');
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== '' && data.nn === arr[i]) {
          return false;
        }
      }
    }
    return true;
  };

  //判断是否特别关注
  const checkDanmakuIsVIP = (data) => {
    let nicknames = options.value.danmaku.vip
      ? options.value.danmaku.vip.trim()
      : '';
    if (nicknames !== '') {
      let arr = nicknames.split(' ');
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== '' && data.nn === arr[i]) {
          return true;
        }
      }
    }
    return false;
  };

  //处理异常礼物(数据不存在)
  let lastHandledGfId = null;
  const handleMissingGift = async (data) => {
    //避免重复处理
    if (lastHandledGfId === data.gfid) {
      return;
    }
    lastHandledGfId = data.gfid;
    //获取数据以及处理
    let supData = await missingGiftFetch(data.gfid);
    if (supData !== '404' && supData !== '500') {
      allGiftData.value[data.gfid] = supData;
      handleNormalGifts(data);
    } else {
      data.dt = new Date().toLocaleTimeString(['en-GB'], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      logToLocalFile(data, '礼物');
      window.dispatchEvent(
        new CustomEvent('unknown-gift', {
          detail: {
            id: data.gfid,
          },
        }),
      );
    }
  };

  const checkGiftValid = (data, threshold) => {
    let giftData = allGiftData.value[data.gfid];
    //判断该礼物是否存在于接口数据中,如不存在则进行处理
    if (!giftData) {
      handleMissingGift(data);
      return false;
    }
    // 屏蔽荧光棒
    if (giftData.n.includes('荧光棒')) return false;
    // 屏蔽单价
    let expThreshold = threshold * 100;
    if (Number(giftData.pc) < expThreshold) {
      //判断连击或捆绑是否总值小于阈值, 如是, 则抛弃该礼物
      if (
        Number(giftData.pc) * Number(data.hits) < expThreshold &&
        Number(giftData.pc) * Number(data.gfcnt) < expThreshold
      ) {
        //console.log("valid: gift total value not valid")
        return false;
      }
    }
    // 屏蔽关键词
    let keywords = options.value.gift.ban.keywords
      ? options.value.gift.ban.keywords.trim()
      : '';
    if (keywords !== '') {
      let giftName = giftData.n;
      let arr = keywords.split(' ');
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== '' && giftName.indexOf(arr[i]) !== -1) {
          return false;
        }
      }
    }
    return true;
  };

  // const getSingleSupplementGiftData = (gfid) => {
  //   return new Promise((resolve) => {
  //     fetch('https://gift.douyucdn.cn/api/gift/v2/web/single?gid=' + gfid, {
  //       method: 'GET',
  //     })
  //       .then((res) => {
  //         return res.json();
  //       })
  //       .then((ret) => {
  //         let supGiftData = {};
  //         if ('giftList' in ret.data) {
  //           let item = ret.data.giftList[0];
  //           supGiftData = {
  //             n: item.name,
  //             pic: item.basicInfo.focusPic,
  //             pc: item.priceInfo.price,
  //           };
  //           resolve(supGiftData);
  //         } else {
  //           resolve('404');
  //         }
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         resolve('500');
  //       });
  //   });
  // };

  const handleNormalGifts = (data) => {
    if (!checkGiftValid(data, Number(options.value.gift.ban.price))) {
      if (checkGiftValid(data, 6)) {
        let obj = {
          nn: data.nn, // 昵称
          lv: data.level, // 等级
          gfid: data.gfid, // 礼物id 获取名字：allGiftData[item.gfid].n
          gfcnt: data.gfcnt, // 礼物数量
          hits: data.hits, // 连击
          key: new Date().getTime() + Math.random(),
          dt: new Date().toLocaleTimeString(['en-GB'], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        };
        if (data.bcnt !== 1) obj.hits = data.bcnt;
        logToLocalFile(obj, '礼物');
        giftListUnfiltered.value.forEach((item, i, arr) => {
          if (
            item.nn === obj.nn &&
            item.gfid === obj.gfid &&
            item.gfcnt === obj.gfcnt &&
            item.hits !== obj.hits
          ) {
            arr.splice(i, 1);
          }
        });
        if (giftListUnfiltered.value.length + 1 > options.value.threshold) {
          giftListUnfiltered.value.shift();
        }
        giftListUnfiltered.value.push(obj);
        return;
      } else return;
    }
    let obj = {
      type: '礼物',
      nn: data.nn, // 昵称
      lv: data.level, // 等级
      gfid: data.gfid, // 礼物id 获取名字：allGiftData[item.gfid].n
      gfcnt: data.gfcnt, // 礼物数量
      hits: data.hits, // 连击
      avatar: data.ic,
      fansName: data.bnn, // 粉丝牌名字
      fansLv: data.bl, // 粉丝牌等级
      diamond: data.diaf, // 是否是钻粉
      noble: data.nl, // 贵族等级
      roomAdmin: data.rg, // 房管，data.rg为4则是房管
      vip: data.ail == '453/' || data.ail == '454/',
      key: new Date().getTime() + Math.random(),
      dt: new Date().toLocaleTimeString(['en-GB'], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
    if (data.bcnt !== 1) obj.hits = data.bcnt;
    logToLocalFile(obj, '礼物');
    giftList.value.forEach((item, i, arr) => {
      if (
        item.nn === obj.nn &&
        item.gfid === obj.gfid &&
        item.gfcnt === obj.gfcnt &&
        item.hits !== obj.hits
      ) {
        arr.splice(i, 1);
      }
    });
    if (giftList.value.length + 1 > options.value.threshold) {
      giftList.value.shift();
    }
    giftList.value.push(obj);
  };

  return {
    connectWs,
    danmakuList,
    danmakuListVIP,
    giftList,
    giftListUnfiltered,
  };
}
