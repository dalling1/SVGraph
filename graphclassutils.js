/* HTML- and SVG-related functions for the Graph, Node, Edge and Automorphism classes
   Utility functions which facilitate display and manipulation of Javascript objects on the webpage.
*/

const Pi = Math.acos(-1);

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
 graph.shuffleNodePositions();
}

function toggle(graph){
 makePrimary(graph);
 graph.toggleNodePositions();
}

function toggleEdgeStyle(graph){
 makePrimary(graph);
 graph.setAlwaysUseBezier(!graph.alwaysUseBezier);
}

function toggleSelfEdges(graph){
 makePrimary(graph);
 graph.setAllowSelfEdges(!graph.allowSelfEdges);
}

function sampleEdge(id){
 console.log("Clicked edge "+id);
}

function oldshowConnections(id){
 // test function to demonstrate acting on a given node, and specifically on the edges attached to a node:
 var E = thegraph.findEdgesTo(id);
 for(var i=0;i<E.length;i++){
  E[i].svg.classList.add("highlightedge");
 };

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
 // highlighting is not removed in this function
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
 var z1 = Math.pow(-2.0*Math.log(r1),0.5)*Math.cos(2.0*Pi*r1);
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
 var z1 = Math.pow(-2.0*Math.log(r1),0.5)*Math.cos(2.0*Pi*r2);
 var z2 = Math.pow(-2.0*Math.log(r1),0.5)*Math.sin(2.0*Pi*r2);
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
