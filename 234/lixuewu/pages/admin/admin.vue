<template>
  <view class="page">
    <view class="admin-hero">
      <image class="ah-bg" src="/static/wood.jpg" mode="aspectFill"></image>
      <view class="ah-mask"></view>
      <view class="ah-in">
        <text class="ah-kicker">ADMIN CONSOLE</text>
        <text class="ah-title">管理后台 · 云栖民宿</text>
        <text class="ah-sub">库存 · 订单 · 支付 · 评价 · 经营数据</text>
      </view>
    </view>

 
    <view class="card">
      <text class="card-title"><text class="ct-ico">01</text>数据看板 <text class="sub">仅自己可见 </text></text>
      <view class="chips">
        <view class="chip" v-for="c in chips" :key="c.k">
          <text class="chip-k">{{ c.k }}</text>
          <text class="chip-v" :class="{ hl: c.hl }">{{ c.v }}</text>
        </view>
      </view>
    </view>

  
    <view class="card">
      <text class="card-title"><text class="ct-ico">02</text>房型与价格 <text class="sub"></text></text>
   

      <view class="price-row" v-for="r in roomTypes" :key="r.id">
        <view class="pr-head">
          <view class="pr-info">
            <text class="pr-name">{{ r.name }}</text>
            <text class="pr-sub">{{ r.subtitle || ('可住 ' + r.capacity + ' 人') }}</text>
          </view>
          <view class="pr-cur">
            <text class="pr-cur-num">￥{{ money(r.price) }}</text>
            <text class="pr-cur-unit">/晚</text>
          </view>
        </view>
        <view class="pr-edit">
          <input class="pr-input" type="digit" v-model="priceDrafts[r.id]" :placeholder="'当前价格 ' + money(r.price)" placeholder-class="ph" />
          <button class="mini-btn primary" size="mini" :loading="savingId === r.id" :disabled="savingId === r.id" @tap="savePrice(r)">保存</button>
        </view>
      </view>
      <view class="empty" v-if="roomTypes.length === 0">
        <text>房型加载中...</text>
      </view>

      <view class="divider"></view>
      <text class="label">最近调价</text>
      <view class="plog" v-for="p in priceLogs" :key="p.id">
        <view class="plog-head">
          <text class="plog-name">{{ p.roomTypeName }}</text>
          <view class="plog-diff">
            <text>￥{{ money(p.oldPrice) }}</text>
            <text class="plog-arrow">→</text>
            <text class="plog-new">￥{{ money(p.newPrice) }}</text>
          </view>
        </view>
        <view class="plog-sub">
          <text>{{ p.adminName || '管理员' }} 调价</text>
          <text>{{ (p.createTime || '').replace('T', ' ') }}</text>
        </view>
      </view>
      <view class="plog-empty" v-if="priceLogs.length === 0">暂无调价记录</view>
    </view>

    
    <view class="card">
      <text class="card-title"><text class="ct-ico">03</text>库存维护</text>
      <view class="field">
        <text class="label">房型</text>
        <picker :range="stockNames" @change="onRoomChange">
          <view class="picker">{{ stockNames[roomIndex] || '请选择房型' }} ›</view>
        </picker>
      </view>

      <view class="field">
        <text class="label">批量补库存</text>
        <view class="date-row">
          <picker mode="date" :start="today" @change="onStartChange">
            <view class="picker">{{ startDate || '开始日期' }} ›</view>
          </picker>
          <text class="sep">至</text>
          <picker mode="date" :start="today" @change="onEndChange">
            <view class="picker">{{ endDate || '结束日期' }} ›</view>
          </picker>
        </view>
      </view>

      <view class="field">
        <text class="label">每日可售量</text>
        <input class="input" type="number" v-model="initTotal" />
      </view>
      <button class="btn primary" :loading="initing" :disabled="initing" @tap="doInit">批量补库存</button>

      <view class="divider"></view>

      <view class="field">
        <text class="label">调整某日可售量</text>
        <view class="date-row">
          <picker mode="date" :start="today" @change="onAdjDateChange">
            <view class="picker">{{ adjDate || '选择日期' }} ›</view>
          </picker>
          <input class="input small" type="number" v-model="adjTotal" placeholder="总量" placeholder-class="ph" />
        </view>
      </view>
      <button class="btn ghost" :loading="adjusting" :disabled="adjusting" @tap="doAdjust">调整当日总量</button>
    </view>

    <!-- 支付流水 -->
    <view class="card">
      <text class="card-title"><text class="ct-ico">04</text>支付流水 <text class="sub">模拟支付实时写入，可对账</text></text>
      <view class="log" v-for="log in logs" :key="log.id">
        <view class="log-head">
          <text class="mono">{{ log.orderNo }}</text>
          <text class="amount">￥{{ money(log.amount) }}</text>
        </view>
        <view class="log-sub">
          <text>{{ log.username }} · {{ log.payType }} · {{ log.statusText }}</text>
          <text>{{ log.createTime }}</text>
        </view>
      </view>
      <view class="empty" v-if="!loadingLogs && logs.length === 0">
        <text>暂无支付流水</text>
      </view>
      <view class="load-more" v-if="logs.length > 0" @tap="loadLogs(false)">
        <text>{{ loadingLogs ? '加载中...' : (finished ? '没有更多了' : '加载更多') }}</text>
      </view>
    </view>

    <!-- 评价中心： -->
    <view class="card">
      <text class="card-title"><text class="ct-ico">05</text>评价中心 <text class="sub"></text></text>

      <view class="ov-panel" v-if="admOverview">
        <view class="ov-main">
          <text class="ov-score">{{ admOverview.avgScore }}</text>
          <text class="ov-score-unit">分</text>
          <text class="ov-score-tip">平均分 · 好评率 {{ admOverview.goodRate }}%</text>
        </view>
        <view class="ov-nums">
          <view class="ov-num"><text class="ov-num-v">{{ admOverview.total }}</text><text class="ov-num-k">总评价</text></view>
          <view class="ov-num"><text class="ov-num-v">{{ admOverview.withImage }}</text><text class="ov-num-k">带图</text></view>
          <view class="ov-num"><text class="ov-num-v">{{ admOverview.replied }}</text><text class="ov-num-k">已回复</text></view>
          <view class="ov-num"><text class="ov-num-v warn">{{ admOverview.hidden }}</text><text class="ov-num-k">已隐藏</text></view>
        </view>
        <view class="ov-dist">
          <view class="ov-dist-row" v-for="d in admOverview.dist" :key="d.score">
            <text class="ov-dist-star">{{ d.score }}星</text>
            <view class="ov-bar"><view class="ov-bar-fill" :style="'width:' + d.percent + '%'"></view></view>
            <text class="ov-dist-cnt">{{ d.count }}</text>
          </view>
        </view>
      </view>

      <picker :range="roomNames" @change="onAdmRoomChange">
        <view class="picker">{{ roomNames[admRoomIndex] || '全部房型' }} ›</view>
      </picker>

      <view class="rev-item" v-for="r in admReviews" :key="r.id">
        <view class="rev-top">
          <text class="mono">{{ r.orderNo }}</text>
          <text class="stars">{{ starText(r.score) }}</text>
        </view>
        <view class="log-sub">
          <text>{{ r.userNickname }} · {{ r.roomTypeName }}</text>
          <text>{{ r.createTime }}</text>
        </view>
        <view class="rev-content" v-if="r.content">{{ r.content }}</view>
        <view class="rev-images" v-if="r.images && r.images.length">
          <image v-for="img in r.images" :key="img" class="rev-img" :src="imgFull(img)" mode="aspectFill" @tap="previewRevImage(r, img)"></image>
        </view>

        <view class="rev-reply" v-if="r.replyContent">
          <text class="rev-reply-label">商家回复</text>
          <text class="rev-reply-text">{{ r.replyContent }}</text>
        </view>

        <view class="rev-reply-box">
          <input class="reply-input" :value="replyDrafts[r.id] || ''" @input="onReplyInput(r.id, $event)" :placeholder="r.replyContent ? '修改回复内容…' : '回复这位住客…'" placeholder-class="ph" />
          <button class="mini-btn primary" size="mini" @tap="replyReview(r)">发送回复</button>
        </view>

        <view class="rev-ops">
          <text class="badge2" :class="r.status === 1 ? 'on' : 'off'">{{ r.status === 1 ? '显示中' : '已隐藏' }}</text>
          <button class="mini-btn" :class="r.status === 1 ? 'ghost' : 'primary'" size="mini" @tap="toggleReview(r)">{{ r.status === 1 ? '隐藏' : '恢复显示' }}</button>
          <button class="mini-btn del" size="mini" @tap="deleteReview(r)">删除</button>
          <text class="rev-log-btn" @tap="toggleActions(r)">{{ actionOpen[r.id] ? '收起记录' : '处理记录' }}</text>
        </view>

        <view class="rev-logs" v-if="actionOpen[r.id]">
          <view class="rev-log" v-for="a in (actionMap[r.id] || [])" :key="a.id">
            <text class="rev-log-act">{{ a.actionText }}</text>
            <text class="rev-log-text">{{ a.adminName }} · {{ a.createTime }}</text>
            <text class="rev-log-rm" v-if="a.remark">{{ a.remark }}</text>
          </view>
          <view class="rev-log-empty" v-if="!(actionMap[r.id] || []).length">暂无处理记录</view>
        </view>
      </view>

      <view class="empty" v-if="admReviews.length === 0">
        <text>暂无评价</text>
      </view>
      <view class="load-more" v-if="admReviews.length > 0" @tap="loadAdmReviews(false)">
        <text>{{ loadingAdm ? '加载中...' : (admFinished ? '没有更多了' : '加载更多') }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { get, post, put, del } from '@/common/request.js'
import { todayStr, addDays, money, toast } from '@/common/util.js'
import config from '@/common/config.js'

const BASE_URL = config.baseUrl

export default {
  data() {
    return {
      roomTypes: [],
      roomIndex: 0,
      today: '',
      startDate: '',
      endDate: '',
      initTotal: '10',
      adjDate: '',
      adjTotal: '10',
      initing: false,
      adjusting: false,
      logs: [],
      pageNum: 1,
      pageSize: 10,
      loadingLogs: false,
      finished: false,
      chips: [
        { k: '订单总数', v: '-', hl: true },
        { k: '累计实付金额', v: '-' },
        { k: '今日新增订单', v: '-' },
        { k: '今日支付金额', v: '-' },
        { k: '待支付/已入住/已离店', v: '-' },
        { k: '在售房型/注册用户', v: '-' },
        { k: '评价总数/平均分', v: '-' },
        { k: '已占用间夜', v: '-' }
      ],
      admRoomIndex: 0,
      admReviews: [],
      admPageNum: 1,
      admPageSize: 10,
      loadingAdm: false,
      admFinished: false,
      admOverview: null,
      replyDrafts: {},
      priceDrafts: {},
      savingId: null,
      priceLogs: [],
      actionMap: {},
      actionOpen: {}
    }
  },
  computed: {
    roomNames() {
      const names = this.roomTypes.map((r) => r.name + '（' + money(r.price) + '/晚）')
      return ['全部房型'].concat(names)
    },
    
    stockNames() {
      return this.roomTypes.map((r) => r.name + '（' + money(r.price) + '/晚）')
    }
  },
  onLoad() {
    this.today = todayStr()
    this.startDate = addDays(this.today, 1)
    this.endDate = addDays(this.today, 60)
    this.loadRooms()
    this.loadPriceLogs()
    this.loadLogs(true)
    this.loadAdmReviews(true)
    this.loadAdmOverview()
    this.loadOverview()
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
    loadRooms() {
      get('/api/room/types')
        .then((types) => {
          this.roomTypes = types || []
        })
        .catch((err) => toast(err.message))
    },
    savePrice(r) {
      const raw = (this.priceDrafts[r.id] || '').toString().trim()
      if (!raw) {
        toast('请输入新的价格')
        return
      }
      const val = Number(raw)
      if (!isFinite(val) || val <= 0) {
        toast('请输入大于 0 的价格')
        return
      }
      if (val > 99999) {
        toast('价格不能超过 99999 元')
        return
      }
      const fixed = val.toFixed(2)
      if (Number(fixed) === Number(r.price)) {
        toast('新价格与当前价格相同')
        return
      }
      this.savingId = r.id
      put('/api/room/types/' + r.id + '/price?price=' + fixed)
        .then(() => {
          toast('价格已更新，住客端同步生效', 'success')
          this.priceDrafts[r.id] = ''
          return this.loadRooms()
        })
        .then(() => this.loadPriceLogs())
        .catch((err) => toast(err.message))
        .finally(() => {
          this.savingId = null
        })
    },
    loadPriceLogs() {
      get('/api/room/types/price-logs', { limit: 5 })
        .then((list) => {
          this.priceLogs = list || []
        })
        .catch(() => {
          // 非管理员看不到调价记录，静默忽略
        })
    },
    loadOverview() {
      get('/api/stats/admin/overview')
        .then((o) => {
          this.chips[0].v = o.totalOrders
          this.chips[1].v = '￥' + money(o.paidAmount)
          this.chips[2].v = o.todayOrders
          this.chips[3].v = '￥' + money(o.todayPaidAmount)
          this.chips[4].v = o.pendingOrders + ' / ' + o.checkedIn + ' / ' + o.checkedOut
          this.chips[5].v = o.roomTypes + ' / ' + o.totalUsers
          this.chips[6].v = o.totalReviews + ' 条 / ' + o.avgScore + ' 分'
          this.chips[7].v = o.bookedRoomNights
        })
        .catch((err) => {
          if (err.message.indexOf('403') >= 0) {
            toast('仅管理员可查看数据看板')
          }
        })
    },
    onRoomChange(e) {
      this.roomIndex = Number(e.detail.value)
    },
    onStartChange(e) {
      this.startDate = e.detail.value
    },
    onEndChange(e) {
      this.endDate = e.detail.value
    },
    onAdjDateChange(e) {
      this.adjDate = e.detail.value
    },
    doInit() {
      const roomTypeId = this.roomTypes[this.roomIndex] && this.roomTypes[this.roomIndex].id
      const total = Number(this.initTotal)
      if (!roomTypeId || !this.startDate || !this.endDate || this.endDate < this.startDate || !total) {
        toast('请完整填写房型、日期范围与可售量')
        return
      }
      this.initing = true
      post('/api/inventory/init?roomTypeId=' + roomTypeId + '&startDate=' + this.startDate +
        '&endDate=' + this.endDate + '&total=' + total)
        .then(() => toast('库存补量完成', 'success'))
        .catch((err) => toast(err.message))
        .finally(() => {
          this.initing = false
        })
    },
    doAdjust() {
      const roomTypeId = this.roomTypes[this.roomIndex] && this.roomTypes[this.roomIndex].id
      const total = Number(this.adjTotal)
      if (!roomTypeId || !this.adjDate || !total) {
        toast('请填写房型、日期与总量')
        return
      }
      this.adjusting = true
      put('/api/inventory/total?roomTypeId=' + roomTypeId + '&date=' + this.adjDate + '&total=' + total)
        .then(() => toast('当日可售量已更新', 'success'))
        .catch((err) => toast(err.message))
        .finally(() => {
          this.adjusting = false
        })
    },
    loadLogs(reset) {
      if (this.loadingLogs) return
      if (reset) {
        this.pageNum = 1
        this.logs = []
        this.finished = false
      }
      this.loadingLogs = true
      get('/api/payment/logs', { pageNum: this.pageNum, pageSize: this.pageSize })
        .then((page) => {
          const records = page.records || []
          this.logs = reset ? records : this.logs.concat(records)
          this.finished = records.length < this.pageSize
        })
        .catch((err) => {
          if (err.message.indexOf('403') >= 0) {
            toast('仅管理员可查看支付流水')
          } else {
            toast(err.message)
          }
        })
        .finally(() => {
          this.loadingLogs = false
        })
    },
    imgFull(url) {
      if (!url) return ''
      return url.indexOf('http') === 0 ? url : BASE_URL + url
    },
    previewRevImage(r, img) {
      const urls = (r.images || []).map((u) => this.imgFull(u))
      uni.previewImage({ urls: urls, current: this.imgFull(img) })
    },
    loadAdmOverview() {
      const params = {}
      if (this.admRoomIndex > 0 && this.roomTypes[this.admRoomIndex - 1]) {
        params.roomTypeId = this.roomTypes[this.admRoomIndex - 1].id
      }
      get('/api/review/overview', params)
        .then((o) => {
          this.admOverview = o
        })
        .catch((err) => {
          if (err.message.indexOf('403') >= 0) {
            toast('仅管理员可查看评价概览')
          }
        })
    },
    onReplyInput(id, e) {
      this.replyDrafts[id] = e.detail.value
    },
    replyReview(r) {
      const text = (this.replyDrafts[r.id] || '').trim()
      if (!text) {
        toast('请先填写回复内容')
        return
      }
      post('/api/review/' + r.id + '/reply', { content: text })
        .then(() => {
          toast('回复已发布', 'success')
          this.replyDrafts[r.id] = ''
          this.loadAdmReviews(true)
          this.loadAdmOverview()
          if (this.actionOpen[r.id]) this.fetchActions(r.id)
        })
        .catch((err) => toast(err.message))
    },
    toggleActions(r) {
      this.actionOpen[r.id] = !this.actionOpen[r.id]
      if (this.actionOpen[r.id]) this.fetchActions(r.id)
    },
    fetchActions(id) {
      get('/api/review/' + id + '/actions')
        .then((list) => {
          this.actionMap[id] = list || []
        })
        .catch((err) => toast(err.message))
    },
    onAdmRoomChange(e) {
      this.admRoomIndex = Number(e.detail.value)
      this.admPageNum = 1
      this.loadAdmReviews(true)
      this.loadAdmOverview()
    },
    loadAdmReviews(reset) {
      if (this.loadingAdm) return
      if (reset) {
        this.admPageNum = 1
        this.admReviews = []
        this.admFinished = false
      }
      this.loadingAdm = true
      const params = { pageNum: this.admPageNum, pageSize: this.admPageSize }
      if (this.admRoomIndex > 0 && this.roomTypes[this.admRoomIndex - 1]) {
        params.roomTypeId = this.roomTypes[this.admRoomIndex - 1].id
      }
      get('/api/review/admin/page', params)
        .then((page) => {
          const records = page.records || []
          this.admReviews = reset ? records : this.admReviews.concat(records)
          this.admFinished = records.length < this.admPageSize
        })
        .catch((err) => {
          if (err.message.indexOf('403') >= 0) {
            toast('仅管理员可管理评价')
          } else {
            toast(err.message)
          }
        })
        .finally(() => {
          this.loadingAdm = false
        })
    },
    toggleReview(r) {
      put('/api/review/' + r.id + '/status?status=' + (r.status === 1 ? 0 : 1))
        .then(() => {
          toast(r.status === 1 ? '评价已隐藏' : '评价已恢复显示', 'success')
          this.loadAdmReviews(true)
          this.loadAdmOverview()
          this.loadOverview()
        })
        .catch((err) => toast(err.message))
    },
    deleteReview(r) {
      uni.showModal({
        title: '删除评价',
        content: '删除后不可恢复，确定删除该评价吗？',
        success: (res) => {
          if (!res.confirm) return
          del('/api/review/' + r.id)
            .then(() => {
              toast('评价已删除', 'success')
              this.loadAdmReviews(true)
              this.loadAdmOverview()
              this.loadOverview()
            })
            .catch((err) => toast(err.message))
        }
      })
    }
  }
}
</script>

<style scoped>
.page {
  padding: 0 24rpx 50rpx;
  box-sizing: border-box;
  min-height: 100vh;
  background-color: #f6f1e8;
  background-image: linear-gradient(rgba(246, 241, 232, 0.9), rgba(246, 241, 232, 0.96)), url('/static/paper.jpg');
  background-size: cover;
  background-position: center top;
  background-attachment: fixed;
}

/* 顶部木质标题条 */
.admin-hero {
  position: relative;
  margin: 0 -24rpx 26rpx;
  height: 280rpx;
  padding: 36rpx 34rpx;
  box-sizing: border-box;
  border-radius: 0 0 36rpx 36rpx;
  overflow: hidden;
}
.ah-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.ah-mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(26, 16, 9, 0.86), rgba(58, 36, 22, 0.56) 55%, rgba(26, 16, 9, 0.88));
}
.ah-in {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
}
.ah-kicker {
  font-size: 20rpx;
  letter-spacing: 6rpx;
  color: rgba(255, 236, 214, 0.58);
}
.ah-title {
  margin-top: 10rpx;
  font-size: 50rpx;
  font-weight: 700;
  color: #fff6e9;
  letter-spacing: 4rpx;
  text-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.35);
}
.ah-sub {
  margin-top: 10rpx;
  font-size: 22rpx;
  letter-spacing: 1rpx;
  color: rgba(255, 238, 220, 0.8);
}

.card {
  background: #fffdf9;
  border-radius: 26rpx;
  padding: 30rpx 26rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 12rpx 30rpx rgba(91, 62, 43, 0.09);
}
.card-title {
  display: flex;
  align-items: center;
  font-size: 30rpx;
  font-weight: 600;
  color: #33281f;
  margin-bottom: 24rpx;
  padding-left: 14rpx;
  border-left: 6rpx solid #c08a4e;
  line-height: 1.2;
}
.ct-ico {
  display: inline-block;
  width: 44rpx;
  height: 44rpx;
  line-height: 44rpx;
  text-align: center;
  font-size: 22rpx;
  font-weight: 600;
  color: #b0762f;
  background: #faf0df;
  border-radius: 12rpx;
  margin-right: 12rpx;
  letter-spacing: 0;
}
.card-title .sub {
  font-size: 21rpx;
  font-weight: 400;
  color: #a89a89;
  margin-left: 8rpx;
}

/* 数据看板 */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.chip {
  flex: 1 1 300rpx;
  background: linear-gradient(160deg, #fdf8ef, #f8efe1);
  border: 2rpx solid #f0e5d3;
  border-radius: 18rpx;
  padding: 20rpx 22rpx;
  box-sizing: border-box;
}
.chip-k {
  display: block;
  font-size: 21rpx;
  color: #8a7f73;
}
.chip-v {
  display: block;
  margin-top: 10rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #33281f;
  letter-spacing: 0.5rpx;
}
.chip-v.hl {
  color: #b0762f;
}

/* 房型与价格 */
.tip-bar {
  background: #faf6ee;
  border-left: 6rpx solid #c08a4e;
  border-radius: 4rpx 14rpx 14rpx 4rpx;
  padding: 14rpx 18rpx;
  margin-bottom: 22rpx;
}
.tip-bar text {
  font-size: 21rpx;
  line-height: 1.6;
  color: #8a7f73;
}
.price-row {
  padding: 18rpx 0;
  border-bottom: 2rpx solid #f8f1e6;
}
.price-row:last-child {
  border-bottom: none;
}
.pr-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.pr-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.pr-name {
  font-size: 27rpx;
  font-weight: 600;
  color: #33281f;
}
.pr-sub {
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #a89a89;
}
.pr-cur {
  display: flex;
  align-items: baseline;
  flex: none;
  margin-left: 16rpx;
}
.pr-cur-num {
  font-size: 34rpx;
  font-weight: 700;
  color: #b0762f;
}
.pr-cur-unit {
  margin-left: 4rpx;
  font-size: 20rpx;
  color: #8a7f73;
}
.pr-edit {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 14rpx;
}
.pr-input {
  flex: 1;
  min-width: 0;
  height: 74rpx;
  line-height: 74rpx;
  padding: 0 18rpx;
  font-size: 26rpx;
  color: #33281f;
  background: #faf6ee;
  border: 2rpx solid #eee3d2;
  border-radius: 16rpx;
}
.plog {
  padding: 12rpx 0;
  border-bottom: 2rpx dashed #efe4d3;
}
.plog:last-child {
  border-bottom: none;
}
.plog-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.plog-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #4a423b;
}
.plog-diff {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}
.plog-diff text {
  font-size: 22rpx;
  color: #8a7f73;
}
.plog-arrow {
  color: #c8b8a2;
}
.plog-new {
  font-size: 22rpx;
  font-weight: 700;
  color: #b0762f !important;
}
.plog-sub {
  margin-top: 6rpx;
  display: flex;
  justify-content: space-between;
  font-size: 20rpx;
  color: #a89a89;
}
.plog-empty {
  padding: 12rpx 0;
  font-size: 21rpx;
  color: #a89a89;
}

/* 评价管理 */
.stars {
  font-size: 24rpx;
  color: #d99a2b;
  letter-spacing: 2rpx;
}
.rev-content {
  margin-top: 12rpx;
  background: #faf6ee;
  border-radius: 14rpx;
  padding: 16rpx 18rpx;
  font-size: 24rpx;
  color: #4a423b;
  line-height: 1.6;
}
.rev-ops {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.badge2 {
  font-size: 21rpx;
  padding: 5rpx 16rpx;
  border-radius: 20rpx;
}
.badge2.on {
  background: #eaf3ec;
  color: #4a7c59;
}
.badge2.off {
  background: #f0ece5;
  color: #8a7f73;
}
.mini-btn {
  margin: 0;
  height: 54rpx;
  line-height: 54rpx;
  font-size: 22rpx;
  padding: 0 24rpx;
  border-radius: 28rpx;
}
.mini-btn::after {
  border: none;
}
.mini-btn.primary {
  background: linear-gradient(135deg, #8a5f3e, #5b3e2b);
  color: #fff;
}
.mini-btn.ghost {
  background: #fffdf9;
  color: #8a5f3e;
  border: 2rpx solid #ddc9ae;
}
.mini-btn.del {
  background: #fbeeee;
  color: #b4534b;
}

/* 评价中心概览 */
.ov-panel {
  background: linear-gradient(160deg, #fdf8ef, #f7efe0);
  border: 2rpx solid #f0e5d3;
  border-radius: 20rpx;
  padding: 24rpx 22rpx;
  margin-bottom: 22rpx;
}
.ov-main {
  display: flex;
  align-items: baseline;
}
.ov-score {
  font-size: 60rpx;
  font-weight: 700;
  line-height: 1;
  color: #b0762f;
}
.ov-score-unit {
  margin-left: 6rpx;
  font-size: 24rpx;
  color: #8a7f73;
}
.ov-score-tip {
  margin-left: 14rpx;
  font-size: 21rpx;
  color: #8a7f73;
}
.ov-nums {
  display: flex;
  margin-top: 18rpx;
}
.ov-num {
  flex: 1;
  text-align: center;
}
.ov-num-v {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #33281f;
}
.ov-num-v.warn {
  color: #b4534b;
}
.ov-num-k {
  display: block;
  margin-top: 6rpx;
  font-size: 21rpx;
  color: #8a7f73;
}
.ov-dist {
  margin-top: 20rpx;
}
.ov-dist-row {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
}
.ov-dist-star {
  width: 66rpx;
  font-size: 20rpx;
  color: #8a7f73;
}
.ov-bar {
  flex: 1;
  height: 14rpx;
  border-radius: 8rpx;
  background: #efe5d5;
  overflow: hidden;
}
.ov-bar-fill {
  height: 14rpx;
  border-radius: 8rpx;
  background: linear-gradient(90deg, #d9b079, #b0762f);
}
.ov-dist-cnt {
  width: 56rpx;
  text-align: right;
  font-size: 20rpx;
  color: #8a7f73;
}

/* 评价条目 */
.rev-item {
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f8f1e6;
}
.rev-item:last-child {
  border-bottom: none;
}
.rev-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.rev-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 14rpx;
}
.rev-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: 14rpx;
  background: #f2ece1;
}
.rev-reply {
  margin-top: 14rpx;
  padding: 14rpx 16rpx;
  background: #f7f1e4;
  border-left: 6rpx solid #c08a4e;
  border-radius: 4rpx 12rpx 12rpx 4rpx;
}
.rev-reply-label {
  display: block;
  font-size: 20rpx;
  color: #b0762f;
}
.rev-reply-text {
  display: block;
  margin-top: 6rpx;
  font-size: 23rpx;
  line-height: 1.6;
  color: #4a423b;
}
.rev-reply-box {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 14rpx;
}
.reply-input {
  flex: 1;
  height: 70rpx;
  line-height: 70rpx;
  padding: 0 18rpx;
  font-size: 23rpx;
  color: #33281f;
  background: #faf6ee;
  border: 2rpx solid #eee3d2;
  border-radius: 16rpx;
}
.rev-log-btn {
  font-size: 21rpx;
  color: #b0762f;
}
.rev-logs {
  margin-top: 14rpx;
  padding: 14rpx 16rpx;
  background: #fbf7ef;
  border-radius: 14rpx;
}
.rev-log {
  padding: 8rpx 0;
  border-bottom: 2rpx dashed #efe4d3;
}
.rev-log:last-child {
  border-bottom: none;
}
.rev-log-act {
  margin-right: 10rpx;
  font-size: 21rpx;
  font-weight: 600;
  color: #8a5f3e;
}
.rev-log-text {
  font-size: 20rpx;
  color: #a89a89;
}
.rev-log-rm {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #6b5b4b;
}
.rev-log-empty {
  padding: 10rpx 0;
  text-align: center;
  font-size: 21rpx;
  color: #a89a89;
}

.field {
  margin-bottom: 22rpx;
}
.label {
  display: block;
  font-size: 23rpx;
  color: #8a7f73;
  margin-bottom: 10rpx;
}
.picker {
  height: 86rpx;
  line-height: 86rpx;
  background: #faf6ee;
  border: 2rpx solid #eee3d2;
  border-radius: 18rpx;
  padding: 0 24rpx;
  font-size: 27rpx;
  color: #33281f;
}
.date-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}
.date-row .picker {
  flex: 1;
  min-width: 0;
}
.sep {
  font-size: 24rpx;
  color: #a89a89;
  flex: none;
}
.input {
  height: 86rpx;
  line-height: 86rpx;
  background: #faf6ee;
  border: 2rpx solid #eee3d2;
  border-radius: 18rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #33281f;
}
.input.small {
  width: 210rpx;
  flex: none;
}
.ph {
  color: #bdaf9f;
}

.btn {
  height: 84rpx;
  line-height: 84rpx;
  font-size: 28rpx;
  letter-spacing: 2rpx;
  border-radius: 42rpx;
  margin-top: 8rpx;
}
.btn::after {
  border: none;
}
.btn.primary {
  background: linear-gradient(135deg, #8a5f3e, #5b3e2b);
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(91, 62, 43, 0.22);
}
.btn.ghost {
  background: #fffdf9;
  color: #8a5f3e;
  border: 2rpx solid #ddc9ae;
}
.divider {
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #ece0cf, transparent);
  margin: 30rpx 0;
}

.log {
  padding: 22rpx 0;
  border-bottom: 2rpx solid #f8f1e6;
}
.log:last-child {
  border-bottom: none;
}
.log-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mono {
  font-family: Consolas, monospace;
  font-size: 24rpx;
  color: #8a7f73;
}
.amount {
  font-size: 30rpx;
  font-weight: 700;
  color: #b0762f;
}
.log-sub {
  margin-top: 8rpx;
  display: flex;
  justify-content: space-between;
  font-size: 21rpx;
  color: #a89a89;
}
.empty {
  text-align: center;
  color: #a89a89;
  font-size: 26rpx;
  padding: 60rpx 0;
}
.load-more {
  text-align: center;
  font-size: 23rpx;
  color: #a89a89;
  padding: 24rpx 0 8rpx;
}
</style>

