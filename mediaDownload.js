/**
 * 获微信公众号中取指定类型的素材
 * @param  {[String]} type 素材的类型，图片（image）、视频（video）、语音 （voice）、图文（news）
 * @return {[void]} 运行后自动在当前文件夹下开始图片下载
 */

const axios = require('axios')
const fs = require('fs')

const appId = 'wx7636c442c4fe4e4c' // 这里换上你自己的appId
const appSecret = '2cc2fc23bfc81643615560b130d20bc3' // 这里换上你自己的appSecret

async function getMedia(type) {
  const token = await getToken()
  const count = await getMediaTotalCount(type)
  console.log(`你下载的是${type}类型的素材，共有${count}条数据`)
  for (let i = 0; i < count; i++) {
    const res = await axios.post(`https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=${token}`, {
      "type": type,
      "offset": i,
      "count": 1
    })
    const id = res.data.item[0].media_id
    const name = res.data.item[0].name
    const source = await axios({
      url: `https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=${token}`,
      method: "POST",
      responseType: "stream",
      data: {
        "media_id": id
      }
    })
    source.data.pipe(fs.createWriteStream(`./${name}`))
  }
  console.log('下载完成')
}

async function getMediaTotalCount(type) {
  const query = type + '_count'
  const token = await getToken()
  const res = await axios.get(`https://api.weixin.qq.com/cgi-bin/material/get_materialcount?access_token=${token}`)
  const count = await res.data[query]
  return count
}

async function getToken() {
  const res = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`)
  if (res.data.errmsg) {
    console.warn(res.data.errmsg + '\n请将上述IP地址添加到微信公众号开发基本配置的IP白名单中')
  } else {
    const token = await res.data.access_token
    return token
  }
}

getMedia('image') // 这里请求的素材类型是图片
