var cms = cms || {};
cms.version = '1.0.0';
cms.papers = {};

cms.parse_date = function(d) {

  var s = d.split('-');
  return new Date(s[2],s[1]-1,s[0]);

};

cms.filter_papers = function(papers) {

  cms.papers.total = papers;

  cms.papers.bph = papers.filter(function(p) {
    return p.type =='BPH';
  });

  var ml = cms.papers.bph.length;

  cms.papers.top = papers.filter(function(p) {
    return p.type =='TOP';
  });

  if ( cms.papers.top.length > ml ) {
    ml = cms.papers.top.length;
  }

  cms.papers.hig = papers.filter(function(p) {
    return p.type =='HIG';
  });

  if ( cms.papers.hig.length > ml ) {
    ml = cms.papers.hig.length;
  }

  cms.papers.sus = papers.filter(function(p) {
    return p.type =='SUS';
  });

  if ( cms.papers.sus.length > ml ) {
    ml = cms.papers.sus.length;
  }

  cms.papers.exo = papers.filter(function(p) {
    return p.type =='EXO';
  });

  if ( cms.papers.exo.length > ml ) {
    ml = cms.papers.exo.length;
  }

  cms.papers.hin = papers.filter(function(p) {
    return p.type =='HIN';
  });

  if ( cms.papers.hin.length > ml ) {
    ml = cms.papers.hin.length;
  }

  cms.papers.fwd = papers.filter(function(p) {
    return (p.type =='FWD' || p.type =='FSQ' || p.type =='GEN');
  });

  if ( cms.papers.fwd.length > ml ) {
    ml = cms.papers.fwd.length;
  }

  cms.papers.smp = papers.filter(function(p) {
    return (p.type =='SMP' || p.type =='QCD' || p.type =='EWK');
  });

  if ( cms.papers.smp.length > ml ) {
    ml = cms.papers.smp.length;
  }

  cms.papers.b2g = papers.filter(function(p) {
    return p.type =='B2G';
  });

  if ( cms.papers.b2g.length > ml ) {
    ml = cms.papers.b2g.length;
  }

  cms.papers.det = papers.filter(function(p) {
    return (p.type =='MUO' || p.type =='EGM' || p.type =='TAU' || p.type =='JME' || p.type =='TRK' || p.type =='BTV');
  });

  if ( cms.papers.det.length > ml ) {
    ml = cms.papers.det.length;
  }

  cms.nduplicates = papers.filter(function(p) {
    return p.duplicate == 'true';
  }).length;

  cms.max_length = ml;

};

cms.split_title = function(title) {

  var t = title.split(' ');
  var tr0 = Math.floor(t.length/2);

  var tl = t[0];
  var tr;

  for ( var i = 1; i < t.length; i++ ) {
    if ( i < tr0 ) {
      tl += ' '+t[i];
    } else if ( i == tr0 ) {
      tr = t[tr0];
    } else {
      tr += ' '+t[i];
    }
  }

  return [tl, tr];

};

cms.circle_mouseover = function(d) {

  d3.select(this).transition().duration(500).attr('r', 20.0);
/*
  var st = cms.split_title(d.title);

  var text = cms.svg.select('text.title')
    .append('tspan')
    .text(st[0])
    .append('tspan')
    .attr('x', 20)
    .attr('dy', 20)
    .text(st[1]);
*/
};

cms.circle_mouseout = function() {

  d3.select(this).transition().duration(1000).attr('r', 8.0);

  var text = cms.svg.select('text.title')
    .transition().duration(1000).text('');

};

cms.clicked = function(d) {

   console.log('clicked', d.url);
   window.open(d.url,'_blank');

};

cms.make_circles = function(cn, circle) {

  
  var circleEnter = circle.enter()
  .append('circle')
    .on('mouseout', cms.circle_mouseout)
    .on('mouseover', cms.circle_mouseover)
    .on('click', cms.clicked)
    .attr('title', function(d) {return d.title;})
    .attr('class', cn)
    .attr('cx', function(d) {return cms.xscale(cms.parse_date(d.date));})
    .attr('cy', function(d,i) {return cms.yscale(i+1);})
    .attr('r', 8.0);

  circleEnter.append('title');
  circle.merge(circleEnter)
    .select('title').text(function(d) {return d.title;});

  circle.transition().delay(1000)
    .attr('cx', function(d) {return cms.xscale(cms.parse_date(d.date));})
    .attr('cy', function(d,i) {return cms.yscale(i+1);})
    .attr('r', 8.0)
    .attr('class', cn);

  circle.exit()
    .transition().delay(1500)
    .attr('r', 1e-6)
    .remove();

};

cms.show_all = function() {

  $('.active').removeClass('active');
  $('#all').addClass('active');

  cms.svg.selectAll('circle.total').transition().delay(1500).attr('r', 1e-6).remove();

  cms.yscale.domain([0, cms.max_length]);
  cms.svg.select('g.yaxis').transition().duration(1000).call(cms.yaxis);

  for ( var cn in cms.papers ) {

    if ( cn == 'total' )
      continue;

    var data = cms.papers[cn];
    cms.make_circles(cn, cms.svg.selectAll('circle.'+cn).data(data));

  }

  $('#number').text(cms.npapers - cms.nduplicates);
  $('#date').text(cms.date_updated);
  $('#numbers').show();

};

cms.show = function(cn) {

  $('.active').removeClass('active');
  $('#'+cn).addClass('active');

  var data = cms.papers[cn];

  cms.yscale.domain([0, data.length]);

  cms.svg.select('g.yaxis').transition().duration(1000).call(cms.yaxis);

  cms.make_circles(cn, cms.svg.selectAll('circle').data(data));

  if ( cn == 'total' ) {
    $('#number').text(cms.npapers - cms.nduplicates);
  } else {
    $('#number').text(data.length);
  }

  $('#date').text(cms.date_updated);
  $('#numbers').show();

};

cms.init = function() {

  console.log('CMS Physics Timeline v'+cms.version);

  d3.json('./data/date.json', function(date) {

    cms.date_updated = date.Y + '-' + date.M + '-' + date.D;

  });

  d3.json('./data/papers.json', function(papers) {

    papers.sort(function(a,b) {
      return (cms.parse_date(a.date)) - (cms.parse_date(b.date));
    });

    cms.npapers = papers.length;
    cms.filter_papers(papers);

    cms.start_date = new Date(2010,0,0)
    cms.end_date = new Date();
    cms.mid_date = new Date(0.5*(cms.end_date.getTime() + cms.start_date.getTime()));

    var m = {
      top:50, right:50, bottom:75, left:50
    };

    var w = 1062 - m.right - m.left;
    var h = 603 - m.top - m.bottom;

    cms.xscale = d3.scaleTime().domain([cms.start_date, cms.end_date]).range([0,w]);
    cms.yscale = d3.scaleLinear().range([h,0]);

    cms.xaxis = d3.axisBottom().scale(cms.xscale);
    //cms.xaxis.tickSize(5.0).tickFormat(d3.timeFormat('%b %Y'));
    cms.yaxis = d3.axisLeft().scale(cms.yscale);

    cms.svg = d3.select('#plot').append('svg')
      .attr('width', w+m.right+m.left)
      .attr('height', h+m.top+m.bottom)
      .append('svg:g')
      .attr('transform', 'translate('+m.bottom+','+m.top+')');

    cms.svg.append('g')
      .attr('class', 'yaxis')
      .call(cms.yaxis);

    cms.svg.append('g')
      .attr('class', 'xaxis')
      .attr('transform', 'translate(0,'+h+')')
      .call(cms.xaxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('transform', function(d) {
          return 'rotate(-65)'
        });

    cms.xgrid = d3.axisBottom().tickFormat('').tickSize(h).scale(cms.xscale);

    cms.svg.append('g')
       .attr('class', 'xgrid')
       .call(cms.xgrid);

    cms.svg.append('text')
      .attr('class', 'title')
      .attr('x', 20)
      .attr('y', 15)
      .attr('font-size', 14);

    cms.show_all();

  });

};
