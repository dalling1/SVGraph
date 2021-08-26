// graph class ////////////////////////////////////////////////////////////////////////////////////
class Graph {
 constructor(
  name = "",
  layoutName = "",
 ){
  this.type = this.constructor.name;
  this.name = name;
  this.nodes = [];
  this.edges = [];
  this.createSvg(); // make an SVG group for this graph
  this.border = [100,100,0]; // keep the centres of nodes this far from the boundary of the graph
  this.createLayout(layoutName);

  // rules for creating edges (these could be controls on the page):
  this.allowSelfEdges = true;
  this.alwaysUseBezier = true;
 }

 /*
   Methods for the Graph class:

   createSvg
   createLayout
   hide
   show
   addNode
   addNodes
   removeNode
   removeNewestNode
   removeOldestNode
   removeNodes
   numberNodes
   nameNodes (wanted?)
   findNode
   findNodes
   showNodeDetails
   randomNode
   addEdge
   addEdges
   findEdgesTo
   findEdgesToMatch
   excludeEdgesTo
   removeEdge
   removeNewestEdge
   removeOldestEdge
   removeEdges
   removeDuplicateEdges
   shuffleNodePositions
   toggleNodePositions
   randomLocation
   randomCircleLocation
   randomGridLocations
   allowSelfEdges
   alwaysUseBezier
   setAllowSelfEdges
   setAlwaysUseBezier
   findEdge
   findEdges
   centralLocation
   nodeLocation
   setLayout
   degreeMatrix
   adjacencyMatrix
   distanceMatrix
   connectivityMatrix

 */

 createSvg(){
  // make an SVG group for the graph, and then append groups for the nodes and edges
  this.svg = appendSvgGroup(this.name,"thesvg");
  this.svgedges = appendSvgGroup(this.name+"edges",this.svg.id);
  this.svgnodes = appendSvgGroup(this.name+"nodes",this.svg.id);
 }

 createLayout(layoutName){
  this.layout = new Layout(this.name+"Layout",layoutName);
 }

 hide(){
  this.svg.classList.add("hidden");
 }

 show(){
  this.svg.classList.remove("hidden");
 }

 addNode(name,position,radius){
  this.nodes.push(new Node(name,position,radius,this,this.nodes.length)); // zero-index the node.n values
 }

 addNodes(n=1){
  for (var i=0;i<n;i++) this.addNode(randomName(),this.nodeLocation(),randomRadius([4,10]));
 }

 removeNode(node){
  // input must be a node object or a node name
  if (typeof(node)=="object"){
   var name = node.name;
  } else if (typeof(node)=="string"){
   var name = node;
  } else {
   console.log("removeNode method requires a Node object or a string (the node name) as input")
   return false;
  }

  // we can't use indexOf to find the given node using its attributes, so just loop through them all:
  for (var i=this.nodes.length;i>0;i--){
   if (this.nodes[i-1].name == name){
    // remove any edges attached to this node first
    var deledges = this.findEdgesTo(name); // this is an array of Edge objects
    for (var k=deledges.length;k>0;k--){
     if (deledges[k-1].svg.parentElement==this.svgedges){ // the SVG edge elements persist after deletion: so check if they are "attached" to the graph
      this.svgedges.removeChild(deledges[k-1].svg); // remove SVG line element
      // use filter to remove edges: can't use splice since we don't know the indices of the elements
      this.edges = this.excludeEdgesTo(name); // "name" here is the name of the node to be removed
     }
    }
    // now remove the node SVG object
    this.svgnodes.removeChild(this.nodes[i-1].svg);
    // then remove this node from the graph
    this.nodes.splice(i-1,1);
   }
  }

  // finished: re-number the remaining nodes
  this.numberNodes();
 }

 removeNewestNode(){
  if (this.nodes.length) this.removeNode(this.nodes[this.nodes.length-1]);
 }

 removeOldestNode(){
  if (this.nodes.length) this.removeNode(this.nodes[0]);
 }

 removeNodes(n=1,newest=true){
  if (newest) for (var i=0;i<n;i++) this.removeNewestNode();
  else for (var i=0;i<n;i++) this.removeOldestNode();
 }

 numberNodes(){
  for (var i=0;i<this.nodes.length;i++) this.nodes[i].n = i;
 }

 nameNodes(){
  // ...but if these change we also need to sort out the edge list...
  for (var i=0;i<this.nodes.length;i++) this.nodes[i].name = "node"+i;
 }

 findNode(name){
  return this.nodes.filter(function(nod){return nod.name==name});
 }

 findNodes(name_regexp){
  return this.nodes.filter(function(nod){var p=new RegExp("^"+name_regexp+"$","i");return p.test(nod.name)});
 }

 showNodeDetails(){
  for (var i=0;i<this.nodes.length;i++) console.log(this.nodes[i].name);
 }

 randomNode(){
  return this.nodes[Math.floor(Math.random()*this.nodes.length)];
 }

 addEdge(name,from,to){
  if (this.allowSelfEdges || from.name != to.name){
   this.edges.push(new Edge(name,from,to,this));
   return true;
  } else {
   return false;
  }
 }

 addEdges(n=1){
  if (this.nodes.length) for (var i=0;i<n;i++) this.addEdge(randomName(),this.randomNode(),this.randomNode());
 }

 findEdge(name){
  // find an edge object with the given name
  return this.edges.filter(function(edg){return edg.name==name});
 }

 findEdgesTo(name){
  // find edges which connect to the vertex with the given name
  return this.edges.filter(function(edg){return edg.from.name==name||edg.to.name==name});
 }

 findEdgesToMatch(name_regexp){
  // find edges which connect to vertices whose names match the given regular expression
  return this.edges.filter(function(edg){var p=new RegExp("^"+name_regexp+"$","i");return p.test(edg.from.name)||p.test(edg.to.name)});
 }

 findEdgesFromTo(from,to){
  // find edges which connect to the named vertices (undirected)
  return this.edges.filter(function(edg){return (edg.from.name==from && edg.to.name==to) || (edg.from.name==to && edg.to.name==from)});
 }

 excludeEdgesTo(name){
  return this.edges.filter(function(edg){return edg.from.name!=name&&edg.to.name!=name});
 }

 removeEdge(edge){
  // input must be an edge object or an edge name
  if (typeof(edge)=="object"){
   var name = edge.name;
  } else if (typeof(edge)=="string"){
   var name = edge;
  } else {
   console.log("removeEdge method requires an Edge object or a string (the edge name) as input")
   return false;
  }

  // we can't use indexOf to find the given edge using its attributes, so just loop through them all:
  for (var i=this.edges.length;i>0;i--){
   if (this.edges[i-1].name == name){
    // remove the SVG object
    this.svgedges.removeChild(this.edges[i-1].svg);
    // then remove this edge from the graph
    this.edges.splice(i-1,1);
   }
  }
 }

 removeNewestEdge(){
  if (this.edges.length) this.removeEdge(this.edges[this.edges.length-1]);
 }

 removeOldestEdge(){
  if (this.edges.length) this.removeEdge(this.edges[0]);
 }

 removeEdges(n=1,newest=true){
  if (newest) for (var i=0;i<n;i++) this.removeNewestEdge();
  else for (var i=0;i<n;i++) this.removeOldestEdge();
 }

 removeDuplicateEdges(){
  for (var i=this.edges.length;i>0;i--){ // work from the end back to the start
   var duplicates = this.findEdgesFromTo(this.edges[i-1].from.name,this.edges[i-1].to.name);
   // if there are duplicates, remove this edge
   if (duplicates.length>1){
    this.removeEdge(this.edges[i-1]);
   }
  }
 }

 shuffleNodePositions(){
  for (var i=0;i<thegraph.nodes.length;i++){
   thegraph.nodes[i].setAltLocation(this.nodeLocation());
   thegraph.nodes[i].moveToAlt();
  }
 }

 toggleNodePositions(){
  for (var i=0;i<thegraph.nodes.length;i++){
   thegraph.nodes[i].moveToAlt();
  }
 }

 randomLocation(){
  // generate a random location within the border of this graph
  var dim=3;
  var lowerLimit = this.border;
  var upperLimit = [window.innerWidth - this.border[0], window.innerHeight - this.border[1], 100 - this.border[2]]
  var P = Array(dim);
  for (var d=0;d<dim;d++){
   if (lowerLimit[d]>upperLimit[d]) lowerLimit[d] = upperLimit[d];
   P[d] = Math.round(Math.random()*(upperLimit[d]-lowerLimit[d])+lowerLimit[d]);
  }
  return P;
 }

 randomCircleLocation(){
  // generate a random location on the circle centred on the page and which fits within the graph's border
  var X = 0.5*window.innerWidth;
  var Y = 0.5*window.innerHeight;
  var W = X - this.border[0];
  var H = Y - this.border[0];
  var R = Math.min(W,H);
  return randomCircleLocation([X,Y],R);
 }

 randomGridLocations(n=1){
  // generate a random location on a grid (within the border of this graph), jittered
  var Ncols = 8; //make a 10x6 grid (this could be user-selected later on)
  var Nrows = 4;
  var Ngrid = Ncols*Nrows;
  var Lvar = 100; // variance of the locations about the grid points (jitter)
  var dim=3;
  var P=new Array(n);

  var lowerLimit = this.border;
  var upperLimit = [window.innerWidth - this.border[0], window.innerHeight - this.border[1], 100 - this.border[2]]

  // 1. determine the grid point locations
  var gridX = new Array(Ncols);
  var gridY = new Array(Nrows);
  for (var i=0;i<Ncols;i++) gridX[i] = Math.round(lowerLimit[0] + i*(upperLimit[0]-lowerLimit[0])/(Ncols-1));
  for (var i=0;i<Nrows;i++) gridY[i] = Math.round(lowerLimit[1] + i*(upperLimit[1]-lowerLimit[1])/(Nrows-1));

  // select n points at those locations:
  for (var i=0;i<n;i++){
   // 2. choose a grid point at random
   var usegridX = Math.floor(Ncols*Math.random()); // use this one across (zero-indexed)
   var usegridY = Math.floor(Nrows*Math.random()); // use this one down (zero-indexed)
   // 3. get jittered coordinates around that point
   var tmp = randomNormal2([gridX[usegridX],gridY[usegridY]],[Lvar,Lvar]);
//   P[i] = Array(dim);
   P[i] = [Math.round(tmp[0]), Math.round(tmp[1]), 0];
  }
  return P;
 }

 setAllowSelfEdges(flag){
  // note that this does not alter existing edges
  this.allowSelfEdges = (flag?true:false);
 }

 setAlwaysUseBezier(flag){
  // note that this does not alter existing edges
  this.alwaysUseBezier = (flag?true:false);
 }

 findEdge(name){
  return this.edges.filter(function(edg){return edg.name==name});
 }

 findEdges(name_regexp){
  return this.edges.filter(function(edg){var p=new RegExp("^"+name_regexp+"$","i");return p.test(edg.name)});
 }

 centralLocation(){
  var dim=3;
  var P = Array(dim);
  P[0] = Math.round(window.innerWidth/2.0);
  P[1] = Math.round(window.innerHeight/2.0);
  P[2] = 0;
  return P;
 }

 nodeLocation(){
  if (this.layout.layoutName=="default"){ /////////////////////////////// default is randomRectangle
   return this.randomLocation();
  } else if (this.layout.layoutName=="randomRectangle"){ //////////////// randomRectangle
   return this.randomLocation();
  } else if (this.layout.layoutName=="randomCircle") { ////////////////// randomCircle
   return this.randomCircleLocation();
  } else if (this.layout.layoutName=="randomGrid") { //////////////////// randomGrid
   return this.randomGridLocations()[0];
  } else {
   return this.centralLocation(); /////////////////////////////////////// not specified: put nodes at the centre
  }
 }

 setLayout(layoutName){
  this.layout.setLayout(layoutName);
 }

 degreeMatrix(){
  var D = new Array(this.nodes.length);
  for (var i=0;i<this.nodes.length;i++){
   D[i] = new Array(this.nodes.length);
   D[i][i] = this.findEdgesTo(this.nodes[i].name).length;
  }
  return D;
 }

 adjacencyMatrix(){
  var A = new Array(this.nodes.length);
  for (var i=0;i<this.nodes.length;i++){
   A[i] = new Array(this.nodes.length).fill(0);
   var edges = this.findEdgesTo(this.nodes[i].name);
   for (var j=0;j<edges.length;j++){
    // use the "from" or "to" node?
    if (edges[j].from.name == this.nodes[i].name) var otherNodeN = edges[j].to.n;
    else var otherNodeN = edges[j].from.n;
    A[i][otherNodeN] += 1;
   }
  }
  return A;
 }

 distanceMatrix(){
  var A = this.adjacencyMatrix();
  var N = A.length;
  // initialise the distance matrix (all zeros)
//  var D = new Array(N);
//  for (var i=0;i<N;i++) D[i] = new Array(N).fill(0);
  var D = multiplyMatricesUsingOnes(A,identityMatrix(N)); // initial distances are 1 if there is an edge between nodes
  var P = multiplyMatricesUsingOnes(A,identityMatrix(N)); // path-length matrix

  for (var n=2;n<N;n++){
   // set P = A^i: P's entries are the number of paths of length n between nodes
   if (n>0) P = multiplyMatrices(A,P);
   // for two nodes, i and j:
   //  if there is a zero entry in D (no shorter path exists) and a non-zero entry in P, set D[i][j] to n
   // Note: a node is always 0 distance from itself, that is, when i=j
   // Note: the value in P is the number of paths of length n between the nodes i and j
   for (var i=0;i<N;i++){
    for (var j=0;j<N;j++){
     if (i!=j) if (D[i][j] == 0 && P[i][j] != 0) D[i][j] = n;
    }
   }

  }
  return D;
 }

 connectivityMatrix(steps){
  // entries are true if there is a path between nodes i and j
  return this.distanceMatrix().map(function(x){return x.map(function(z){return z>0;})});
 }

}

// node class /////////////////////////////////////////////////////////////////////////////////////
class Node {
 constructor(
  name,
  position,
  radius,
  graph,
  number = -1,
 ){
  this.type = this.constructor.name;
  this.name = name;
  this.x = position[0];
  this.y = position[1];
  this.z = (position.length==3? position[2] : 0); // add a default z coordinate if missing
  this.r = radius;
  this.n = number; // number the nodes if they are in a graph
  this.graph = graph; // the parent graph object
  this.svg = this.createSvg(); // the SVG object for this node
  this.addToSvgGraph();
  this.altx = this.x; // alternative location
  this.alty = this.y;
  this.altz = this.z;
  this.oldx = this.x; // previous location
  this.oldy = this.y;
  this.oldz = this.z;
  this.timer = null;
 }

 /*
   Methods for the Node class:

   createSvg
   addToSvgGraph
   showDetails
   setLocation
   setAltLocation
   setOldLocation
   moveToAlt
   neighbours

 */

 createSvg(){
  var c = Circle({
   "fill": "#000",
   "stroke": "none",
   "r": this.r,
   "cx": this.x,
   "cy": this.y,
   "z-index": this.z,
   "id": this.name,
   "class": "anode",
//   "onclick": "showConnectionsFading(this.id)",
   "onmouseover": "showConnections(this.id)",
   "onmouseout": "hideConnections(this.id)",
  });
  return c;
 }

 addToSvgGraph(){
  appendSvgObject(this.svg,this.graph.svgnodes);
 }

 showDetails(){
  console.log("The node \""+this.name+"\" has position (x,y,z) = ("+this.x+","+this.y+","+this.z+")");
 }

 setLocation(position){
  this.x = position[0];
  this.y = position[1];
  this.z = (position.length==3? position[2] : 0); // default to 0 if missing
 }

 setAltLocation(position){
  this.altx = position[0];
  this.alty = position[1];
  this.altz = (position.length==3? position[2] : 0); // default to 0 if missing
 }

 setOldLocation(position){
  this.oldx = position[0];
  this.oldy = position[1];
  this.oldz = (position.length==3? position[2] : 0); // default to 0 if missing
 }

 moveToAlt(){
  // move the node to its alternative position (and swap its position and alt positions)
  var percentage = 0.0;
  var increment = 5.0;
  var nodesvg = this.svg;
  var oldPosition = [this.x, this.y, this.z];
  var newPosition = [this.altx, this.alty, this.altz];
  var thisnode = this;
  var thistimer = window.setInterval(function(){
   var intermediatePosition = linearPosition(oldPosition,newPosition,percentage);
   nodesvg.setAttribute("cx", intermediatePosition[0]);
   nodesvg.setAttribute("cy", intermediatePosition[1]);
   nodesvg.setAttribute("z-index", intermediatePosition[2]);
   var moveedges = thisnode.graph.findEdgesTo(thisnode.name);
   for (var i=moveedges.length;i>0;i--) moveedges[i-1].movingUpdate();
   // perform some actions when finished:
   if (percentage>=100.0){
    window.clearInterval(thistimer);
    thisnode.setOldLocation(oldPosition);
    thisnode.setAltLocation(oldPosition);
    thisnode.setLocation(newPosition);
    // here we assume that the edge exists in the graph's svgedges collection (unlike in removeEdge())
//    for (var i=moveedges.length;i>0;i--) moveedges[i-1].update();
   }
   percentage += increment;
  });
 }

 neighbours(){
  var edges = this.graph.findEdgesTo(this.name);
  var neighbours = new Array();
  for (var i=0;i<edges.length;i++){
   if (edges[i].from.name != this.name){
    // add the "from" node to the neighbour list if it is not this node AND is not already in the list
    if (neighbours.indexOf(edges[i].from)==-1) neighbours.push(edges[i].from);
   } else {
    // otherwise, add the "to" node IF it is not already in the list
    if (neighbours.indexOf(edges[i].to)==-1) neighbours.push(edges[i].to);
   }
  }
  return neighbours;
 }

}

// edge class /////////////////////////////////////////////////////////////////////////////////////
class Edge {
 constructor(
  name,
  from,
  to,
  graph,
  number = -1,
 ){
  this.type = this.constructor.name;
  this.name = name;
  this.from = from;
  this.to = to;
  this.graph = graph; // the parent graph object
  this.linewidth = 0.5;
  this.z = 0;

  this.svg = this.createSvg(this.graph.allowSelfEdges,this.graph.alwaysUseBezier); // the SVG object for this edge
  this.addToSvgGraph();
 }

 /*
   Methods for the Edge class:

   showDetails
   createSvg
   addToSvgGraph
   update
   movingUpdate

 */

 showDetails(){
  console.log("The edge \""+this.name+"\" goes from "+this.from.name+" to "+this.to.name);
 }

 createSvg(allowSelfEdges=true,alwaysUseBezier=true){
  if ((alwaysUseBezier && this.from!=this.to) || (allowSelfEdges && this.from == this.to)){
   var L = SelfEdge({
    "stroke": "#f44",
    "stroke-width": this.linewidth,
    "from": this.from,
    "to": this.to,
    "z-index": this.z,
    "id": this.name,
    "class": "anedge"+(this.from==this.to?" selfedge":""),
    "onclick": "sampleEdge(this.id)",
   });
  } else {
   // if self-edges are disallowed, a zero-length line will be created here: deal with it elsewhere
   var L = Line({
    "stroke": "#f44",
    "stroke-width": this.linewidth,
    "x1": this.from.x,
    "y1": this.from.y,
    "x2": this.to.x,
    "y2": this.to.y,
    "z-index": this.z,
    "from": this.from,
    "to": this.to,
    "id": this.name,
    "class": "anedge"+(this.from==this.to?" selfedge":""),
    "onclick": "sampleEdge(this.id)",
   });
  }
  return L;
 }

 addToSvgGraph(){
  appendSvgObject(this.svg,this.graph.svgedges);
 }

/*
  This is a bit heavy really: no need to remove/add SVG lines, just update the x1,y1,x2,y2 values
  -- except for SelfEdge objects....... need to recompute the path
  -- but we could just track the node and add deltas to the path's elements (have to break down the path string, though)
*/
 update(){
  // remove the existing SVG object
  this.graph.svgedges.removeChild(this.svg);
  // make a new one using the endpoints' updated positions
  this.svg = this.createSvg();
  // and add it to the graph
  this.addToSvgGraph();
 }

 movingUpdate(){
  if (this.svg.nodeName=="line"){ // "line" or "path"
   // set the edge's endpoints according to the attached nodes' SVG objects' coordinates
   this.svg.setAttribute("x1",this.from.svg.getAttribute("cx"));
   this.svg.setAttribute("y1",this.from.svg.getAttribute("cy"));
   this.svg.setAttribute("x2",this.to.svg.getAttribute("cx"));
   this.svg.setAttribute("y2",this.to.svg.getAttribute("cy"));
  } else {
   this.update();
  }
 }

}

// automorphism class /////////////////////////////////////////////////////////////////////////////
class Automorphism {
 constructor(
  name,
 ){
  this.type = this.constructor.name;
  this.name = name;
 }
}

// layout class ///////////////////////////////////////////////////////////////////////////////////
class Layout {
 constructor(
  name,
  layoutName,
  focusObject = "",
 ){
  this.type = this.constructor.name;
  this.name = name;
  this.setFocus(focusObject);
  this.setLayout(layoutName);
 }

 /*
   Methods for the Layout class:

   allowedLayouts
   isAllowed
   setLayout
   setFocus

 */

 allowedLayouts(){
  var layoutList = ["default","randomRectangle","randomCircle","randomGrid"];
  if (this.focus.type=="Node") layoutList.push("vertexFocused");
  if (this.focus.type=="Edge") layoutList.push("edgeFocused");
  return layoutList;
 }

 // eg. L.isAllowed("randomRectangle") is true
 isAllowed(layoutName){
  return (this.allowedLayouts().indexOf(layoutName)!=-1);
 }

 setLayout(layoutName="default"){
  if (this.isAllowed(layoutName)){
   this.layoutName = layoutName;
  } else {
   this.layoutName = "default";
  }
 }

 setFocus(focusObject=""){
  this.focus = ((focusObject.type=="Node" || focusObject.type=="Edge")? focusObject : "none");
 }
}
