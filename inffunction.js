/*
idea: load pop stats from CDC by country. 
*/
//<script type="text/javascript">
$(function () {
    // we use an inline data source in the example, usually data would
    // be fetched from a server
    var totalPoints = 300;
    var lcolors = ["#FFA500","#00BFFF","#3CB371","#DC143C"]; //line colors inf, healthy, immuen, dead
    var data_infected = [], data_healthy = [], data_immune = [], data_dead = [];
    var run_plot = 1;
    var graph_style = 0;
    var ticks = 0;
    //var init_ninfected = 100;
    //var init_nhealthy = 100;
    var reset_infected = 1000;
    var reset_healthy = 1000;
    var reset_immune = 10;
    var reset_pinfect = 0.1;
    var reset_socialcoef = 10;
    var reset_infticks = 10;
    var reset_death_probability = 0.01;
    //var output = "Hello. Messages are displayed through here. "
    function resetSimulation() {
	ticks = 0;
	var z = new Population();
	z.initializePopulation(reset_infected,reset_healthy,reset_immune, reset_pinfect,
			        reset_socialcoef, reset_infticks, reset_death_probability);
	return z;
    }
    /*function startSimulation(infected, healthy) {
	var z = new Population();
	//alert(parseInt($("#init_ninfected"));
	//parseInt( .val(), 10 ) || 0
	ticks = 0;
	//function Population(ninfected,nhealthy,nimmune,pinfect,
	//socialcoef,infticks, death_probability)
	z.initializePopulation(infected,healthy,0,0.05,100,365,0.01);
	return z;
    }*/
    function getData(z, index) {
        //if (data_infected.length > 0)
        data_infected = data_infected.slice(1);
	data_healthy = data_healthy.slice(1);
	data_immune = data_immune.slice(1);
	data_dead = data_dead.slice(1);
	var total_pop = 1.0 * (z.ninfected + z.nimmune + z.nhealthy);
        // do a random walk
        while (data_infected.length < totalPoints) {
            //var prev = data_infected.length > 0 ? data_infected[data_infected.length - 1] : 50;
            var y0 = z.ninfected/total_pop * 100.0;
	    var y1 = z.nhealthy/total_pop * 100.0;
	    var y2 = z.nimmune/total_pop * 100.0;
	    var y3 = z.ndead/total_pop * 100.0;
            /*if (y0 < 0)
                y0 = 0;
            if (y0 > 100)
                y0 = 100;*/
            data_infected.push(y0);
	    data_healthy.push(y1);
	    data_immune.push(y2);
	    data_dead.push(y3);
        }

        // zip the generated y values with the x values
        var res = [[],[],[],[]];
        for (var i = 0; i < data_infected.length; ++i) {
            res[0].push([i, data_infected[i]]);
	    res[1].push([i, data_healthy[i]]);
	    res[2].push([i, data_immune[i]]);
	    res[3].push([i, data_dead[i]]);
	}
	//alert(res[0]);
        return res[index];
    }
    function getPieData(z, index)
    {
	var res=[[],[],[],[]];
	/*res[0] = [1,100];
	res[1] = [1,90];
	res[2] = [1,80];
	res[3] = [1,140];*/
	/*res[0].push([z.ninfected]);
	res[1].push([z.nhealthy]);
	res[2].push([z.nimmune]);
	res[3].push([z.ndead]);*/
	//try first with a static pie chart.
	res[0].push([10]);
	res[1].push([100]);
	res[2].push([19]);
	res[3].push([30]);
	return res[index];
    }

    // setup control widget
    var updateInterval = 100;
    $("#updateInterval").val(updateInterval).change(function () {
        var v = $(this).val();
        if (v && !isNaN(+v)) {
            updateInterval = +v;
            if (updateInterval < 1)
                updateInterval = 1;
            if (updateInterval > 2000)
                updateInterval = 2000;
            $(this).val("" + updateInterval);
        }
    });
    var updateText = "text here";
    $("#updateText").val(updateText).change(function () {
	var v = $(this).val();
	if (v && !isNaN(+v)) {
	    updateText = v;
	    $(this).val(""+updateText);
	}
	if (v == "hello"){
	    alert("hello!");
	}
	if (v == "pause")
	    run_plot = 0;
	else {
	    run_plot = 1;
	    update();
	}
    });
    $("#intable").hide();
    $("#infection_properties_table").hide();
    //$("#live_options_table").show();
    $("#Reset").show();
    $("#runToggle").change(function () {
	//var v = $(this).val();
	if (run_plot == 1) {
	    //here we should reset the values on the table to show the 
	    //reset values, not the current values on the graph. 
	    $("#intable").show();
	    $("#infection_properties_table").show();
	    //$("#live_options_table").hide();
	    $("#Reset").hide();
	    run_plot = 0;
	}
	else {
	    run_plot = 1;
	    $("#RESET_TEXT span").html(reset_infected.toString() + 
				       " infected, " + reset_healthy.toString() + 
				       " healthy, " + reset_immune.toString() +
				       " immune. "); 
	    $("#intable").hide();
	    $("#infection_properties_table").hide();
	    //$("#live_options_table").show();
	    $("#Reset").show();
	    z = resetSimulation();
	    update();
	}
	//hide the input table if not paused
    });
    $("#Reset").click(function() {
	//z = startSimulation(reset_infected, reset_healthy);
	z = resetSimulation();
	//if (run_plot == 0)
	run_plot = 1;
	//update();
    });
    $("#vaccine_toggle").click(function() {
	var mu=parseFloat($("#vaccine_mu").val());
//	mu = parseFloat(mu);
	//var mu = mu*1.0;
	z.introduceVaccine(mu);
	//run_plot = 1;
    });
    $("#treatment_toggle").click(function() {
	var mu=parseFloat($("#treatment_mu").val());
	var x=parseInt($("#treatment_x").val());
	//mu = parseFloat(mu);
	z.introduceTreatment(mu, x);
	//run_plot = 1;
    });
    /*$("Reset").change(function () {
	z = startSimulation();
	update();	
    }*/
    var normal_options = {
	
        series: { 
	    //shadowSize = 2
	    /*pie: {
	      show: true,
	      radius: 1
	      }*/
	},
        yaxis: { min: 0, max: 100 },
	//yaxis: {show: false}
        xaxis: { show: false }
	
	//legend: {show: true }
	//label: { "% pop" }
    };
    var pie_options = {
	series: {
	    pie: {
		show: true
	    }
	}
    };
    function update() {
	if (graph_style == 0) {
            plot_infected.setData([
		{label:"infected", data:getData(z,0), color:lcolors[0]},
		{label:"healthy", data:getData(z,1), color:lcolors[1]},
		{label:"immune", data:getData(z,2), color:lcolors[2]},
		{label:"dead", data:getData(z,3), color:lcolors[3]}
	    ]);
	}
	if (graph_style == 1) {
	    plot_infected.setData([
		{label:"infected", data:getPieData(z,0), color:lcolors[0]},
		{label:"healthy", data:getPieData(z,1), color:lcolors[1]},
		{label:"immune", data:getPieData(z,2), color:lcolors[2]},
		{label:"dead", data:getPieData(z,3), color:lcolors[3]},
	    ]);
	    //alert(getPieData(z,0));
	}
	//plot_healthy.setData([getData(z,1)]);
        // since the axes don't change, we don't need to call plot.setupGrid()
        plot_infected.draw();
	//plot_healthy.draw();
	//$("#output").val(data[0]);
	//alert(getData(z)[0]);
	$("#healthy").val(z.nhealthy);
	$("#immune").val(z.nimmune);
	$("#infected").val(z.ninfected);
	$("#dead").val(z.ndead);
	$("#run_time span").html(ticks.toString());
        if (run_plot==1){
	    z.updatePopulation();
	    if (z.ninfected > 0) {	
		ticks++;
		
	    }
	    else {
		// show a stopped graph from start -> now (equilibrium)
		/*var equilibrium_variables = {
		    series: {shadowSize: 0 },
		    yaxis: {min: 0, max: 100 },
		    xaxis: {min: 0, max: ticks }
		};
		var plot_infected = $.plot($("#placeholder"), [ getData(z,0), getData(z,1), getData(z,2) ], equilibrium_variables);
		plot_infected.setData([getData(z,0), getData(z,1), getData(z,2)]);
		plot_infected.draw();
		run_plot = 0;*/
	    }
	    setTimeout(update, updateInterval);
	    /*else
		$("#timer_off").html*/
            
	}
	else { 
	    //var reset_yes = 1;
	    //ADD A .val(z.nimmune) after the $("#name") to show the current value in text box.
	    $("#init_nhealthy").val(reset_healthy).change(function() {
		//z = startSimulation(z.ninfected, $(this).val())	  
		reset_healthy = $(this).val();
		//reset_infected = z.ninfected;
		//z = resetSimulation();
		//reset_yes = 1;
	    });
	    $("#init_ninfected").val(reset_infected).change(function() {
		//z = startSimulation($(this).val(), z.nhealthy)
		//reset_healthy = z.nhealthy;
		reset_infected = $(this).val();
		//z = resetSimulation();
		//reset_yes = 1;
	    });	
	    $("#init_nimmune").val(reset_immune).change(function() { 
		reset_immune =  $(this).val()*1.0; });
	    $("#init_pinfect").val(reset_pinfect).change(function() { 
		reset_pinfect = $(this).val()*1.0; });
	    $("#init_socialcoef").val(reset_socialcoef).change(function() { 
		reset_socialcoef = $(this).val()*1; });
	    $("#init_infticks").val(reset_infticks).change(function() { 
		reset_infticks = $(this).val()*1; });
	    $("#init_pdeath").val(reset_death_probability).change(function() { 
		reset_death_probability = $(this).val()*1.0; });
	    
	    /*$("#init_nimmune").val(z.ninfected).change(function() {
		//z = startSimulation($(this).val(), z.nhealthy)
		reset_healthy = z.nhealthy;
		reset_infected = $(this).val();
		//z = resetSimulation();
		reset_yesno = 1;
	    });	*/
	    //if (reset_yes)
	    z = resetSimulation();
	    //z = resetSimulation();
	    //run_plot = 1;
	    //$("#Reset").click();
	    
	}
    }
    //z = new Population();
    //z = startSimulation(1000,1000);
    z = resetSimulation();
    /*var plot_infected = $.plot($("#placeholder"), [ getData(z,0), getData(z,1), getData(z,2) ], options);*/
    if (graph_style == 0) {
	var plot_infected = $.plot($("#placeholder"), [
	    {label:"infected", data:getData(z,0), color:lcolors[0]},
	    {label:"healthy", data:getData(z,1), color:lcolors[1]},
	    {label:"immune", data:getData(z,2),color:lcolors[2]},
	    {label:"dead",data:getData(z,3), color:lcolors[3]}], normal_options);
    }
    if (graph_style == 1) {
	var plot_infected = $.plot($("#placeholder"), [
	    {label:"infected", data:getPieData(z,0), color:lcolors[0]},
	    {label:"healthy", data:getPieData(z,1), color:lcolors[1]},
	    {label:"immune", data:getPieData(z,2), color:lcolors[2]},
	    {label:"dead", data:getPieData(z,3), color:lcolors[3]}], pie_options);
    }
    //var plot_healthy = $.plot($("#placeholder"), [ getData(z,1) ], options);
    run_plot = 1;
    update();
    
});
/*
z.nimmune = 0; //couldn't get nimmune working...
	   
		var init_healthy=0;
		var init_infected=0;
		
		z.nhealthy = $(this).val();
		init_healthy = $(this).val();

		z.infarr[0] = $(this).val();
		init_infected = $(this).val();

		z=startSimulation(init_infected, init_healthy);
		update();
*/
    
	
    //z.updatePopulation()
    //for(i=0;i<10;i++)
//	z.updatePopulation();
   // update();
   

//</script>
