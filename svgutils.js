//const Pi = Math.acos(-1);

/*
function oldrandomLocation(w=0,h=0,z=0){
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
*/

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
 var selfedg = document.createElementNS("http://www.w3.org/2000/svg","path");
 var from = [];
 var to = [];
 for (var attr in attributes){
  if (attr=="from"){
   from = attributes[attr];
   selfedg.setAttribute(attr,from.name);
  } else if (attr=="to"){
   to = attributes[attr];
   selfedg.setAttribute(attr,attributes[attr].name);
  } else {
   selfedg.setAttribute(attr,attributes[attr]);
  }
 }

 // add a "fill" attribute
 selfedg.setAttribute("fill","none");
 // finally, calculate the path
 var edgeRadius = 300;

 if (false){ // approach 1: use the node's logical position
  var fromx = from.x;
  var fromy = from.y;
  var tox = to.x;
  var toy = to.y;
 } else { // approach 2: use the node's SVG object's position
  var fromx = parseInt(from.svg.getAttribute("cx"));
  var fromy = parseInt(from.svg.getAttribute("cy"));
  var tox = parseInt(to.svg.getAttribute("cx"));
  var toy = parseInt(to.svg.getAttribute("cy"));
 }
 // calculate the location of two control points, used to create a looping path with a cubic Bezier curve
 var control1XY = [Math.round(fromx+(Math.random()-0.5)*edgeRadius), Math.round(fromy+(Math.random()-0.5)*edgeRadius)].join(","); // control point 1
 var control2XY = [Math.round(fromx+(Math.random()-0.5)*edgeRadius), Math.round(fromy+(Math.random()-0.5)*edgeRadius)].join(","); // control point 2
 var fromXY = [fromx, fromy].join(",");
 var toXY = [tox, toy].join(",");

 var d = "M "+fromXY+" C "+control1XY+" "+control2XY+" "+toXY; // "C" for cubic; higher orders are available but require more control points
 selfedg.setAttribute("d",d);

 return selfedg;
}

function randomRadius(r1=-1,r2=-1){
 // default limits:
 if (r1<0) r1 = 2;
 if (r2<0) r2 = 20;
 if (r1.length==2){
  r2 = r1[1];
  r1 = r1[0];
 }
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

/*
function removeElement(id){
 var el = document.getElementById(id);
 if (el!=null) el.parentNode.removeChild(el);
}
*/

/*
function linearPosition(from,to,percent){
 var dim = from.length;
 if (from.length<3){
  from[2] = 0;
  to[2] = 0;
 }
 var newx = from[0] + (percent/100.0)*(to[0]-from[0]);
 var newy = from[1] + (percent/100.0)*(to[1]-from[1]);
 var newz = from[2] + (percent/100.0)*(to[2]-from[2]);
 return [newx, newy, newz];
}
*/

function randomCircleLocation(centre,radius,angleMin=0,angleMax=2*Math.PI){
 var angle = Math.random()*(angleMax-angleMin);
 var x = Math.round(centre[0] + radius*Math.sin(angleMin+angle));
 var y = Math.round(centre[1] + radius*Math.cos(angleMin+angle));
 return [x,y];
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

function circleLocation(centre,radius,angle){
 var x = Math.round(centre[0] + radius*Math.sin(angle));
 var y = Math.round(centre[1] + radius*Math.cos(angle));
 return [x,y];
}

function spacedCircleLocation(centre,radius,valency,depth,n,angleMin=0,angleMax=2*Math.PI){
 // Place nodes around a circle, evenly spaced; number is determined by valency and depth
 // Return the nth of those positions
 // if n is zero-indexed, n=0 will give the position at angle=0, otherwise n=N will be angle=2*Pi==0
// var angleSpacing = 2*Math.PI/treeShellCount(valency,depth);
 var angleSpacing = (angleMax-angleMin)/treeShellCount(valency,depth);
 var angle = angleMin+angleSpacing*(n+0.5);
 return circleLocation(centre,radius,angle);
}

function treeShellCount(valency,depth){
 if (depth==0) return 1;
 return valency*Math.pow(valency-1,depth-1);
}
