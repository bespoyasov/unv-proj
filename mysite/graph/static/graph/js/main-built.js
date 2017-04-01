'use strict';

// Конфиг
var config = {
  baseurl: '/',
  apiPrefix: 'api/v1/'
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

  _.forEach(stats, function (item) {
    if (!item.ref) return;

    var refs = item.ref.split(',');
    item.ref = {};

    _.forEach(refs, function (r) {
      if (!item.ref[r]) item.ref[r] = 1;else item.ref[r] += 1;
    });
  });

  var statsHtml = '<div class="stats">';

  _.forEach(stats, function (item) {
    statsHtml += '<div class="stats-page">' + item.title + ', <span class="url">(' + item.url + ')</span></div>';

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
      statsHtml += '<div class="stats-refs">Переходов внутри домена не было</div>';
    }
  });

  statsHtml += '</div>';

  var rootNode = getEl('#root');
  rootNode.innerHTML = statsHtml;

  var nodes = {};
  var links = _.reduce(stats, function (res, item) {
    var target = item.url;
    var refs = item.ref;

    _.forEach(Object.keys(refs), function (ref) {
      var repeat = _.findIndex(res, function (o) {
        return o.target == target && o.source == ref;
      });
      if (repeat > -1) {
        res[repeat].value += refs[ref];
        res[repeat].count += refs[ref];
      } else {
        res.push({
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

  var width = 800,
      height = 500;

  var force = d3.layout.force().nodes(d3.values(nodes)).links(links).size([width, height]).gravity(0.05)
  // .linkDistance(d => d.value * 110)
  .linkDistance(150).charge(-300).on("tick", tick).start();

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
      return 'edgepath' + i;
    },
    'opacity': function opacity(d) {
      return d.opacity;
    },
    'marker-end': 'url(#end)'
  });

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

  var node = svg.selectAll('.node').data(force.nodes()).enter().append('g').attr('class', 'node').call(force.drag);

  node.append('circle').attr('r', 6);

  node.append('text').attr('x', 15).attr('dy', '.35em').text(function (d) {
    return d.name;
  });

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
