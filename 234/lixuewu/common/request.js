import config from './config.js'

/**
 * 统一请求封装
 * 后端所有接口都返回 { code, msg, data }：code === 200 视为成功，直接 resolve(data)
 *
 * 阶段二改造：
 * 1. 请求自动携带登录令牌（Authorization: Bearer xxx）；
 * 2. 后端返回 code 401 时清除本地令牌并跳转登录页，避免页面一直报错。
 */
export function getToken() {
  return uni.getStorageSync(config.tokenKey) || ''
}

export function setToken(token) {
  if (token) {
    uni.setStorageSync(config.tokenKey, token)
  } else {
    uni.removeStorageSync(config.tokenKey)
  }
}

function request(options) {
  return new Promise((resolve, reject) => {
    const header = {
      'Content-Type': 'application/json'
    }
    const token = getToken()
    if (token) {
      header['Authorization'] = 'Bearer ' + token
    }
    uni.request({
      url: config.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: config.timeout,
      header: header,
      success(res) {
        const body = res.data
        if (!body || typeof body.code === 'undefined') {
          reject(new Error('接口返回格式异常（HTTP ' + res.statusCode + '）'))
          return
        }
        if (body.code === 401) {
          // 令牌失效：清掉本地令牌并去登录页
          setToken('')
          uni.showToast({ title: body.msg || '请先登录', icon: 'none' })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/login/login' })
          }, 600)
          reject(new Error(body.msg || '请先登录'))
          return
        }
        if (body.code === 200) {
          resolve(body.data)
        } else {
          reject(new Error(body.msg || '操作失败'))
        }
      },
      fail() {
        reject(new Error('网络请求失败，请确认后端已启动：' + config.baseUrl))
      }
    })
  })
}

export function get(url, data) {
  return request({ url: url, method: 'GET', data: data })
}

export function post(url, data) {
  return request({ url: url, method: 'POST', data: data })
}

export function put(url, data) {
  return request({ url: url, method: 'PUT', data: data })
}

export function del(url, data) {
  return request({ url: url, method: 'DELETE', data: data })
}

export default request
