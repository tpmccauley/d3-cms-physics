var cms = cms || {};
cms.version = '1.0.0';
cms.papers = {};

cms.parse_date = function(d) {

  var s = d.split('-');
  return new Date(s[2],s[1]-1,s[0]);

};

cms.filter = function(papers) {

  cms.papers.bph = papers.filter(function(p) {
    return p.type =='BPH';
  });

  cms.papers.top = papers.filter(function(p) {
    return p.type =='TOP';
  });

  cms.papers.hig = papers.filter(function(p) {
    return p.type =='HIG';
  });

  cms.papers.sus = papers.filter(function(p) {
    return p.type =='SUS';
  });

  cms.papers.exo = papers.filter(function(p) {
    return p.type =='EXO';
  });

  cms.papers.hin = papers.filter(function(p) {
    return p.type =='HIN';
  });

  cms.papers.fwd = papers.filter(function(p) {
    return (p.type =='FWD' || p.type =='FSQ' || p.type =='GEN');
  });

  cms.papers.smp = papers.filter(function(p) {
    return (p.type =='SMP' || p.type =='QCD' || p.type =='EWK');
  });

  cms.papers.b2g = papers.filter(function(p) {
    return p.type =='B2G';
  });

  cms.papers.det = papers.filter(function(p) {
    return (p.type =='MUO' || p.type =='EGM' || p.type =='TAU' || p.type =='JME' || p.type =='TRK' || p.type =='BTV');
  });

  cms.nduplicates = papers.filter(function(p) {
    return p.duplicate == 'true';
  }).length;

};

cms.show = function() {

  console.log(this.id);

  var data = cms.papers[this.id];

  // Rescale the numbers on the y axis
  cms.y.domain([0, data.length]);
  cms.svg.select('g.yaxis').transition().duration(1000).call(cms.yaxis);

  var circle = cms.svg.selectAll('circle').data(data);
  var class_name = this.id;

  circle.enter()
    .append('a')
    .attr('class', class_name)
    .attr('target', '_blank')
    .attr('xlink:href', function(d) {return d.url;})
    .append('circle')
    .attr('class', class_name)
    .attr('cx', function(d) {return cms.x(cms.parse_date(d.date));})
    .attr('cy', function(d,i) {return cms.y(i+1);})
    .attr('r', 1e-6)
    //.on('mouseout', circle_mouseout)
    //.on('mouseover', circle_mouseover)
    .transition().delay(1000)
    .attr('r', 8.0)
    .attr('title', function(d) {return d.title;});

  circle.transition().delay(1000)
    .attr('cx', function(d) {return cms.x(cms.parse_date(d.date));})
    .attr('cy', function(d,i) {return cms.y(i+1);})
    .attr('r', 8.0)
    .attr('class', class_name)
    .attr('title', function(d) {return d.title;});

  circle.exit()
    .transition().delay(1500)
    .attr('r', 1e-6)
    .remove();

};

cms.init = function() {

  console.log('CMS Physics Timeline v'+cms.version);

  d3.json('./data/papers.json', function(papers) {

    // Sort papers by date
    papers.sort(function(a,b) {
      return (cms.parse_date(a.date)) - (cms.parse_date(b.date));
    });

    cms.filter(papers);

  });

  // Listen for the button clicks
  var buttons = document.getElementsByClassName('btn-primary');

  for ( var i = 0; i < buttons.length; i++ ) {

    buttons[i].addEventListener('click', cms.show);

  }

  d3.json('./data/date.json', function(date) {

    cms.date_updated = date.Y + '-' + date.M + '-' + date.D;
    console.log('Timeline data last updated:', cms.date_updated);

  });

  cms.start_date = new Date(2010,0,0)
  cms.end_date = new Date();
  cms.mid_date = new Date(0.5*(cms.end_date.getTime() + cms.start_date.getTime()));

  var m = {top:50, right:50, bottom:75, left:50};
  var w = 1062 - m.right - m.left;
  var h = 603 - m.top - m.bottom;

  cms.x = d3.time.scale().domain([cms.start_date, cms.end_date]).range([0,w]);
  cms.y = d3.scale.linear().range([h,0]);
  cms.xaxis = d3.svg.axis().scale(cms.x).orient('bottom').tickSize(5.0).tickSubdivide(false).tickFormat(d3.time.format('%b %Y'));
  cms.yaxis = d3.svg.axis().scale(cms.y).orient('left').tickSize(5.0).tickSubdivide(true).tickFormat(d3.format('d'));

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

  cms.yrule = cms.svg.selectAll('g.yrules').data(cms.y.ticks(10));

};
