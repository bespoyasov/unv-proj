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


// Основа
getData()
  .then(stats => {
    console.log(stats)
  })
