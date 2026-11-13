<template>
  <view class="page">
    <view class="intro">
      <image class="intro-bg" src="/static/wood.jpg" mode="aspectFill"></image>
      <view class="intro-mask"></view>
      <view class="intro-in">
        <text class="intro-k">FACILITIES</text>
        <text class="intro-t">服务及设施</text>
        <text class="intro-s">山野木屋里的每一处，都为慢下来准备</text>
      </view>
    </view>

    <view class="shots">
      <view class="shot" v-for="(s, si) in shots" :key="si">
        <image class="shot-img" :src="s.src" mode="aspectFill"></image>
        <view class="shot-tag">
          <text class="shot-tag-t">{{ s.label }}</text>
        </view>
      </view>
    </view>

    <view class="sheet">
      <view class="block" v-for="(b, bi) in blocks" :key="bi">
        <view class="b-head">
          <view class="b-bar"></view>
          <text class="b-title">{{ b.title }}</text>
          <text class="b-count">{{ b.items.length }} 项</text>
        </view>
        <view class="b-grid">
          <view
            class="fi"
            v-for="(it, ii) in b.items"
            :key="ii"
            :class="{ off: it.off }"
          >
            <text class="fi-icon">{{ it.off ? '×' : '✓' }}</text>
            <text class="fi-name">{{ it.n }}</text>
            <text class="fi-free" v-if="it.free">免费</text>
          </view>
        </view>
      </view>
    </view>

    <view class="foot">
      <text class="foot-t">带 × 的项目当前暂不提供，如有疑问请咨询前台</text>
      <view class="foot-link" @tap="goNotice">
        <text class="fl-t">查看入住须知</text>
        <text class="fl-arrow">›</text>
      </view>
      <button class="foot-btn" @tap="goHome">返回首页</button>
    </view>
  </view>
</template>

<script>
const SHOTS = [
  { src: '/static/facility/facility-1.jpg', label: '茶室' },
  { src: '/static/facility/facility-2.jpg', label: '观星露台' }
]

const BLOCKS = [
  {
    title: '设施服务',
    items: [
      { n: '公共停车位', free: true },
      { n: '独立观景阳台' },
      { n: '观星露台' },
      { n: '行李寄存', free: true },
      { n: '山泉直饮' },
      { n: '茶室' }
    ]
  },
  {
    title: '前台服务',
    items: [
      { n: '房东接待' },
      { n: '快速入住退房' },
      { n: '储物柜' },
      { n: '叫醒服务' },
      { n: '旅游咨询' },
      { n: '夜间值守' },
      { n: '电子身份证入住', off: true }
    ]
  },
  {
    title: '餐饮服务',
    items: [
      { n: '代订农家餐' },
      { n: '茶室茶席' },
      { n: '周边便利店' },
      { n: '正餐堂食', off: true }
    ]
  },
  {
    title: '娱乐设施',
    items: [
      { n: '观星台', free: true },
      { n: '山径徒步' },
      { n: '露天影幕' },
      { n: '篝火区' },
      { n: '庭院茶叙' }
    ]
  },
  {
    title: '公共区域',
    items: [
      { n: '公共区 WiFi', free: true },
      { n: '共享厨房' },
      { n: '户外家具' },
      { n: '庭院小院' },
      { n: '电梯', off: true }
    ]
  },
  {
    title: '清洁服务',
    items: [
      { n: '洗衣房' },
      { n: '洗衣服务' },
      { n: '开水供应', free: true },
      { n: '每日整理' }
    ]
  },
  {
    title: '安全与安保',
    items: [
      { n: '公共区域监控' },
      { n: '门禁密码锁' },
      { n: '灭火器' },
      { n: '烟雾报警器' },
      { n: '急救包' },
      { n: '应急照明' }
    ]
  }
]

export default {
  data() {
    return {
      shots: SHOTS,
      blocks: BLOCKS
    }
  },
  methods: {
    goNotice() {
      uni.navigateTo({ url: '/pages/notice/notice' })
    },
    goHome() {
      uni.reLaunch({ url: '/pages/index/index' })
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
  margin: 0 -24rpx 24rpx;
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

/* 实景图 */
.shots {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.shot {
  position: relative;
  flex: 1 1 300rpx;
  min-width: 0;
  aspect-ratio: 1100 / 733;
  min-height: 160rpx;
  border-radius: 18rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 24rpx rgba(91, 62, 43, 0.14);
}
.shot-img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.shot-tag {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 26rpx 0 10rpx;
  background: linear-gradient(transparent, rgba(18, 11, 5, 0.66));
}
.shot-tag-t {
  display: block;
  text-align: center;
  font-size: 22rpx;
  letter-spacing: 3rpx;
  color: #fff6e9;
}

/* 设施清单 */
.sheet {
  margin-top: 24rpx;
  background: #fffdf9;
  border-radius: 26rpx;
  padding: 8rpx 26rpx 20rpx;
  box-shadow: 0 12rpx 30rpx rgba(91, 62, 43, 0.09);
}
.block {
  padding: 24rpx 0 8rpx;
  border-bottom: 2rpx dashed #efe4d3;
}
.block:last-child {
  border-bottom: none;
}
.b-head {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}
.b-bar {
  width: 6rpx;
  height: 24rpx;
  border-radius: 3rpx;
  background: linear-gradient(180deg, #b0762f, #8a5f3e);
  margin-right: 12rpx;
}
.b-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #33281f;
  letter-spacing: 1rpx;
}
.b-count {
  margin-left: 12rpx;
  font-size: 19rpx;
  color: #b0a496;
}
.b-grid {
  display: flex;
  flex-wrap: wrap;
}
.fi {
  flex: 1 1 30%;
  min-width: 190rpx;
  display: flex;
  align-items: center;
  padding: 9rpx 8rpx 9rpx 0;
  box-sizing: border-box;
}
.fi-icon {
  flex: none;
  width: 30rpx;
  font-size: 22rpx;
  line-height: 1.4;
  color: #8a5f3e;
}
.fi-name {
  font-size: 23rpx;
  line-height: 1.5;
  color: #4a423b;
}
.fi-free {
  flex: none;
  margin-left: 8rpx;
  font-size: 18rpx;
  line-height: 1.4;
  color: #4a7c59;
}
.fi.off .fi-icon {
  color: #c7bdb0;
}
.fi.off .fi-name {
  color: #b3a99c;
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
.foot-link {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 24rpx;
  background: #fffdf9;
  border: 2rpx dashed #e3d3ba;
  border-radius: 18rpx;
}
.fl-t {
  font-size: 25rpx;
  font-weight: 600;
  color: #8a5f3e;
}
.fl-arrow {
  font-size: 30rpx;
  color: #c0a488;
}
.foot-btn {
  margin-top: 18rpx;
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
