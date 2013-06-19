d3.tsv("data/geomedia.csv", function(data){

  // Various formatters.
  var formatDate = d3.time.format("%d/%m/%Y");

  // A nest operator, for grouping the links list.
  var nestByDate = d3.nest()
      .key(function(d) { return d3.time.day(d.date); });

  data.forEach(function(d, i) {
    d.date = formatDate.parse(d['end_date'])
    d.weight = parseFloat(d.weight)
  });

  // Create the crossfilter for the relevant dimensions and groups.
  	  window.links = crossfilter(data),
      window.all = links.groupAll(),
      window.date = links.dimension(function(d) { return d.date; }),
      window.dates = date.group(d3.time.day),
      window.journal = links.dimension(function(d) { return d.journal; }),
      window.journals = journal.group(),
      window.article = links.dimension(function(d) { return d.id_article }),
      window.articles = article.group(),
      window.source = links.dimension(function(d) { return d.source}),
      window.sources = source.group(),
      window.target = links.dimension(function(d) { return d.target}),
      window.targets = target.group(),
      window.weight = links.dimension(function(d) { return (Math.round(d.weight * 100)/100)}),
      window.weights = weight.group();

      journals.all().forEach(function(d,i){
      	
      	val=""
      	k=""
      	switch(d.key)
      	{
      		case 'ft' :
      			val="Financial Times"
      			break;
      		case 'mo' :
      			val="Le Monde"
      			break;
      		case 'ti' :
      			val="Times of India"
      			break;
      		case 'wp':
      			val="Washington Post"
      			break;
      		}
      		
      	$("#journal1").append("<li role='presentation'><a href='#' data='"+d.key+"' role='menuitem'>"+val+"</a></li>")
      	$("#journal2").append("<li role='presentation'><a href='#' data='"+d.key+"' role='menuitem'>"+val+"</a></li>")	
      })
      
      
      //journal.filterFunction(function(d){return d == "mo" || d == "ti"})


      var mo = date.group(d3.time.day).reduceSum(function(d){return d.journal=="mo"?1:0;});
      var ti = date.group(d3.time.day).reduceSum(function(d){return d.journal=="ti"?1:0;});
      var ft = date.group(d3.time.day).reduceSum(function(d){return d.journal=="ft"?1:0;});
      var wp = date.group(d3.time.day).reduceSum(function(d){return d.journal=="wp"?1:0;});

      //var mog = article.group().reduceSum(function(d){return d.journal=="mo"?1:0;});
      //var tig = source.group().reduceSum(function(d){return d.journal=="ti"?1:0;});
      //var ftg = source.group().reduceSum(function(d){return d.journal=="ft"?1:0;});
      //var wpg = source.group().reduceSum(function(d){return d.journal=="wp"?1:0;});



      function reduceAddDate(p, v) {

        ++p.links;

        if (p.articles.indexOf(v.id_article) == -1){
          p.articles.push(v.id_article);
          p.count = p.articles.length
          if(p.journals[v.journal] == undefined){
          p.journals[v.journal] = 1
          }else{
              p.journals[v.journal] = p.journals[v.journal] + 1
          }
        }


        return p;
      }

      function reduceRemoveDate(p, v) {

         --p.links;

        if (p.articles.indexOf(v.id_article) != -1){
          p.articles.splice(p.articles.indexOf(v.id_article), 1);
          p.count = p.articles.length
          if(p.journals[v.journal] == undefined){
          p.journals[v.journal] = 0
          }else{
              p.journals[v.journal] = p.journals[v.journal] - 1
          }
        }

        return p;
      }

      function reduceInitialDate() {
        return {links: 0, articles: [], count: 0, journals:{}};
      }




 var dates = date.group(d3.time.day).reduce(reduceAddDate, reduceRemoveDate, reduceInitialDate)

//console.log(dates.all())
      function reduceAdd(p, v) {

        if (p.country.indexOf(v.source) == -1){
        ++p.count;
        p.country.push(v.source);
        p.journal = v.journal;
        p.weight = 1/p.country.length;
        }
        return p;
      }

      function reduceRemove(p, v) {

        if (p.country.indexOf(v.source) != -1){
        --p.count;
        p.country.splice(p.country.indexOf(v.source), 1);
        p.journal = v.journal;
        p.weight = 1/p.country.length;
      }
        return p;
      }

      function reduceInitial() {
        return {count: 0, country: [], journal:"", weight: 0};
      }

      window.graphData = article.group().reduce(reduceAdd, reduceRemove, reduceInitial)


  var stacked = d3.entries(dates.top(1)[0].value.journals)


  window.dateBc = dc.barChart("#timeline")
    .width($("#timeline").width())
    .height(100)
    .margins({top: 10, right: 10, bottom: 30, left: 50})
    .dimension(date)
    .group(dates)
    .valueAccessor(function(p) { return p.value.journals[stacked[0].key]; })
    .x(d3.time.scale().domain([new Date(2012, 0, 1), new Date(2012, 11, 31)]))
    .round(d3.time.day.round)
    .xUnits(d3.time.days)
    .gap(1)
    .brushOn(true)
    .on("filtered", function(chart, filter){
      initG();
      $("#biforce").empty();
      stack();
      
    })

    stacked.forEach(function(d,i){
      if (i >0){
        dateBc.stack(dates, function(p) { return p.value.journals[d.key]; })
      }
    })

  
   dc.renderAll();

   initG();


});


   function initG(){
	  
  
  //console.log(d3.nest().key(function(d){return d.value.country}).entries(data))
  
  
  window.nod = [];
  nodes=[]
  jours=[]
  
  graphData.all().forEach(function(d){
      d.value.country.forEach(function(f){
			i=lookup(f,nodes)
            if(i<0){
            obj={}
            obj.name=f;
            obj[d.value.journal]=1;
            obj.total=1;
        	nodes.push(obj);
        	
        	j=lookup(d.value.journal,jours)
        	if(j<0) {
        		objour={};
        		objour.name=d.value.journal;
        		objour.label=findLabel(d.value.journal);
        		objour.lst=[]
        		jours.push(objour);
        	}
        	    
          }else{
          	
	          	j=lookup(d.value.journal,jours)
	        	if(j<0) {
	        		objour={};
	        		objour.name=d.value.journal;
	        		objour.label=findLabel(d.value.journal);
	        		objour.lst=[]
	        		jours.push(objour);
	        		}
          	
              if(nodes[i][d.value.journal]) {
	            	nodes[i][d.value.journal]++;
	            	nodes[i].total++;
            	}
            else{
              nodes[i][d.value.journal]=1;
              nodes[i].total++;
             }
          }
        	
        })
        
      })
    nodes.sort(function(a, b) {
    return b.total - a.total;
});  

	nodes=nodes.slice(0,30);


	z=0;
	nodes.forEach(function(f){
		
		jours.forEach(function(j){
		if (f[j.name]!=null){
			obj={}
			obj.label=f.name
			obj.x=z
			obj.y=f[j.name]
			j.lst.push(obj)
			
		}
		else {
			obj={}
			obj.label=f.name
			obj.x=z
			obj.y=0
			j.lst.push(obj)
		}
	})
	z=z+1
})  
	
	glst=[]
	
	jours.forEach(function(j){
		glst.push(j.lst);
	
	});
	
	
	nod=glst;
	console.log(nod);
	

function findLabel(key) {
	val=""
      	
      	switch(key)
      	{
      		case 'ft' :
      			val="Financial Times"
      			break;
      		case 'mo' :
      			val="Le Monde"
      			break;
      		case 'ti' :
      			val="Times of India"
      			break;
      		case 'wp':
      			val="Washington Post"
      			break;
      		}
      		return val;
}
	
	
function lookup( name, arr ) {
    for(var i = 0, len = arr.length; i < len; i++) {
        if( arr[ i ].name === name )
            return i;
    }
    return -1;
}
}
