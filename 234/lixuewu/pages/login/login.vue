<template>
  <view class="page">
    <image class="page-bg" src="/static/login-bg.jpg" mode="aspectFill"></image>
    <view class="page-mask"></view>
    <view class="page-inner">
      <view class="brand">
        <view class="brand-seal">云</view>
        <text class="hero-title">云栖民宿</text>
        <text class="hero-en">YUNQI HOMESTAY</text>
        <view class="brand-line"></view>
        <text class="hero-sub">山野木屋 · 云海晨光 · 静候你来</text>
      </view>

      <view class="card">
      <view class="field">
        <text class="label">账号</text>
        <input class="input" v-model="username" placeholder="admin" placeholder-class="ph" />
      </view>
      <view class="field">
        <text class="label">密码</text>
        <input class="input" v-model="password" password placeholder="admin123" placeholder-class="ph"
          @confirm="doLogin" />
      </view>

      <button class="btn primary" :loading="loading" :disabled="loading" @tap="doLogin">登 录</button>
      <button class="btn ghost" :loading="loading" :disabled="loading" @tap="doRegister">注册新账号</button>

      <view class="tips">
        <text class="tips-title">欢迎登录</text>
        <view class="tip-row" @tap="quickFill('admin', 'admin123')">
          <text>admin / admin123</text><text class="tip-arrow">管理员  →</text>
        </view>
        <view class="tip-row" @tap="quickFill('lixuewu', '123456')">
          <text>lixuewu / 123456</text><text class="tip-arrow">普通用户 →</text>
        </view>
       
      </view>
      </view>
    </view>
  </view>
</template>

<script>
import { post, getToken, setToken } from '@/common/request.js'
import { toast } from '@/common/util.js'

export default {
  data() {
    return {
      username: '',
      password: '',
      loading: false
    }
  },
  onLoad() {

    if (getToken()) {
      uni.reLaunch({ url: '/pages/index/index' })
    }
  },
  methods: {
    quickFill(username, password) {
      this.username = username
      this.password = password
    },
    doLogin() {
      if (!this.username.trim() || !this.password) {
        toast('请输入账号和密码')
        return
      }
      this.loading = true
      post('/api/auth/login', {
        username: this.username.trim(),
        password: this.password
      })
        .then((vo) => {
          setToken(vo.token)
          toast('登录成功，欢迎 ' + (vo.user.nickname || vo.user.username), 'success')
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/index/index' })
          }, 700)
        })
        .catch((err) => toast(err.message))
        .finally(() => {
          this.loading = false
        })
    },
    doRegister() {
      const username = this.username.trim()
      const password = this.password
      if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
        toast('账号需 3-20 位字母/数字/下划线')
        return
      }
      if (password.length < 6) {
        toast('密码至少 6 位')
        return
      }
      this.loading = true
      post('/api/auth/register', {
        username: username,
        password: password,
        nickname: username
      })
        .then((vo) => {
          setToken(vo.token)
          toast('注册成功，已自动登录', 'success')
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/index/index' })
          }, 700)
        })
        .catch((err) => toast(err.message))
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 80rpx;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}
.page-bg {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
}
.page-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(24, 18, 26, 0.62) 0%, rgba(30, 20, 14, 0.45) 38%, rgba(20, 13, 8, 0.86) 100%);
}
.page-inner {
  position: relative;
  z-index: 3;
  padding: 0 32rpx;
}


.brand {
  padding: 110rpx 8rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.brand-seal {
  width: 100rpx;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 46rpx;
  font-weight: 600;
  color: #fdf3e4;
  border: 2rpx solid rgba(253, 243, 228, 0.7);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  letter-spacing: 2rpx;
  box-shadow: 0 0 0 8rpx rgba(255, 255, 255, 0.06);
}
.hero-title {
  margin-top: 26rpx;
  font-size: 58rpx;
  font-weight: 700;
  color: #fffaf2;
  letter-spacing: 12rpx;
  text-shadow: 0 6rpx 22rpx rgba(0, 0, 0, 0.4);
}
.hero-en {
  margin-top: 12rpx;
  font-size: 20rpx;
  letter-spacing: 8rpx;
  color: rgba(255, 245, 232, 0.72);
}
.brand-line {
  margin: 26rpx 0 18rpx;
  width: 120rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, rgba(255, 235, 210, 0.7), transparent);
}
.hero-sub {
  font-size: 23rpx;
  letter-spacing: 2rpx;
  color: rgba(255, 240, 224, 0.78);
}

/* 登录卡片 */
.card {
  background: rgba(255, 253, 249, 0.97);
  border-radius: 30rpx;
  padding: 40rpx 34rpx 34rpx;
  box-shadow: 0 24rpx 60rpx rgba(20, 13, 8, 0.32);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
}

.field {
  margin-bottom: 26rpx;
}
.label {
  display: block;
  font-size: 24rpx;
  color: #8a7f73;
  margin-bottom: 12rpx;
  letter-spacing: 1rpx;
}
.input {
  height: 92rpx;
  line-height: 92rpx;
  background: #fffaf2;
  border: 2rpx solid #eee3d2;
  border-radius: 18rpx;
  padding: 0 26rpx;
  font-size: 28rpx;
  color: #33281f;
}
.ph {
  color: #bdaf9f;
}

.btn {
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 46rpx;
  font-size: 30rpx;
  letter-spacing: 4rpx;
  margin-top: 22rpx;
}
.btn::after {
  border: none;
}
.btn.primary {
  background: linear-gradient(135deg, #8a5f3e, #5b3e2b);
  color: #fff;
  box-shadow: 0 12rpx 28rpx rgba(91, 62, 43, 0.26);
}
.btn.ghost {
  background: transparent;
  color: #8a5f3e;
  border: 2rpx solid #d8c4a8;
}

.tips {
  margin-top: 34rpx;
  background: #f9f2e6;
  border-radius: 18rpx;
  padding: 22rpx 24rpx;
  border: 1rpx dashed #e6d6bd;
}
.tips-title {
  display: block;
  font-size: 22rpx;
  color: #9c9184;
  margin-bottom: 10rpx;
  letter-spacing: 1rpx;
}
.tip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
  font-size: 26rpx;
  color: #3a2e24;
}
.tip-arrow {
  font-size: 22rpx;
  color: #b0762f;
}
</style>

