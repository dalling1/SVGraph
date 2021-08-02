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

function Line(attributes){
 var lin = document.createElementNS("http://www.w3.org/2000/svg","line");
 for (attr in attributes){
  lin.setAttribute(attr,attributes[attr]);
 }
 return lin;
}

function randomRadius(r1=-1,r2=-1){
 // default limits:
 if (r1<0) r1 = 2;
 if (r2<0) r2 = 8;
 return Math.round(Math.random()*(r2-r1)+r1);
}

function addRandomNode(e=null){
 var nodegrp = document.getElementById("nodegroup");
 var radius = randomRadius();
 var position = randomLocation(-radius,-radius);
 var nodeN = nodegrp.children.length;
 var nodeid = "node"+nodeN; // not guaranteed to be unique, since nodes can be removed

 if (e!=null){
  // a user click, not a function call (eg. using +100 button)
  position[0] = event.clientX;
  position[1] = event.clientY;
 }

 var newnode = new Circle({
   "fill": "#000",
   "stroke": "none",
   "r": radius,
   "cx": position[0],
   "cy": position[1],
   "z-index": position[2],
   "id": nodeid,
   "class": "anode",
 });
 nodegrp.appendChild(newnode);

 var addRandomEdges = true;
 // the first true one of these methods will be enacted:
 var binomialEdges = true;
 var fixedDegree = false;
 var localBinomialEdges = false;

 if (addRandomEdges){
  var edgegrp = document.getElementById("edgegroup");

  // edges are stored as two lists, the "from" and "to" nodes
  // this makes it easier to find which nodes are contained in which edges, for removal
  if (binomialEdges){
   // add possible edges (from the new node to each existing node) with probability Pedge
   var Pedge = 0.01; // probability
   var N = nodegrp.childElementCount;
//   var newEdges = Array();
   var newEdgesFrom = Array();
   var newEdgesTo = Array();
   for (var i=0;i<N;i++){
    if (Math.random()<Pedge){
     if (nodeN != i){ // exclude self-edges
//      newEdges.push([nodeN, i]); // store the edge list
      newEdgesFrom.push(nodeN); // store the edge endpoints
      newEdgesTo.push(i);
     }
    }
   }
  } else if (fixedDegree){
   // add edges to D existing nodes

  } else if (localBinomialEdges){
   var Redge = 60; // only allow edges within this radius, with some probability
   var Pedge = 0.2; // probability
   var N = nodegrp.childElementCount;
//   var newEdges = Array();
   var newEdgesFrom = Array();
   var newEdgesTo = Array();
   for (var i=0;i<N;i++){
    if (Math.random()<Pedge){
     var d = distance(nodeN,i);
     if (d>0 && d<=Redge){
//      newEdges.push([nodeN, i]); // store the edge list
      newEdgesFrom.push(nodeN); // store the edge endpoints
      newEdgesTo.push(i);
     }
    }
   }
  }

  // add lines for the edges
  for (i in newEdgesFrom){
   var edgeN = edgegrp.childElementCount;
   var edgeid = "edge"+edgeN; // this id is not guaranteed to be unique...
   var fromNode = newEdgesFrom[i];
   var toNode = newEdgesTo[i];
   var newedge = new Line({
    "stroke": "#004",
    "stroke-width": 1,
    "x1": document.getElementById("nodegroup").children[fromNode].attributes.cx.value,
    "y1": document.getElementById("nodegroup").children[fromNode].attributes.cy.value,
    "x2": document.getElementById("nodegroup").children[toNode].attributes.cx.value,
    "y2": document.getElementById("nodegroup").children[toNode].attributes.cy.value,
    "id": edgeid,
    "class": "anedge",
   });
   edgegrp.appendChild(newedge);
  }
 }

 // add the new nodes and edges to the global lists
 for (i in newEdgesFrom) edgesFrom.push(newEdgesFrom[i]);
 for (i in newEdgesTo) edgesTo.push(newEdgesTo[i]);
 vertices.push(nodeN);

 return true;
}

function addRandomNodes(n=1){
 for (var i=0;i<n;i++) addRandomNode();
 return n;
}

function removeNode(youngestFirst=true){
 // by default, remove the last-added node
 var count = 0;
 var edgegrp = document.getElementById("edgegroup");
 var edgechildren = edgegrp.children;
 var nodegrp = document.getElementById("nodegroup");
 var nodechildren = nodegrp.children;
 if (nodechildren.length){
  if (youngestFirst){
   var delnode = nodechildren[nodechildren.length-1];
  } else {
   var delnode = nodechildren[0];
  }
  // first remove any edges attached to this node
  var delnodeN = parseInt(delnode.id.replace("node",""));
  indx = false;
  while ((indx = edgesFrom.indexOf(delnodeN)) > -1){
   edgegrp.removeChild(edgechildren[indx]);
   edgesFrom.splice(indx,1);
   edgesTo.splice(indx,1);
  }
  while ((indx = edgesTo.indexOf(delnodeN)) > -1){
   edgegrp.removeChild(indx);
   edgesFrom.splice(indx,1);
   edgesTo.splice(indx,1);
  }

  // now remove the node itself
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

function distance(i,j){
 // Euclidean distance from node i to node j
 var nodes = document.getElementById("nodegroup").children;
 if (nodes.length>=i && nodes.length>=j){
  var n1=nodes[i];
  var n2=nodes[j];
  return Math.pow(Math.pow(n1.attributes.cx.value-n2.attributes.cx.value,2.0)+Math.pow(n1.attributes.cy.value-n2.attributes.cy.value,2.0),0.5)
 }
}


/* ---------------------------------------------------------------------------------------------- */



/*
 Generate a random graph and draw it with SVG objects
 Choose new locations for each node
 Animate the movement of each node (and its connected edges) to its new location
*/

/*
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
*/

// create an SVG group to put the edges into
var gr = document.createElementNS("http://www.w3.org/2000/svg","g");
gr.id = "edgegroup";
document.getElementById("thesvg").appendChild(gr);

// create an SVG group to put the nodes into
var gr = document.createElementNS("http://www.w3.org/2000/svg","g");
gr.id = "nodegroup";
document.getElementById("thesvg").appendChild(gr);

// add a node when the user clicks the page
document.getElementById("thesvg").onclick = function(e){addRandomNode(e)};
document.getElementById("thesvg").onauxclick = function(e){if(e.which==2)removeNode()}; // middle-click only, not right-click
// create the logical list of nodes and edges
var vertices = Array();
var edgesFrom = Array();
var edgesTo = Array();
