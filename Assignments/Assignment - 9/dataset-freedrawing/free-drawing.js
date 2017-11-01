var canvas = new fabric.Canvas('canvas');
// This enables the free drawing mode.
canvas.isDrawingMode=true;


var selectedValue = "A"
// Creating the brush object to override _finalizeAndAddPath function
var pencil_brush = new fabric.PencilBrush(canvas);
canvas.freeDrawingBrush = pencil_brush;
var pencil_brush = new fabric.SprayBrush(canvas);
canvas.freeDrawingBrush = pencil_brush;
debugger;
canvas.freeDrawingBrush.density = 20;
//canvas.freeDrawingBrush.dotWidth = 0.2;
//canvas.freeDrawingBrush.dotWidthVariance = 2;
canvas.freeDrawingBrush.width = 10;
	


var canvas_points = []; // To Store the points that are available in _finalizeAndAddPath
var classA_coordinates = [];  // These are the final X,Y Co-Ordinates of the free drawing graph.
var classB_coordinates = [];


var clearCanvas  = function() {
	// Function to clear the canvas.
	canvas.clear();
};


var getCoordinates = function(){
	// Function to see the Co Ordinates of the graph.
	debugger;
	var data = canvas.getObjects();
	canvas.includeDefaultValues = false;
};

var change_density = function(){
	canvas.freeDrawingBrush.density= parseInt($("#density_id").val());
};
var change_width = function(){
	canvas.freeDrawingBrush.width = parseInt($("#width_id").val());
};

canvas.on('path:created', function(e){
	//Adding the points to the x,y list of X-Y co-ordinates.
	add_coordinates_to_array(canvas.freeDrawingBrush.sprayChunks);
});


var add_coordinates_to_array = function(chunks){
	//Function to add the points to the x-y coordinates list.
	debugger;
	if (selectedValue == 'A'){
		var final_points = classA_coordinates;
	}
	else{
		var final_points = classB_coordinates;
	}
	chunks.forEach( function (chunk){
		 //debugger;
		chunk.forEach(function(point){
			final_points.push(point);
			//final_points.push({'X':point.x, 'Y':point.y, 'Width':point.width});
		});
	});
}
var graph_points = []
var retain_only_one_common_point = function(classA_coordinates, classB_coordinates){
	debugger;
	var bfinal_points = []
	classA_coordinates.forEach( function (classApoint){
			graph_points.push({'Ax':classApoint.x, 'Ay':classApoint.y});
				classB_coordinates =  classB_coordinates.filter(function (classBpoint){
								 if (!classApoint.eq(classBpoint)){
										 bfinal_points.push({'Bx':classBpoint.x, 'By':classBpoint.y});
								 }
				 });
	});
	//debugger;
	var obj = Object.assign({}, graph_points, bfinal_points);
	//debugger;
}

function download(){
	//Method to download the points.
	retain_only_one_common_point(classA_coordinates, classB_coordinates);
	debugger;
	if (classA_coordinates !== []){
		JSONToCSVConvertor(classA_coordinates, "Co-Ordinates of Class A", true);
	}
	if (classB_coordinates !== []){
		JSONToCSVConvertor(classB_coordinates, "Co-Ordinates of Class B", true);
	}
}


function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
	//If JSONData is not an object then JSON.parse will parse the JSON string in an Object
	var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

	var CSV = '';    
	//Set Report title in first row or line

	CSV += ReportTitle + '\r\n\n';

	//This condition will generate the Label/Header
	if (ShowLabel) {
		var row = "";
			
			//This loop will extract the label from 1st index of on array
		 // for (var index in arrData[0]) {
					
					//Now convert each value to string and comma-seprated
			//    row += index + ',';
			//}
		row += "X" + ','+ "Y" + ','+ "Width "; 

		row = row.slice(0, -1);
			
		//append Label row with line break
		CSV += row + '\r\n';
	}

	//1st loop is to extract each row
	for (var i = 0; i < arrData.length; i++) {
		var row = "";
			
			//2nd loop will extract each column and convert it in string comma-seprated
			//for (var index in arrData[i]) {
			//    row += '"' + arrData[i][index] + '",';
			//}
		debugger;
		row += '"' + arrData[i].x + '",';
		row += '"' + arrData[i].y + '",';
		row += '"' + arrData[i].width + '",';
		row.slice(0, row.length - 1);
		
		//add a line break after each row
		CSV += row + '\r\n';
	}

	if (CSV == '') {        
		alert("Invalid data");
		return;
	}   

	//Generate a file name
	var fileName = "GraphCoOrdinates_";
	//this will remove the blank-spaces from the title and replace it with an underscore
	fileName += ReportTitle.replace(/ /g,"_");   

	//Initialize file format you want csv or xls
	var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

	// Now the little tricky part.
	// you can use either>> window.open(uri);
	// but this will not work in some browsers
	// or you will not get the correct file extension    

	//this trick will generate a temp <a /> tag
	var link = document.createElement("a");    
	link.href = uri;

	//set the visibility hidden so it will not effect on your web-layout
	link.style = "visibility:hidden";
	link.download = fileName + ".csv";

	//this part will append the anchor tag and remove it after automatic click
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}


var change_brushcolor = function(){
	debugger;
	selectedValue = $("input[name='optradio']:checked").val();
	if (selectedValue == 'A'){
			canvas.freeDrawingBrush.color='#f46242';
	}
	else{
			canvas.freeDrawingBrush.color='#117c9c';
	}
}




canvas.freeDrawingBrush._finalizeAndAddPath =function() {
	//Overridden function to get the points that are marked
	debugger;
	canvas_points = this._points;
	var ctx = this.canvas.contextTop;
	ctx.closePath();

	var pathData = this.convertPointsToSVGPath(this._points).join('');
	if (pathData === 'M 0 0 Q 0 0 0 0 L 0 0') {
		// do not create 0 width/height paths, as they are
		// rendered inconsistently across browsers
		// Firefox 4, for example, renders a dot,
		// whereas Chrome 10 renders nothing
		this.canvas.requestRenderAll();
		return;
	}

	var path = this.createPath(pathData);

	this.canvas.add(path);
	path.setCoords();

	this.canvas.clearContext(this.canvas.contextTop);
	this._resetShadow();
	// this.canvas.requestRenderAll();

	// fire event 'path' created
	this.canvas.fire('path:created', { path: path });
}

var grid = 50;

// create grid

for (var i = 0; i < (600 / grid); i++) {
	canvas.add(new fabric.Line([ i * grid, 0, i * grid, 600], { stroke: '#ccc', selectable: false }));
	canvas.add(new fabric.Line([ 0, i * grid, 600, i * grid], { stroke: '#ccc', selectable: false }))
}