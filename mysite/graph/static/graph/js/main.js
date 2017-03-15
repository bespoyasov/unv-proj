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


    let links = _.reduce(stats, (res, item) => {
      const target = item.url
      const refs = item.ref

      _.forEach(Object.keys(refs), (ref) => {
        const repeat = _.findIndex(res, o => o.target == target && o.source == ref)
        if (repeat > -1) {
          res[repeat].value += refs[ref]
        }
        else {
          res.push({
            target: target,
            source: ref,
            value: refs[ref]
          })
        }
      })

      return res
    }, [])

    let nodes = {}

    links.forEach(function(link) {
      link.source = nodes[link.source] ||
          (nodes[link.source] = {name: link.source});
      link.target = nodes[link.target] ||
          (nodes[link.target] = {name: link.target});
      link.value = +link.value;
    });

    let width = 960,
        height = 500

    let force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .gravity(0.05)
      .linkDistance(d => d.value * 110)
      .charge(-300)
      .on("tick", tick)
      .start();


    let v = d3.scale.linear().range([0, 100]);
    v.domain([0, d3.max(links, function(d) { return d.value; })]);

    links.forEach(function(link) {
      link.opacity = v(link.value) / 100
    });

    let svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("svg:defs").selectAll("marker")
        .data(["end"])
      .enter().append("svg:marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    let path = svg.append("svg:g").selectAll("path")
        .data(force.links())
      .enter().append("svg:path")
        .attr("class", 'link')
        .attr('opacity', d => d.opacity)
        .attr("marker-end", "url(#end)");

    let node = svg.selectAll(".node")
        .data(force.nodes())
      .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    node.append("circle")
        .attr("r", 6);

    node.append("text")
        .attr("x", 15)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; });

    function tick() {
      path.attr("d", function(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = 0

        return "M" +
          d.source.x + "," +
          d.source.y + "A" +
          dr + "," + dr + " 0 0,1 " +
          d.target.x + "," +
          d.target.y
      })

      node.attr("transform", function(d) {
	      return "translate(" + d.x + "," + d.y + ")";
      })
    }
  })
