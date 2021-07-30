function printMatrix(M){
 for (var i=0;i<M.length;i++) console.log(M[i].toString());
}

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
 for (d=0;d<dim;d++){
  if (lowerLimit[d]>upperLimit[d]) lowerLimit[d] = upperLimit[d];
  P[d] = Math.round(Math.random()*(upperLimit[d]-lowerLimit[d])+lowerLimit[d]);
 }
 return P;
}

function Circle(attributes){ // thanks Matt https://stackoverflow.com/a/21362202
 var cir = document.createElementNS("http://www.w3.org/2000/svg","circle");
 for (attr in attributes){
  cir.setAttribute(attr,attributes[attr]);
 }
 return cir;
}

function randomRadius(r1=-1,r2=-1){
 // default limits:
 if (r1<0) r1 = 5;
 if (r2<0) r2 = 25;
 return Math.round(Math.random()*(r2-r1)+r1);
}

function randomNode(){
 var nodegrp = document.getElementById("nodegroup");
 var radius = randomRadius();
 var position = randomLocation(-radius,-radius);
 var newnode = new Circle({
   "fill": "#000",
   "stroke": "none",
   "r": radius,
   "cx": position[0],
   "cy": position[1],
   "z-index": position[2],
   "id": "node"+nodegrp.children.length,
   "class": "anode",
 });
 nodegrp.appendChild(newnode);
 return true;
}

function randomNodes(n=1){
 for (var i=0;i<n;i++) randomNode();
 return n;
}

function removeNode(youngestFirst=true){
 // by default, remove the last-added node
 var count = 0;
 var nodegrp = document.getElementById("nodegroup");
 var nodechildren = nodegrp.children;
 if (nodechildren.length){
  if (youngestFirst) delnode = nodechildren[nodechildren.length-1];
  else delnode = nodechildren[0];
  nodegrp.removeChild(delnode);
  count++;
 }
 return count;
}

function removeNodes(n=0){
 // default is to remove all nodes
 if (n==0) n = document.getElementById("nodegroup").children.length;
 var count = 0;
 for (var i=0;i<n;i++){
  removeNode();
  count++;
 }
 return count;
}

function removeGivenNode(n=-1){
 if (n>-1){
  var delnode = document.getElementById("node"+n.toString())
  if (delnode!=null){
   // node n exists
   var nodegrp = document.getElementById("nodegroup");
   nodegrp.removeChild(delnode);
   return true;
  }
 }
 return false;
}



/* ---------------------------------------------------------------------------------------------- */



/*
 Generate a random graph and draw it with SVG objects
 Choose new locations for each node
 Animate the movement of each node (and its connected edges) to its new location
*/

var N = 16; // number of nodes
var P = 0.2; // probability that each edge exists
var M = Array(N);
for (var i=0;i<N;i++){
 M[i] = Array(N);
 for (var j=0;j<N;j++){
  if (j>=i){
   M[i][j] = (Math.random()<P?1:0);
  } else {
   M[i][j] = M[j][i]; // symmetric adjacency matrix (ie. undirected)
  }
 }
}
// create an SVG group to put the nodes into
var gr = document.createElementNS("http://www.w3.org/2000/svg","g");
gr.id = "nodegroup";
document.getElementById("thesvg").appendChild(gr);
// add a node when the user clicks the page
document.getElementById("thesvg").onclick = function(){console.log(randomNode())};
document.getElementById("thesvg").onauxclick = function(e){if(e.which==2)console.log(removeNode())}; // middle-click only, not right-click
