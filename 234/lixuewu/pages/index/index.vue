<template>
  <view class="page">

    <view class="hero">
      <image class="hero-bg" src="/static/hero.jpg" mode="aspectFill"></image>
      <view class="hero-mask"></view>
      <view class="hero-inner">
        <view class="hero-top">
          <text class="hero-kicker">YUNQI · HOMESTAY</text>
          <view class="hero-links">
            <text class="hero-link" v-if="isAdmin" @tap="goAdmin">管理后台 ›</text>
            <text class="hero-link" @tap="goOrders">我的订单 ›</text>
          </view>
        </view>
        <text class="hero-title">云栖民宿</text>
        <text class="hero-sub">山野木屋 · 云海晨光 · 欢迎入住</text>
        <view class="hero-badges">
          <text class="hero-badge">在线选房</text>
          <text class="hero-badge">实时库存</text>
          <text class="hero-badge">优质品质</text>
        </view>
        <view class="hero-user">
          <text class="hero-avatar">{{ nickname ? nickname.substring(0, 1) : '访' }}</text>
          <text class="hero-nick">{{ nickname || '未登录' }}</text>
          <text class="hero-tag" v-if="isAdmin">管理员</text>
          <text class="hero-logout" @tap="doLogout">退出</text>
        </view>
      </view>
    </view>

    
    <view class="stay-bar">
      <picker class="sb-picker" mode="date" :value="checkIn" :start="today" :end="maxDate" @change="onCheckIn">
        <view class="sb-side">
          <text class="sb-date">{{ checkIn.substring(5) }}</text>
          <text class="sb-week">{{ weekday(checkIn) }}</text>
        </view>
      </picker>
      <view class="sb-pill" @tap="openMonthPicker">
        <text class="sb-num">{{ nights }}</text>
        <text class="sb-num-u">晚</text>
      </view>
      <picker class="sb-picker" mode="date" :value="checkOut" :start="checkIn || today" :end="maxDate" @change="onCheckOut">
        <view class="sb-side sb-right">
          <text class="sb-date">{{ checkOut.substring(5) }}</text>
          <text class="sb-week">{{ weekday(checkOut) }} 退房</text>
        </view>
      </picker>
      <view class="sb-cal" @tap="openMonthPicker">
        <text class="sb-cal-t">日历</text>
        <text class="sb-cal-a">▾</text>
      </view>
    </view>

    <view class="book-box">
      <view class="box-sec">
        <view class="sec-head">
          <view class="sec-label">
            <text class="sec-no">01</text>
            <text class="card-title">库存日历</text>
          </view>
          <view class="cal-head" @tap="openMonthPicker">
            <text>{{ viewYear }} 年 {{ viewMonth }} 月</text>
            <text class="cal-arrow">▾</text>
          </view>
        </view>

        <view class="cal-fold-bar" @tap="toggleCal">
          <text class="cfb-sum">{{ calOpen ? '点击收起' : calSummary }}</text>
          <text class="cfb-arrow">{{ calOpen ? '收起 ▲' : '展开 ▾' }}</text>
        </view>
        <view class="cal-week-head" v-if="calOpen">
          <text class="cal-week-cell" v-for="(w, wi) in weekHead" :key="wi">{{ w }}</text>
        </view>
        <view class="cal-grid" v-if="calOpen">
          <view
            v-for="(day, di) in calendarDays"
            :key="di"
            class="cal-day"
            :class="dayClass(day)"
          >
            <text class="cal-num" v-if="!day.blank">{{ day.dayNum }}</text>
            <text class="cal-price" v-if="!day.blank && !day.past && day.open && day.price">{{ day.price }}</text>
            <text class="cal-rest" v-if="!day.blank && day.past">已过</text>
            <text class="cal-rest" v-else-if="!day.blank && !day.open">未开放</text>
            <text class="cal-rest" v-else-if="!day.blank && day.available > 0">剩{{ day.available }}</text>
            <text class="cal-rest" v-else-if="!day.blank">已满</text>
          </view>
        </view>
        <view class="legend" v-if="calOpen">
          <text class="legend-item">绿色可订</text>
          <text class="legend-item">灰色已满 / 未开放 / 已过</text>
          <text class="legend-item">橙色为已选日期</text>
        </view>

        <view class="trend" v-if="calOpen && trendDays.length">
          <view class="trend-head">
            <text class="trend-title">入住起 7 晚走势</text>
            <text class="trend-hint">欢迎您的入住</text>
          </view>
          <view class="trend-body">
            <view class="trend-col" v-for="(t, ti) in trendDays" :key="ti">
              <text class="trend-price">{{ t.priceText }}</text>
              <view class="trend-track">
                <view class="trend-fill" :class="'tone-' + t.tone" :style="{ height: t.h + '%' }"></view>
              </view>
              <text class="trend-avail" :class="'tone-' + t.tone">{{ t.availText }}</text>
              <text class="trend-day">{{ t.md }}</text>
            </view>
          </view>
        </view>
      </view>

    
   
      <view class="box-sec">
        <view class="sec-head">
          <view class="sec-label">
            <text class="sec-no">02</text>
            <text class="card-title">选择房型</text>
          </view>
          <text class="card-hint">优质房源</text>
        </view>
      <view
        v-for="room in roomTypes"
        :key="room.id"
        class="room"
        :class="{ active: room.id === roomTypeId }"
        @tap="selectRoom(room.id)"
      >
        <view class="room-media">
          <image class="room-photo" :src="roomImg(room)" mode="aspectFill"></image>
          <text class="room-stock" v-if="roomStock[room.id]">{{ roomStock[room.id] }}</text>
        </view>
        <view class="room-info">
          <view class="room-name-row">
            <text class="room-name">{{ room.name }}</text>
          </view>
          <text class="room-sub">{{ room.subtitle }}</text>
          <view class="room-rate" v-if="room.reviewCount > 0">
            <text class="rate-stars">{{ starText(room.score) }}</text>
            <text class="rate-num">{{ room.score }} 分 · {{ room.reviewCount }} 条评价</text>
          </view>
          <view class="room-rate" v-else>
            <text class="rate-num">暂无评价</text>
          </view>

          <view class="room-tags">
            <text class="rtag">欢迎入住</text>
            <text class="rtag">可携宠物</text>
          </view>
        </view>
        <view class="room-price">
          <view class="rp-main">
            <text class="price-num">￥{{ money(room.price) }}</text>
            <text class="price-unit">/晚</text>
          </view>
          <view class="book-btn" :class="{ on: room.id === roomTypeId }" @tap.stop="selectRoom(room.id)">{{ room.id === roomTypeId ? '已选' : '订' }}</view>
        </view>
      </view>
      <view class="empty" v-if="roomTypes.length === 0">房型加载中...</view>
    </view>

      
      <view class="policy-bar" @tap="goNotice">
        <view class="pb-main">
          <text class="pb-title">入住须知</text>
          <text class="pb-sub">14:00 入住 · 12:00 退房 · 可携宠物 · 不提供早餐</text>
        </view>
        <text class="pb-arrow">›</text>
      </view>

      <view class="facility-bar" @tap="goFacility">
        <view class="pb-main">
          <text class="pb-title">服务及设施</text>
          <text class="pb-sub">茶室 · 观星露台 · 共享厨房 · 公共区 WiFi</text>
        </view>
        <text class="pb-arrow">›</text>
      </view>

      <view class="mp-mask" v-if="showMonthPicker" @tap="closeMonthPicker">
        <view class="mp-card" @tap.stop>
          <view class="mp-year">
            <view
              class="mp-year-btn"
              :class="{ disabled: viewYear <= todayYear }"
              @tap="prevYear"
            >‹</view>
            <text class="mp-year-text">{{ viewYear }} 年</text>
            <view
              class="mp-year-btn"
              :class="{ disabled: viewYear >= maxYear }"
              @tap="nextYear"
            >›</view>
          </view>
          <view class="mp-months">
            <view
              v-for="mo in 12"
              :key="mo"
              class="mp-month"
              :class="{ disabled: monthDisabled(mo), current: mo === viewMonth }"
              @tap="selectMonth(mo)"
            >{{ mo }} 月</view>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="sum">
        <text class="sum-label">合计</text>
        <text class="sum-amount">￥{{ totalAmount }}</text>
        <text class="sum-detail" v-if="nights > 0">￥{{ money(selectedRoom ? selectedRoom.price : 0) }} × {{ nights }} 晚</text>
      </view>
      <button class="submit-btn" :loading="submitting" :disabled="submitting" @tap="submit">立即预订</button>
    </view>
  </view>
</template>

<script>
import { get, post, getToken, setToken } from '@/common/request.js'
import { todayStr, addDays, nightsOf, weekdayText, money, toast } from '@/common/util.js'

export default {
  data() {
    return {
      roomTypes: [],
      priceTimer: null,
      roomTypeId: null,
      checkIn: '',
      checkOut: '',
      calendar: [],
      today: '',
      maxDate: '',
      viewYear: 0,
      viewMonth: 0,
      showMonthPicker: false,
      weekHead: ['日', '一', '二', '三', '四', '五', '六'],
      submitting: false,
      nickname: '',
      isAdmin: false,
      trendRaw: [],
      calOpen: false,
      roomStock: {}
    }
  },
  computed: {
    nights() {
      return nightsOf(this.checkIn, this.checkOut)
    },
    selectedRoom() {
      if (!this.roomTypeId) return null
      for (let i = 0; i < this.roomTypes.length; i++) {
        if (this.roomTypes[i].id === this.roomTypeId) return this.roomTypes[i]
      }
      return null
    },
    
    calendarDays() {
      const list = this.calendar || []
      const map = {}
      for (let i = 0; i < list.length; i++) {
        map[list[i].date] = list[i]
      }
      const y = this.viewYear
      const mo = this.viewMonth
      if (!y || !mo) return []
      const daysInMonth = new Date(y, mo, 0).getDate()
      const firstWeekday = new Date(y, mo - 1, 1).getDay()
      const today = this.today || todayStr()
      const days = []
      for (let p = 0; p < firstWeekday; p++) {
        days.push({ blank: true })
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr =
          y + '-' + String(mo).padStart(2, '0') + '-' + String(d).padStart(2, '0')
        const item = map[dateStr] || {}
        const past = dateStr < today
        days.push({
          date: dateStr,
          dayNum: d,
          open: !past && !!item.open,
          available: item.available,
          price: item.price ? '￥' + Math.round(Number(item.price)) : '',
          past
        })
      }
      return days
    },
    trendDays() {
      const list = this.trendRaw || []
      if (!list.length) return []
      const out = []
      for (let i = 0; i < list.length; i++) {
        const v = list[i]
        const avail = Number(v.available || 0)
        const total = Number(v.total || 0)
        const open = !!v.open
        const ratio = total > 0 ? avail / total : 0
        let tone = 'ok'
        if (!open) tone = 'closed'
        else if (avail <= 0) tone = 'full'
        else if (avail <= 2) tone = 'tight'
        out.push({
          date: v.date,
          md: (v.date || '').substring(5).replace('-', '/'),
          priceText: '￥' + Math.round(Number(v.price || 0)),
          availText: !open ? '未开放' : avail > 0 ? '剩' + avail : '已满',
          tone: tone,
          h: open ? Math.max(12, Math.round(ratio * 100)) : 12
        })
      }
      return out
    },
    calSummary() {
      const list = this.calendar || []
      if (!list.length) return '暂无库存数据'
      let openDays = 0
      let minPrice = 0
      for (let i = 0; i < list.length; i++) {
        const d = list[i]
        if (d.open) {
          openDays++
          const p = Number(d.price || 0)
          if (p > 0 && (!minPrice || p < minPrice)) minPrice = p
        }
      }
      if (!openDays) return '本月暂无可订日期'
      return '本月可订 ' + openDays + ' 天' + (minPrice ? ' · 最低 ￥' + Math.round(minPrice) : '')
    },
    totalAmount() {
      if (!this.selectedRoom || this.nights <= 0) return '0.00'
      return money(Number(this.selectedRoom.price) * this.nights)
    }
  },
  onLoad() {

    if (!getToken()) {
      uni.reLaunch({ url: '/pages/login/login' })
      return
    }
    this.today = todayStr()
    this.maxDate = addDays(this.today, 60)
    this.checkIn = addDays(this.today, 1)
    this.checkOut = addDays(this.today, 2)

    this.viewYear = Number(this.checkIn.substring(0, 4))
    this.viewMonth = Number(this.checkIn.substring(5, 7))
    this.loadUser()
    this.loadRoomTypes()
  },
  onShow() {
    
    this.loadRoomTypes()
    this.startPricePoll()
  },
  onHide() {
    this.stopPricePoll()
  },
  onUnload() {
    this.stopPricePoll()
  },
  methods: {
    money(v) {
      return money(v)
    },
    starText(score) {
      const s = Math.round(score || 0)
      let text = ''
      for (let i = 1; i <= 5; i++) {
        text += i <= s ? '★' : '☆'
      }
      return text
    },
    loadUser() {
      get('/api/auth/me')
        .then((me) => {
          this.nickname = me.nickname || me.username
          this.isAdmin = me.role === 1
        })
        .catch(() => {
         
        })
    },
    startPricePoll() {
      this.stopPricePoll()
      this.priceTimer = setInterval(() => {
        this.pollPrices()
      }, 30000)
    },
    stopPricePoll() {
      if (this.priceTimer) {
        clearInterval(this.priceTimer)
        this.priceTimer = null
      }
    },
    pollPrices() {
      get('/api/room/types')
        .then((list) => {
          const next = list || []
          if (next.length === 0) return
          const changed = next.length !== this.roomTypes.length || next.some((r) => {
            const old = this.roomTypes.find((o) => o.id === r.id)
            return !old || Number(old.price) !== Number(r.price)
          })
          if (!changed) return
          this.roomTypes = next
          toast('房型价格已更新', 'success')
          this.loadCalendar()
        })
        .catch(() => {
        
        })
    },
    goFacility() {
      uni.navigateTo({ url: '/pages/facility/facility' })
    },
    goNotice() {
      uni.navigateTo({ url: '/pages/notice/notice' })
    },
    doLogout() {
      setToken('')
      toast('已退出登录')
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/login/login' })
      }, 500)
    },
    goAdmin() {
      uni.navigateTo({ url: '/pages/admin/admin' })
    },
    weekday(date) {
      return weekdayText(date)
    },
    dayClass(day) {
      if (day.blank) return { blank: true }

      const inRange =
        this.checkIn && this.checkOut && day.date >= this.checkIn && day.date <= this.checkOut
      return {
        none: !day.open,
        full: day.open && day.available <= 0,
        tight: day.open && day.available > 0 && day.available <= 2,
        'in-range': inRange,
        today: day.date === (this.today || '')
      }
    },
    loadRoomTypes() {
      get('/api/room/types')
        .then((list) => {
          this.roomTypes = list || []
          if (this.roomTypes.length > 0) {
            
            const keep = this.roomTypes.some((r) => r.id === this.roomTypeId)
            if (!keep) {
              this.roomTypeId = this.roomTypes[0].id
            }
            this.loadCalendar()
          }
        })
        .catch((err) => toast(err.message))
    },
    roomImg(room) {
      const map = {
        '山景标准间': 1,
        '溪畔家庭房': 2,
        '庭院观景套房': 3,
        
      }
      const n = map[room.name] || ((Number(room.id) % 4) + 1)
      return '/static/rooms/room-' + n + '.jpg'
    },
    loadTrend() {
      if (!this.roomTypeId) {
        this.trendRaw = []
        return
      }
      const today = this.today || todayStr()
      const maxDate = this.maxDate || addDays(today, 60)
      let start = this.checkIn || today
      if (start < today) start = today
      let end = addDays(start, 6)
      if (end > maxDate) end = maxDate
      get('/api/inventory/calendar', {
        roomTypeId: this.roomTypeId,
        startDate: start,
        endDate: end
      })
        .then((days) => {
          this.trendRaw = days || []
        })
        .catch(() => {
          this.trendRaw = []
        })
    },
    toggleCal() {
      this.calOpen = !this.calOpen
    },
    loadRoomStock() {
      const list = this.roomTypes || []
      if (!list.length || !this.checkIn) return
      for (let i = 0; i < list.length; i++) {
        const r = list[i]
        get('/api/inventory/calendar', {
          roomTypeId: r.id,
          startDate: this.checkIn,
          endDate: this.checkIn
        })
          .then((days) => {
            const d = (days || [])[0] || {}
            if (!d.open) this.roomStock[r.id] = '未开放'
            else if (Number(d.available || 0) > 0) this.roomStock[r.id] = '剩' + d.available
            else this.roomStock[r.id] = '已满'
          })
          .catch(() => {
            this.roomStock[r.id] = ''
          })
      }
    },
    loadCalendar() {
      this.loadRoomStock()
      this.loadTrend()
      if (!this.roomTypeId) return
      const y = this.viewYear
      const mo = this.viewMonth
      if (!y || !mo) return
      const today = this.today || todayStr()
      const maxDate = this.maxDate || addDays(today, 60)
      const pad = (n) => String(n).padStart(2, '0')
  
      let start = y + '-' + pad(mo) + '-01'
      let end = y + '-' + pad(mo) + '-' + pad(new Date(y, mo, 0).getDate())
    
      if (end < today || start > maxDate) {
        this.calendar = []
        return
      }
      if (start < today) start = today
      if (end > maxDate) end = maxDate
      get('/api/inventory/calendar', {
        roomTypeId: this.roomTypeId,
        startDate: start,
        endDate: end
      })
        .then((days) => {
          this.calendar = days || []
        })
        .catch((err) => toast(err.message))
    },
    todayYear() {
      return Number((this.today || todayStr()).substring(0, 4))
    },
    maxYear() {
      return Number((this.maxDate || addDays(this.today || todayStr(), 60)).substring(0, 4))
    },
    openMonthPicker() {
      this.showMonthPicker = true
    },
    closeMonthPicker() {
      this.showMonthPicker = false
    },
    prevYear() {
      if (this.viewYear <= this.todayYear()) return
      this.viewYear--
      this.loadCalendar()
    },
    nextYear() {
      if (this.viewYear >= this.maxYear()) return
      this.viewYear++
      this.loadCalendar()
    },
    monthDisabled(mo) {
      const y = this.viewYear
      const today = this.today || todayStr()
      const maxDate = this.maxDate || addDays(today, 60)
      const ym = y * 12 + (mo - 1)
      const minYm = Number(today.substring(0, 4)) * 12 + (Number(today.substring(5, 7)) - 1)
      const maxYm = Number(maxDate.substring(0, 4)) * 12 + (Number(maxDate.substring(5, 7)) - 1)
      return ym < minYm || ym > maxYm
    },
    selectMonth(mo) {
      if (this.monthDisabled(mo)) return
      this.viewMonth = mo
      this.showMonthPicker = false
      this.loadCalendar()
    },
    selectRoom(id) {
      if (this.roomTypeId === id) return
      this.roomTypeId = id
      this.loadCalendar()
    },
    onCheckIn(e) {
      this.checkIn = e.detail.value
      if (nightsOf(this.checkIn, this.checkOut) <= 0) {
        this.checkOut = addDays(this.checkIn, 1)
      }
      this.loadCalendar()
    },
    onCheckOut(e) {
      this.checkOut = e.detail.value
      this.loadCalendar()
    },
    submit() {
      if (this.submitting) return
      if (!this.roomTypeId) {
        toast('请选择房型')
        return
      }
      if (this.nights <= 0) {
        toast('退房日期必须晚于入住日期')
        return
      }
      this.submitting = true
      post('/api/order/create', {
        roomTypeId: this.roomTypeId,
        checkIn: this.checkIn,
        checkOut: this.checkOut
      })
        .then((order) => {
          this.loadCalendar()
          uni.showModal({
            title: '预订成功',
            content:
              '订单号：' + order.orderNo +
              '\n应付：￥' + money(order.totalAmount) +
              '\n请在 15 分钟内完成支付，超时系统自动关闭',
            confirmText: '去支付',
            cancelText: '稍后支付',
            success: (res) => {
              if (res.confirm) {
                this.payOrder(order.orderNo)
              } else {
                this.goOrders()
              }
            }
          })
        })
        .catch((err) => toast(err.message))
        .finally(() => {
          this.submitting = false
        })
    },
    payOrder(orderNo) {
      post('/api/order/pay?orderNo=' + encodeURIComponent(orderNo))
        .then(() => {
          toast('支付成功', 'success')
          setTimeout(() => this.goOrders(), 900)
        })
        .catch((err) => {
          toast(err.message)
          this.goOrders()
        })
    },
    goOrders() {
      uni.navigateTo({ url: '/pages/orders/list' })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 190rpx;
  box-sizing: border-box;
  background-color: #f6f1e8;
  background-image: linear-gradient(rgba(246, 241, 232, 0.9), rgba(246, 241, 232, 0.96)), url('/static/paper.jpg');
  background-size: cover;
  background-position: center top;
  background-attachment: fixed;
}

/* 顶部主视觉 */
.hero {
  position: relative;
  height: 470rpx;
  padding: 32rpx 36rpx 56rpx;
  box-sizing: border-box;
  border-radius: 0 0 44rpx 44rpx;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.hero-mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(38, 25, 16, 0.6) 0%, rgba(38, 25, 16, 0.32) 42%, rgba(38, 25, 16, 0.9) 100%);
}
.hero-inner {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.hero-kicker {
  font-size: 20rpx;
  letter-spacing: 6rpx;
  color: rgba(255, 255, 255, 0.7);
}
.hero-links {
  display: flex;
  align-items: center;
  gap: 28rpx;
}
.hero-link {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.92);
}
.hero-title {
  margin-top: auto;
  font-size: 62rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 8rpx;
  line-height: 1.2;
  text-shadow: 0 4rpx 18rpx rgba(0, 0, 0, 0.35);
}
.hero-sub {
  margin-top: 12rpx;
  font-size: 24rpx;
  letter-spacing: 2rpx;
  color: rgba(255, 238, 222, 0.9);
}
.hero-badges {
  margin-top: 18rpx;
  display: flex;
  flex-wrap: wrap;
}
.hero-badge {
  font-size: 20rpx;
  color: #fff;
  border: 1rpx solid rgba(255, 255, 255, 0.34);
  background: rgba(255, 255, 255, 0.14);
  border-radius: 24rpx;
  padding: 6rpx 18rpx;
  margin-right: 14rpx;
  margin-bottom: 8rpx;
}
.hero-user {
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.14);
  border: 1rpx solid rgba(255, 255, 255, 0.22);
  border-radius: 36rpx;
  padding: 8rpx 22rpx 8rpx 8rpx;
}
.hero-avatar {
  width: 48rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
  border-radius: 50%;
  font-size: 24rpx;
  color: #fff;
  background: linear-gradient(135deg, #d8b183, #a8794c);
  margin-right: 12rpx;
}
.hero-nick {
  font-size: 24rpx;
  color: #fff;
}
.hero-tag {
  font-size: 20rpx;
  color: #5b3e2b;
  background: #f5dfc0;
  border-radius: 18rpx;
  padding: 2rpx 14rpx;
  margin-left: 14rpx;
}
.hero-logout {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.86);
  margin-left: 22rpx;
}


.book-box {
  position: relative;
  margin: -60rpx 24rpx 0;
  padding: 32rpx 26rpx;
  background: #fffdf9;
  border-radius: 28rpx;
  box-shadow: 0 16rpx 44rpx rgba(91, 62, 43, 0.12);
}
.box-sec + .box-sec {
  margin-top: 30rpx;
  padding-top: 26rpx;
  border-top: 2rpx solid #f4ecdf;
}
.sec-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22rpx;
}
.sec-label {
  display: flex;
  align-items: center;
}
.sec-no {
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  font-size: 18rpx;
  font-weight: 600;
  color: #8a5f3e;
  background: #f8ecdb;
  border-radius: 10rpx;
  margin-right: 14rpx;
}
.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #33281f;
  letter-spacing: 1rpx;
}
.card-hint {
  font-size: 22rpx;
  color: #9c9184;
}

.date-row {
  display: flex;
  align-items: center;
}
.date-picker {
  flex: 1;
}
.date-box {
  background: #fffaf2;
  border: 2rpx solid #eee3d2;
  border-radius: 18rpx;
  padding: 18rpx 20rpx;
  display: flex;
  flex-direction: column;
  box-shadow: inset 0 2rpx 0 rgba(255, 255, 255, 0.9);
}
.date-label {
  font-size: 22rpx;
  color: #9c9184;
}
.date-value {
  font-size: 34rpx;
  font-weight: 600;
  color: #33281f;
  margin-top: 6rpx;
  letter-spacing: 1rpx;
}
.date-week {
  font-size: 22rpx;
  color: #b0762f;
  margin-top: 2rpx;
}
.date-arrow {
  width: 64rpx;
  text-align: center;
  color: #cbb79c;
  font-size: 30rpx;
}

/* 房型 */
.room {
  display: flex;
  align-items: center;
  padding: 18rpx 16rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid #efe6d7;
  border-radius: 20rpx;
  background: #fffdf9;
}
.room:last-child {
  margin-bottom: 0;
}
.room.active {
  border-color: #c08a4e;
  background: linear-gradient(135deg, #fdf5e9, #f7ebd8);
  box-shadow: 0 8rpx 22rpx rgba(192, 138, 78, 0.16);
}
.room-avatar {
  width: 78rpx;
  height: 78rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #d8b183, #a8794c);
  color: #fff;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(168, 121, 76, 0.28);
}
.room-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.room-name-row {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}
.room-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #33281f;
  margin-right: 10rpx;
  white-space: nowrap;
}
.cap-badge {
  font-size: 18rpx;
  color: #8a6a48;
  background: #faf0df;
  border-radius: 8rpx;
  padding: 2rpx 8rpx;
  line-height: 1.4;
  flex-shrink: 0;
  white-space: nowrap;
}
.room-sub {
  font-size: 21rpx;
  color: #9c9184;
  margin-top: 8rpx;
  line-height: 1.5;
}
.room-rate {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  white-space: nowrap;
  overflow: hidden;
}
.rate-stars {
  font-size: 20rpx;
  color: #d99a2b;
  letter-spacing: 1rpx;
  flex-shrink: 0;
}
.rate-num {
  font-size: 18rpx;
  color: #9c9184;
  margin-left: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
}
.room-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  margin-left: 8rpx;
  min-width: 158rpx;
}
.rp-main {
  display: flex;
  align-items: baseline;
}
.price-num {
  font-size: 34rpx;
  font-weight: 700;
  color: #b0762f;
  letter-spacing: 0.5rpx;
}
.price-unit {
  font-size: 22rpx;
  color: #9c9184;
}
.room-check {
  width: 34rpx;
  height: 34rpx;
  line-height: 32rpx;
  text-align: center;
  font-size: 22rpx;
  color: transparent;
  border: 2rpx solid #ded0ba;
  border-radius: 50%;
  margin-top: 10rpx;
}
.room-check.on {
  color: #fff;
  background: #6b4a32;
  border-color: #6b4a32;
}
.empty {
  text-align: center;
  color: #9c9184;
  font-size: 24rpx;
  padding: 24rpx 0;
}

/* 库存日历（单月日历表 + 年月选择弹层） */
.cal-head {
  display: flex;
  align-items: center;
  background: #f9f1e4;
  border: 2rpx solid #eee2cf;
  border-radius: 14rpx;
  padding: 10rpx 22rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #4a3a2c;
}
.cal-arrow {
  margin-left: 10rpx;
  font-size: 22rpx;
  color: #a08d76;
}
.cal-week-head {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 10rpx;
}
.cal-week-cell {
  text-align: center;
  font-size: 20rpx;
  color: #a89a89;
  letter-spacing: 1rpx;
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
}
.cal-day {
  aspect-ratio: 1 / 1.32;
  box-sizing: border-box;
  border: 2rpx solid #efe5d5;
  border-radius: 12rpx;
  background: #fffdf9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.cal-day.blank {
  border-color: transparent;
  background: transparent;
}
.cal-num {
  font-size: 28rpx;
  font-weight: 600;
  color: #3a2e24;
  line-height: 1.2;
}
.cal-rest {
  font-size: 18rpx;
  color: #5f7f63;
  line-height: 1.2;
  margin-top: 4rpx;
}
.cal-day.today .cal-num {
  color: #b0762f;
}
.cal-day.full .cal-rest {
  color: #b4534b;
}
.cal-day.none {
  background: #f6f0e6;
  border-color: #e9ddca;
  border-style: dashed;
}
.cal-day.none .cal-rest {
  color: #ab9f92;
}
.cal-day.none .cal-num {
  color: #ab9f92;
}
.cal-day.in-range {
  border-color: #6b4a32;
  background: linear-gradient(180deg, #8a5f3e, #63432e);
  box-shadow: 0 6rpx 14rpx rgba(107, 74, 50, 0.24);
}
.cal-day.in-range .cal-num {
  color: #fff;
}
.cal-day.in-range .cal-rest {
  color: #f3ddbf;
}
.legend {
  margin-top: 18rpx;
  display: flex;
  flex-wrap: wrap;
}
.legend-item {
  font-size: 20rpx;
  color: #a89a89;
  margin-right: 20rpx;
}

/* 房型实景图 */
.room-photo {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
  background: #f2e9dc;
  box-shadow: 0 8rpx 20rpx rgba(91, 62, 43, 0.18);
}
.room-info {
  min-width: 0;
}

.cal-price {
  font-size: 17rpx;
  color: #a8763a;
  line-height: 1.15;
  margin-top: 2rpx;
}
.cal-day.tight .cal-rest {
  color: #c07a2c;
}


.trend {
  margin-top: 22rpx;
  padding-top: 20rpx;
  border-top: 2rpx dashed #eee1cd;
}
.trend-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 14rpx;
}
.trend-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #4a3a2c;
}
.trend-hint {
  font-size: 19rpx;
  color: #a89a89;
}
.trend-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.trend-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}
.trend-price {
  font-size: 20rpx;
  color: #6b4a32;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 6rpx;
}
.trend-track {
  width: 26rpx;
  height: 132rpx;
  background: #f4ecdf;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}
.trend-fill {
  width: 100%;
  border-radius: 8rpx;
  background: #8fa87a;
}
.trend-fill.tone-tight {
  background: #c9924a;
}
.trend-fill.tone-full {
  background: #b4534b;
}
.trend-fill.tone-closed {
  background: #d9cfc1;
}
.trend-avail {
  font-size: 18rpx;
  color: #7d8f6c;
  margin-top: 8rpx;
  line-height: 1.2;
}
.trend-avail.tone-tight {
  color: #b0762f;
}
.trend-avail.tone-full {
  color: #b4534b;
}
.trend-avail.tone-closed {
  color: #a89a89;
}
.trend-day {
  font-size: 18rpx;
  color: #a89a89;
  margin-top: 4rpx;
}

/* 年月选择弹层 */
.mp-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 20, 12, 0.5);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mp-card {
  width: 600rpx;
  background: #fffdf9;
  border-radius: 26rpx;
  padding: 34rpx 30rpx;
  box-shadow: 0 20rpx 60rpx rgba(40, 26, 16, 0.3);
}
.mp-year {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26rpx;
}
.mp-year-btn {
  width: 76rpx;
  height: 76rpx;
  border-radius: 14rpx;
  background: #f7ecdb;
  color: #4a3a2c;
  font-size: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mp-year-btn.disabled {
  opacity: 0.3;
}
.mp-year-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #33281f;
  letter-spacing: 2rpx;
}
.mp-months {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.mp-month {
  text-align: center;
  padding: 20rpx 0;
  border-radius: 14rpx;
  background: #f6f0e6;
  color: #4a3a2c;
  font-size: 26rpx;
}
.mp-month.current {
  background: linear-gradient(135deg, #8a5f3e, #5b3e2b);
  color: #fff;
  font-weight: 600;
}
.mp-month.disabled {
  opacity: 0.35;
}

/* 底部 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
  background: #fffdf9;
  border-top: 2rpx solid #f4ecdf;
  box-shadow: 0 -10rpx 30rpx rgba(91, 62, 43, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sum {
  display: flex;
  flex-direction: column;
}
.sum-label {
  font-size: 22rpx;
  color: #9c9184;
}
.sum-amount {
  font-size: 42rpx;
  font-weight: 700;
  color: #b0762f;
  line-height: 1.2;
  letter-spacing: 1rpx;
}
.sum-detail {
  font-size: 20rpx;
  color: #ab9f92;
}
.submit-btn {
  min-width: 260rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #8a5f3e, #5b3e2b);
  color: #fff;
  font-size: 30rpx;
  letter-spacing: 4rpx;
  border-radius: 44rpx;
  padding: 0 44rpx;
  margin: 0;
  box-shadow: 0 10rpx 24rpx rgba(91, 62, 43, 0.28);
}
.submit-btn::after {
  border: none;
}
.submit-btn[disabled] {
  background: #c3b3a1;
  box-shadow: none;
  color: #fff;
}
/* 入住须知入口 */
.policy-bar {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 24rpx;
  background: #fffdf9;
  border: 2rpx dashed #e3d3ba;
  border-radius: 18rpx;
}
.pb-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.pb-title {
  font-size: 25rpx;
  font-weight: 600;
  color: #8a5f3e;
}
.pb-sub {
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #a89a89;
}
.pb-arrow {
  flex: none;
  margin-left: 16rpx;
  font-size: 30rpx;
  color: #c0a488;
}


/* 服务及设施入口 */
.facility-bar {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 24rpx;
  background: linear-gradient(135deg, #fbf6ec, #f3eadb);
  border: 2rpx solid #efe4d3;
  border-radius: 18rpx;
}
.stay-bar {
  position: relative;
  z-index: 3;
  margin: -60rpx 24rpx 0;
  padding: 22rpx 24rpx;
  display: flex;
  align-items: center;
  background: #fffdf9;
  border-radius: 24rpx;
  box-shadow: 0 16rpx 40rpx rgba(91, 62, 43, 0.16);
}
.sb-side {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.sb-right {
  align-items: flex-end;
}
.sb-date {
  font-size: 40rpx;
  font-weight: 700;
  color: #33281f;
  letter-spacing: 1rpx;
  line-height: 1.2;
}
.sb-week {
  font-size: 19rpx;
  color: #a89a89;
  margin-top: 2rpx;
}
.sb-pill {
  flex: none;
  margin: 0 14rpx;
  padding: 8rpx 20rpx;
  display: flex;
  align-items: baseline;
  background: #f7efe0;
  border-radius: 30rpx;
}
.sb-num {
  font-size: 26rpx;
  font-weight: 600;
  color: #8a5f3e;
}
.sb-num-u {
  font-size: 18rpx;
  color: #a8763a;
  margin-left: 2rpx;
}
.sb-cal {
  flex: none;
  display: flex;
  align-items: center;
  margin-left: 12rpx;
  padding: 8rpx 14rpx;
  border: 2rpx solid #efe4d3;
  border-radius: 24rpx;
}
.sb-cal-t {
  font-size: 20rpx;
  color: #8a7f73;
}
.sb-cal-a {
  font-size: 18rpx;
  color: #b0a496;
  margin-left: 4rpx;
}

.book-box {
  margin: 16rpx 24rpx 0;
}

.cal-fold-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14rpx 20rpx;
  background: #faf5ec;
  border: 2rpx dashed #e3d3ba;
  border-radius: 14rpx;
}
.cfb-sum {
  font-size: 21rpx;
  color: #8a7f73;
}
.cfb-arrow {
  font-size: 20rpx;
  color: #a8763a;
}


.cal-week-head {
  margin-bottom: 8rpx;
}
.cal-grid {
  gap: 6rpx;
}
.cal-day {
  aspect-ratio: auto;
  height: 96rpx;
  border-radius: 10rpx;
}
.cal-num {
  font-size: 22rpx;
}
.cal-rest {
  font-size: 15rpx;
  margin-top: 0;
}
.cal-price {
  font-size: 13rpx;
}


.room {
  align-items: stretch;
  padding: 20rpx 0;
  margin-bottom: 0;
  border: none;
  border-bottom: 2rpx solid #f2e8d9;
  border-radius: 0;
  background: transparent;
}
.room.active {
  padding-left: 12rpx;
  padding-right: 12rpx;
  background: linear-gradient(135deg, #fdf5e9, #f7ebd8);
  border-radius: 18rpx;
  border-bottom-color: transparent;
}
.room-media {
  position: relative;
  width: 176rpx;
  height: 176rpx;
  flex-shrink: 0;
  margin-right: 18rpx;
}
.room-photo {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  margin-right: 0;
  box-shadow: 0 8rpx 20rpx rgba(91, 62, 43, 0.16);
}
.room-stock {
  position: absolute;
  right: 8rpx;
  bottom: 8rpx;
  font-size: 17rpx;
  line-height: 1.4;
  color: #fff;
  background: rgba(26, 16, 9, 0.6);
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
}
.room-name {
  font-size: 30rpx;
}
.room-sub {
  font-size: 22rpx;
  margin-top: 10rpx;
}
.room-rate {
  margin-top: 10rpx;
}
.room-tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10rpx;
}
.rtag {
  font-size: 17rpx;
  line-height: 1.5;
  color: #8a6a48;
  background: #faf0df;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  margin: 0 8rpx 6rpx 0;
}
.room-price {
  justify-content: center;
  min-width: 150rpx;
}
.price-num {
  font-size: 36rpx;
}
.book-btn {
  margin-top: 14rpx;
  width: 104rpx;
  height: 54rpx;
  line-height: 54rpx;
  text-align: center;
  font-size: 24rpx;
  letter-spacing: 2rpx;
  color: #fff;
  background: linear-gradient(135deg, #8a5f3e, #5b3e2b);
  border-radius: 12rpx;
  box-shadow: 0 6rpx 16rpx rgba(91, 62, 43, 0.2);
}
.book-btn.on {
  background: linear-gradient(135deg, #c08a4e, #a8794c);
}


.sb-picker {
  flex: 1;
  min-width: 0;
}
.book-btn {
  box-sizing: border-box;
}


.room-sub {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.room-price {
  min-width: 138rpx;
}

</style>

