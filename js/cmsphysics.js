// Do this to handle parsing problems
function parseDate(d) {
  var s = d.split("-");
  return new Date(s[2],s[1]-1,s[0]);
}

// Sort papers by date
papers.sort(function(a,b) {
  return (parseDate(a.date)) - (parseDate(b.date));
});

// Filter papers by PAG
var qcds = papers.filter(function(p) {return p.type=="QCD";}),
    bphs = papers.filter(function(p) {return p.type=="BPH";}),
    ewks = papers.filter(function(p) {return p.type=="EWK";}),
    tops = papers.filter(function(p) {return p.type=="TOP";}),
    higs = papers.filter(function(p) {return p.type=="HIG";}),
    suss = papers.filter(function(p) {return p.type=="SUS";}),
    exos = papers.filter(function(p) {return p.type=="EXO";}),
    hins = papers.filter(function(p) {return p.type=="HIN";}),
    fwds = papers.filter(function(p) {return (p.type=="FWD" || p.type=="FSQ");}),
    smps = papers.filter(function(p) {return p.type=="SMP";}),
    b2gs = papers.filter(function(p) {return p.type=="B2G";});

var max_length = d3.max([qcds,bphs,ewks,tops,higs,suss,exos,hins,fwds,smps,b2gs], function(p) {return p.length;});

var duplicates = papers.filter(function(p) {return p.duplicate == "true";}).length
console.log("There are " + duplicates + " duplicates");

var start_date = new Date(2010,0,0),
    end_date = new Date(),
    mid_date = new Date(0.5*(end_date.getTime()+start_date.getTime()));
 
var m = {top:50, right:50, bottom:70, left:50},
    w = 800 - m.right - m.left,
    h = 600 - m.top - m.bottom,
    x = d3.time.scale().domain([start_date,end_date]).range([0,w]),
    y = d3.scale.linear().range([h,0]),
    xaxis = d3.svg.axis().scale(x).orient("bottom").tickSize(5.0).tickSubdivide(false).tickFormat(d3.time.format("%b %Y")),
    yaxis = d3.svg.axis().scale(y).orient("left").tickSize(5.0).tickSubdivide(true).tickFormat(d3.format("d")),
    svg, yrule, last_pag;

function circle_mouseover() {
  d3.select(this)
  .transition()
  .duration(500)
  .attr("r", 20.0);
}

function circle_mouseout() {
  d3.select(this)
  .transition()
  .duration(1000)
  .attr("r", 8.0);
}

function text_mouseover() {
  d3.select(this)
  .attr("style", "fill:#000");
}

function text_mouseout() {
  d3.select(this)
  .attr("style", "fill:#666");
}

// TO-DO be a bit clever
// about the text length
function title(d,t) {
  d = parseDate(d);
  t = t.split(" ");
		
  var l = 5; // This is the number of "words" displayed in the title
  var s = t[0];
  for (var i = 1; i <= l; i++ ) {
     s += " "+t[i];
  }
  return s += "...";
}

var line = d3.svg.line()
        .x(function(d) {return x(parseDate(d.date));})
        .y(function(d,i) {return y(i+1);})
        .interpolate("linear");

// Initialize axes and add add paths and circles to the DOM

function add(class_name,data,length,text) {
    
    //console.log(class_name+' '+length+' '+text);

     y.domain([0,length]);

     svg.select("g.yrules").transition().duration(1000).call(y);

     svg.append("path")
         .attr("class", class_name)
         .attr("d", line(data));

     var circle = svg.selectAll("circle."+class_name)
       .data(data)
       .enter()
       .append("a")
       .attr("class", class_name)
       .attr("xlink:href", function(d) {return d.url;})
       .append("circle")
       .attr("class", class_name)
       .attr("cx", function(d) {return x(parseDate(d.date));})
       .attr("cy", function(d,i) {return y(i+1);})
       .attr("r", 8.0);  

     circle.append("title")
       .text(function(d) {return d.title;});
 
     circle.on("mouseover", circle_mouseover);
     circle.on("mouseout", circle_mouseout); 

     if ( text ) {

     var text = svg.selectAll("text."+class_name)
       .data(data)
       .enter()
       .append("a")
       .attr("class", class_name)
       .attr("xlink:href", function(d) {return d.url;})
       .append("text")
       .attr("class", class_name)
       .attr("text-anchor", function(d) {if (parseDate(d.date) > mid_date) {return "end";} else {return "start";}})
       .attr("x", function(d) {return x(parseDate(d.date));})
       .attr("transform", function(d) {if (parseDate(d.date) > mid_date) {return "translate(-10)";} else {return "translate(10)";}})
       .attr("y", function(d,i) {return y(i+1);})
       .attr("dy", "0.3em")
       .text(function(d) {return title(d.date,d.title);});

     text.append("title")
       .text(function(d) {return d.title;});

     text.on("mouseover", text_mouseover);
     text.on("mouseout", text_mouseout);   
   }

   $("."+class_name).hide();
}

function init() {
  svg = d3.select("body").append("svg")
    .attr("width", w+m.right+m.left)
    .attr("height", h+m.top+m.bottom)
    .append("svg:g")
    .attr("transform", "translate("+m.bottom+","+m.top+")");

  // Add x and y axes
  svg.append("g")
    .attr("class", "yaxis")
    .call(yaxis);	

  svg.append("g")
  	.attr("class", "xaxis")
  	.attr("transform", "translate(0,"+h+")")
  	.call(xaxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", function(d) {
        return "rotate(-65)"
      });
    
  yrule = svg.selectAll("g.yrules").data(y.ticks(10));

  // We add three plots to the DOM:
  //  - The total number of papers (unsorted with no text)
  //  - The total number of papers (sorted by PAG with no text)
  //  - Each PAG with text (actually a plot each)

  add("total", papers, papers.length, false);

  add("qcdall", qcds, max_length, false);
  add("exoall", exos, max_length, false);
  add("susall", suss, max_length, false);
  add("bphall", bphs, max_length, false);
  add("ewkall", ewks, max_length, false);
  add("topall", tops, max_length, false);
  add("hinall", hins, max_length, false);
  add("higall", higs, max_length, false);
  add("fwdall", fwds, max_length, false);
  add("smpall", smps, max_length, false);
  add("b2gall", b2gs, max_length, false);

  add("qcd", qcds, qcds.length, true);
  add("exo", exos, exos.length, true);
  add("sus", suss, suss.length, true);
  add("bph", bphs, bphs.length, true);
  add("ewk", ewks, ewks.length, true);
  add("top", tops, tops.length, true);
  add("hin", hins, hins.length, true);
  add("hig", higs, higs.length, true);
  add("fwd", fwds, fwds.length, true);
  add("smp", smps, smps.length, true);
  add("b2g", b2gs, b2gs.length, true);
}

// ACK! This is all very inelegant. Clean up when 
// I have a chance.
function hide_pags() {
  $(".qcd").hide();
  $(".bph").hide();
  $(".ewk").hide();
  $(".top").hide();
  $(".hig").hide();
  $(".sus").hide();
  $(".exo").hide();
  $(".hin").hide();
  $(".fwd").hide();
  $(".smp").hide();
  $(".b2g").hide();
}

function hide_total() {
  $("#number").hide();
  $(".total").hide();
}

function hide_all() {
  $("#number").hide();
  $(".qcdall").hide();
  $(".bphall").hide();
  $(".ewkall").hide();
  $(".topall").hide();
  $(".higall").hide();
  $(".susall").hide();
  $(".exoall").hide();
  $(".hinall").hide();
  $(".fwdall").hide();
  $(".smpall").hide();
  $(".b2gall").hide();
}

function show_all() {
  y.domain([0,max_length]);
  svg.select("g.yaxis").transition().duration(1000).call(yaxis);
  hide_total();
  hide_pags();
  $("#number").text(papers.length - duplicates);
  $("#numbers").show();
  $("#number").show();
  $(".qcdall").show();
  $(".bphall").show();
  $(".ewkall").show();
  $(".topall").show();
  $(".higall").show();
  $(".susall").show();
  $(".exoall").show();
  $(".hinall").show();
  $(".fwdall").show();
  $(".smpall").show();
  $(".b2gall").show();
}

function show_total() {
  y.domain([0,papers.length]);
  svg.select("g.yaxis").transition().duration(1000).call(yaxis);
  hide_all();
  hide_pags();
  $("#number").text(papers.length - duplicates);
  $("#numbers").show();
  $("#number").show();
  $(".total").show();
}

function show_qcd() {draw("qcd", qcds.length); $("#numbers").hide();}
function show_bph() {draw("bph", bphs.length); $("#numbers").hide();}
function show_ewk() {draw("ewk", ewks.length); $("#numbers").hide();}
function show_top() {draw("top", tops.length); $("#numbers").hide();}
function show_hig() {draw("hig", higs.length); $("#numbers").hide();}
function show_sus() {draw("sus", suss.length); $("#numbers").hide();}
function show_exo() {draw("exo", exos.length); $("#numbers").hide();}
function show_hin() {draw("hin", hins.length); $("#numbers").hide();}
function show_fwd() {draw("fwd", fwds.length); $("#numbers").hide();}
function show_smp() {draw("smp", smps.length); $("#numbers").hide();}
function show_b2g() {draw("b2g", b2gs.length); $("#numbers").hide();}

function draw(pag,length) {
    hide_all();
    hide_total();

    y.domain([0,length]);
    svg.select("g.yaxis").transition().duration(1000).call(yaxis);

    if (pag !== last_pag) {
      $("."+last_pag).hide();
    }

    $("."+pag).show();
    last_pag = pag;
}

// Initialize and show all by default
init();
show_all();