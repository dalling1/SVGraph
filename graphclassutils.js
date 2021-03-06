/* HTML- and SVG-related functions for the Graph, Node, Edge and Automorphism classes
   Utility functions which facilitate display and manipulation of Javascript objects on the webpage.
*/

function primaryGraph(){
 var g = document.getElementById("thesvg").getAttribute("data-primary-graph");
 if (g.length) return document.getElementById(g);
 else return false;
}

function makePrimary(graph){
 document.getElementById("thesvg").setAttribute("data-primary-graph",graph.name);
}

function addGraphNode(graph,position,radius,edgelist=[]){
 makePrimary(graph);
 graph.addNode(randomName(),position,radius);
}

function addRandomGraphNode(graph){
 makePrimary(graph);
 graph.addNodes(1);
}

function addRandomGraphNodes(graph,n=1){
 makePrimary(graph);
 graph.addNodes(n);
}

function removeGraphNodes(graph,n=1){
 graph.removeNodes(n);
}

function addRandomGraphEdges(graph,n=1){
 makePrimary(graph);
 graph.addEdges(n);
}

function removeGraphEdges(graph,n=1){
 makePrimary(graph);
 graph.removeEdges(n);
}

function shuffle(graph){
 makePrimary(graph);
// graph.layout.shuffleNodePositions();
 graph.draw();
}

function toggle(graph){
 makePrimary(graph);
 graph.layout.toggleNodePositions();
}

function permute(graph,reverse){
 makePrimary(graph);
 graph.layout.permuteNodePositions(reverse);
}

function setEdgeStyle(graph,val){
 makePrimary(graph);
// graph.setAlwaysUseBezier(!graph.alwaysUseBezier);
 graph.setAlwaysUseBezier(val);
}

function setSelfEdges(graph,val){
 makePrimary(graph);
// graph.setAllowSelfEdges(!graph.allowSelfEdges);
 graph.setAllowSelfEdges(val);
}

function sampleEdge(id){
 thegraph.layout.setFocus(thegraph.findEdge(id)[0]);
 console.log("Clicked edge "+id);
}

function sampleNode(id){
 thegraph.layout.setFocus(thegraph.findNode(id)[0]);
 console.log("Clicked node "+id);
}

function showConnections(id){
 // add the highlightedge class to this node's edges
 var E = thegraph.findEdgesTo(id);
 for (var i=0;i<E.length;i++){
  E[i].svg.classList.add("highlightedge");
 }
 // highlighting is not removed in this function
}

function hideConnections(id){
 // remove the highlightedge class to this node's edges
 var E = thegraph.findEdgesTo(id);
 for (var i=0;i<E.length;i++){
  E[i].svg.classList.remove("highlightedge");
 }
}

function showConnectionsFading(id,highlightTime=1.0){
 // add the highlightedge class to this node's edges
 var E = thegraph.findEdgesTo(id);
 for (var i=0;i<E.length;i++){
  E[i].svg.classList.add("highlightedge");
 }
 // and remove it after some seconds
// var highlightTime = 1; // seconds
 setTimeout(function(){var E = thegraph.findEdgesTo(id);for(var i=0;i<E.length;i++){E[i].svg.classList.remove("highlightedge")}},highlightTime*1000.0);
}

function randomNormal(mean,variance){
 // The Box-Muller transformation yields two normal random numbers, but this function only returns one
 // mean and variance must be scalar
 var r1 = Math.random();
 var r2 = Math.random();
 var z1 = Math.pow(-2.0*Math.log(r1),0.5)*Math.cos(2.0*Math.PI*r1);
 // omit z1
 var R1 = mean+z1*Math.pow(variance,0.5);
 // omit R2
 return R1;
}

function randomNormal2(mean,variance){
 // The Box-Muller transformation yields two normal random numbers, return them both (handy for 2D coordinates)
 // mean and variance should be vectors of length 2
 if (typeof(mean)=="number") mean = [mean, mean];
 if (typeof(variance)=="number") variance = [variance, variance];
 var r1 = Math.random();
 var r2 = Math.random();
 var z1 = Math.pow(-2.0*Math.log(r1),0.5)*Math.cos(2.0*Math.PI*r2);
 var z2 = Math.pow(-2.0*Math.log(r1),0.5)*Math.sin(2.0*Math.PI*r2);
 var R1 = mean[0]+z1*Math.pow(variance[0],0.5);
 var R2 = mean[1]+z2*Math.pow(variance[1],0.5);
 return [R1, R2];
}

function removeDuplicateEdges(graph){
 graph.removeDuplicateEdges();
}

function printMatrix(M){
 for (var i=0;i<M.length;i++) console.log(M[i].toString());
}

function addMatrices(A,B){
 if (A.length != B.length){
  console.log("addMatrices: matrix sizes do not match (rows)");
  return false;
 }
 var C = new Array(A.length);
 for (var i=0;i<A.length;i++){
  if (A[i].length != B[i].length){
   console.log("addMatrices: matrix sizes do not match (columns)");
   return false;
  }
  C[i] = new Array(A[i].length);
  for (var j=0;j<A[i].length;j++){
   C[i][j] = A[i][j] + B[i][j];
  }
 }
 return C;
}

function showNodeDetails(nodes){
 // convenience function for arrays of Node objects
 for (var i=0;i<nodes.length;i++) nodes[i].showDetails();
}

function multiplyMatrices(A,B){
 // initialise the resulting matrix, AB
 var AB = new Array(A.length);
 // loop through the elements of AB
 for (var i=0;i<AB.length;i++){
  AB[i] = Array(B[0].length).fill(0);
  for (var j=0;j<AB[i].length;j++){
   // for this element of AB, sum up the product of the ith row of A and the jth column of B
   for (k=0;k<A[i].length;k++) AB[i][j] += A[i][k]*B[k][j];
  }
 }
 return AB;
}

function matrixPower(A,n){
 // multiply a matrix by itself n times (n should be an integer)
 if (A.length != A[0].length){ // must be a square matrix
  console.log("matrixPower: matrix is not square");
  return false;
 } else {
  if (n==0){ // A^0 is the identity matrix:
   B = identityMatrix(A.length);
  } else {
   var B = A;
   for (var i=1;i<n;i++) B = multiplyMatrices(A,B);
  }
  return B;
 }
}

function matrixNonzero(A){
 // returns an array of booleans the same size as A, true where A's elements are not zero
 return A.map(function(s){return s.map(function(t){return (t!=0?1:0);})});
}

function multiplyMatricesUsingOnes(A,B){
 // for multiplying adjacency matrices: we only care if values are non-zero, not their value (the number of paths between nodes)
 // this will allow us to multiply adjacency matrices together many times without the resulting matrix elements becoming large

 // initialise the resulting matrix, AB
 var AB = new Array(A.length);
 // loop through the elements of AB
 for (var i=0;i<AB.length;i++){
  AB[i] = Array(B[0].length).fill(0);
  for (var j=0;j<AB[i].length;j++){
   // for this element of AB, test the usual element value, replacing non-zero values with "1"
   // this approach could fail if there are negative non-zero entries which result in zero-valued entries in the product...
   for (k=0;k<A[i].length;k++){
    if (A[i][k]*B[k][j]!=0){
     AB[i][j]=1;
     break; // this element of the summation for this element of the product is non-zero, so we can stop calculating it this i,j element
    }
   }
  }
 }
 return AB;
}

function identityMatrix(n){
 var I = new Array(n);
 for (var i=0;i<I.length;i++){
  I[i] = new Array(n).fill(0); // all zeros
  I[i][i] = 1; // put ones on the diagonal
 }
 return I;
}

function maxFiniteElement(array){
 var M = -Infinity;
 for (var i=0;i<array.length;i++) if (array[i]>M && array[i]!=Infinity) M = array[i];
 return M;
}

function matrixMaxFiniteElement(A){
 var M = -Infinity;
 for (var i=0;i<A.length;i++){
  for (var j=0;j<A[i].length;j++){
   if (A[i][j]>M && A[i][j]!=Infinity) M = A[i][j];
  }
 }
 return M;
}

function treeSize(valency,depth){
 // Note: depth of zero means a single node with no neighbours
 var N = 0;
 var Nnodes = 0;
 for (var d=0;d<=depth;d++){
  if (d==0){
   N = 1;
  } else if (d==1){
   N = valency;
  } else {
   N = N*(valency-1);
  }
  Nnodes += N;
 }
 return Nnodes;
}

function makeTree(valency=0,depth=0){
 var tree = new Graph('tree');
 tree.allowSelfEdges = false;
 tree.alwaysUseBezier = false;
 tree.addNodes(1);
 var N = treeSize(valency,depth);

 for (var i=0;i<tree.nodes.length;i++){
  // add V-1 children to each node and connect them to their parent with a new edge
  // root node is a special case: it needs V children
  // stop when we have the complete tree (ie. have N ndoes)
  var branch = tree.nodes[i]; // this node (the "parent")
  if (tree.findEdgesTo(branch).length==0){ // needed?
   for (var v=0;v<valency;v++){
    if (i==0 || v>0){ // skip v=0 unless this is the root node
     tree.addNodes(1);
     var leaf = tree.nodes[tree.nodes.length-1]
     tree.addEdge(randomName(),branch,leaf);
    }
   }
   if (tree.nodes.length>=N) break; // stop when enough nodes have been added
  }
 }

// tree.layout.setLayout('vertexFocused');
 tree.layout.setLayout('treeVertexFocused');
 tree.layout.setFocus(tree.nodes[0]); // set the root node as the focus for now
 return tree;
}

function matrixDiagonal(M){
 if (M.length>0) if (M.length != M[0].length) return false;
 var diag = new Array(M.length);
 for (var i=0;i<M.length;i++) diag[i] = M[i][i];
 return diag;
}

function isSymmetric(M){
 if (M.length>0) if (M.length != M[0].length) return false; // not square so not symmetric
 for (var i=0;i<M.length;i++){
  for (var j=i+1;j<M[i].length;j++){
   if (M[i][j] != M[j][i]) return false;
  }
 }
 return true;
}

function matrixSum(M){
 var sum = 0;
 if (M.length==0) return sum;
 // otherwise:
 for (var i=0;i<M.length;i++){
  for (var j=0;j<M[i].length;j++){
   sum += M[i][j];
  }
 }
 return sum;
}

function duplicateMatrix(M){
 var A = [];
 for (var i=0;i<M.length;i++){
  A[i] = [];
  for (var j=0;j<M[i].length;j++){
   A[i][j] = M[i][j];
  }
 }
 return A;
}

function matricesAreEqual(A,B){
 if (A.length != B.length) return false;
 for (var i=0;i<A.length;i++){
  if (A[i].length != B[i].length) return false;
  for (var j=0;j<A[i].length;j++) if (A[i][j] != B[i][j]) return false;
 }
 // no fails, so:
 return true;
}

function animationMotion(from,to,percent,method='default'){
 if (from.length<2 || to.length<2) console.log("error in animationMotion: coordinates are not (at least) two-dimensional");

 if (method=='none'){
  var animationPosition = (percent<50.0 ? 0.0 : 1.0);
 } else if (method=='default' || method=='linear'){
  var animationPosition = (percent/100.0);
 } else if (method=='easeInOutBack'){
  var animationPosition = easeInOutBack(percent/100.0);
 } else if (method=='easeOutBack'){
  var animationPosition = easeOutBack(percent/100.0);
 } else if (method=='easeOutQuint'){
  var animationPosition = easeOutQuint(percent/100.0);
 } else if (method=='easeInSine'){
  var animationPosition = easeInSine(percent/100.0);
 } else if (method=='easeOutElastic'){
  var animationPosition = easeOutElastic(percent/100.0);
 }
 var newx = from[0] + animationPosition*(to[0]-from[0]);
 var newy = from[1] + animationPosition*(to[1]-from[1]);
 var newz = 0;

 return [newx, newy, newz];
}

function easeInOutBack(x){ // https://easings.net
 // x is the proportion of the way along the curve from 0 to 1 (start to finish)
 const c1 = 1.70158;
 const c2 = c1 * 1.525;
 return (x < 0.5)
  ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
  : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

function easeOutBack(x){ // https://easings.net
 // x is the proportion of the way along the curve from 0 to 1 (start to finish)
 const c1 = 1.70158;
 const c3 = c1 + 1;
 return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeOutQuint(x){  // https://easings.net
 // x is the proportion of the way along the curve from 0 to 1 (start to finish)
 return 1 - Math.pow(1 - x, 5);
}

function easeInSine(x){  // https://easings.net
 // x is the proportion of the way along the curve from 0 to 1 (start to finish)
 return 1 - Math.cos((x * Math.PI) / 2);
}

function easeOutElastic(x){  // https://easings.net
 // x is the proportion of the way along the curve from 0 to 1 (start to finish)
 const c4 = (2 * Math.PI) / 3;
 return (x === 0)
  ? 0
  : (x === 1)
  ? 1
  : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

function treeDistance(v,w){
 // calculates the distance between nodes (given their addresses eg 'abababc') assuming that they form a tree
 // remove common prefix:
 if (v.length>0 && w.length>0){
  while (v[0]==w[0]){
   v=v.slice(1);
   w=w.slice(1);
   if (v.length==0 | w.length==0){
    break;
   }
  }
 }
 // then count the remaining path length
 return v.length + w.length;
}
