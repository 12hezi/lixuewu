<script>
import config from '@/common/config.js'

export default {
  onLaunch() {
    // 启动时打印后端地址，方便排查"连不上后端"的问题
    console.log('[云栖民宿] ：' + config.baseUrl)
  },
  onShow() {},
  onHide() {}
}
</script>

<style>
/* 全局基础样式：所有页面共用 */
page {
  background-color: #f6f1e8;
  color: #33281f;
  font-size: 28rpx;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif;
  box-sizing: border-box;
}

view,
text,
button,
image,
scroll-view {
  box-sizing: border-box;
}
</style>
