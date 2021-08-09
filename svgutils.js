function randomLocation(w=0,h=0,z=0){
 // generate a random location
 // bounds are the box [0,w],[0,h],[0,z] or within the browser window by default (z limits 0-100)
 // -- but if any entry is negative, exclude the points from that boundary
 var dim=3;
 var lowerLimit = Array(dim)
 var upperLimit = Array(dim)
 lowerLimit[0] = (w<0? -w : 0);
 lowerLimit[1] = (h<0? -h : 0);
 lowerLimit[2] = (z<0? -z : 0);

 upperLimit[0] = (w>0? w : window.innerWidth + w);
 upperLimit[1] = (h>0? h : window.innerHeight + h);
 upperLimit[2] = (z>0? z : 100 + z);

 var P = Array(dim);
 for (var d=0;d<dim;d++){
  if (lowerLimit[d]>upperLimit[d]) lowerLimit[d] = upperLimit[d];
  P[d] = Math.round(Math.random()*(upperLimit[d]-lowerLimit[d])+lowerLimit[d]);
 }
 return P;
}

function Circle(attributes){ // thanks Matt https://stackoverflow.com/a/21362202
 var cir = document.createElementNS("http://www.w3.org/2000/svg","circle");
 for (var attr in attributes){
  cir.setAttribute(attr,attributes[attr]);
 }
 return cir;
}

function Line(attributes){
 var lin = document.createElementNS("http://www.w3.org/2000/svg","line");
 for (var attr in attributes){
  lin.setAttribute(attr,attributes[attr]);
 }
 return lin;
}

function SelfEdge(attributes){
 var selflin = document.createElementNS("http://www.w3.org/2000/svg","path");
 var from = [];
 var to = [];
 for (var attr in attributes){
  if (attr=="from"){
   from = attributes[attr];
   selflin.setAttribute(attr,from.name);
  } else if (attr=="to"){
   to = attributes[attr];
   selflin.setAttribute(attr,attributes[attr].name);
  } else {
   selflin.setAttribute(attr,attributes[attr]);
  }
  // add a "fill" attribute
  selflin.setAttribute("fill","none");
  // finally, calculate the path
  var edgeRadius = 300;
  var c1XY = [Math.round(from.x+(Math.random()-0.5)*edgeRadius), Math.round(from.y+(Math.random()-0.5)*edgeRadius)].join(","); // control point 1
  var c2XY = [Math.round(from.x+(Math.random()-0.5)*edgeRadius), Math.round(from.y+(Math.random()-0.5)*edgeRadius)].join(","); // control point 2
  var fromXY = [from.x, from.y].join(",");
  var toXY = [to.x, to.y].join(",");
  var d = "M "+fromXY+" C "+c1XY+" "+c2XY+" "+toXY;
  selflin.setAttribute("d",d);
 }
 return selflin;
}

function randomRadius(r1=-1,r2=-1){
 // default limits:
 if (r1<0) r1 = 2;
 if (r2<0) r2 = 20;
 return Math.round(Math.random()*(r2-r1)+r1);
}

function randomName(L=8){
 var rname = "";
 const charset = "abcdefgh".split("");
 for (var i=0;i<L;i++) rname += charset[parseInt(charset.length*Math.random())];
 return rname;
}

/*
function distance(i,j){
 // Euclidean distance from node i to node j
 var nodes = document.getElementById("nodegroup").children;
 if (nodes.length>=i && nodes.length>=j){
  var n1=nodes[i];
  var n2=nodes[j];
  return Math.pow(Math.pow(n1.attributes.cx.value-n2.attributes.cx.value,2.0)+Math.pow(n1.attributes.cy.value-n2.attributes.cy.value,2.0),0.5)
 }
}
*/

function appendSvgGroup(id,parent){
 var gr = document.createElementNS("http://www.w3.org/2000/svg","g");
 gr.id = id;
 document.getElementById(parent).appendChild(gr);
 return document.getElementById(id);
}

function appendSvgObject(obj,target){
 if (document.getElementById(target.id)!=null){
  target.appendChild(obj);
  return true;
 } else {
  return false;
 }
}

function removeElement(id){
 var el = document.getElementById(id);
 if (el!=null) el.parentNode.removeChild(el);
}

/*
function duplicateSvg(){
 // duplicate the contents of object with id "thesvg", and put the copies back in with a coordinate offset [now zero offset]
 // and then apply movement to them (the example is to drop them down to the bottom of the screen)
 var thesvg = document.getElementById("thesvg");
 var nodegrp = document.getElementById("nodegroup");
 var edgegrp = document.getElementById("edgegroup");

 removeElement("copyedgegroup");
 removeElement("copynodegroup");
 copyedgegrp = appendSvgGroup("copyedgegroup","thesvg");
 copynodegrp = appendSvgGroup("copynodegroup","thesvg");

 var offset = 0;

 // loop through the existing nodes and duplicate them
 for (var i=0;i<nodegrp.childElementCount;i++){
  var thisnode = nodegrp.children[i];
  var newnode = new Circle({
    "fill": "#060", // differentiate the copies by colour
    "stroke": "#800",
    "r": parseFloat(thisnode.getAttribute("r")),
    "cx": parseFloat(thisnode.getAttribute("cx"))+offset,
    "cy": parseFloat(thisnode.getAttribute("cy"))+offset,
    "z-index": parseFloat(thisnode.getAttribute("z-index")),
    "id": "copy"+thisnode.getAttribute("id"),
    "class": thisnode.getAttribute("class"),
  });
  copynodegrp.appendChild(newnode);
 }

 // add the new node to the global list
// vertices.push(nodeN);

 // loop through the existing edges and duplicate them
 for (var i=0;i<edgegrp.childElementCount;i++){
  var thisedge = edgegrp.children[i];
  var newedge = new Line({
//    "stroke": "#3f3",
    "stroke": "#6af",
    "stroke-width": parseFloat(thisedge.getAttribute("stroke-width")),
    "x1": parseFloat(thisedge.getAttribute("x1"))+offset,
    "x2": parseFloat(thisedge.getAttribute("x2"))+offset,
    "y1": parseFloat(thisedge.getAttribute("y1"))+offset,
    "y2": parseFloat(thisedge.getAttribute("y2"))+offset,
    "id": "copy"+thisedge.getAttribute("id"),
    "class": thisedge.getAttribute("class"),
  });
  copyedgegrp.appendChild(newedge);
 }

 // thanks Danil https://stackoverflow.com/a/12092526
 var timer = window.setInterval(function(){var done=moveDuplicates(10);if(done)clearInterval(timer);},20);
}
*/

/*
function moveDuplicates(delta=20){
 // example motion of the duplicated nodes and edges: move them towards the bottom of the screen
 console.log("moving...");

 var copynodegrp = document.getElementById("copynodegroup");
 var copyedgegrp = document.getElementById("copyedgegroup");

 var y0 = window.innerHeight; // move nodes to the bottom of the window

 var Nfinished = 0;
 for (var i=0;i<copynodegrp.childElementCount;i++){
  var cy = parseInt(copynodegrp.children[i].getAttribute("cy"));
  var r = parseInt(copynodegrp.children[i].getAttribute("r"));
  var cynew = Math.min(cy+delta,y0-r);
  // check that the movement is non-zero (otherwise, this node is finished)
  if (cy==cynew){
   Nfinished++;
  } else {
   copynodegrp.children[i].setAttribute("cy",cynew);
  }
 }

 for (var i=0;i<copyedgegrp.childElementCount;i++){
  var y1 = parseInt(copyedgegrp.children[i].getAttribute("y1"));
  var y2 = parseInt(copyedgegrp.children[i].getAttribute("y2"));
  var y1new = Math.min(y1+delta,y0);
  var y2new = Math.min(y2+delta,y0);
  copyedgegrp.children[i].setAttribute("y1",y1new);
  copyedgegrp.children[i].setAttribute("y2",y2new);
 }

// if (Nfinished==copynodegrp.childElementCount) clearTimeout(timer);
 return (Nfinished==copynodegrp.childElementCount); // == finished

}
*/
