// graph class ////////////////////////////////////////////////////////////////////////////////////
class Graph {
 constructor(
  name = "",
  layout = "default",
 ){
  this.type = this.constructor.name;
  this.name = name;
  this.nodes = [];
  this.edges = [];
  this.createSvg(); // make an SVG group for this graph
  this.border = [100,100,0]; // keep the centres of nodes this far from the boundary of the graph

  // rules for creating edges (these could be controls on the page):
  this.allowSelfEdges = true;
  this.alwaysUseBezier = true;
 }

 /*
   Methods for the Graph class:

   createSvg
   hide
   show
   addNode
   addNodes
   removeNode
   removeNodes
   numberNodes (wanted?)
   nameNodes (wanted?)
   findNode
   findNodes
   listNodes
   randomNode
   addEdge
   addEdges
   findEdgesTo
   findEdgesToMatch
   excludeEdgesTo
   removeEdge
   removeEdges
   shuffleNodePositions
   toggleNodePositions
   randomLocation
   randomCircleLocation
   allowSelfEdges
   alwaysUseBezier
   setAllowSelfEdges
   setAlwaysUseBezier
   findEdge
   findEdges

 */

 createSvg(){
  // make an SVG group for the graph, and then append groups for the nodes and edges
  this.svg = appendSvgGroup(this.name,"thesvg");
  this.svgedges = appendSvgGroup(this.name+"edges",this.svg.id);
  this.svgnodes = appendSvgGroup(this.name+"nodes",this.svg.id);
 }

 hide(){
  this.svg.classList.add("hidden");
 }

 show(){
  this.svg.classList.remove("hidden");
 }

 addNode(name,position,radius){
  this.nodes.push(new Node(name,position,radius,this,this.nodes.length+1));
 }

 addNodes(n=1){
  for (var i=0;i<n;i++) this.addNode(randomName(),this.randomLocation(),randomRadius([2,5]));
 }

 removeNode(youngest=true){
  // by default, remove the last-added node
  if (this.nodes.length){
   var delnode = (youngest? this.nodes.length-1 : 0); // note that delnode is a number

   // remove any edges attached to this node first
   var deledges = this.findEdgesTo(this.nodes[delnode].name); // may include already deleted edges... (they still exist in the DOM)
   for (var i=deledges.length;i>0;i--){
    if (deledges[i-1].svg.parentElement==this.svgedges){ // the SVG edge elements persist after deletion: so check if they are "attached" to the graph
     this.svgedges.removeChild(deledges[i-1].svg); // remove SVG line element
     // use filter to remove edges: can't use splice since we don't know the indices of the elements
     this.edges = this.excludeEdgesTo(this.nodes[delnode].name);
    }
   }
   // remove the SVG object
   this.svgnodes.removeChild(this.nodes[delnode].svg);
   // then remove this node from the graph
   this.nodes.splice(delnode,1);
  }
 }

 removeNodes(n=1,youngest=true){
  for (var i=0;i<n;i++) this.removeNode(youngest);
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

 listNodes(){
  for (var i=0;i<this.nodes.length;i++) console.log(this.nodes[i].name);
 }

 randomNode(){
  return this.nodes[Math.floor(Math.random()*this.nodes.length)];
 }

 addEdge(name,from,to){
  this.edges.push(new Edge(name,from,to,this));
 }

 addEdges(n=1){
  for (var i=0;i<n;i++) this.addEdge(randomName(),this.randomNode(),this.randomNode());
 }

 findEdgesTo(name){
  return this.edges.filter(function(edg){return edg.from.name==name||edg.to.name==name});
 }

 findEdgesToMatch(name_regexp){
  return this.edges.filter(function(edg){var p=new RegExp("^"+name_regexp+"$","i");return p.test(edg.from.name)||p.test(edg.to.name)});
 }

 excludeEdgesTo(name){
  return this.edges.filter(function(edg){return edg.from.name!=name&&edg.to.name!=name});
 }

 removeEdge(youngest=true){
  // by default, remove the last-added edge
  if (this.edges.length){
   var deledge = (youngest? this.edges.length-1 : 0); // note that deledge is a number

   // remove the SVG object
   this.svgedges.removeChild(this.edges[deledge].svg);
   // then remove this edge from the graph
   this.edges.splice(deledge,1);
  }
 }

 removeEdges(n=1,youngest=true){
  for (var i=0;i<n;i++) this.removeEdge(youngest);
 }

 shuffleNodePositions(){
  for (var i=0;i<thegraph.nodes.length;i++){
   thegraph.nodes[i].setAltLocation(this.randomLocation());
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
   "onclick": "showConnections(this.id)",
  });
  return c;
 }

 addToSvgGraph(){
  appendSvgObject(this.svg,this.graph.svgnodes);
 }

 print(){
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

 print(){
  console.log("The edge \""+this.name+"\" goes from "+this.from.name+" to "+this.to.name);
 }

 createSvg(allowSelfEdges=true,alwaysUseBezier=true){
  if ((alwaysUseBezier && this.from!=this.to) || (allowSelfEdges && this.from == this.to)){
//   console.log("self-connecting edge");
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
  this.name = name;
 }
}

// layout class ///////////////////////////////////////////////////////////////////////////////////
class Layout {
 constructor(
  name,
 ){
  this.name = name;
 }

 allowedLayouts(){
  return ["default","randomRectangle","randomCircle"];
 }

 // eg. L.isAllowed("randomRectangle") is true
 isAllowed(layout){
  return (this.allowedLayouts().indexOf(layout)!=-1);
 }

}
