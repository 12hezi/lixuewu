/**
 * 通用工具：日期、金额、状态文案
 */

function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

/** Date -> yyyy-MM-dd */
export function formatDate(date) {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
}

/** 今天 yyyy-MM-dd */
export function todayStr() {
  return formatDate(new Date())
}

/** yyyy-MM-dd 加减天数 */
export function addDays(dateStr, n) {
  const d = new Date(dateStr.replace(/-/g, '/'))
  d.setDate(d.getDate() + n)
  return formatDate(d)
}

/** 住宿晚数（退房日不计） */
export function nightsOf(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0
  const a = new Date(checkIn.replace(/-/g, '/'))
  const b = new Date(checkOut.replace(/-/g, '/'))
  return Math.round((b - a) / 86400000)
}

/** 星期文案 */
export function weekdayText(dateStr) {
  if (!dateStr) return ''
  const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return names[new Date(dateStr.replace(/-/g, '/')).getDay()]
}

/** 金额保留两位 */
export function money(value) {
  const n = Number(value)
  if (isNaN(n)) return '0.00'
  return n.toFixed(2)
}

/** 订单状态文案 */
export function statusText(status) {
  const map = { 0: '待支付', 1: '已支付', 2: '已取消', 3: '超时关闭', 4: '已完成' }
  return map[status] || '未知'
}

/** 订单状态样式后缀 */
export function statusClass(status) {
  return 's' + status
}

/** 轻提示 */
export function toast(title, icon) {
  uni.showToast({
    title: title,
    icon: icon || 'none',
    duration: 2500
  })
}
