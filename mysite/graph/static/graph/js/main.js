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


    // преобразуем для Д3 — nodes: {0: {x,y}, 1: {x,y}...}
    // const {width, height} = config.canvas
    // const pageWidth = config.page.width,
    //       pageHeight = config.page.height,
    //       gap = 60
    //
    // const nodes = _.reduce(stats, (res, item) => {
    //   const size = Object.keys(res).length
    //   const half = width / 2
    //   const delta = size % 2 == 0
    //     ? half - (Math.ceil(size / 2) + size % 2) * gap
    //     : half + (Math.ceil(size / 2) + size % 2) * gap
    //
    //   res[size.toString()] = {
    //     x: size == 0 ? half : delta,
    //     y: gap * Math.ceil(size / 2),
    //     url: item.url
    //   }
    //
    //   return res
    // }, {})
    //
    // console.log('Nodes', nodes)
    //
    //
    // // собираем инфу по граням
    // const edges = _.reduce(stats, (res, item) => {
    //   const {ref, url} = item
    //   const id = getNodeId(url, nodes)
    //
    //   _.forEach(Object.keys(ref), item => {
    //     const itemId = getNodeId(item, nodes)
    //     res.push({
    //       source: itemId.toString(),
    //       target: id.toString(),
    //       url: url
    //     })
    //   })
    //
    //   return res
    // }, [])
    //
    // console.log('Edges', edges)
    //
    //
    //
    // // ну и собсно граф
    // const new_scale_x = d3.scale.linear().domain([0, Number.MAX_VALUE]).range([900,50]);
    // const new_scale_y = d3.scale.linear().domain([0, Number.MAX_VALUE]).range([460,50]);
    //
    // for(let i = 0; i < nodes.length; i++){
    //   nodes[i].x = new_scale_x(nodes[i].x)
    //   nodes[i].y = new_scale_y(nodes[i].y)
    // }
    //
    // var fbundling = d3.ForceEdgeBundling().nodes(nodes).edges(edges)
		// var results = fbundling()
    //
    // var svg = d3.select("#svg").append("svg")
    //   .attr("width", 1000)
    //   .attr("height", 600);
    //
    // svg = svg.append('g');
    // svg.append('rect').attr({'fill': '#ffffff', 'width': 1000, 'height':600});
    // svg.attr('transform', 'translate(0, 40)');
    //
    //
		// var d3line = d3.svg.line()
    //   .x(d => d.x)
    //   .y(d => d.y)
    //   .interpolate("linear");
    //
    // for(var i = 0; i < results.length; i++){
    //   svg.append("path").attr("d", d3line(results[i]))
    //     .style("stroke-width", 2)
    //     .style("stroke", "#000000")
    //     .style("fill", "none")
    //     .style('stroke-opacity', 0.15);
    // }
    //
    // const enter = svg.selectAll('.node')
    //   .data(d3.entries(nodes))
    //   .enter()
    //   .append('g')
    //   .classed('nodeWrapper', true)
    //
    // enter
    //   .append('circle')
    //   .classed('node', true)
    //   .attr({'r': 8, 'fill': '#000000'})
    //   .attr('cx', d => d.value.x)
    //   .attr('cy', d => d.value.y)
    //   .style('z-index', '90')
    //   .style('position', 'relative')
    //
    // enter
    //   .append('text')
    //   .attr({'font-size': 10, 'font-family': 'sans-serif', 'fill': '#000000'})
    //   .attr('x', d => d.value.x + 10)
    //   .attr('y', d => d.value.y - 10)
	  //   .text(d => d.value.url)

    // const startnodes =  _.reduce(stats, (res, item) => {
    //   res.push({ name: item.url })
    //   return res
    // }, [])
    //
    //
    // var w = 1000;
    // var h = 600;
    // var linkDistance=210;
    //
    // var colors = d3.scale.category10();
    //
    // var dataset = {
    //   nodes: startnodes,
    //
    //   edges: _.reduce(stats, (res, item) => {
    //     const {ref, url} = item
    //     const target = _.findIndex(startnodes, o => o.name == url)
    //
    //     _.forEach(Object.keys(ref), item => {
    //       const itemId = _.findIndex(startnodes, o => o.name == item)
    //
    //       if (itemId > -1) {
    //         res.push({
    //           source: itemId,
    //           target: target
    //         })
    //       }
    //     })
    //
    //     return res
    //   }, [])
    // };
    //





    //
    // var svg = d3.select("body").append("svg").attr({"width":w,"height":h});
    //
    // var force = d3.layout.force()
    //     .nodes(dataset.nodes)
    //     .links(dataset.edges)
    //     .size([w,h])
    //     .linkDistance([linkDistance])
    //     .charge([-600])
    //     // .gravity(0.05)
    //     .start();
    //
    //
    //
    // var edges = svg.selectAll("line")
    //   .data(dataset.edges)
    //   .enter()
    //   .append("line")
    //   .attr("id",function(d,i) {return 'edge'+i})
    //   .attr('marker-end','url(#arrowhead)')
    //   .style("stroke","#ccc")
    //   .style("pointer-events", "none");
    //
    // var nodes = svg.selectAll("circle")
    //   .data(dataset.nodes)
    //   .enter()
    //   .append("circle")
    //   .attr({"r":15})
    //   .style("fill",function(d,i){return colors(i);})
    //   .call(force.drag)
    //
    //
    // var nodelabels = svg.selectAll(".nodelabel")
    //    .data(dataset.nodes)
    //    .enter()
    //    .append("text")
    //    .attr({"x":function(d){return d.x;},
    //           "y":function(d){return d.y;},
    //           "class":"nodelabel",
    //           "stroke":"black"})
    //    .text(function(d){return d.name;});
    //
    // var edgepaths = svg.selectAll(".edgepath")
    //     .data(dataset.edges)
    //     .enter()
    //     .append('path')
    //     .attr({'d': function(d) {return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y},
    //            'class':'edgepath',
    //            'fill-opacity':0,
    //            'stroke-opacity':0,
    //            'fill':'blue',
    //            'stroke':'red',
    //            'id':function(d,i) {return 'edgepath'+i}})
    //     .style("pointer-events", "none")
    //     .attr('transform', 'translate(2, 2)');
    //
    // // var edgelabels = svg.selectAll(".edgelabel")
    // //     .data(dataset.edges)
    // //     .enter()
    // //     .append('text')
    // //     .style("pointer-events", "none")
    // //     .attr({'class':'edgelabel',
    // //            'id':function(d,i){return 'edgelabel'+i},
    // //            'dx':80,
    // //            'dy':0,
    // //            'font-size':10,
    // //            'fill':'#aaa'});
    // //
    // // edgelabels.append('textPath')
    // //     .attr('xlink:href',function(d,i) {return '#edgepath'+i})
    // //     .style("pointer-events", "none")
    // //     .text(function(d,i){return 'label '+i});
    //
    //
    // svg.append('defs').append('marker')
    //     .attr({'id':'arrowhead',
    //            'viewBox':'-0 -5 10 10',
    //            'refX':25,
    //            'refY':0,
    //            //'markerUnits':'strokeWidth',
    //            'orient':'auto',
    //            'markerWidth':10,
    //            'markerHeight':10,
    //            'xoverflow':'visible'})
    //     .append('svg:path')
    //         .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    //         .attr('fill', '#ccc')
    //         .attr('stroke','#ccc');
    //
    //
    // force.on("tick", function(){
    //
    //     edges.attr({"x1": function(d){return d.source.x;},
    //                 "y1": function(d){return d.source.y;},
    //                 "x2": function(d){return d.target.x;},
    //                 "y2": function(d){return d.target.y;}
    //     });
    //
    //     nodes.attr({"cx":function(d){return d.x;},
    //                 "cy":function(d){return d.y;}
    //     });
    //
    //     nodelabels.attr("x", function(d) { return d.x; })
    //               .attr("y", function(d) { return d.y; });
    //
    //     edgepaths.attr('d', function(d) { var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
    //                                        //console.log(d)
    //                                        return path});
    //
    //     // edgelabels.attr('transform',function(d,i){
    //     //     if (d.target.x<d.source.x){
    //     //         bbox = this.getBBox();
    //     //         rx = bbox.x+bbox.width/2;
    //     //         ry = bbox.y+bbox.height/2;
    //     //         return 'rotate(180 '+rx+' '+ry+')';
    //     //         }
    //     //     else {
    //     //         return 'rotate(0)';
    //     //         }
    //     // });
    // });


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
      // .linkDistance(300)
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
        // .on("click", click)
        // .on("dblclick", dblclick)
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
            // dr = Math.sqrt(dx * dx + dy * dy);

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


    // function click() {
    //   d3.select(this).select("text").transition()
    //     .duration(750)
    //     .attr("x", 22)
    //     .style("fill", "steelblue")
    //     .style("stroke", "lightsteelblue")
    //     .style("stroke-width", ".5px")
    //     .style("font", "20px sans-serif");
    //   d3.select(this).select("circle").transition()
    //     .duration(750)
    //     .attr("r", 16)
    //     .style("fill", "lightsteelblue");
    // }

    // function dblclick() {
    //   d3.select(this).select("circle").transition()
    //     .duration(750)
    //     .attr("r", 6)
    //     .style("fill", "#ccc");
    //   d3.select(this).select("text").transition()
    //     .duration(750)
    //     .attr("x", 12)
    //     .style("stroke", "none")
    //     .style("fill", "black")
    //     .style("stroke", "none")
    //     .style("font", "10px sans-serif");
    // }

  })
