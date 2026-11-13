<template>
  <view class="page">
    <view class="list-hero">
      <image class="lh-bg" src="/static/paper.jpg" mode="aspectFill"></image>
      <view class="lh-mask"></view>
      <view class="lh-in">
        <text class="lh-kicker">MY BOOKINGS</text>
        <text class="lh-title">我的订单</text>
        <text class="lh-sub">共 {{ total }} 个订单 · 下拉可刷新</text>
      </view>
    </view>

  
    <scroll-view class="tabs-scroll" scroll-x>
      <view class="tabs">
        <view
          v-for="tab in tabs"
          :key="tab.label"
          class="tab"
          :class="{ active: status === tab.value }"
          @tap="switchTab(tab.value)"
        >
          <text class="tab-text">{{ tab.label }}</text>
        </view>
      </view>
    </scroll-view>

  
    <view class="list">
      <view
        v-for="order in list"
        :key="order.orderNo"
        class="order-card"
        :class="'oc' + order.orderStatus"
        @tap="goDetail(order.orderNo)"
      >
        <view class="order-head">
          <text class="order-no">{{ order.orderNo }}</text>
          <text class="badge" :class="'s' + order.orderStatus">{{ order.statusText }}</text>
        </view>

        <view class="order-body">
          <view class="row">
            <view class="room-line">
              <text class="room-avatar">{{ order.roomTypeName ? order.roomTypeName.substring(0, 1) : '房' }}</text>
              <text class="room-name">{{ order.roomTypeName }}</text>
            </view>
            <text class="amount">￥{{ money(order.totalAmount) }}</text>
          </view>
          <view class="row sub">
            <text>{{ order.checkIn }} → {{ order.checkOut }}</text>
            <text>共 {{ order.nights }} 晚</text>
          </view>
          <view class="row time">
            <text>下单 {{ order.createTime }}</text>
          </view>
        </view>

        <view class="order-actions">
          <button
            v-if="order.orderStatus === 0"
            class="btn ghost"
            size="mini"
            @tap.stop="cancelOrder(order)"
          >取消订单</button>
          <button
            v-if="order.orderStatus === 0"
            class="btn primary"
            size="mini"
            @tap.stop="payOrder(order)"
          >去支付</button>
          <button
            v-if="order.orderStatus === 1 && isAdmin"
            class="btn primary"
            size="mini"
            @tap.stop="checkinOrder(order)"
          >办理入住</button>
          <button
            v-if="order.orderStatus === 4 && isAdmin"
            class="btn primary"
            size="mini"
            @tap.stop="checkoutOrder(order)"
          >办理离店</button>
          <button
            v-if="canDelete(order)"
            class="btn danger"
            size="mini"
            @tap.stop="deleteOrder(order)"
          >删除订单</button>
          <button class="btn ghost" size="mini" @tap.stop="goDetail(order.orderNo)">查看详情</button>
        </view>
      </view>

      <view class="empty" v-if="!loading && list.length === 0">
        <text class="empty-icon">🛏</text>
        <text class="empty-text">还没有订单，先回首页选房预订</text>
        <button class="btn primary mini" @tap="goHome">去预订</button>
      </view>

      <view class="load-more" v-if="list.length > 0">
        <text>{{ loading ? '加载中...' : (finished ? '没有更多了' : '上拉加载更多') }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { get, post, del } from '@/common/request.js'
import { money, toast } from '@/common/util.js'

export default {
  data() {
    return {
      tabs: [
        { label: '全部', value: '' },
        { label: '待支付', value: 0 },
        { label: '已支付', value: 1 },
        { label: '已入住', value: 4 },
        { label: '已离店', value: 5 },
        { label: '已取消', value: 2 },
        { label: '超时关闭', value: 3 }
      ],
      status: '',
      list: [],
      total: 0,
      pageNum: 1,
      pageSize: 10,
      loading: false,
      finished: false,
      isAdmin: false
    }
  },
  onLoad() {
    this.load(true)
    get('/api/auth/me')
      .then((me) => {
        this.isAdmin = me.role === 1
      })
      .catch(() => {})
  },
  onPullDownRefresh() {
    this.load(true)
  },
  onReachBottom() {
    if (this.finished || this.loading) return
    this.pageNum = this.pageNum + 1
    this.load(false)
  },
  methods: {
    money(v) {
      return money(v)
    },
    load(reset) {
      if (this.loading) return
      if (reset) {
        this.pageNum = 1
        this.list = []
        this.finished = false
      }
      this.loading = true
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      if (this.status !== '') {
        params.orderStatus = this.status
      }
      get('/api/order/page', params)
        .then((page) => {
          const records = page.records || []
          this.list = reset ? records : this.list.concat(records)
          this.total = page.total || 0
          this.finished = this.list.length >= this.total || records.length < this.pageSize
        })
        .catch((err) => toast(err.message))
        .finally(() => {
          this.loading = false
          uni.stopPullDownRefresh()
        })
    },
    switchTab(value) {
      if (this.status === value) return
      this.status = value
      this.load(true)
    },
    payOrder(order) {
      uni.showModal({
        title: '确认支付',
        content: '订单 ' + order.orderNo + '\n应付 ￥' + money(order.totalAmount),
        success: (res) => {
          if (!res.confirm) return
          post('/api/order/pay?orderNo=' + encodeURIComponent(order.orderNo))
            .then(() => {
              toast('支付成功', 'success')
              this.load(true)
            })
            .catch((err) => toast(err.message))
        }
      })
    },
    cancelOrder(order) {
      uni.showModal({
        title: '取消订单',
        content: '取消后该房间库存会立即释放，确定取消吗？',
        success: (res) => {
          if (!res.confirm) return
          post('/api/order/cancel?orderNo=' + encodeURIComponent(order.orderNo))
            .then(() => {
              toast('已取消，库存已归还', 'success')
              this.load(true)
            })
            .catch((err) => toast(err.message))
        }
      })
    },
    checkinOrder(order) {
      uni.showModal({
        title: '办理入住',
        content: '确认订单 ' + order.orderNo + ' 到店办理入住？',
        success: (res) => {
          if (!res.confirm) return
          post('/api/order/checkin?orderNo=' + encodeURIComponent(order.orderNo))
            .then(() => {
              toast('办理入住成功', 'success')
              this.load(true)
            })
            .catch((err) => toast(err.message))
        }
      })
    },
    checkoutOrder(order) {
      uni.showModal({
        title: '办理离店',
        content: '确认订单 ' + order.orderNo + ' 办理离店？',
        success: (res) => {
          if (!res.confirm) return
          post('/api/order/checkout?orderNo=' + encodeURIComponent(order.orderNo))
            .then(() => {
              toast('办理离店成功', 'success')
              this.load(true)
            })
            .catch((err) => toast(err.message))
        }
      })
    },
    canDelete(order) {
    
      return order.orderStatus !== 4 && order.orderStatus !== 5
    },
    deleteOrder(order) {
      uni.showModal({
        title: '删除订单',
        content: '删除后该订单将从「我的订单」移除。确定删除吗？',
        confirmColor: '#b4534b',
        success: (res) => {
          if (!res.confirm) return
          del('/api/order/' + encodeURIComponent(order.orderNo))
            .then(() => {
              toast('订单已删除', 'success')
              this.load(true)
            })
            .catch((err) => toast(err.message))
        }
      })
    },
    goDetail(orderNo) {
      uni.navigateTo({ url: '/pages/order/detail?orderNo=' + encodeURIComponent(orderNo) })
    },
    goHome() {
      uni.navigateBack({
        fail: () => uni.redirectTo({ url: '/pages/index/index' })
      })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 0 0 60rpx;
  box-sizing: border-box;
  background-color: #f6f1e8;
  background-image: linear-gradient(rgba(246, 241, 232, 0.9), rgba(246, 241, 232, 0.96)), url('/static/paper.jpg');
  background-size: cover;
  background-position: center top;
  background-attachment: fixed;
}

/* 顶部条 */
.list-hero {
  position: relative;
  height: 260rpx;
  padding: 34rpx 32rpx;
  box-sizing: border-box;
  border-radius: 0 0 36rpx 36rpx;
  overflow: hidden;
}
.lh-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.lh-mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255, 252, 246, 0.9) 0%, rgba(250, 243, 232, 0.86) 60%, rgba(244, 235, 221, 0.96) 100%);
}
.lh-in {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
}
.lh-kicker {
  font-size: 20rpx;
  letter-spacing: 6rpx;
  color: #a08d76;
}
.lh-title {
  margin-top: 10rpx;
  font-size: 46rpx;
  font-weight: 700;
  color: #33281f;
  letter-spacing: 4rpx;
}
.lh-sub {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #9c9184;
}


.tabs-scroll {
  width: 100%;
  white-space: nowrap;
  padding: 24rpx 0 4rpx;
  box-sizing: border-box;
}
.tabs-scroll ::-webkit-scrollbar,
.tabs-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
.tabs-scroll .uni-scroll-view::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
.tabs {
  display: inline-flex;
  padding: 0 24rpx;
}
.tab {
  flex: none;
  padding: 14rpx 30rpx;
  margin-right: 14rpx;
  border-radius: 32rpx;
  background: #fffdf9;
  border: 2rpx solid #efe5d5;
}
.tab:last-child {
  margin-right: 24rpx;
}
.tab-text {
  font-size: 24rpx;
  color: #8a7f73;
}
.tab.active {
  background: linear-gradient(135deg, #8a5f3e, #5b3e2b);
  border-color: #5b3e2b;
  box-shadow: 0 8rpx 20rpx rgba(91, 62, 43, 0.22);
}
.tab.active .tab-text {
  color: #fff;
  font-weight: 600;
}


.list {
  padding: 20rpx 24rpx 0;
}
.order-card {
  background: #fffdf9;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 22rpx;
  border-left: 8rpx solid #e6dccb;
  box-shadow: 0 10rpx 26rpx rgba(91, 62, 43, 0.08);
}
.order-card.oc0 {
  border-left-color: #c58a2a;
}
.order-card.oc1 {
  border-left-color: #5f7f63;
}
.order-card.oc2 {
  border-left-color: #a9a29a;
}
.order-card.oc3 {
  border-left-color: #b4534b;
}
.order-card.oc4 {
  border-left-color: #4a6cc3;
}
.order-card.oc5 {
  border-left-color: #7a5aa8;
}
.order-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 18rpx;
  border-bottom: 2rpx solid #f6eee1;
}
.order-no {
  font-size: 23rpx;
  color: #8a7f73;
  font-family: Consolas, monospace;
  letter-spacing: 0.5rpx;
}
.badge {
  font-size: 22rpx;
  padding: 6rpx 18rpx;
  border-radius: 22rpx;
  font-weight: 500;
}
.badge.s0 {
  background: #fdf3e1;
  color: #a8752a;
}
.badge.s1 {
  background: #eaf3ec;
  color: #4a7c59;
}
.badge.s2 {
  background: #f0efec;
  color: #8a8078;
}
.badge.s3 {
  background: #fbeeee;
  color: #b4534b;
}
.badge.s4 {
  background: #e8eefb;
  color: #4a6cc3;
}
.badge.s5 {
  background: #efe8f7;
  color: #7a5aa8;
}

.order-body {
  padding-top: 18rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.room-line {
  display: flex;
  align-items: center;
}
.room-avatar {
  width: 52rpx;
  height: 52rpx;
  line-height: 52rpx;
  text-align: center;
  border-radius: 50%;
  font-size: 24rpx;
  color: #fff;
  background: linear-gradient(135deg, #d8b183, #a8794c);
  margin-right: 14rpx;
}
.room-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #33281f;
}
.amount {
  font-size: 32rpx;
  font-weight: 700;
  color: #b0762f;
}
.row.sub {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #8a7f73;
  padding-left: 66rpx;
}
.row.time {
  margin-top: 6rpx;
  font-size: 21rpx;
  color: #b0a396;
  padding-left: 66rpx;
}

.order-actions {
  margin-top: 20rpx;
  padding-top: 18rpx;
  border-top: 2rpx dashed #f0e6d6;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.btn {
  margin: 0 0 0 16rpx;
  height: 62rpx;
  line-height: 62rpx;
  font-size: 24rpx;
  border-radius: 32rpx;
  padding: 0 30rpx;
}
.btn::after {
  border: none;
}
.btn.primary {
  background: linear-gradient(135deg, #8a5f3e, #5b3e2b);
  color: #fff;
  box-shadow: 0 6rpx 16rpx rgba(91, 62, 43, 0.22);
}
.btn.ghost {
  background: #fffdf9;
  color: #8a5f3e;
  border: 2rpx solid #ddc9ae;
}
.btn.danger {
  background: #fff7f6;
  color: #b4534b;
  border: 2rpx solid #e8b9b5;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 140rpx 0;
}
.empty-icon {
  font-size: 76rpx;
}
.empty-text {
  margin: 22rpx 0 32rpx;
  font-size: 26rpx;
  color: #8a7f73;
}
.empty .btn {
  margin: 0;
}

.load-more {
  text-align: center;
  font-size: 22rpx;
  color: #b0a396;
  padding: 24rpx 0;
}
</style>
