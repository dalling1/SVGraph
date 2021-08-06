// graph class ////////////////////////////////////////////////////////////////////////////////////
class Graph {
 constructor(
  name = "",
 ){
  this.type = this.constructor.name;
  this.name = name;
  this.nodes = [];
  this.edges = [];
  this.svg = this.createSvg(); // the SVG group for this graph
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

 */

 createSvg(){
  return appendSvgGroup(this.name,"thesvg");
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
  for (var i=0;i<n;i++) this.addNode(randomName(),randomLocation(),randomRadius());
 }

 removeNode(youngest=true){
  // by default, remove the last-added node
  if (this.nodes.length){
   var delnode = (youngest? this.nodes.length-1 : 0);
   // remove the SVG object
   this.svg.removeChild(this.nodes[delnode].svg);
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
  return this.nodes[Math.round(Math.random()*this.nodes.length)];
 }

 addEdge(name,from,to){
  this.edges.push(new Edge(name,from,to,this));
 }

 addEdges(n=1){
  for (var i=0;i<n;i++) this.addEdge(randomName(),this.randomNode(),this.randomNode());
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
  });
  return c;
 }

 addToSvgGraph(){
  appendSvgObject(this.svg,this.graph.svg);
 }

 print(){
  console.log("The node \""+this.name+"\" has position (x,y,z) = ("+this.x+","+this.y+","+this.z+")");
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
  this.graph = graph; // the parent graph object
  this.linewidth = 0.25;
  this.z = 0;

  // from, to: test that the inputs are Node objects
  if (from.type!="Node" || to.type!="Node"){
   console.log("error: edge endpoint is not a Node object");
   return false;
  } else {
   this.from = from;
   this.to = to;
  }

  this.svg = this.createSvg(); // the SVG object for this node
  this.addToSvgGraph();
 }

 print(){
  console.log("The edge \""+this.name+"\" goes from "+this.from.name+" to "+this.to.name);
 }

 createSvg(){
  var L = Line({
   "stroke": "#000",
   "stroke-width": this.linewidth,
   "x1": this.from.x,
   "y1": this.from.y,
   "x2": this.to.x,
   "y2": this.to.y,
   "z-index": this.z,
   "id": this.name,
   "class": "anedge",
  });
  return L;
 }

 addToSvgGraph(){
  appendSvgObject(this.svg,this.graph.svg);
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
