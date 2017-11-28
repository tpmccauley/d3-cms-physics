// Do this to handle parsing problems
function parseDate(d) {
  var s = d.split('-');
  return new Date(s[2],s[1]-1,s[0]);
}

var date_updated;
d3.json('./data/date.json', function(date) {
	date_updated = date.Y + '-' + date.M + '-' + date.D;
})

var start_date = new Date(2010,0,0),
    end_date = new Date(),
    mid_date = new Date(0.5*(end_date.getTime()+start_date.getTime()));

var m = {top:50, right:50, bottom:75, left:50},
    w = 700 - m.right - m.left,
    h = 600 - m.top - m.bottom,
    x = d3.time.scale().domain([start_date,end_date]).range([0,w]),
    y = d3.scale.linear().range([h,0]),
    xaxis = d3.svg.axis().scale(x).orient('bottom').tickSize(5.0).tickSubdivide(false).tickFormat(d3.time.format('%b %Y')),
    yaxis = d3.svg.axis().scale(y).orient('left').tickSize(5.0).tickSubdivide(true).tickFormat(d3.format('d')),
    svg, yrule, max_length, papers_length, duplicates;

var all_papers, qcds, bphs, ewks, tops, higs, suss, exos, hins, fwds, smps, b2gs, dets;
var showing = 'all';

function text_mouseover() {
  d3.select(this)
  .attr('style', 'fill:#000');
}

function text_mouseout() {
  d3.select(this)
  .attr('style', 'fill:#666');
}

function circle_mouseover() {
  d3.select(this)
  .transition()
  .duration(500)
  .attr('r', 20.0);
}

function circle_mouseout() {
  d3.select(this)
  .transition()
  .duration(1000)
  .attr('r', 8.0);
}

// TO-DO be a bit clever
// about the text length
function title(t) {
  t = t.split(' ');

  var l = 4; // This is the number of 'words' displayed in the title
  var s = t[0];
  for (var i = 1; i <= l; i++ ) {
     s += ' '+t[i];
  }
  return s += '...';
}

var line = d3.svg.line()
          .x(function(d) {return x(parseDate(d.date));})
          .y(function(d,i) {return y(i+1);})
          .interpolate('linear');

function init() {
  svg = d3.select('#plot').append('svg')
    .attr('width', w+m.right+m.left)
    .attr('height', h+m.top+m.bottom)
    .append('svg:g')
    .attr('transform', 'translate('+m.bottom+','+m.top+')');

  // Add x and y axes
  svg.append('g')
    .attr('class', 'yaxis')
    .call(yaxis);

  svg.append('g')
    .attr('class', 'xaxis')
    .attr('transform', 'translate(0,'+h+')')
    .call(xaxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('transform', function(d) {
        return 'rotate(-65)'
      });

  yrule = svg.selectAll('g.yrules').data(y.ticks(10));
}

function draw_total(data) {
  remove_all();

  y.domain([0, data.length]);
  svg.select('g.yaxis').transition().duration(1000).call(yaxis);

  var path = svg.selectAll('path.total').data(data);

  path.enter()
    .append('path')
    .attr('class', 'total')
    .attr('d', line(data))
    .attr('opacity', 1e-6)
    .transition().delay(1000)
    .attr('opacity', 1);

  var circle = svg.selectAll('circle').data(data);

  circle.enter()
    .append('circle')
    .attr('class', 'total')
    .attr('cx', function(d) {return x(parseDate(d.date));})
    .attr('cy', function(d,i) {return y(i+1);})
    .attr('r', 1e-6)
    .on('mouseover', circle_mouseover)
    .on('mouseout', circle_mouseout)
    .transition().delay(1000)
    .attr('r', 8.0)
    .attr('title', function(d) {return d.title;});

  $('#number').text(data.length-duplicates);
  $('#numbers').show();
}

function draw_all(data, class_name) {

  svg.append('path')
      .attr('class', 'pag ' + class_name)
      .attr('d', line(data));

  var circle = svg.selectAll('circle.'+class_name)
      .data(data)
      .enter()
      .append('a')
      .attr('class', class_name)
      .attr('target', '_blank')
      .attr('xlink:href', function(d) {return d.url;})
      .append('circle')
      .attr('class', class_name)
      .attr('cx', function(d) {return x(parseDate(d.date));})
      .attr('cy', function(d,i) {return y(i+1);})
      .attr('r', 8.0);

  circle.append('title')
    .text(function(d) {return d.title;});

  circle.on('mouseover', circle_mouseover);
  circle.on('mouseout', circle_mouseout);
}

function draw_pag(data, class_name, show_text) {

  remove_all();
  y.domain([0, data.length]);
  svg.select('g.yaxis').transition().duration(1000).call(yaxis);

  var path = svg.selectAll('path.pag').data(data);

  path.enter()
    .append('path')
    .attr('class', 'pag ' + class_name)
    .attr('d', line(data))
    .attr('opacity', 1e-6)
    .transition().delay(500)
    .attr('opacity', 1);

    /*
  path.transition().delay(1000)
    .attr('class', 'pag ' + class_name)
    .attr('d', line(data))
    .attr('opacity', 1);

  path.exit()
    .transition().delay(1500)
    .attr('opacity', 1e-6)
    .remove();
    */

  if (show_text) {
    var text = svg.selectAll('text.title').data(data);

    text.enter()
      .append('a')
      .attr('class', class_name)
      .attr('target', '_blank')
      .attr('xlink:href', function(d) {return d.url;})
      .append('text')
      .attr('class', 'title ' + class_name)
      .attr('text-anchor', function(d) {
        if (parseDate(d.date) > mid_date) {
          return 'end';
        } else {
          return 'start';
        }
      })
      .attr('x', function(d) {
        if (parseDate(d.date) > mid_date) {
          return x(parseDate(d.date))-25;
        } else {
          return x(parseDate(d.date))+25;
        }
      })
      .attr('y', function(d,i) {return y(i+1)+5;})
      .attr('opacity', 1e-6)
      .on('mouseover', text_mouseover)
      .on('mouseout', text_mouseout)
      .attr('title', function(d) {return d.title;})
      .transition().delay(1500)
      .attr('opacity', 1)
      .text(function(d,i) {return title(d.title);});

      /*
    text.transition().delay(1000)
      .text(function(d,i) {return title(d.title);})
      .attr('class', 'title ' + class_name)
      .attr('text-anchor', function(d) {
        if (parseDate(d.date) > mid_date) {
          return 'end';
        } else {
          return 'start';
        }
      })
      .attr('x', function(d) {
        if (parseDate(d.date) > mid_date) {
          return x(parseDate(d.date))-10;
        } else {
          return x(parseDate(d.date))+10;
        }
      })
      .attr('y', function(d,i) {return y(i+1);})
      .attr('opacity', 1);

    text.exit()
      .transition().delay(1500)
      .attr('opacity', 1e-6)
      .remove();
      */

    //text.on('mouseover', text_mouseover)
    //text.on('mouseout', text_mouseout)
  }

  var circle = svg.selectAll('circle').data(data);

  circle.enter()
    .append('a')
    .attr('class', class_name)
    .attr('target', '_blank')
    .attr('xlink:href', function(d) {return d.url;})
    .append('circle')
    .attr('class', class_name)
    .attr('cx', function(d) {return x(parseDate(d.date));})
    .attr('cy', function(d,i) {return y(i+1);})
    .attr('r', 1e-6)
    .on('mouseout', circle_mouseout)
    .on('mouseover', circle_mouseover)
    .transition().delay(1000)
    .attr('r', 8.0)
    .attr('title', function(d) {return d.title;});

    /*
  circle.transition().delay(1000)
    .attr('cx', function(d) {return x(parseDate(d.date));})
    .attr('cy', function(d,i) {return y(i+1);})
    .attr('r', 8.0)
    .attr('class', class_name)
    .attr('title', function(d) {return d.title;});

  circle.exit()
    .transition().delay(1500)
    .attr('r', 1e-6)
    .remove();
    */

  if (class_name == 'total') {
    $('#number').text(data.length - duplicates);
  } else {
   $('#number').text(data.length);
  }
  $('#numbers').show();
}

function remove_all() {
  // Why do this and not follow the enter, update, exit
  // pattern? We could, but 're-use' of the paths and
  // circles has undesirable behavior: sometimes the
  // paths appear on top of the circles and sometimes
  // under the circles (desired), sometimes in the same plot
  svg.selectAll('path.pag').remove();
  svg.selectAll('path.total').remove();
  svg.selectAll('text.title').remove();
  svg.selectAll('circle').remove();
}

function handle_active(id) {
  $('.active').removeClass('active');
  $('#'+id).addClass('active');
}

function show(data, id, text) {
  $('.active').removeClass('active');
  $('#'+id).addClass('active');
  draw_pag(data, id, text);
}

function show_total() { show(all_papers, 'total', false); }
function show_bph() { show(bphs, 'bph', true); }
function show_top() { show(tops, 'top', true); }
function show_hig() { show(higs, 'hig', true); }
function show_sus() { show(suss, 'sus', true); }
function show_exo() { show(exos, 'exo', true); }
function show_hin() { show(hins, 'hin', true); }
function show_fwd() { show(fwds, 'fwd', true); }
function show_smp() { show(smps, 'smp', true); }
function show_b2g() { show(b2gs, 'b2g', true); }
function show_det() { show(dets, 'det', true); }

function show_all() {
  handle_active('all');

  remove_all();
  y.domain([0, max_length]);
  svg.select('g.yaxis').transition().duration(1000).call(yaxis);

  draw_all(dets, 'det');
  draw_all(hins, 'hin');
  draw_all(fwds, 'fwd');
  draw_all(bphs, 'bph');
  draw_all(smps, 'smp');
  draw_all(exos, 'exo');
  draw_all(b2gs, 'b2g');
  draw_all(suss, 'sus');
  draw_all(tops, 'top');
  draw_all(higs, 'hig');

  $('#number').text(papers_length - duplicates);
  $('#date').text(date_updated);
  $('#numbers').show();
}

d3.json('./data/papers.json', function(papers) {

  // Sort papers by date
  papers.sort(function(a,b) {
    return (parseDate(a.date)) - (parseDate(b.date));
  });

  all_papers = papers;

  papers_length = papers.length;

  bphs = papers.filter(function(p) {return p.type=='BPH';}),
  tops = papers.filter(function(p) {return p.type=='TOP';}),
  higs = papers.filter(function(p) {return p.type=='HIG';}),
  suss = papers.filter(function(p) {return p.type=='SUS';}),
  exos = papers.filter(function(p) {return p.type=='EXO';}),
  hins = papers.filter(function(p) {return p.type=='HIN';}),
  fwds = papers.filter(function(p) {return (p.type=='FWD' || p.type=='FSQ' || p.type=='GEN');}),
  smps = papers.filter(function(p) {return (p.type=='SMP' || p.type=='QCD' || p.type=='EWK');}),
  b2gs = papers.filter(function(p) {return p.type=='B2G';});
  dets = papers.filter(function(p) {return (p.type=='MUO' || p.type=='EGM' || p.type=='TAU' || p.type=='JME' || p.type=='TRK' || p.type=='BTV' );}),
      max_length = d3.max([bphs,tops,higs,suss,exos,hins,fwds,smps,b2gs,dets], function(p) {return p.length;});
  duplicates = papers.filter(function(p) {return p.duplicate == 'true';}).length

  init();
  show_all();
});
