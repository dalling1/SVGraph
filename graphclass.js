// graph class ////////////////////////////////////////////////////////////////////////////////////
class Graph {
 constructor(
  name = "",
 ){
  this.type = this.constructor.name;
  this.name = name;
  this.nodes = [];
  this.edges = [];
  this.svg = null;
 }

 addNode(name,position,radius){
  var node = new Node(name,position,radius,this.name,this.nodes.length+1);
  this.nodes.push(node);
  return node;
 }

 addNodes(n=1){
  for (var i=0;i<n;i++) this.addNode(randomName(),randomLocation(),randomRadius());
 }

 numberNodes(){
  for (var i=0;i<this.nodes;i++) this.nodes[i].n = i;
 }

 nameNodes(){
  // ...but we also need to sort out the names in the edge list...
  for (var i=0;i<this.nodes;i++) this.nodes[i].name = "node"+i;
 }

 addEdge(name,fromNode,toNode,svgElement=undefined){
  var edge = new Edge(name,fromNode,toNode);
  this.edges.push(edge);
  return edge;
 }

 draw(){
  // create an SVG group for this graph if it does not exist
  if (this.svg==null){
   this.svg = appendSvgGroup(this.name,"thesvg");
   // add subgroups for the nodes and edges
   appendSvgGroup(this.name+"nodes",this.name);
   appendSvgGroup(this.name+"edges",this.name);
  }
  for (var i=0;i<this.nodes.length;i++) this.nodes[i].draw();
  for (var i=0;i<this.edges.length;i++) this.edges[i].draw();
 }

}

// node class /////////////////////////////////////////////////////////////////////////////////////
class Node {
 constructor(
  name,
  position,
  radius,
  graph = null,
  number = -1,
 ){
  this.type = this.constructor.name;
  this.name = name;
  this.x = position[0];
  this.y = position[1];
  this.z = (position.length==3? position[2] : 0); // add a default z coordinate if missing
  this.r = radius;
  this.n = number; // number the nodes if they are in a graph
  this.graph = graph; // name of the parent graph
  this.svg = null; // placeholder for SVG object which will be created on draw()
 }

 draw(){
  if (this.svg==null){
   this.svg = new Circle({
    "fill": "#000",
    "stroke": "none",
    "r": this.r,
    "cx": this.x,
    "cy": this.y,
    "z-index": this.z,
    "id": this.name,
    "class": "anode",
   });
  }
  var graphnodegroup = document.getElementById(this.graph+"nodes");
  appendSvgObject(this.svg,graphnodegroup);
 }

 print(){
  console.log("The node \""+this.name+"\" has position (x,y,z) = ("+this.x+","+this.y+","+this.z+")");
 }

}

// edge class /////////////////////////////////////////////////////////////////////////////////////
class Edge {
 constructor(
  name,
  fromNode,
  toNode,
  svgElement = undefined,
 ){
  this.type = this.constructor.name;
  this.name = name;
  if (fromNode.type=="Node") this.from = fromNode;
  if (toNode.type=="Node") this.to = toNode;
  this.svgElement = svgElement;
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
