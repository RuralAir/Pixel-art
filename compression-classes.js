/**Bipartite graph
 * @Author Rur
 * 
 * Used to store and manipulate data representative of a bipartite graph.
 * Hopcroft-Karp algorithm implementation transcribed to JavaScript from:
 * https://www.geeksforgeeks.org/hopcroft-karp-algorithm-for-maximum-matching-set-2-implementation/
*/
class BipartiteGraph{
  constructor(m, n){
    this.m = m;
    this.n = n;
    this.adj = Array(m+1).fill().map(() => []);
  }

  /**Hopcroft-Karp algorithm
   * Finds a maximum cardinality matching in a bipartite graph. WAY faster than the Hungarian algorithm.
  */
  hopcroftKarp(){
    // found distance from vertex (u in U) to NIL vertex
    this.dist = Array(this.m+1).fill();

    // pair of vertex (u in U)
    this.pairU = Array(this.m+1).fill(0);

    // pair of vertex (v in V)
    this.pairV = Array(this.n+1).fill(0);

    // while there are more matches, find them and add them to the set
    while(this.bfs()){
      for(let u = this.pairU.length; --u;){
        if(this.pairU[u] === 0) this.dfs(u);
      }
    }
  }

  /**Breadth-first search
   * Checks a matching for new alternating path.
  */
  bfs(){
    // Queue of destination vertices
    var Q = [];

    for(let u = this.pairU.length; --u;){
      if(this.pairU[u] === 0){
        this.dist[u] = 0;
        Q.push(u);
      } else {
        this.dist[u] = Infinity;
      }
    }

    this.dist[0] = Infinity;

    // search the Queue for a longer match
    while(Q.length){
      let u = Q.shift();
      if(this.dist[u] < this.dist[0]){
        for(let i = this.adj[u].length, v; i--;){
          v = this.adj[u][i];
          if(this.dist[this.pairV[v]] === Infinity){
            this.dist[this.pairV[v]] = this.dist[u] + 1;
            Q.push(this.pairV[v]);
          }
        }
      }
    }
    return this.dist[0] !== Infinity;
  }

  /**First depth-first search method
   * used to set alternating paths starting from (u in U) into the matching.
  */
  dfs(u){
    if(u !== 0){
      for(let i = this.adj[u].length, v; i--;){
        v = this.adj[u][i];
        if(this.dist[this.pairV[v]] === this.dist[u]+1 && this.dfs(this.pairV[v])){
          this.pairV[v] = u;
          this.pairU[u] = v;
          return true;
        }
      }
      this.dist[u] = Infinity;
      return false;
    }
    return true;
  }

  /**Second depth-first search method
   * Marks visited alternating paths through the matching, starting from vertice (u in U)
  */
  dfs2 (u) {
    this.visU[u] = true;
    for(let j = this.adj[u].length, v; j--;){
      v = this.adj[u][j];

      // skip if it's already matched/visited
      if(this.pairU[u] === v || this.visV[v]){
        continue;
      }

      // visit v
      this.visV[v] = true;

      // if v is matched and the match is unvisited, recurse from that match.
      if(this.pairV[v] && !this.visU[this.pairV[v]]){
        this.dfs2(this.pairV[v]);
      }
    }
  }

  /**Maximum independent set
   * Finds the maximum independent set in a bipartite graph.
   * Uses the Hopcroft-Karp algorithm to find a maximum cardinality matching. ()
   * Reduces the matching to the minimum vertex cover by proving Kőnig's theorem.
   * Outputs the inverse of the minimum vertex cover. (The maximum independent set)
  */
  maxIS () {
    this.hopcroftKarp();
    this.visU = Array(this.m+1).fill(false);
    this.visV = Array(this.n+1).fill(false);
    for(let u = this.pairU.length; --u;){

      // only start on unmatched vertices
      if(this.pairU[u]){
        continue;
      }
      this.dfs2(u);
    }
    return {
      m: this.visU,
      n: this.visV.map((v) => !v),
    };
  }

  /**Adds an edge between vertices u and v*/
  addEdge(u, v){
    this.adj[u].push(v);
  }
}


/**GridVertex
 * @Author Rur
 * 
 * stores positional, relative neighbor, and angular data for a point on a grid. Used to construct diagonals. 
*/
class GridVertex{
  constructor(x, y, a){
    this.coords = [x, y];

    /**binary 4 direction storage:
     * directions:
      * up: 8
      * right: 4
      * down: 2
      * left: 1
     * methods:
      * read (up) = this.internals & 8
      * write (up) = this.internals |= 8
    */
    this.adjacents = a // adjacents are stored by the counter-clockwise-most edge of the rectangle. Eg. 'up' -> 'above-right'
    var ar = a >>> 1 | (a & 1) << 3; // adjacents bit-shifted right with wrapping
    this.edges = a ^ ar;// lines that follow one edge of an adjacent bit
    this.internals = (a | ar) ^ this.edges; // lines that follow two alligned edges of adjacent bits
  }
}

/**Diagonal
 * @Author Rur
 * 
 * Combines two axis-parallel vertices into a line.
*/
class Diagonal{
  constructor(c1, c2){
    this.c1 = c1;
    this.c2 = c2;
    this.x1 = c1[0];
    this.y1 = c1[1];
    this.x2 = c2[0];
    this.y2 = c2[1];
  }
  intersects(d2){
    return (d2.y1 >= this.y1 && d2.y1 <= this.y2 && this.x1 >= d2.x1 && this.x1 <= d2.x2);
  } // checks if this (vertical) Diagonal intersects d2 (horizontal) Diagonal
}
