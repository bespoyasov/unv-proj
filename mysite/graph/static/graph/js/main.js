// Конфиг
const config = {
  baseurl: '/',
  apiPrefix: 'api/v1/'
}


// АПИ
const getData = () => {
  const apiUrl = config.baseurl + config.apiPrefix + 'stats'

  return axios
    .get(apiUrl)
    .then(res => { return res.data })
    .catch(err => { console.error(err) })
}


// Хелперы
const getEl = (selector) => {
  return document.querySelectorAll(selector)[0]
}

const getCase = (_number, _case1, _case2, _case3) => {
  var base = _number - Math.floor(_number / 100) * 100
  var result

  if (base > 9 && base < 20) {
    result = _case3
  } else {
    var remainder = _number - Math.floor(_number / 10) * 10

    if (1 == remainder) result = _case1
    else if (0 < remainder && 5 > remainder) result = _case2
    else result = _case3
  }

  return result
}


// Основа
getData()
  .then(stats => {

    // преобразуем в удобоваримый вид
    _.forEach(stats, item => {
      if (!item.ref) return

      const refs = item.ref.split(',')
      item.ref = {}

      _.forEach(refs, r => {
        if (!item.ref[r]) item.ref[r] = 1
        else item.ref[r] += 1
      })
    })

    // создаём нормальный текст
    let statsHtml = '<div class="stats">'

    _.forEach(stats, item => {
      statsHtml += '<div class="stats-page">' + item.title + '</div>'

      if (item.ref && Object.keys(item.ref).length) {
        const keys = Object.keys(item.ref)
        for (let key of keys) {
          const users = item.ref[key]
          statsHtml += '<div class="stats-refs">С «' + key + '» — ' + users + ' ' + getCase(users, 'раз', 'раза', 'раз') + '</div>'
        }
      }
      else {
        statsHtml += '<div class="stats-refs">Переходов внутри домена не было</div>'
      }
    })

    statsHtml += '</div>'

    const rootNode = getEl('#root')
    rootNode.innerHTML = statsHtml
  })
