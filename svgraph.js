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

function addRandomNode(e=null){
 var nodegrp = document.getElementById("nodegroup");
 var radius = randomRadius();
// var position = randomLocation(-radius,-radius); // nodes can (just) touch the edges of the window
 var position = randomLocation(-100,-100); // leave a border of 100px
 var nodeN = nodegrp.children.length;
 var nodeid = "node"+nodeN; // not guaranteed to be unique, since nodes can be removed

 if (e!=null){
  // a user click, not a function call (eg. using +100 button): use the clicked coordinates
  position[0] = event.clientX;
  position[1] = event.clientY;
 }

// var node = new Node(

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
 // add the new nodes and edges to the global lists
 vertices.push(nodeN);

 var addRandomEdges = true;
 // the first true one of these methods will be enacted:
 var binomialEdges = true;
 var fixedDegree = false;
 var localBinomialEdges = false;

 if (addRandomEdges){
  var edgegrp = document.getElementById("edgegroup");
  var newEdgesFrom = Array();
  var newEdgesTo = Array();
//  var newEdges = Array();

  // edges are stored as two lists, the "from" and "to" nodes
  // this makes it easier to find which nodes are contained in which edges, for removal
  if (binomialEdges){
   // add possible edges (from the new node to each existing node) with probability Pedge
   var Pedge = 0.1; // probability
   for (var i=0;i<nodeN;i++){
    if (Math.random()<Pedge){
//     newEdges.push([nodeN, i]); // store the edge list
     newEdgesFrom.push(nodeN); // store the edge endpoints
     newEdgesTo.push(i);
    }
   }
  } else if (fixedDegree){
   // add edges to D existing nodes

  } else if (localBinomialEdges){
   var Redge = 60; // only allow edges within this radius, with some probability
   var Pedge = 0.2; // probability
   for (var i=0;i<nodeN;i++){
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

  addEdges(newEdgesFrom,newEdgesTo);
 }

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
   edgegrp.removeChild(document.getElementById(edgesLines[indx]));
   edgesFrom.splice(indx,1);
   edgesTo.splice(indx,1);
   edgesLines.splice(indx,1);
  }
  while ((indx = edgesTo.indexOf(delnodeN)) > -1){
   edgegrp.removeChild(document.getElementById(edgesLines[indx]));
   edgesFrom.splice(indx,1);
   edgesTo.splice(indx,1);
   edgesLines.splice(indx,1);
  }

  // now remove the node itself
  var vindx = delnodeN;
  vertices.splice(vindx,1);
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

function addNode(position,radius,edgelist=[]){
 // add a given node
 var nodegrp = document.getElementById("nodegroup");
 var nodeN = nodegrp.children.length;
 var nodeid = "node"+nodeN; // not guaranteed to be unique, since nodes can be removed

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
 // add the circle object to the page
 nodegrp.appendChild(newnode);
 // add the new node to the global list
 vertices.push(nodeN);

 for (var i=0;i<edgelist.length;i++){
  if (edgelist[i]==1){
   addEdges(nodeN,i);
  }
 }

 return true;
}

function addEdges(fromnodes,tonodes){
 // add lines for the given edges
 var nodegrp = document.getElementById("nodegroup");
 var edgegrp = document.getElementById("edgegroup");

 if (typeof(tonodes)=="number") tonodes = [tonodes]; // convert to an array if a single entry is given
 if (typeof(fromnodes)=="number") fromnodes = [fromnodes]; // convert to an array if a single entry is given
 if (fromnodes.length==1 && tonodes.length>1) fromnodes = Array(tonodes.length).fill(fromnodes[0]); // clone the "fromnodes" node for longer "to" lists

 // make sure the endpoints exist
 for (var i=0;i<fromnodes.length;i++){
  if (vertices.indexOf(fromnodes[i])>-1 && vertices.indexOf(tonodes[i])>-1){
   var edgeN = edgegrp.childElementCount;
   var edgeid = "edge"+edgeN; // this id is not guaranteed to be unique...
   var fromNode = fromnodes[i];
   var toNode = tonodes[i];
   var newedge = new Line({
    "stroke": "#004",
    "stroke-width": 0.2,
    "x1": document.getElementById("nodegroup").children[fromNode].attributes.cx.value,
    "y1": document.getElementById("nodegroup").children[fromNode].attributes.cy.value,
    "x2": document.getElementById("nodegroup").children[toNode].attributes.cx.value,
    "y2": document.getElementById("nodegroup").children[toNode].attributes.cy.value,
    "id": edgeid,
    "class": "anedge",
   });
   // add the line object to the page
   edgegrp.appendChild(newedge);

   // add the new edge to the global list
   edgesFrom.push(fromnodes[i]);
   edgesTo.push(tonodes[i]);
   // record the SVG line element's id, in case we want to remove it later
   edgesLines.push(edgeid);
  } else {
   console.log("Endpoints do not all exist "+fromnodes[i]+" to "+tonodes[i]);
   console.log("  vertices.indexOf("+fromnodes[i]+") = "+vertices.indexOf(fromnodes[i]));
   console.log("  vertices.indexOf("+tonodes[i]+") = "+vertices.indexOf(tonodes[i]));
  }
 }

 return true;
}

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

/* ---------------------------------------------------------------------------------------------- */



/*
 Generate a random graph and draw it with SVG objects
 Choose new locations for each node
 Animate the movement of each node (and its connected edges) to its new location
*/

var N = 16; // number of nodes
var P = 0.25; // probability that each edge exists
var M = Array(N);
for (var i=0;i<N;i++){
 M[i] = Array(N);
 for (var j=0;j<N;j++){
  if (j==i){
   M[i][j] = 0; // no self-edges
  } else if (j>=i){
   M[i][j] = (Math.random()<P?1:0);
  } else {
   M[i][j] = M[j][i]; // symmetric adjacency matrix (ie. undirected)
  }
 }
}

// create SVG groups to put the edges and nodes into (creation order determines drawing order)
appendSvgGroup("edgegroup","thesvg");
appendSvgGroup("nodegroup","thesvg");

// add a node when the user clicks the page
document.getElementById("thesvg").onclick = function(e){addRandomNode(e)};
document.getElementById("thesvg").onauxclick = function(e){if(e.which==2)removeNode()}; // middle-click only, not right-click

// create the logical list of nodes and edges
vertices = Array();
edgesFrom = Array();
edgesTo = Array();
edgesLines = Array();

//for (var i=0;i<N;i++){addNode(randomLocation(),randomRadius(),M[i])}
