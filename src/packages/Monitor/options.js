export const defaultOptions = {
  //背景颜色(包含alpha)
  bgcolora: 'rgba(255,255,255,0.7)',
  // 纵向column 横向row
  moduleSize: {
    upper: 260,
    lower: 200,
  },
  // 数据阈值
  threshold: 1000,
  // 字号
  fontSize: 14,
  //超粉团任务监控
  taskTracking: {
    enabled: false,
    interval: 5,
  },
  // 弹幕设置
  danmaku: {
    // 设置弹幕显示内容，如果在数组里就显示
    // level:等级  avatar:头像  fans:粉丝牌  noble:贵族  roomAdmin:房管  diamond:钻粉
    show: ['level', 'avatar', 'fans', 'noble', 'roomAdmin', 'diamond', 'vip'],
    // 屏蔽项
    ban: {
      level: 0, // 等级
      keywords: '', // 关键词
      nicknames: '', // 关键昵称
    },
    vip: '',
  },
  // 礼物设置
  gift: {
    // 高亮价格
    totalPrice: 100,
    show: [
      'giftImg',
      'level',
      'avatar',
      'fans',
      'noble',
      'roomAdmin',
      'diamond',
      'vip',
    ],
    // 屏蔽项
    ban: {
      // 价格低于
      price: 50,
      // 礼物名称
      keywords: '',
    },
  },
  log: {
    dir: '',
  },
};
