'use strict';

// Конфиг
var config = {
  baseurl: '/',
  apiPrefix: 'api/v1/',
  protocol: 'graph', // 'map', 'graph'
};

// АПИ
var getData = function getData() {
  var apiUrl = config.baseurl + config.apiPrefix + 'stats';

  return axios.get(apiUrl).then(function (res) {
    return res.data;
  }).catch(function (err) {
    console.error(err);
  });
};

// Хелперы
var getEl = function getEl(selector) {
  return document.querySelectorAll(selector)[0];
};

var getCase = function getCase(_number, _case1, _case2, _case3) {
  var base = _number - Math.floor(_number / 100) * 100;
  var result;

  if (base > 9 && base < 20) {
    result = _case3;
  } else {
    var remainder = _number - Math.floor(_number / 10) * 10;

    if (1 == remainder) result = _case1;else if (0 < remainder && 5 > remainder) result = _case2;else result = _case3;
  }

  return result;
};

// Основа
getData().then(function (stats) {
  // stats.splice(9, 2)

  _.forEach(stats, function (item) {
    if (!item.ref) return;

    var refs = item.ref.split(',');
    item.ref = {};

    _.forEach(refs, function (r) {
      if (!item.ref[r]) item.ref[r] = 1;else item.ref[r] += 1;
    });
  });

  var statsHtml = '<div class="stats">';
  var noTransitions = []

  _.forEach(stats, function (item) {
    statsHtml += '<div class="stats-page"><span class="title">' + item.title + '</span><span class="url">(' + item.url + ')</span></div>';

    if (item.ref && Object.keys(item.ref).length) {
      var keys = Object.keys(item.ref);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          var users = item.ref[key];
          statsHtml += '<div class="stats-refs"><span class="leftpart">с <span class="url">' + key + '</span></span> ' + users + ' ' + getCase(users, 'раз', 'раза', 'раз') + '</div>';
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } else {
      noTransitions.push(item)
      statsHtml += '<div class="stats-refs">Переходов внутри домена не было</div>';
    }
  });

  statsHtml += '</div>';


  var criticalHtml = '<div><p>Список страниц, не посещённых пользователями:</p>'
  for (var i in noTransitions) {
    var item = noTransitions[i]
    console.log(item.title)
    criticalHtml += ('<div><span class="no-transition-name">' + item.title + '</span> <span class="url">(' + item.url + ')</span></div>')
  }
  criticalHtml += '</div>'


  var rootNode = getEl('#root');
  var criticalNode = getEl('#critical');

  if (config.protocol !== 'map') {
    rootNode.innerHTML = statsHtml;
    criticalNode.innerHTML = criticalHtml
  }

  var titleNode = getEl('#title');
  titleNode.innerHTML = config.protocol !== 'map' 
    ? 'Статистика по переходам'
    : 'Карта возможных переходов по страницам сайта'
  
  if (config.protocol === 'map' ) {
    getEl('html').classList.add('is-map')
  }

  var nodes = {};
  var links = _.reduce(stats, function (res, item) {
    var target = item.url;
    var refs = item.ref;
    var idx = _.findIndex(stats, function(o) { return o.url === target })

    _.forEach(Object.keys(refs), function (ref) {
      var repeat = _.findIndex(res, function (o) {
        return o.target == target && o.source == ref;
      });
      if (repeat > -1) {
        res[repeat].value += refs[ref];
        res[repeat].count += refs[ref];
      } else {
        res.push({
          idx: idx,
          target: target,
          source: ref,
          value: refs[ref],
          count: refs[ref]
        });
      }
    });

    return res;
  }, []);

  links.forEach(function (link) {
    link.source = nodes[link.source] || (nodes[link.source] = { name: link.source });
    link.target = nodes[link.target] || (nodes[link.target] = { name: link.target });
    link.value = +link.value;
    link.count = +link.count;
  });

  var bridges
  if (config.protocol === 'map' ) {
    bridges = findBridges(stats)
  }

  var width = 800,
      height = 600;

  var force = d3.layout.force().nodes(d3.values(nodes)).links(links).size([width, height]).gravity(0.05)
  // .linkDistance(d => d.value * 110)
  .linkDistance(200).charge(-400).on("tick", tick).start();

  var v = d3.scale.linear().range([0, 100]).domain([0, d3.max(links, function (d) {
    return d.value;
  })]);

  links.forEach(function (link) {
    link.opacity = v(link.value) / 100;
  });

  var svg = d3.select('body').append('svg').attr({
    'id': 'rootsvg',
    'width': width,
    'height': height
  });

  svg.append('svg:defs').selectAll('marker').data(['end']).enter().append("svg:marker").attr({
    'id': String,
    'viewBox': '0 -5 10 10',
    'refX': 15,
    'refY': 0,
    'markerWidth': 6,
    'markerHeight': 6,
    'orient': 'auto'
  }).append('svg:path').attr('d', 'M0,-5L10,0L0,5');

  var path = svg.append('svg:g').selectAll('path').data(force.links()).enter().append('svg:path').attr({
    'class': 'link',
    'id': function id(d, i) {
      var source = d.source.index
      var target = d.idx
      return 'edgepath-' + source + '-' + target;
    },
    'opacity': function opacity(d) {
      return d.opacity;
    },
    'marker-end': config.protocol === 'map' ? '' : 'url(#end)'
  });

  if (config.protocol !== 'map') {
    var edgelabels = svg.selectAll('.edgelabel').data(force.links()).enter().append('text').style('pointer-events', 'none').attr({
      'class': 'edgelabel',
      'id': function id(d, i) {
        return 'edgelabel' + i;
      },
      'dx': 100,
      'dy': 0,
      'font-size': 10,
      'fill': '#999999'
    });

    edgelabels.append('textPath').attr('xlink:href', function (d, i) {
      return '#edgepath' + i;
    }).style('pointer-events', 'none').text(function (d) {
      return d.count;
    });
  }

  var node = svg.selectAll('.node').data(force.nodes()).enter().append('g').attr('class', 'node').call(force.drag);

  node.append('circle').attr('r', 6);

  node.append('text').attr('x', 15).attr('dy', '.35em').text(function (d) {
    return d.name;
  });

  if (config.protocol === 'map' ) {
    for (var i in bridges) {
      var bridge = bridges[i]
      var source = bridge[0]
      var target = bridge[1]
      var nd = getEl('#edgepath-' + source + '-' + target)
      if (nd && nd.classList) nd.classList.add('is-bridge')
    }
  }

  function tick() {
    path.attr('d', function (d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = 0;

      return 'M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.target.x + ',' + d.target.y;
    });

    node.attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  }
});


function createMatrix(stats) {
  var matrix = []
  var vertices = []

  for (var i in stats) {
    var item = stats[i]
    var index = vertices.length
    vertices[index] = item.url
    matrix[index] = []
  }

  for (var i in vertices) {
    var vertex = vertices[i]

    for (var j in stats) {
      var keys = Object.keys(stats[j].ref)
      // для таблицы инцидентности
      // matrix[i].push(keys.indexOf(vertex) > -1 ? 1 : 0)
      // для поиска DFS
      if (keys.indexOf(vertex) > -1) matrix[i].push(+j)
    }
  }
  
  return matrix
}


function findBridges(stats) {
  var g = createMatrix(stats)
  var MAXN = g.length
  var bridges = []
  var used = []
  var tin = []
  var fup = []
  var timer

  main()
  return bridges
 
  function dfs(v, p=-1) {
    used[v] = true
    tin[v] = fup[v] = timer++

    for (var i=0; i<g[v].length; ++i) {
      var to = g[v][i]
      if (to == p)  continue
      if (used[to]) fup[v] = Math.min(fup[v], tin[to])
      else {
        dfs(to, v)
        fup[v] = Math.min(fup[v], fup[to])
        if (fup[to] > tin[v]) markBridge(v, to)
      }
    }
  }
 
  function main() {
    timer = 0
    for (var i = 0; i < MAXN; ++i) {
      used[i] = false
    }
    for (var i = 0; i < MAXN; ++i) {
      if (!used[i]) dfs(i)
    }
  }


  function markBridge(v, i) {
    bridges.push([v, i])
  }
}



// function findBridges_backup() {
//   var pre = []
//   var low = []
//   var p = []
//   var pre_c
  
//   startSearch(graph)

//   function dfs(v, size) {
//     pre[v] = pre_c
//     low[v] = pre_c
//     pre_c++
    
//     for(var i = 0; i < size; i++) {
//       if (graph[v][i] !== 0) {

//         if(pre[i] === 0) {
//           p[i] = v
//           dfs(i)

//           low[v] = Math.min(low[v], low[i])
//           if (low[i] > pre[v]) markBridge(v,i)
//         }
//         else if (p[v] !== i) {
//           low[v] = Math.min(low[v], pre[i])
//         } 
//       }
//     }
//   }


//   function startSearch(graph) {
//     var size = graph.length
//     pre_c=1
//     pre = []
//     low = []
//     p = []

//     for(var i = 0; i < size; i++) {
//       pre[i] = low[i] = p[i] = 0
//     }
//     for(var i = 0; i < size; i++) {
//       if (pre[i] == 0) dfs(i, size)
//     }
//   }
// }