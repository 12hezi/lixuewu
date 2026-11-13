<template>
  <view class="page">
    <view class="status-card" v-if="order">
      <image class="sc-bg" src="/static/hero.jpg" mode="aspectFill"></image>
      <view class="sc-mask"></view>
      <view class="sc-in">
        <text class="status-text">{{ order.statusText }}</text>
        <text class="status-sub">{{ statusTip }}</text>
      </view>
    </view>

    <view class="card" v-if="order">
      <view class="card-head">
        <text class="ch-title">预订信息</text>
        <text class="ch-tip">入住安排</text>
      </view>
      <view class="row">
        <text class="label">房型</text>
        <text class="value strong">{{ order.roomTypeName }}</text>
      </view>
      <view class="row">
        <text class="label">入住</text>
        <text class="value">{{ order.checkIn }}（{{ weekday(order.checkIn) }}）</text>
      </view>
      <view class="row">
        <text class="label">退房</text>
        <text class="value">{{ order.checkOut }}（{{ weekday(order.checkOut) }}）</text>
      </view>
      <view class="row">
        <text class="label">住宿</text>
        <text class="value">{{ order.nights }} 晚</text>
      </view>
      <view class="row total">
        <text class="label">订单金额</text>
        <text class="value amount">￥{{ money(order.totalAmount) }}</text>
      </view>
    </view>

    <view class="card" v-if="order">
      <view class="card-head">
        <text class="ch-title">订单信息</text>
        <text class="ch-tip">交易记录</text>
      </view>
      <view class="row">
        <text class="label">订单号</text>
        <text class="value mono">{{ order.orderNo }}</text>
      </view>
      <view class="row">
        <text class="label">下单时间</text>
        <text class="value">{{ order.createTime || '—' }}</text>
      </view>
      <view class="row">
        <text class="label">支付时间</text>
        <text class="value">{{ order.payTime || '—' }}</text>
      </view>
      <view class="row">
        <text class="label">取消时间</text>
        <text class="value">{{ order.cancelTime || '—' }}</text>
      </view>
    </view>

    <!-- 阶段五：仅已离店订单可发评价；已评价过的历史订单仍显示只读评价 -->
    <view class="card review-card" v-if="order && (order.reviewed || order.orderStatus === 5)">
      <view class="review-head">
        <text class="review-title">{{ order.reviewed ? '我的评价' : '评价本单' }}</text>
        <text class="review-sub" v-if="order.reviewed">一单一评 · 已发布</text>
        <text class="review-sub" v-else>本次入住体验如何？评分将展示在房型评价区</text>
      </view>

      <view v-if="!order.reviewed">
        <view class="stars">
          <text v-for="i in 5" :key="i" class="star" :class="{ on: i <= reviewScore }" @tap="reviewScore = i">{{ i <= reviewScore ? '★' : '☆' }}</text>
        </view>
        <textarea class="review-input" v-model="reviewContent" maxlength="500" placeholder="说说这次入住体验（最多 500 字）" placeholder-class="ph"></textarea>

        <view class="img-field">
          <view class="img-field-head">
            <text class="img-field-label">现场照片</text>
            <text class="img-field-tip">选填 · 最多 3 张 · 单张不超过 5MB</text>
          </view>
          <view class="img-strip">
            <view class="img-box" v-for="(img, idx) in reviewImages" :key="img">
              <image class="img-thumb" :src="imgFull(img)" mode="aspectFill"></image>
              <view class="img-del" @tap="removeImage(idx)"><text class="img-del-x">×</text></view>
            </view>
            <view class="img-add" v-if="reviewImages.length < 3" @tap="chooseImages">
              <text class="img-add-plus">+</text>
              <text class="img-add-text">{{ uploading ? '上传中…' : '添加照片' }}</text>
            </view>
          </view>
        </view>

        <button class="btn submit" :loading="submitting" :disabled="submitting" @tap="submitReview">发布评价</button>
      </view>

      <view v-else>
        <view class="stars">
          <text v-for="i in 5" :key="i" class="star" :class="{ on: i <= (myReview.score || 0) }">{{ i <= (myReview.score || 0) ? '★' : '☆' }}</text>
        </view>
        <view class="my-review" v-if="myReview && myReview.content">
          <text>{{ myReview.content }}</text>
          <text class="review-time">{{ myReview.createTime }}</text>
        </view>
        <view class="my-review empty-tip" v-else><text>已评价（未填写文字内容）</text></view>
        <view class="my-images" v-if="myReview && myReview.images && myReview.images.length">
          <image v-for="img in myReview.images" :key="img" class="my-image" :src="imgFull(img)" mode="aspectFill" @tap="previewImage(img)"></image>
        </view>
        <view class="reply-block" v-if="myReview && myReview.replyContent">
          <text class="reply-label">民宿回复</text>
          <text class="reply-text">{{ myReview.replyContent }}</text>
          <text class="reply-time" v-if="myReview.replyTime">{{ myReview.replyTime }}</text>
        </view>
      </view>
    </view>

    <view class="loading" v-if="loading">订单加载中...</view>
    <view class="loading" v-if="!loading && !order">订单不存在或已删除</view>

    <view class="footer" v-if="order && order.orderStatus === 0">
      <button class="btn ghost" @tap="cancelOrder">取消订单</button>
      <button class="btn primary" :loading="paying" :disabled="paying" @tap="payOrder">立即支付 ￥{{ money(order.totalAmount) }}</button>
    </view>
    <view class="footer" v-else-if="order && isAdmin && (order.orderStatus === 1 || order.orderStatus === 4)">
      <button class="btn primary" :loading="acting" :disabled="acting" @tap="adminOperate">{{ order.orderStatus === 1 ? '办理入住' : '办理离店' }}</button>
    </view>
  </view>
</template>

<script>
import { get, post, getToken } from '@/common/request.js'
import { money, weekdayText, toast } from '@/common/util.js'
import config from '@/common/config.js'

const BASE_URL = config.baseUrl

export default {
  data() {
    return {
      orderNo: '',
      order: null,
      loading: true,
      paying: false,
      reviewScore: 5,
      reviewContent: '',
      submitting: false,
      myReview: null,
      reviewImages: [],
      uploading: false,
      isAdmin: false,
      acting: false
    }
  },
  computed: {
    statusTip() {
      if (!this.order) return ''
      switch (this.order.orderStatus) {
        case 0:
          return '请在 15 分钟内完成支付，超时系统会自动关闭并释放房间'
        case 1:
          return '支付成功，凭订单号到店办理入住即可，离店后即可评价'
        case 2:
          return '订单已取消，房间库存已释放'
        case 3:
          return '订单超时未支付，系统已自动关闭'
        case 4:
          return '已办理入住，退房时请到前台办理离店，离店后即可评价'
        case 5:
          return '已办理离店，欢迎再次光临，可对本次入住发表评价'
        default:
          return ''
      }
    }
  },
  onLoad(options) {
    this.orderNo = options.orderNo || ''
    get('/api/auth/me')
      .then((me) => {
        this.isAdmin = me.role === 1
      })
      .catch(() => {})
    this.load()
  },
  methods: {
    money(v) {
      return money(v)
    },
    weekday(date) {
      return weekdayText(date)
    },
    load() {
      if (!this.orderNo) {
        this.loading = false
        return
      }
      this.loading = true
      get('/api/order/detail', { orderNo: this.orderNo })
        .then((data) => {
          this.order = data
          if (data.reviewed) {
            this.loadMyReview()
          }
        })
        .catch((err) => toast(err.message))
        .finally(() => {
          this.loading = false
        })
    },
    loadMyReview() {
      get('/api/review/page', { roomTypeId: this.order.roomTypeId, pageNum: 1, pageSize: 50 })
        .then((page) => {
          const hit = (page.records || []).filter((r) => r.orderNo === this.orderNo)[0]
          if (hit) {
            this.myReview = hit
            this.reviewScore = hit.score
          }
        })
        .catch(() => {})
    },
    adminOperate() {
      if (this.acting) return
      const isCheckin = this.order.orderStatus === 1
      const api = isCheckin ? '/api/order/checkin' : '/api/order/checkout'
      const title = isCheckin ? '办理入住' : '办理离店'
      uni.showModal({
        title: title,
        content: '确认订单 ' + this.order.orderNo + ' ' + title + '？',
        success: (res) => {
          if (!res.confirm) return
          this.acting = true
          post(api + '?orderNo=' + encodeURIComponent(this.order.orderNo))
            .then(() => {
              toast(title + '成功', 'success')
              this.load()
            })
            .catch((err) => toast(err.message))
            .finally(() => {
              this.acting = false
            })
        }
      })
    },
    imgFull(url) {
      if (!url) return ''
      return url.indexOf('http') === 0 ? url : BASE_URL + url
    },
    previewImage(url) {
      const urls = (this.myReview && this.myReview.images ? this.myReview.images : []).map((u) => this.imgFull(u))
      uni.previewImage({ urls: urls, current: this.imgFull(url) })
    },
    removeImage(idx) {
      this.reviewImages.splice(idx, 1)
    },
    chooseImages() {
      const left = 3 - this.reviewImages.length
      if (left <= 0 || this.uploading) return
      uni.chooseImage({
        count: left,
        sizeType: ['compressed'],
        success: (res) => {
          const paths = res.tempFilePaths || []
          if (!paths.length) return
          this.uploading = true
          let chain = Promise.resolve()
          paths.forEach((path) => {
            chain = chain.then(() => this.uploadOne(path).then((url) => {
              if (this.reviewImages.length < 3 && url) this.reviewImages.push(url)
            }))
          })
          chain
            .then(() => toast('照片已添加', 'success'))
            .catch((err) => toast(err.message || '照片上传失败'))
            .finally(() => {
              this.uploading = false
            })
        }
      })
    },
    // H5 走 fetch + FormData（blob 临时路径最稳），App/小程序走 uni.uploadFile
    uploadOne(tempPath) {
      const tk = getToken()
      // #ifdef H5
      return fetch(tempPath)
        .then((r) => r.blob())
        .then((blob) => {
          const fd = new FormData()
          fd.append('file', blob, 'review-' + Date.now() + '.jpg')
          return fetch(BASE_URL + '/api/upload/review-image', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + tk },
            body: fd
          })
        })
        .then((r) => r.json())
        .then((res) => {
          if (res.code !== 200) throw new Error(res.msg || '照片上传失败')
          return res.data
        })
      // #endif
      // #ifndef H5
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: BASE_URL + '/api/upload/review-image',
          filePath: tempPath,
          name: 'file',
          header: { Authorization: 'Bearer ' + tk },
          success: (r) => {
            try {
              const res = JSON.parse(r.data)
              if (res.code !== 200) {
                reject(new Error(res.msg || '照片上传失败'))
                return
              }
              resolve(res.data)
            } catch (e) {
              reject(new Error('照片上传失败'))
            }
          },
          fail: () => reject(new Error('照片上传失败'))
        })
      })
      // #endif
    },
    submitReview() {
      if (this.submitting) return
      this.submitting = true
      post('/api/review/create', {
        orderNo: this.orderNo,
        score: this.reviewScore,
        content: this.reviewContent.trim(),
        imageUrls: this.reviewImages.slice()
      })
        .then(() => {
          toast('评价发布成功', 'success')
          this.order.reviewed = true
          this.loadMyReview()
        })
        .catch((err) => toast(err.message))
        .finally(() => {
          this.submitting = false
        })
    },
    payOrder() {
      if (this.paying) return
      this.paying = true
      post('/api/order/pay?orderNo=' + encodeURIComponent(this.orderNo))
        .then(() => {
          toast('支付成功', 'success')
          this.load()
        })
        .catch((err) => toast(err.message))
        .finally(() => {
          this.paying = false
        })
    },
    cancelOrder() {
      uni.showModal({
        title: '取消订单',
        content: '取消后房间库存会立即释放，确定取消吗？',
        success: (res) => {
          if (!res.confirm) return
          post('/api/order/cancel?orderNo=' + encodeURIComponent(this.orderNo))
            .then(() => {
              toast('已取消，库存已归还', 'success')
              this.load()
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
  padding: 24rpx;
  box-sizing: border-box;
  min-height: 100vh;
  padding-bottom: 200rpx;
  background-color: #f6f1e8;
  background-image: linear-gradient(rgba(246, 241, 232, 0.9), rgba(246, 241, 232, 0.96)), url('/static/paper.jpg');
  background-size: cover;
  background-position: center top;
  background-attachment: fixed;
}

.status-card {
  position: relative;
  border-radius: 26rpx;
  padding: 38rpx 30rpx;
  overflow: hidden;
  box-shadow: 0 16rpx 40rpx rgba(91, 62, 43, 0.16);
}
.sc-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.sc-mask {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(38, 25, 16, 0.88), rgba(58, 38, 24, 0.62) 60%, rgba(38, 25, 16, 0.9));
}
.sc-in {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
}
.status-text {
  font-size: 44rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 3rpx;
  text-shadow: 0 4rpx 14rpx rgba(0, 0, 0, 0.3);
}
.status-sub {
  margin-top: 12rpx;
  font-size: 23rpx;
  line-height: 1.6;
  color: rgba(255, 240, 224, 0.86);
}

.card {
  margin-top: 24rpx;
  background: #fffdf9;
  border-radius: 24rpx;
  padding: 8rpx 26rpx 12rpx;
  box-shadow: 0 10rpx 26rpx rgba(91, 62, 43, 0.08);
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0 14rpx;
  border-bottom: 2rpx solid #f6eee1;
}
.ch-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #33281f;
  padding-left: 14rpx;
  border-left: 6rpx solid #c08a4e;
  line-height: 1;
}
.ch-tip {
  font-size: 21rpx;
  color: #b0a396;
  letter-spacing: 1rpx;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 2rpx solid #f8f1e6;
}
.row:last-child {
  border-bottom: none;
}
.label {
  font-size: 26rpx;
  color: #8a7f73;
}
.value {
  font-size: 26rpx;
  color: #33281f;
  max-width: 62%;
  text-align: right;
}
.value.strong {
  font-size: 30rpx;
  font-weight: 600;
}
.value.mono {
  font-family: Consolas, monospace;
  font-size: 24rpx;
  color: #8a7f73;
}
.value.amount {
  color: #b0762f;
  font-size: 34rpx;
  font-weight: 700;
}
.row.total {
  border-top: 2rpx dashed #ede1cf;
  border-bottom: none;
}

.loading {
  text-align: center;
  color: #8a7f73;
  font-size: 26rpx;
  padding: 100rpx 0;
}

.footer {
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
}
.btn {
  flex: 1;
  margin: 0 0 0 16rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 28rpx;
  border-radius: 44rpx;
}
.btn:first-child {
  margin-left: 0;
}
.btn::after {
  border: none;
}
.btn.primary {
  flex: 2;
  background: linear-gradient(135deg, #8a5f3e, #5b3e2b);
  color: #fff;
  letter-spacing: 2rpx;
  box-shadow: 0 10rpx 24rpx rgba(91, 62, 43, 0.26);
}
.btn.ghost {
  background: #fffdf9;
  color: #8a5f3e;
  border: 2rpx solid #ddc9ae;
}

/* 评价 */
.review-card {
  padding-bottom: 26rpx;
}
.review-head {
  padding: 24rpx 0 14rpx;
  border-bottom: 2rpx solid #f6eee1;
}
.review-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #33281f;
  padding-left: 14rpx;
  border-left: 6rpx solid #c08a4e;
  line-height: 1;
}
.review-sub {
  display: block;
  margin-top: 10rpx;
  font-size: 21rpx;
  color: #a89a89;
}
.stars {
  display: flex;
  margin-top: 22rpx;
}
.star {
  font-size: 54rpx;
  color: #ddd0bd;
  margin-right: 12rpx;
}
.star.on {
  color: #d99a2b;
}
.review-input {
  width: 100%;
  box-sizing: border-box;
  margin-top: 18rpx;
  background: #faf6ee;
  border: 2rpx solid #eee3d2;
  border-radius: 18rpx;
  padding: 20rpx 22rpx;
  font-size: 26rpx;
  color: #33281f;
  min-height: 150rpx;
}
.ph {
  color: #bdaf9f;
}
.btn.submit {
  margin-top: 22rpx;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #8a5f3e, #5b3e2b);
  color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(91, 62, 43, 0.22);
}
.my-review {
  margin-top: 18rpx;
  background: #faf6ee;
  border-radius: 16rpx;
  padding: 20rpx 22rpx;
  font-size: 26rpx;
  color: #4a423b;
  line-height: 1.7;
}
.review-time {
  display: block;
  margin-top: 10rpx;
  font-size: 21rpx;
  color: #b0a396;
}
.my-review.empty-tip {
  color: #8a7f73;
}

/* 评价图片 */
.img-field {
  margin-top: 20rpx;
}
.img-field-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.img-field-label {
  font-size: 24rpx;
  font-weight: 600;
  color: #6b5b4b;
}
.img-field-tip {
  font-size: 19rpx;
  color: #b0a396;
}
.img-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 14rpx;
}
.img-box {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f2ece1;
}
.img-thumb {
  width: 100%;
  height: 100%;
  display: block;
}
.img-del {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(38, 25, 16, 0.72);
}
.img-del-x {
  display: block;
  width: 40rpx;
  height: 40rpx;
  line-height: 36rpx;
  text-align: center;
  font-size: 26rpx;
  color: #fff;
}
.img-add {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #dcc9ae;
  border-radius: 16rpx;
  background: #fbf6ec;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.img-add-plus {
  font-size: 46rpx;
  line-height: 1;
  color: #b0762f;
}
.img-add-text {
  margin-top: 10rpx;
  font-size: 20rpx;
  color: #9c8b78;
}
.my-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}
.my-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  background: #f2ece1;
}
.reply-block {
  margin-top: 16rpx;
  background: #f7f1e4;
  border-left: 6rpx solid #c08a4e;
  border-radius: 4rpx 14rpx 14rpx 4rpx;
  padding: 18rpx 20rpx;
}
.reply-label {
  display: block;
  font-size: 21rpx;
  letter-spacing: 1rpx;
  color: #b0762f;
}
.reply-text {
  display: block;
  margin-top: 8rpx;
  font-size: 25rpx;
  line-height: 1.7;
  color: #4a423b;
}
.reply-time {
  display: block;
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #b0a396;
}
</style>

