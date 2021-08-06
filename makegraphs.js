/*

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

*/

/*
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
*/


var thegraph = new Graph("thegraph");
//thegraph.addNodes(100);
