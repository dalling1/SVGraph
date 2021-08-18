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
 // and remove it after 4 seconds
 setTimeout(function(){var E = thegraph.findEdgesTo(id);for(var i=0;i<E.length;i++){E[i].svg.classList.remove("highlightedge")}},4000);
}
