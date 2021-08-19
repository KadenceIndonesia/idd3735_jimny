$(document).ready(function(){
	var polylinepts = "";
	var point = [{
		"x" : "30",
		"y" : "261"
	},
	{
		"x" : "121",
		"y" : "100"
	},
	{
		"x" : "213",
		"y" : "100"
	},
	{
		"x" : "305",
		"y" : "50"
	}];
	
	for (var i = 0; i < point.length; i++) {
		polylinepts+=point[i].x+","+point[i].y+" ";
	}
	
	//document.getElementsByTagName("polyline")[0].setAttribute("points", polylinepts); //write line chart

	var svgheight = $('svg').height();
	var svgwidth = $('svg').width();

	
	var margin_v = svgheight / 6;
	var margin_h = (svgwidth+80) / yourData.length;
	var startpoint = svgheight - 30;

	// max point chart
	function getMaxvalue(yourData, prop){
		var max;
		for (var i = 0; i < yourData.length; i++) {
			if (!max || parseInt(yourData[i][prop]) > parseInt(max[prop])) {
				max = yourData[i];
			}
		}
		return max;
	}
	var maxvalue = getMaxvalue(yourData, "value");
	if (maxvalue.value.length == 1) {
		var toplimit = 10;
	}else if (maxvalue.value.length == 2) {
		var toplimit = Math.round(maxvalue.value / 10) * 10+10;
	}else if (maxvalue.value.length == 3) {
		var toplimit = Math.round(maxvalue.value / 100) * 100+100;
	}else if (maxvalue.value.length == 4) {
		var toplimit = Math.round(maxvalue.value / 1000) * 1000+1000;
	}else if (maxvalue.value.length == 5) {
		var toplimit = Math.round(maxvalue.value / 10000) * 10000+10000;
	}
	function getDataY(thedata){
		var dataY;
		var converttopercent;
		var startpointY;
		var getPointY;
		dataY = thedata	/ toplimit*100; //data dijadikan persen
		startpointY = startpoint*dataY/100; // nilai sama dengan (svgheigt - margin) * (persentase*100)
		getPointY = startpoint - startpointY; // posisi sama dengan (svgheigt - margin) - nilai
		return getPointY;
	}
	var rangeY = toplimit / (yourData.length-1);
	var pointY = "";
	var linevalue = "";
	var dataY = "";
	var writeYline = "";
	var circlepointXY = "";
	for (i = 0, j = startpoint, h = 40; i < 6; i++, j-=margin_v, h+=margin_h) {

		pointY += '<text x="20" y="'+j+'" dx="0">'+Math.round(rangeY*i)+'</text>';
		linevalue += '<path d="M40,'+j+' L'+svgwidth+','+j+'" stroke-linecap="butt" stroke="#E4E3E3" stroke-opacity="1" stroke-width="1" fill="none" style="stroke-linecap: butt;stroke-opacity: 1;fill: none;"></path>';
		dataY += yourData[i].value / toplimit*100;
		writeYline += h+','+getDataY(yourData[i].value)+" ";
		circlepointXY += '<circle cx="'+h+'" cy="'+getDataY(yourData[i].value)+'" r="3" fill="#ffffff" stroke="#177FC4" stroke-width="1" style="cursor:pointer;" title="'+yourData[i].value+'"></circle>';
	}
	document.getElementById("value_v").innerHTML = pointY; // write value vertical/sumbu Y
	document.getElementsByTagName("polyline")[0].setAttribute("points", writeYline); //write line chart
	document.getElementById("ciclePoint").innerHTML = circlepointXY;
	var horizontalval = "";
	var textLabel_y = svgheight - 10;
	for (i = 0, j = 40; i < yourData.length; i++, j+=margin_h) {
		horizontalval += '<text x="'+j+'" y="'+textLabel_y+'" dx="0">'+yourData[i].label+'</text>';
	}
	document.getElementById("value_h").innerHTML = horizontalval; // write value vertical

	
	// for (var i = 0; i < svgheight; i-=margin_v) {
	// 	linevalue += '<path d="M30,'+i+' L500,'+i+'" stroke-linecap="butt" stroke="#999999" stroke-opacity="1" stroke-width="1" fill="none" style="stroke-linecap: butt;stroke-opacity: 1;fill: none;"></path>'
	// }
	document.getElementById("line_h").innerHTML = linevalue; // write line value horizontal

})

