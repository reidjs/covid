/*
add a function to distribute the first batch across infarr 
rather than just piling them on day[0]. This will prevent that huge 'bump' after the first group recovers from the infection. 
*/
//function Population(ninfected, nhealthy, nimmune, pinfect, socialcoef, infticks, infarr, pdeath)
function Population()
{
    this.initializePopulation=initializePopulation;
    this.updatePopulation=updatePopulation;
    this.introduceVaccine=introduceVaccine;
    this.introduceTreatment=introduceTreatment;
    this.introduceQuarantine=introduceQuarantine;
    this.distributeNormally=distributeNormally;
    function initializePopulation(ninfected,nhealthy,nimmune,pinfect,socialcoef,
				  infticks, death_probability)
    {
	//var Population = new Object();
	//var empty = 0;
	this.ninfected = ninfected;
	this.nhealthy = nhealthy;
	this.nimmune = nimmune;
	this.nquarantined = 0;
	this.ndead = 0;
	this.death_probability = death_probability;
	//var death_probability = 0.01;
	this.pinfect = pinfect;
	this.socialcoef = socialcoef; //multiplier of of healthy peeps that one infected person exposes infection to
	//var ninteractions = 0;
	this.infticks = infticks; //time in ticks that a person stays infected. On the last tick, they become immune. 
	this.infarr = new Array(this.infticks);
	this.pdeath = new Array(this.infticks); //probability of infected to die every day. 
	//this.quarr = new Array(this.infticks); //quarantined infected population.
	//idea: change this to distribute infection normally.
	//Basically, some people recover quicker than others.
	//this.infarr[0] = this.ninfected;
	for(i=0; i<this.infarr.length;i++)
	    this.infarr[i] = 0;
	//alert(this.infarr);
	this.infarr = this.distributeNormally(this.infarr, this.ninfected);
	/*for(i=0; i<this.infarr.length;i++) {
	    this.infarr[i] = temp_infarr[i];
	}*/
	    //this.infarr[i] = 0;
	//death probability based on time exposed to infection.
	//consider changing this so that people are more likely to die 
	//the longer they are exposed. 
	for(i=0; i< this.pdeath.length; i++)
	    this.pdeath[i] = death_probability;
    }

    function updatePopulation()
    {
	//print (this.infarr);
	var tempinfarr = new Array(this.infarr.length);
	var deadcount = 0;
	for(i=0; i<this.infarr.length;i++)
	{
	    var t = Math.floor(this.pdeath[i]*this.infarr[i]);
	    this.infarr[i] -= t; //kill off a percentage
	    deadcount += t;
	    tempinfarr[i] = this.infarr[i];
	}
	//print (tempinfarr);
	this.ninfected = 0;
	for(i=0; i<this.infarr.length-1;i++) 
	{
	    //print(infarr[i+1],tempinfarr[i]);
	    this.infarr[i+1] = tempinfarr[i];
	    this.ninfected += tempinfarr[i];	
	}
	//print("updatepop, this.infarr: ",this.infarr);
	//asdf
	var newimmune = this.infarr[this.infarr.length-1];
	this.ninfected -= newimmune; //they are no longer infected.
	this.infarr[this.infarr.length-1] = 0;
	
	//# healthy pop exposed to infection (can be greater than total pop)
	//NOTE: 1-8-2013, do I add this.nhealthy to this.ninfected?
	var x = ((this.ninfected) * returnInteractions(this.nhealthy, this.ninfected,this.nimmune,this.socialcoef));
	//print("x:",x)
	if (this.nhealthy == 0 || x>this.nhealthy)
	{
	    //print("Entire healthy population has been exposed.");
	    //newinfected = Math.round(nhealthy*pinfect);
	    x = this.nhealthy;
	}
	//this doesn't work for very small pop of healthy
	//because it will always round to 0. 
	//if the newinfected value is < 1 there must be 
	//a probability to infect ppl regardless...
	var newinfected = Math.floor(x*this.pinfect);
	//print ("newinfects: ",newinfected);
	this.infarr = this.distributeNormally(this.infarr,newinfected);
	this.nhealthy -= newinfected;
	this.nimmune += newimmune;
	this.ndead += deadcount;
	//return ninfected;
	//infarr[0] 
    }
    function returnInteractions(nhealthy, ninfected,nimmune,socialcoef)
    {
	//if entire pop is sick, return 0
	//if entire pop is healthy, return ...
	//ratio = (nhealthy/ninfected)
	//if (ratio < 1)
	//	ratio = 1/ratio;
	if (nhealthy > 0)
	{
	    ratio = nhealthy/(ninfected+nimmune+nhealthy);
	    ninteractions = socialcoef*ratio;
	    //print("interactions/tick: ",ninteractions);
	    return ninteractions;   
	}
	else
	    return socialcoef;
	 
    }
    function introduceVaccine(mu)
    {
	//some percentage (mu) of the healthy pop becomes immune instantly.
	var newimmune= Math.floor(mu*this.nhealthy);
	//print("immunized ",newimmune);
	this.nhealthy-=newimmune;
	this.nimmune+=newimmune;
    }
    function introduceTreatment(mu, x)
    {
	//the odds of death is decreased to mu after x days of infection
	if (x < this.pdeath.length && x >= 0)
	{
	    for(i=x;i<this.pdeath.length;i++)
	    {
		this.pdeath[i] = mu;
	    }
	}
    }
    function introduceQuarantine(mu)
    {	
	/*
	  This will work by taking the sickest people first (latest in infarr).
	  generates a new population of entirely infected individuals (mu percentage of ninfected from this). Consider changing death_probability upon init to 
	  a lower percentage? 
	 */
	var qpop = new Population();
	qpop.initializePopulation(0,0,0,this.pinfect, this.socialcoef, this.infticks, this.death_probability);
	if (mu<=1 && mu>=0)
	{
	    var cnt = Math.floor(mu*this.ninfected);
	    //var quarr = new Array(this.infticks)
	    //var cnt = newquarantined; 
	    //print("**Quarantining: ",cnt, "of ",this.ninfected);
	    for(j=this.infarr.length-1;j>=0;j--)
	    {
		//if (cnt <= 0)
		//    break;
		delta = cnt - this.infarr[j]; //1-4
		//print("delta:",delta,"infarr[j]: ",this.infarr[j]);
		if (delta <= 0)
		{
		    //a sufficient infected population can be found in this section of infarr. 
		    //print("infarr[j], delta", this.infarr[j], delta)
		    this.infarr[j] = this.infarr[j] + delta;
		    qpop.infarr[j] = qpop.infarr[j] + this.infarr[j];
		    cnt = cnt - this.infarr[j];
		    break;
		}
		else
		{
		    qpop.infarr[j] += this.infarr[j];
		    cnt = cnt - this.infarr[j];
		    this.infarr[j] = 0;
		}
	    }
	    //print(cnt, "<-if not zero, something went wrong!");
	    return qpop;
	}
    }
    function distributeNormally(arr, n)
    {
	var w = 0.3989422804014327; //(2pi)^-.5, normal distr.
	var bins = arr.length;
	var c1 = bins/2-.5; //center pointer of array arr.
	var cnt = 0;
	if (n == 0)
	    return arr;
	if (n == 1 || n < 0) {
	    arr[Math.round(c1)] += n; //the rounding here prevents a perfect normal distr.
	    cnt += n;
	}
	else {
	    for (i = 0; i < bins; i++) {
		t = Math.round(w*n*Math.exp(-Math.pow(i-c1,2)/2.));
		arr[i] += t;
		cnt += t;
	    }
	}
	if (cnt != n) {
	    //print("err: ", n-cnt);
	    this.distributeNormally(arr, n-cnt);
	}
	return arr;
    }
}
var z = new Population()
/*y = [0,0,0,0,0];
n = 1000;
print(z.distributeNormally(y, n));*/
//function Population(ninfected,nhealthy,nimmune,pinfect,
//socialcoef,infticks, death_probability)
/*var ticks = 0;
var infected = 100;
var healthy = 10000000;
var inftime = 10;
var z = new Population();
z.initializePopulation(infected,healthy,0,0.1,1,10,0.01);
var initpop = infected + healthy;
//z.updatePopulation();
var toggle = 0;
var toggle_2 = 0;
while(z.ninfected > 0)
{
    z.updatePopulation();
    //print("toggle2:",toggle_2);
    if (toggle_2)
    {
	//print(k.infarr);
	//asdf
	k.updatePopulation();
	//print("K POP: healthy: ",k.nhealthy, "infected: ",k.ninfected,"immune: ",k.nimmune);
	//asdf
    }
    //print("Z POP: healthy: ",z.nhealthy, "infected: ",z.ninfected,"immune: ",z.nimmune);
    if (ticks > z.infticks*2 && ticks < (z.infticks*2 + 3))
    {
	z.introduceVaccine(0.01);
	//print("********VACCINE");
    }
    if (ticks > z.infticks && toggle == 0)
    {
	z.introduceTreatment(0.0001,2);
	//print("********TREATMENT");
	toggle = 1;
    }
    if (ticks > z.infticks && toggle_2 == 0)
    {
	//print("********QUARANTINE");
	var k = z.introduceQuarantine(0.01);
	toggle_2 = 1;
    }
    ticks++;
}

//print("Population has reached equilibrium, ticks: ", ticks, "dead: ",initpop-(z.nhealthy+z.nimmune));*/
/*print("ERR1: ",n-cnt,"c1: ",c1);
	    t = Math.round(n-cnt);
	    half_t = Math.round(t/2);
	    if (c1 % 2 == 0) {
		arr[c1] += t;
		cnt += t;
	    }
	    else {
		if (t%2 == 0) {
		    arr[c1-0.5] += half_t;
		    cnt += half_t;
		    arr[c1+0.5] += half_t;
		    cnt += half_t;
		}
		else {
		    print(c1+0.5);
		    arr[c1-0.5] += half_t;
		    cnt += half_t;
		    arr[c1+0.5] += (half_t-1);
		    cnt += half_t-1;
		}
	    }
	    if (n-cnt < 0)
		print ("NEGATIVE VALUE ERROR");
	    print("ERR: ",n-cnt); //toss these into middle.*/
