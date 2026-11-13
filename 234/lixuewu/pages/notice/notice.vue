<template>
  <view class="page">
    <view class="intro">
      <image class="intro-bg" src="/static/wood.jpg" mode="aspectFill"></image>
      <view class="intro-mask"></view>
      <view class="intro-in">
        <text class="intro-k">STAY POLICY</text>
        <text class="intro-t">入住须知</text>
        <text class="intro-s">下单前请先阅读，确认订单即视为同意以下条款</text>
      </view>
    </view>

    <view class="sheet">
      <view class="group" v-for="(g, gi) in groups" :key="gi">
        <text class="g-label">{{ g.label }}</text>
        <view class="g-body">
          <view class="item" v-for="(it, ii) in g.items" :key="ii">
            <text class="item-k" v-if="it.k">{{ it.k }}</text>
            <view class="item-main">
              <text class="item-text" :class="{ strong: it.strong }">{{ it.text }}</text>
              <view class="tags" v-if="it.tags && it.tags.length">
                <text class="tag" :class="{ free: it.tone === 'free' }" v-for="t in it.tags" :key="t">{{ t }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="foot">
      <text class="foot-t">如有特殊安排（夜间到店、携带宠物、加床等），请提前联系前台</text>
      <button class="foot-btn" @tap="goBack">我已知晓</button>
    </view>
  </view>
</template>

<script>
const GROUPS = [
  {
    label: '入离时间',
    items: [
      { k: '入住时间', text: '14:00 至 24:00' },
      { k: '退房时间', text: '12:00 前' }
    ]
  },
  {
    label: '预订提示',
    items: [{ text: '订单需民宿确认后生效，确认结果以站内消息或短信通知为准。' }]
  },
  {
    label: '前台服务',
    items: [{ text: '前台 24 小时值班，夜间到店请提前 2 小时告知。' }]
  },
  {
    label: '接待提示',
    items: [
      { k: '年龄限制', text: '入住办理人需年满 18 岁' },
      { k: '可接待人群', text: '仅接待持有效居民身份证件的客人' }
    ]
  },
  {
    label: '宠物',
    items: [
      { text: '允许携带宠物，需提前联系民宿确认', tags: ['免费'], tone: 'free' },
      { text: '可携带：猫、狗及其他小型宠物' }
    ]
  },
  {
    label: '服务型动物',
    items: [{ text: '允许携带服务型动物（需提前联系民宿报备）' }]
  },
  {
    label: '早餐',
    items: [{ text: '民宿不提供早餐，可前往周边早餐铺用餐' }]
  },
  {
    label: '收费说明',
    items: [
      { text: '入住期间使用厨房需另付清洁费，具体金额请咨询前台', tags: ['非强制收费'] },
      { text: '入住不收取押金，退房当日结清房费即可' }
    ]
  },
  {
    label: '客房使用',
    items: [
      { k: '商业拍摄', text: '允许，需提前 3 天预约并告知用途' },
      { k: '做饭', text: '允许，需提前预约厨房并自备食材' },
      { k: '聚会', text: '允许小型聚会，22:00 后请保持安静' }
    ]
  },
  {
    label: '支付方式',
    items: [{ text: '支持下列方式付款', tags: ['微信支付', '支付宝', '银联卡'] }]
  },
  {
    label: '儿童及加床',
    items: [
      { text: '欢迎携带儿童入住', strong: true },
      { text: '17 岁及以下儿童使用现有床铺', tags: ['免费'], tone: 'free' },
      { text: '不同房型的加床与婴儿床政策不同，请以预订房型内政策为准' }
    ]
  },
  {
    label: '取消与退订',
    items: [
      { text: '待支付订单可直接取消，取消后其他客人可预定' },
      { text: '已支付订单如需退订，请在前台联系人工处理' }
    ]
  },
  {
    label: '安静时段',
    items: [{ text: '22:00 至次日 07:00 请降低音量，山间夜间请勿喧哗' }]
  }
]

export default {
  data() {
    return {
      groups: GROUPS
    }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages && pages.length > 1) {
        uni.navigateBack({
          fail: () => uni.reLaunch({ url: '/pages/index/index' })
        })
      } else {
        uni.reLaunch({ url: '/pages/index/index' })
      }
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 0 24rpx 60rpx;
  box-sizing: border-box;
  background-color: #f6f1e8;
  background-image: linear-gradient(rgba(246, 241, 232, 0.92), rgba(246, 241, 232, 0.97)), url('/static/paper.jpg');
  background-size: cover;
  background-position: center top;
  background-attachment: fixed;
}

/* 顶部标题条 */
.intro {
  position: relative;
  margin: 0 -24rpx 26rpx;
  padding: 44rpx 34rpx 40rpx;
  border-radius: 0 0 34rpx 34rpx;
  overflow: hidden;
}
.intro-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.intro-mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(26, 16, 9, 0.86), rgba(58, 36, 22, 0.56) 55%, rgba(26, 16, 9, 0.88));
}
.intro-in {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
}
.intro-k {
  font-size: 20rpx;
  letter-spacing: 6rpx;
  color: rgba(255, 236, 214, 0.62);
}
.intro-t {
  margin-top: 12rpx;
  font-size: 46rpx;
  font-weight: 700;
  letter-spacing: 3rpx;
  color: #fff6e9;
  text-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.35);
}
.intro-s {
  margin-top: 12rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: rgba(255, 238, 220, 0.82);
}

/* 条款卡片 */
.sheet {
  background: #fffdf9;
  border-radius: 26rpx;
  padding: 8rpx 26rpx;
  box-shadow: 0 12rpx 30rpx rgba(91, 62, 43, 0.09);
}
.group {
  display: flex;
  padding: 26rpx 0;
  border-bottom: 2rpx dashed #efe4d3;
}
.group:last-child {
  border-bottom: none;
}
.g-label {
  flex: none;
  width: 168rpx;
  padding-right: 12rpx;
  box-sizing: border-box;
  font-size: 24rpx;
  font-weight: 600;
  color: #33281f;
  line-height: 1.5;
}
.g-body {
  flex: 1;
  min-width: 0;
}
.item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12rpx;
}
.item:last-child {
  margin-bottom: 0;
}
.item-k {
  flex: none;
  width: 150rpx;
  font-size: 23rpx;
  color: #8a7f73;
  line-height: 1.65;
}
.item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.item-text {
  font-size: 24rpx;
  line-height: 1.65;
  color: #4a423b;
}
.item-text.strong {
  font-weight: 600;
  color: #33281f;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-left: 12rpx;
}
.tag {
  font-size: 19rpx;
  line-height: 1.5;
  padding: 3rpx 12rpx;
  border-radius: 8rpx;
  background: #faf3e6;
  border: 1rpx solid #ecdcc2;
  color: #a5702c;
}
.tag.free {
  background: #eaf3ec;
  border-color: #cfe3d4;
  color: #4a7c59;
}

/* 底部 */
.foot {
  margin-top: 26rpx;
  padding: 0 6rpx;
}
.foot-t {
  display: block;
  font-size: 21rpx;
  line-height: 1.6;
  color: #a89a89;
  text-align: center;
}
.foot-btn {
  margin-top: 22rpx;
  height: 84rpx;
  line-height: 84rpx;
  font-size: 28rpx;
  letter-spacing: 2rpx;
  border-radius: 42rpx;
  color: #fff;
  background: linear-gradient(135deg, #8a5f3e, #5b3e2b);
  box-shadow: 0 8rpx 20rpx rgba(91, 62, 43, 0.22);
}
.foot-btn::after {
  border: none;
}
</style>
