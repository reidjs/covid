/*

*/
//function Population(ninfected, nhealthy, nimmune, pinfect, socialcoef, infticks, infarr, pdeath)
function Population(ninfected,nhealthy,nimmune,pinfect,socialcoef,
		    infticks, death_probability)
{
    //var Population = new Object();
    //var empty = 0;
    this.ninfected = ninfected;
    this.nhealthy = nhealthy;
    this.nimmune = nimmune;
    //var death_probability = 0.01;
    this.pinfect = pinfect;
    this.socialcoef = socialcoef; //multiplier of of healthy peeps that one infected person exposes infection to
    //var ninteractions = 0;
    this.infticks = infticks; //time in ticks that a person stays infected. On the last tick, they become immune. 
    this.infarr = new Array(this.infticks);
    this.pdeath = new Array(this.infticks); //probability of infected to die every day. 
    this.infarr[0] = this.ninfected;
    for(i=1; i<this.infarr.length;i++)
	this.infarr[i] = 0;
    //death probability based on time exposed to infection.
    //consider changing this so that people are more likely to die 
    //the longer they are exposed. 
    for(i=0; i< this.pdeath.length; i++)
	this.pdeath[i] = death_probability;
    this.updatePopulation=updatePopulation;
    function updatePopulation()
    {
	//this.ninfected++;
	var tempinfarr = new Array(this.infarr.length);
	for(i=0; i<this.infarr.length;i++)
	{
	    this.infarr[i] -= Math.round(this.pdeath[i]*this.infarr[i]) //kill off a percentage
	    tempinfarr[i] = this.infarr[i];
	}
	this.ninfected = 0;
	for(i=0; i<this.infarr.length-1;i++) 
	{
	    //print(infarr[i+1],tempinfarr[i]);
	    this.infarr[i+1] = tempinfarr[i];
	    this.ninfected += tempinfarr[i];	
	}
	
	var newimmune = this.infarr[this.infarr.length-1];
	this.ninfected -= newimmune; //they are no longer infected.
	this.infarr[this.infarr.length-1] = 0;
	
	//# healthy pop exposed to infection (can be greater than total pop)
	var x = (this.ninfected * returnInteractions(this.nhealthy, this.ninfected,this.nimmune,this.socialcoef));
	//print("x:",x)
	if (this.nhealthy == 0 || x>this.nhealthy)
	{
	    print("Entire healthy population has been exposed.");
	    //newinfected = Math.round(nhealthy*pinfect);
	    x = this.nhealthy;
	}
	var newinfected = Math.round(x*this.pinfect);
	print ("newinfects: ",newinfected);
	this.infarr[0] = newinfected;
	this.nhealthy -= newinfected;
	this.nimmune += newimmune;
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
	ratio = nhealthy/(ninfected+nimmune+nhealthy);
	ninteractions = socialcoef*ratio;
	print("interactions/tick: ",ninteractions);
	return ninteractions;    
    }
}
//function Population(ninfected,nhealthy,nimmune,pinfect,
//socialcoef,infticks, death_probability)
var ticks = 0;
var z = new Population(100,100000,0,.1,10,100,.01);

z.updatePopulation();
while(z.ninfected > 0)
{
    z.updatePopulation();
    print("healthy: ",z.nhealthy, "infected: ",z.ninfected,"immune: ",z.nimmune);
    if (ticks > 10)
    {
	//introduce vaccine for 1% pop
	var newimmune = Math.round(.01*z.nhealthy);
	z.nhealthy -= newimmune;
	z.nimmune += newimmune;
    }
    ticks++;
}
print("Population has reached equilibrium.");

