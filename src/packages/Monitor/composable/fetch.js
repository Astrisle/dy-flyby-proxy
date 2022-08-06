export function useFetch() {
  const getRoomGiftData = () => {
    return new Promise((resolve) => {
      fetch('https://gift.douyucdn.cn/api/gift/v3/web/list?rid=' + rid, {
        method: 'GET',
      })
        .then((res) => {
          return res.json();
        })
        .then((ret) => {
          resolve(ret);
        })
        .catch((err) => {
          ipc.invoke('err-quit', err.message);
        });
    });
  };

  const getBpGiftData = () => {
    return new Promise((resolve) => {
      fetch(
        'https://webconf.douyucdn.cn/resource/common/prop_gift_list/prop_gift_config.json',
        {
          method: 'GET',
          credentials: 'include',
        },
      )
        .then((res) => {
          return res.text();
        })
        .then((ret) => {
          let json = ret.substring(
            String('DYConfigCallback(').length,
            ret.length,
          );
          json = json.substring(0, json.lastIndexOf(')'));
          json = JSON.parse(json);
          let obj = {};
          for (const key in json.data) {
            let item = json.data[key];
            obj[key] = {
              n: item.name,
              pic: item.himg.replace('https://gfs-op.douyucdn.cn/dygift', ''),
              pc: item.pc,
            };
          }
          return obj;
        })
        .then((ret) => {
          resolve(ret);
        })
        .catch((err) => {
          ipc.invoke('err-quit', err.message);
        });
    });
  };

  const getSuperFansData = () => {
    return new Promise((resolve) => {
      fetch(
        'https://www.douyu.com/japi/roomtask/superfans/getTaskStatus?rid=' +
          rid,
        {
          method: 'GET',
        },
      )
        .then((res) => {
          return res.json();
        })
        .then((ret) => {
          resolve(ret);
        })
        .catch((err) => {
          console.log(err);
          resolve('500');
        });
    });
  };

  return { getRoomGiftData, getBpGiftData, getSuperFansData };
}
