// graph class ////////////////////////////////////////////////////////////////////////////////////
class Graph {
 constructor(
  name,
  layoutName = "default",
 ){
  this.type = this.constructor.name;
  this.name = name;
  this.nodes = [];
  this.edges = [];
  this.createSvg(); // make an SVG group for this graph
  this.createLayout(layoutName);

  this.radius = 0; // maximum path length in the graph

  // rules for creating edges (these could be controls on the page):
  this.allowSelfEdges = true;
  this.alwaysUseBezier = true;

  this.degreeMatrix = new Array(); // initialise; diagonal, integers
  this.adjacencyMatrix = new Array(); // initialise; boolean
  this.distanceMatrix = new Array(); // initialise; integers
  this.connectivityMatrix = new Array(); // initialise; boolean
  this.connectedComponents = new Array(); // initialise; arrays of nodes
 }

 /*
   Methods for the Graph class:

   toString
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
   findEdge
   findEdges
   findEdgesTo
   findEdgesToMatch
   excludeEdgesTo
   removeEdge
   removeNewestEdge
   removeOldestEdge
   removeEdges
   removeDuplicateEdges
   setAllowSelfEdges
   setAlwaysUseBezier
   setLayout
   updateDegreeMatrix
   updateAdjacencyMatrix
   updateDistanceMatrix
   updateConnectedComponents
   draw
   addTree
   balanceTree
   updateTreeMatrices
   validAdjacencyMatrix

 */

 toString(){
  // overridden method to return a string unique to the graph (the graph's name)
  return this.name;
 }

 createSvg(){
  // make an SVG group for the graph, and then append groups for the nodes and edges
  this.svg = appendSvgGroup(this.name,"thesvg");
  this.svgedges = appendSvgGroup(this.name+"edges",this.svg.id);
  this.svgnodes = appendSvgGroup(this.name+"nodes",this.svg.id);
 }

 createLayout(layoutName){
  this.layout = new Layout(this.name+"Layout",layoutName,this);
 }

 hide(){
  this.svg.classList.add("hidden");
 }

 show(){
  this.svg.classList.remove("hidden");
 }

 addNode(name,position,radius){
  this.nodes.push(new Node(name,position,radius,this,this.nodes.length)); // zero-index the node.n values
  return true;
 }

 addNodes(n=1,radiusRange=[4,10],name=randomName()){
  var counter = 0;
  for (var i=0;i<n;i++) if (this.addNode((n==1?name:randomName()),this.layout.nodeLocation(),randomRadius(radiusRange))) counter++;
  return counter;
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

  return true;
 }

 removeNewestNode(){
  var counter = 0;
  if (this.nodes.length) if (this.removeNode(this.nodes[this.nodes.length-1])) counter++;
  return counter>0;
 }

 removeOldestNode(){
  var counter = 0;
  if (this.nodes.length) if (this.removeNode(this.nodes[0])) counter++;
  return counter>0;
 }

 removeNodes(n=1,newest=true){
  var counter = 0;
  if (newest) for (var i=0;i<n;i++) if (this.removeNewestNode()) counter++;
  else for (var i=0;i<n;i++) if (this.removeOldestNode()) counter++;
  return counter;
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
  var counter = 0;
  if (this.nodes.length) for (var i=0;i<n;i++) if (this.addEdge(randomName(),this.randomNode(),this.randomNode())) counter++;
  return counter;
 }

 findEdge(name){
  // find an edge object with the given name
  return this.edges.filter(function(edg){return edg.name==name});
 }

 findEdges(name_regexp){
  // find edge objects which match the given name regexp
  return this.edges.filter(function(edg){var p=new RegExp("^"+name_regexp+"$","i");return p.test(edg.name)});
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
  // find edges which connect to the given vertices (undirected)
  // 'from' and 'to' can be Node objects or node names (strings)
  if (typeof(from)=="object") var from = from.name;
  if (typeof(to)=="object") var to = to.name;
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
  return true;
 }

 removeNewestEdge(){
  var counter = 0;
  if (this.edges.length) if (this.removeEdge(this.edges[this.edges.length-1])) counter++;
  return counter>0;
 }

 removeOldestEdge(){
  var counter = 0;
  if (this.edges.length) if (this.removeEdge(this.edges[0])) counter++;
  return counter>0;
 }

 removeEdges(n=1,newest=true){
  var counter = 0;
  if (newest) for (var i=0;i<n;i++) if (this.removeNewestEdge()) counter++;
  else for (var i=0;i<n;i++) if (this.removeOldestEdge()) counter++;
  return counter;
 }

 removeDuplicateEdges(){
  var counter = 0;
  for (var i=this.edges.length;i>0;i--){ // work from the end back to the start
   var duplicates = this.findEdgesFromTo(this.edges[i-1].from.name,this.edges[i-1].to.name);
   // if there are duplicates, remove this edge
   if (duplicates.length>1) if (this.removeEdge(this.edges[i-1])) counter++;
  }
  return counter;
 }

 setAllowSelfEdges(flag){
  // note that this does not alter existing edges
  this.allowSelfEdges = (flag?true:false);
 }

 setAlwaysUseBezier(flag){
  // note that this does not alter existing edges
  this.alwaysUseBezier = (flag?true:false);
 }

 setLayout(layoutName){
  return this.layout.setLayout(layoutName);
 }

 updateDegreeMatrix(){
  this.numberNodes;
  this.degreeMatrix = new Array(this.nodes.length);
  // initialise the degree matrix, filled with zeros
  for (var i=0;i<this.nodes.length;i++) this.degreeMatrix[i] = new Array(this.nodes.length).fill(0);
  // now work through the list of edges and increment the degree of their ends
  for (var i=0;i<this.edges.length;i++){
   this.degreeMatrix[this.edges[i].from.n][this.edges[i].from.n]++;
   this.degreeMatrix[this.edges[i].to.n][this.edges[i].to.n]++;
  }
 }

 updateAdjacencyMatrix(){
  this.adjacencyMatrix = new Array(this.nodes.length);
  // initialise adjacency matrix and fill with false
  for (var i=0;i<this.nodes.length;i++){
   this.adjacencyMatrix[i] = new Array(this.nodes.length).fill(false);
  }
  // loop over all edges in the graph and set the adjacency matrix entries according to their end-points
  for (var i=0;i<this.edges.length;i++){
   this.adjacencyMatrix[this.edges[i].from.n][this.edges[i].to.n] = true;
   this.adjacencyMatrix[this.edges[i].to.n][this.edges[i].from.n] = true;
  }
 }

 updateDistanceMatrix(forceUpdate=false){
  // test whether the adjacency matrix is valid:
  if (this.validAdjacencyMatrix() && !forceUpdate){
   // yes, so assume the distance matrix is okay, unless we are forcing an update
   // ie. do nothing
   return false; // we DIDN'T update the distance matrix
  } else {
   var t0 = performance.now();
   console.log("Updating distance matrix");
   this.updateAdjacencyMatrix(); // we could test whether this is required or not, but it is fast anyway
   var N = this.nodes.length;
   this.distanceMatrix = multiplyMatricesUsingOnes(this.adjacencyMatrix,identityMatrix(N)); // initial distances are 1 if there is an edge between nodes
   var P = duplicateMatrix(this.distanceMatrix); // path-length matrix, we will examine its powers
   var isSym = isSymmetric(P); // adding this check saves about 10% [multiplying is the slow part]; note: P^n is symmetric if P is symmetric

   for (var n=2;n<N;n++){
    // set P = A^i: P's entries would be the number of paths of length n between nodes, but the "usingOnes" shortcut obviates this
    // it is, however, 6 or 7 times faster than "regular" matrix multiplication [but does assume non-negative entries in the adjacency matrix, which could break if edges had negative weights, say]
    P = multiplyMatricesUsingOnes(this.adjacencyMatrix,P);
    // for two nodes, i and j:
    //  - if there is a zero entry in D (no shorter path exists) and a non-zero entry in P, set D[i][j] to n
    // Note: a node is always 0 distance from itself, that is, when i=j
    // Note: the value in P is the number of paths of length n between the nodes i and j [not when using the "UsingOnes" version of multiplication]

    // keep a copy of the distance matrix so that we can check if it becomes static:
    // when the distance matrix doesn't change from one power of P to the next, its construction is finished
    var prevDistanceMatrix = duplicateMatrix(this.distanceMatrix);

    for (var i=0;i<N;i++){

     for (var j=(isSym?i+1:0);j<N;j++){
      if (i!=j && this.distanceMatrix[i][j] == 0 && P[i][j] != 0){
       this.distanceMatrix[i][j] = n;
       if (isSym) this.distanceMatrix[j][i] = n;
      }
     }
    }

    // when can we stop...?
    if (matricesAreEqual(prevDistanceMatrix,this.distanceMatrix)){
//     console.log("   Stopped calculating distance matrix after "+n+" step(s)");
     break;
    }


   }

   // nodes are 0 distance from themselves:
   for (var i=0;i<this.distanceMatrix.length;i++){
    this.distanceMatrix[i][i] = 0; // 999 during testing
   }

   // now re-work the distance matrix to indicate infinite path lengths for nodes which are not connected
   for (var i=0;i<N;i++){
    for (var j=(isSym?i+1:0);j<N;j++){
     if (this.distanceMatrix[i][j]==0 && i!=j){
      this.distanceMatrix[i][j] = Infinity;
      if (isSym) this.distanceMatrix[j][i] = Infinity;
     }
    }
   }

   // and, finally, update the connectivity matrix and radius
   // (we don't do anything with the connected components here, call that separately if needed)
   this.connectivityMatrix = this.distanceMatrix.map(function(x){return x.map(function(z){return z<Infinity;})});
   this.radius = matrixMaxFiniteElement(this.distanceMatrix);

   var t1 = performance.now();
   console.log("... in " + (t1 - t0) + " milliseconds")
   return true; // we DID update the distance matrix
  }
 }

 updateConnectedComponents(){
  // computes an array of arrays, each containing nodes connected to each other
  this.updateDistanceMatrix();
  // loop over all nodes
  for (var i=0;i<this.nodes.length;i++){
   // test whether this node is in an already-identified connected component
   var foundNodeInComponent = false;
   for (var k=0;k<this.connectedComponents.length;k++){
    if (this.connectedComponents[k].indexOf(this.nodes[i])!=-1){
     foundNodeInComponent=true;
     break; // found, stop looking (nodes cannot be in more than one connected component)
    }
   }
   if (!foundNodeInComponent){
    // not found: this is the first node in a new connected component:
    this.connectedComponents[this.connectedComponents.length] = new Array(); // don't add this node yet, it will come with the rest below
    // add the nodes connected to this one:
    for (var j=0;j<this.connectivityMatrix[i].length;j++) if (this.connectivityMatrix[i][j]) this.connectedComponents[this.connectedComponents.length-1].push(this.nodes[j]);
   }
  }
 }

 draw(){
  // use the graph's layout to set the node positions and move them there:
  this.layout.draw();
 }

 addTree(valency=0,depth=0,updateMatrices=true){
  this.allowSelfEdges = false;
  this.alwaysUseBezier = false;
  var N = treeSize(valency,depth);
  var existingN = this.nodes.length;
  var treeNodeRadiusRange = [3,3];

  this.addNodes(1,treeNodeRadiusRange,'\u{d8}'); // label the root node with the O-slash symbol
  var root = this.nodes[this.nodes.length-1];
  var counter = 1; // for keeping track of how many nodes we have added

  var alphabet = 'abcdefghijklmnopqrstuvwxyz';

  for (var i=0;i<N;i++){ // actually we will stop when the number of nodes added is N
   // add V-1 children to each node and connect them to their parent with a new edge
   // root node is a special case: it needs V children
   // stop when we have the complete tree (ie. have N ndoes)
   var branch = this.nodes[existingN+i]; // the "parent" of the tree (the node added above to start the tree)
   for (var v=0;v<valency;v++){
    var branchColour = branch.name[branch.name.length-1]; // last letter of the branch node address
    if (v!=alphabet.indexOf(branchColour)){ // do not add an edge which is the same "colour" as the parent (branch) node
     var nodeAddress = branch.name + alphabet[v];
     this.addNodes(1,treeNodeRadiusRange,nodeAddress);
     counter++;
     var leaf = this.nodes[this.nodes.length-1]
     this.addEdge(randomName(),branch,leaf);
    }
   }
   if (counter>=N) break; // stop when enough nodes have been added
  }

  this.layout.setFocus(root); // set the root node as the focus for now

  // update the distance and adjacency matrices (unless asked not to): note that this assumes that the whole graph is a tree
  if (updateMatrices){
   this.updateTreeMatrices();
   // might as well draw it sensibly, since we have already assumed that the graph is a tree...
   this.layout.setLayout('treeVertexFocused');
   this.draw();
  }

  return N;
 }

 balanceTree(){
  // only balance a tree with the edge-focused layout AND a not-undefined focus edge:
  if (this.layout.layoutName=='treeEdgeFocused' && this.layout.focus.type=='Edge'){
   // test whether the graph is already balanced:
   var Nleft = this.findNodes(this.layout.focus.from.name+'.*').length;
   var Nright = this.findNodes(this.layout.focus.to.name+'.*').length;
   if (Nleft != 2*Nright && Nright != 2*Nleft){

    var alphabet = 'abcdefghijklmnopqrstuvwxyz';
    // add nodes to one side of the tree so that the edge-focused layout is balanced
    var valency = this.findNodes('\u{d8}.').length;
    var depth = maxFiniteElement(this.nodes.map(x=>x.name.length)) - 1; // longest name minus one character (the root node label)
    var sideNodes = this.findNodes('\u{d8}'+alphabet[0]+'.{'+(depth-1)+'}'); // assumes that the focus edge is the first edge
    var treeNodeRadiusRange = [3,3];
    for (var i=0;i<sideNodes.length;i++){
     var branch = sideNodes[i]; // add leaves to each "side node"
     for (var v=0;v<valency;v++){
      var branchColour = branch.name[branch.name.length-1]; // last letter of the branch node address
      if (v!=alphabet.indexOf(branchColour)){ // do not add an edge which is the same "colour" as the parent (branch) node
       var nodeAddress = branch.name + alphabet[v];
       this.addNodes(1,treeNodeRadiusRange,nodeAddress);
       var leaf = this.nodes[this.nodes.length-1]
       this.addEdge(randomName(),branch,leaf);
      }
     }
    }
    this.updateTreeMatrices();

   }
  }
 }

 updateTreeMatrices(){
  // assumes that the graph is a tree, and constructs the distance and adjacency matrices
  var t0 = performance.now();

  // initialise the matrices and fill them with zeros/false
  var Nnodes = this.nodes.length;
  this.distanceMatrix = new Array(Nnodes);
  for (var i=0;i<Nnodes;i++) this.distanceMatrix[i] = new Array(Nnodes).fill(0);
  this.adjacencyMatrix = new Array(Nnodes);
  for (var i=0;i<Nnodes;i++) this.adjacencyMatrix[i] = new Array(Nnodes).fill(false);

  // loop through the nodes and calculate their distances, based on their addresses
  for (var i=0;i<Nnodes;i++){
   for (var j=i+1;j<Nnodes;j++){
    this.distanceMatrix[i][j] = treeDistance(this.nodes[i].name,this.nodes[j].name);
    this.distanceMatrix[j][i] = treeDistance(this.nodes[i].name,this.nodes[j].name);
    // and check for adjacency as we go
    this.adjacencyMatrix[i][j] = (this.distanceMatrix[i][j]==1);
    this.adjacencyMatrix[j][i] = (this.distanceMatrix[j][i]==1);
   }
  }

  var t1 = performance.now();
  console.log("... updated tree matrices " + (t1 - t0) + " milliseconds")
 }

 validAdjacencyMatrix(){
  // compare the graph's adjacency matrix to the number of nodes and the edge list and see if they agree
  // this information can be used to decide whether to update the distance matrix (a slow operation)

  // 1. test that the matrix size agrees with the number of nodes: (even if there are no nodes)
  var isvalid = (this.adjacencyMatrix.length == this.nodes.length);

  // if there are no nodes, we are finished; otherwise:
  if (isvalid && this.nodes.length){
   // 2. check that each row of the adjacency matrix is the right length
   for (var i=0;i<this.adjacencyMatrix.length;i++){
    if (this.adjacencyMatrix[i].length != this.nodes.length){
     return false;
    }
   }

   // if it hasn't failed yet, continue:
   // 3. count the number of 'true' entries in the adjacency matrix and test whether there are too many
   //    (too few is okay: it means that there are multi-edges) (recall that each undirected edge is present twice in the matrix)
   if (matrixSum(this.adjacencyMatrix) > 2*this.edges.length){
    return false;
   }

   // if it hasn't failed yet, continue:
   // 4. check that each edge is present in the matrix: two entries to check (for undirected edges)
   for (var i=0;i<this.edges.length;i++){
    var n1 = this.edges[i].from.n;
    var n2 = this.edges[i].to.n;
    if (!(this.adjacencyMatrix[n1][n2] && this.adjacencyMatrix[n2][n1])){
     return false;
    }
   }

  }

  return isvalid;
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

   toString
   createSvg
   addToSvgGraph
   showDetails
   getLocation
   setLocation
   getAltLocation
   setAltLocation
   setOldLocation
   moveToAlt
   neighbours

 */

 toString(){
  // overridden method to return a string unique to the node (the node's name, which may also be its address)
  return this.name;
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
   "onclick": "sampleNode(this.id)",
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

 getLocation(){
  return [this.x,this.y,this.z];
 }

 setLocation(position){
  this.x = position[0];
  this.y = position[1];
  this.z = (position.length==3? position[2] : 0); // default to 0 if missing
 }

 getAltLocation(){
  return [this.altx,this.alty,this.altz];
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
  if (this.graph.layout.animation=='none'){
   increment = 100.0;
  }
  var thistimer = window.setInterval(function(){
   var intermediatePosition = animationMotion(oldPosition,newPosition,percentage,thegraph.layout.animation);
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

   toString
   showDetails
   createSvg
   addToSvgGraph
   update
   movingUpdate

 */

 toString(){
  // overridden method to return a string unique to the edge (the edge's name)
  return this.name;
 }

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
  automorphismName,
 ){
  this.type = this.constructor.name;
  this.name = name;
  this.automorphismName = automorphismName;
 }

 /*
   Methods for the Automorphism class:

   toString
   allowedAutomorphisms
   isAllowedAutomorphism

 */

 toString(){
  // overridden method to return a string unique to the automorphism (the automorphism's name)
  return this.name;
 }

 allowedAutomorphisms(){
  var layoutList = ["localactions","listtolist"];
  return layoutList;
 }

 isAllowedAutomorphism(automorphismName){
  return (this.allowedAutomorphisms().indexOf(automorphismName)!=-1);
 }

}

// action class /////////////////////////////////////////////////////////////////////////////
class Action {
 constructor(
  name,
  actionType,
  isReference = false,
  from,
  to = null, // need a good way to specify an undefined node (empty address is a valid address...)
  localaction = [],
 ){
  this.type = this.constructor.name;
  this.name = name;
  this.actionType = actionType;
  if (isReference){
   this.isReference = true;
  }
  this.from = from;
  if (actionType=="listtolist"){
   this.to = to;
  } else if (actionType=="localaction"){
   this.localaction = localaction;
  }
 }

 /* Action methods */
 allowedActions(){
  var actionList = ["localactions","listtolist"];
  return actionList;
 }

 isAllowedAction(actionName){
  return (this.allowedActions().indexOf(actionName)!=-1);
 }

}

// layout class ///////////////////////////////////////////////////////////////////////////////////
class Layout {
 constructor(
  name,
  layoutName,
  graph,
  animation = "default",
  focusObject = "",
 ){
  this.type = this.constructor.name;
  this.name = name;
  this.setFocus(focusObject);
  this.setLayout(layoutName);
  this.setAnimation(animation);
  this.graph = graph;
  this.border = [100,100,0]; // keep the centres of nodes this far from the boundary of the page
 }

 /*
   Methods for the Layout class:

   allowedLayouts
   isAllowedLayout
   allowedAnimations
   isAllowedAnimation
   setLayout
   setAnimation
   setFocus
   removeFocus
   randomRectangleLocation
   randomCircleLocation
   randomGridLocations
   spacedCircleLocation
   spacedSectorLocation
   centralLocation
   nodeLocation
   shuffleNodePositions
   toggleNodePositions
   permuteNodePositions
   draw

 */

 allowedLayouts(){
  var layoutList = ["default","randomRectangle","randomCircle","randomGrid","vertexFocused","treeVertexFocused","treeEdgeFocused"];
  return layoutList;
 }

 allowedAnimations(){
  var animationsList = ["none","default","linear","easeInOutBack","easeInSine","easeOutBack","easeOutQuint","easeOutElastic"];
  return animationsList;
 }

 // eg. L.isAllowedLayout("randomRectangle") is true
 isAllowedLayout(layoutName){
  return (this.allowedLayouts().indexOf(layoutName)!=-1);
 }

 isAllowedAnimation(animationName){
  return (this.allowedAnimations().indexOf(animationName)!=-1);
 }

 setLayout(layoutName="default"){
  if (this.isAllowedLayout(layoutName)){
   this.layoutName = layoutName;
   return true;
  } else {
   this.layoutName = "default";
   return false;
  }
 }

 setAnimation(animationName="default"){
  if (this.isAllowedAnimation(animationName)){
   this.animation = animationName;
   return true;
  } else {
   this.animation = "default";
   return false;
  }
 }

 setFocus(focusObject=""){
  this.removeFocus();
  this.focus = ((focusObject.type=="Node" || focusObject.type=="Edge")? focusObject : "none");
  if (this.focus.type=="Node"){
   this.focus.svg.classList.add("focusNode"); // highlight the focus node
  } else if (this.focus.type=="Edge"){
   this.focus.svg.classList.add("focusEdge"); // highlight the focus edge
  }
 }

 removeFocus(){
  // clear the CSS class from an existing focus object, if any
  var F = document.getElementsByClassName("focusNode");
  for (var i=F.length;i>0;i--) F[i-1].classList.remove("focusNode");
  F = document.getElementsByClassName("focusEdge");
  for (i=F.length;i>0;i--) F[i-1].classList.remove("focusEdge");
  // and unset the layout's focus object
  this.focus = "none";
 }

 randomRectangleLocation(){
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

 randomCircleLocation(s=1.0){
  // generate a random location on the circle centred on the page and which fits within the graph's border,
  // scaled by the factor s (ie. scale the circle's diameter)
  var X = 0.5*window.innerWidth;
  var Y = 0.5*window.innerHeight;
  var W = X - this.border[0];
  var H = Y - this.border[0];
  var R = Math.min(W,H);
  return randomCircleLocation([X,Y],R*s);
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

 spacedCircleLocation(C,s=1.0,valency,depth,n){
  // generate an incremental location on the circle centred on the page and which fits within the graph's border,
  // scaled by the factor s (ie. scale the circle's diameter)
  // ie. work out the even spacing of nodes on the required circle, and return the coordinates of the nth of those locations
//  var X = 0.5*window.innerWidth;
//  var Y = 0.5*window.innerHeight;
  var X = C[0];
  var Y = C[1];
  var W = X - this.border[0];
  var H = Y - this.border[0];
  var R = Math.min(W,H);
  return spacedCircleLocation([X,Y],R*s,valency,depth,n);
 }

 spacedSectorLocation(C,s=1.0,Ntotal,n,angleMin=0,angleMax=2*Math.PI){
  // generate an incremental location on the sector centred on the page and which fits within the
  // graph's border and defined by the given angles, with radius scaled by the factor s
  // ie. work out the even spacing of nodes on the required sector, and return the coordinates of the nth of those locations
//  var X = 0.5*window.innerWidth;
//  var Y = 0.5*window.innerHeight;
  var X = C[0];
  var Y = C[1];
  var W = X - this.border[0];
  var H = Y - this.border[0];
  var R = Math.min(W,H);
  return spacedSectorLocation([X,Y],R*s,Ntotal,n,angleMin,angleMax);
 }

 centralLocation(offset=[0,0,0]){
  var dim=3;
  var P = Array(dim);
  P[0] = Math.round(window.innerWidth/2.0) + offset[0];
  P[1] = Math.round(window.innerHeight/2.0) + offset[1];
  P[2] = 0 + offset[2];
  return P;
 }

 nodeLocation(){
  if (this.layoutName=="default"){ /////////////////////////////// default is randomRectangle
   return this.randomRectangleLocation();
  } else if (this.layoutName=="randomRectangle"){ //////////////// randomRectangle
   return this.randomRectangleLocation();
  } else if (this.layoutName=="randomCircle") { ////////////////// randomCircle
   return this.randomCircleLocation();
  } else if (this.layoutName=="randomGrid") { //////////////////// randomGrid
   return this.randomGridLocations()[0];
  } else {
   return this.centralLocation(); /////////////////////////////////////// not specified: put nodes at the centre
  }
 }

 shuffleNodePositions(){
  for (var i=0;i<this.graph.nodes.length;i++){
   this.graph.nodes[i].setAltLocation(this.nodeLocation());
   this.graph.nodes[i].moveToAlt();
  }
 }

 toggleNodePositions(){
  for (var i=0;i<this.graph.nodes.length;i++){
   this.graph.nodes[i].moveToAlt();
  }
 }

 permuteNodePositions(reverse=false){
  // assigns each graph's position to the next one in numbering order, and the last to the first
  this.graph.numberNodes();
  var nodeCount = this.graph.nodes.length;

  if (reverse){
   for (var i=nodeCount;i>0;i--){
    if (i==nodeCount){
     this.graph.nodes[i-1].setAltLocation(this.graph.nodes[0].getLocation());
    } else {
     this.graph.nodes[i-1].setAltLocation(this.graph.nodes[i].getLocation());
    }
   }
  } else {
   for (var i=0;i<nodeCount;i++){
    if (i==0){
     this.graph.nodes[i].setAltLocation(this.graph.nodes[nodeCount-1].getLocation());
    } else {
     this.graph.nodes[i].setAltLocation(this.graph.nodes[i-1].getLocation());
    }
   }
  }
  this.toggleNodePositions();
 }

 draw(){
  // set the alternative position of each node according to the this Layout object's layout, and move them there
  if (this.layoutName=="default" || this.layoutName=="randomRectangle"){ // default ie. randomRectangle

   for (var i=0;i<this.graph.nodes.length;i++){
    this.graph.nodes[i].setAltLocation(this.randomRectangleLocation());
   }


  } else if (this.layoutName=="randomCircle") { // randomCircle
   for (var i=0;i<this.graph.nodes.length;i++){
    this.graph.nodes[i].setAltLocation(this.randomCircleLocation());
   }


  } else if (this.layoutName=="randomGrid") { // randomGrid
   var gridpos = this.randomGridLocations(this.graph.nodes.length);
   for (var i=0;i<this.graph.nodes.length;i++){
    this.graph.nodes[i].setAltLocation(gridpos[i]);
   }


  } else if (this.layoutName=="vertexFocused") { // vertexFocused
   if (this.focus.type!="Node" || this.graph.findNode(this.focus.name).length==0){ // test type and presence in the graph
    console.log("Focus object not set: using first node of the graph");
    this.setFocus(this.graph.nodes[0]); // if there was an invalid entry, use the first node as the focus object
   }
   if (true){
    // 1. put the focus object at the centre
    // 2. loop through the other nodes:
    //    - place each node on a concentric circle about the focus
    //    - with the radius determined by the node's distance (in the graph) from the focus

    // do these every time, for now:
    this.graph.updateDegreeMatrix();
    this.graph.updateDistanceMatrix();

    // place the focus node
    this.focus.setAltLocation(this.centralLocation());
    var dmax = maxFiniteElement(this.graph.distanceMatrix[this.focus.n]);

    // loop over other nodes and place them
    for (var i=0;i<this.graph.nodes.length;i++){
     if (this.graph.nodes[i].n!=this.focus.n){
      // scale the circle according to the distance to the focus node:
      var d = this.graph.distanceMatrix[this.focus.n][i];
      var s = d/dmax;
      if (s==Infinity) s = 1.1; // put detached nodes just outside the circle
      this.graph.nodes[i].setAltLocation(this.randomCircleLocation(s));
     }
    }

   }


  } else if (this.layoutName=="treeVertexFocused") { // treeVertexFocused
   if (this.focus.type!="Node" || this.graph.findNode(this.focus.name).length==0){ // test type and presence in the graph
    console.log("Focus object not set: using first node of the graph");
    this.setFocus(this.graph.nodes[0]); // if there was an invalid entry, use the first node as the focus object
   }
   if (true){
    // 1. put the focus node at the centre,
    // 2. compute dmax, the maximum distance of any connected node from the focus node
    // 3. find the Nd nodes at distance d from the focus node
    // 4. spread them around the circle with scale d/dmax
    // Nb. if needed, we could approximate the degree of the tree by the maximum degree of any node connected to the focus node

    // do these every time: not too onorous since the first is quick and the second only runs if needed:
    this.graph.updateDegreeMatrix();
    this.graph.updateDistanceMatrix();

    // estimate the valency of the graph using the maximum degree
    var valency = maxFiniteElement(matrixDiagonal(this.graph.degreeMatrix));

    // put the focus node at the centre
    this.focus.setAltLocation(this.centralLocation());
    // find the distance to the furthest connected node from the focus node
    var dmax = maxFiniteElement(this.graph.distanceMatrix[this.focus.n]); // this could be limited to the focus object's connected component...
    // loop over the distances moving away from the focus node
    for (var r=1;r<=dmax;r++){
     // find the indices of nodes at distance r from the focus node
     var distRnodes = this.graph.distanceMatrix[this.focus.n].map((val,indx) => val == r ? indx : undefined).filter(x => x !== undefined);
     // loop over them and set their alt locations
     for (var i=0;i<distRnodes.length;i++){
      // these nodes belong on a circle of radius scale s = r/dmax from the centre, with position angles determined by the valency, r and their "n"
      var s = r/dmax;
      this.graph.nodes[distRnodes[i]].setAltLocation(   this.spacedCircleLocation(this.focus.getAltLocation(),s,valency,r,i)  );
     }
    }

    // finally, place nodes which are not connected to the focus node (distance is infinity)
    var distRnodes = this.graph.distanceMatrix[this.focus.n].map((val,indx) => val == Infinity ? indx : undefined).filter(x => x !== undefined);
    var s = 1.1; // put detached nodes just outside the outer circle
    for (var i=0;i<distRnodes.length;i++){
     this.graph.nodes[distRnodes[i]].setAltLocation(   this.spacedCircleLocation(this.focus.getAltLocation(),s,valency,r+1,i)  );
    }

   }

  } else if (this.layoutName=="treeEdgeFocused") { // treeEdgeFocused
   if (this.focus.type!="Edge" || this.graph.findEdge(this.focus.name).length==0){ // test type and presence in the graph
    console.log("Focus object not set: using first edge of the graph");
    this.setFocus(this.graph.edges[0]); // if there was an invalid entry, use the first edge as the focus object
   }
   if (true){
    // 0. balance the tree so that the layout is symmetrical
    this.graph.balanceTree();

    // 1. put the edge's nodes either side of the centre
    // 2. compute dmax, the maximum distance of any connected node from the focus edge
    //    ie. the minimum distance to either of the focus edge's endpoints
    // 3. find the Nd1 nodes at distance d from the focus edge's "from" endpoint
    // 4. find the Nd2 nodes at distance d from the focus edge's "to" endpoint
    // 5. spread these two sets of nodes around a semicircle, with scale d/dmax, centred on their endpoint of the focus edge
    //    ie. similarly to the vertex-focused layout, but with a restricted range of angles
    // Nb. if needed, we could approximate the degree of the tree by the maximum degree of any node connected to the focus node

    // do these every time: not too onorous since the first is quick and the second only runs if needed:
    this.graph.updateDegreeMatrix();
    this.graph.updateDistanceMatrix();

    // estimate the valency of the graph using the maximum degree
    var valency = maxFiniteElement(matrixDiagonal(this.graph.degreeMatrix));

    // put the focus edge at the centre:
    this.focus.from.setAltLocation(this.centralLocation([-20,0,0])); // left of centre
    this.focus.to.setAltLocation(this.centralLocation([20,0,0]));    // right of centre

    // for each node, check which end of the focus edge it is closest to, and position it accordingly,
    // using the spacedSectorLocation function with restricted angle, to make two sides

    var dmaxFrom = maxFiniteElement(this.graph.distanceMatrix[this.focus.from.n]); // this could be limited to the focus object's connected component...
    var dmaxTo = maxFiniteElement(this.graph.distanceMatrix[this.focus.to.n]); // this could be limited to the focus object's connected component...
    var dmax = Math.max(dmaxFrom,dmaxTo) - 1;

    // set up the range of angles on each side of the focus edge
    var angleMin = 0.5;
    var angleMax = Math.PI-0.5;

    // loop over the distances moving away from the focus edge
    for (var r=1;r<=dmax;r++){
     // s is the scale of the location radius (distance from the centre) for nodes at distance r
     var s = (r+0.5)/dmax; // make it a little bigger than just r/dmax, to fit in the focus edge...

     // PART 1: nodes closer to the "from" end of the focus edge:
     // find the indices of nodes at distance r from the focus edge's "from" node AND distance greater than r from the "to" node
     var distRnodes = this.graph.distanceMatrix[this.focus.from.n].map((val,indx) => val == r ? indx : undefined).filter(x => x !== undefined);
     var angleOffset = Math.PI; // put these nodes on the opposite side of the focus edge from the ones closest to the "to" node
     // work through them backwards and omit those which are closer to the "to" node:
     for (var i=distRnodes.length;i>0;i--){
      if (this.graph.distanceMatrix[this.focus.from.n][distRnodes[i-1]] > this.graph.distanceMatrix[this.focus.to.n][distRnodes[i-1]]){
       distRnodes.splice(i-1,1);
      }
     }
     // loop over the remaining distance r nodes and set their alt locations
     for (var i=0;i<distRnodes.length;i++){
      // these nodes belong on a circle of radius s from the centre, with position angles determined by the valency, r and their "n"
      this.graph.nodes[distRnodes[i]].setAltLocation(   this.spacedSectorLocation(this.focus.from.getAltLocation(),s,distRnodes.length,i,angleMin+angleOffset,angleMax+angleOffset)  );
     }

     // PART 2: nodes closer to the "to" end of the focus edge:
     // find the indices of nodes at distance r from the focus edge's "to" node AND distance greater than r from the "from" node
     var distRnodes = this.graph.distanceMatrix[this.focus.to.n].map((val,indx) => val == r ? indx : undefined).filter(x => x !== undefined);
     // work through them backwards and discard those which are closer to the "from" node:
     for (var i=distRnodes.length;i>0;i--){
      if (this.graph.distanceMatrix[this.focus.to.n][distRnodes[i-1]] > this.graph.distanceMatrix[this.focus.from.n][distRnodes[i-1]]){
       distRnodes.splice(i-1,1);
      }
     }
     // loop over the remaining distance r nodes and set their alt locations
     for (var i=0;i<distRnodes.length;i++){
      // these nodes belong on a circle of radius s from the centre, with position angles determined by the valency, r and their "n"
      this.graph.nodes[distRnodes[i]].setAltLocation(   this.spacedSectorLocation(this.focus.to.getAltLocation(),s,distRnodes.length,i,angleMin,angleMax)  );
     }

    } // loop over r

    // finally, place nodes which are not connected to the focus node (distance is infinity)
    var distRnodes = this.graph.distanceMatrix[this.focus.from.n].map((val,indx) => val == Infinity ? indx : undefined).filter(x => x !== undefined);
    var s = 1.1; // put detached nodes just outside the outer circle
    for (var i=0;i<distRnodes.length;i++){
     this.graph.nodes[distRnodes[i]].setAltLocation(   this.spacedCircleLocation(s,valency,r+1,i)  );
    }

   }


  } else {
   for (var i=0;i<this.graph.nodes.length;i++){
    this.graph.nodes[i].setAltLocation(this.centralLocation());
   }

  }

  // now move the nodes to their newly-set alternative positions:
  this.toggleNodePositions();

  return true;
 }

}
