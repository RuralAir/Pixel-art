(function(){
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
      return isBetween(d2.y1, this.y1, this.y2) && isBetween(this.x1, d2.x1, d2.x2);
    } // checks if this (vertical) Diagonal intersects d2 (horizontal) Diagonal
  }

  /**isBetween
   * @Author Rur
   * 
   * Very simple function to check if a value falls between floor and ceiling, inclusive.
  */
  function isBetween (v, f, c) {
    return v >= f && v <= c;
  }

  /**bitCount
   * @Author Rur
   * Outputs the number of positive bits contained in input number n.
   * Eg. 5 (101) -> 2
  */
  function bitCount (n) {
    var r = 0;
    while(r+=n&1,n>>=1){}
    return r;
  }

  /**CssToRgba
   * @Author Rur
   * 
   * Transcribed and modified from this stack overflow answer by joe:
   * https://stackoverflow.com/a/74408201
   * (Thanks, joe!)
   * 
   * Accepts a string containing any valid CSS color and outputs the RGBA values in an array.
  */
  function cssToRgba (color) {
    let tempElement = document.createElement('div'), rgba = (tempElement.style.color = color, tempElement.style.display = 'none',
    document.body.appendChild(tempElement), window.getComputedStyle(tempElement).getPropertyValue("color")), [r, g, b, a] = (tempElement.remove(), tempElement = undefined, rgba.match(/[0-9.]+/g).map(Number)), ret = (a = a || 255, [r, g, b, a]);
    return ret;
  }

  /**bitmap compression function
   * @Author Rur
   * 
   * Accepts a bitmap object in the form, 
   * {
        m:[
          "aba",
          "bab",
        ],
        p:{
          'a':(CSS color string)
          'b':(CSS color string)
        }
     }
   * 
   * Partitions the bitmap into the mathematically fewest possible rectangles. For more information, see section three of this paper by David Eppstein: https://arxiv.org/pdf/0908.3916.pdf
   * 
   * Outputs a stringified version of this rectangle map, along with a KA-compatible color string.
  */
  var compressBitmap = function (data) {
    // cache the overall dimensions
    const bitmapWidth = data.m[0].length,
    bitmapHeight = data.m.length;

    // ensure the dimensions will work as intended
    for(let y = bitmapHeight; --y;){
      if(data.m[y].length !== bitmapWidth) return "// ERROR: Input bitmap row length is not uniform."
    }

    // color characters used
    const chars = [],

    // construct a 2D character array from data.m. Keep track of what characters are used.
    charMap = data.m
      .map((r) => r
        .split('')
        .map((i) => (!chars.includes(i)?chars.push(i):undefined, i))
      ),

    // rectangle storage
    rectList = [];

    // for every color to be compressed
    chars.forEach((char) => {
      // cache the bounding coordinates around the color
      const yOffset = charMap
        .findIndex(r => r
          .includes(char)),
      yBound = charMap
        .findLastIndex(r => r
          .includes(char)),
      xOffset = charMap
        .reduce((prev, cur) => Math.min(prev, cur.findIndex(i => i === char)), Infinity),
      xBound = charMap
        .reduce((prev, cur) => Math.max(prev, cur.findLastIndex(i => i === char)), 0),

      // construct a true/false bitmap within the bounding coordinates for whether or not the pixel in question is the color being compressed
      bitmap = charMap
        .slice(yOffset, yBound+1)
        .map((r) => r
          .slice(xOffset, xBound+1)
          .map((c) => c === char)),

      // cache the bitmap dimensions
      height = bitmap.length,
      width = bitmap[0].length,

      // construct a map of points (corners of the pixels)
      pointmap = Array(height+1)
        .fill()
        .map((r, y) => Array(width+1)
          .fill()
          .map((i, x) =>
            // if it has neighboring pixels, store the corner as a GraphVertex and give it the relative positions of the neighboring pixels in a 4-bit numerical format
            bitmap[y] && (bitmap[y][x] || bitmap[y][x-1]) || bitmap[y-1] && (bitmap[y-1][x] || bitmap[y-1][x-1]) ? new GridVertex(x, y, (bitmap[y-1] && bitmap[y-1][x]) << 3 | (bitmap[y] && bitmap[y][x]) << 2 | (bitmap[y] && bitmap[y][x-1]) << 1 | (bitmap[y-1] && bitmap[y-1][x-1]) << 0)

            // if no neighbors, set the corner to false.
            : false)
          ),

      // set these up for good diagonal storage
      verticals = [],
      horizontals = [];

      /**find good diagonals*/

      // scan the pointmap for corners with two internal angles
      pointmap.forEach((r, y) => {
        r.forEach((i, x) => {
          // if there are two internal angles, it is concave
          if(bitCount(i.internals) === 2){

            // check the internal angles. If a line can be drawn internal the shape from internal angle A to internal angle B, then AB is a good diagonal.
            if(i.internals & 4){
              for(var j = 0, t; (t = pointmap[y][x+(j+=1)]);){
                if(bitCount(t.internals) === 2 && t.internals & 1){
                  horizontals.push(new Diagonal(i.coords, t.coords));
                  break;
                }
              }
            } // right
            if(i.internals & 2){
              for(var j = 0, t; (pointmap[y+(j+=1)]) && (t = pointmap[y+j][x]);){
                if(bitCount(t.internals) === 2 && t.internals & 8){
                  verticals.push(new Diagonal(i.coords, t.coords));
                  break;
                }
              }
            } // down
            // it is not necessary to check left and up -- AB and BA are the same line.
          }
        });
      });

      // create a bipartite graph to represent the good diagonals
      const rurGraph = new BipartiteGraph(verticals.length, horizontals.length);

      // set the good diagonal intersections as edges in the graph
      verticals.forEach((v, j) => {
        horizontals.forEach((h, i) => {
          if(v.intersects(h)) rurGraph.addEdge(j+1, i+1);
        });
      });

      // get the maximum independent set for the graph
      var keepers = rurGraph.maxIS();


      /**resolve good diagonals included in the maxIS*/
      // verticals
      for(var j = keepers.m.length, v; --j;){
        if(!keepers.m[j]) continue;
        v = verticals[j-1];
        pointmap[v.y1][v.x1].edges |= 2;
        pointmap[v.y1][v.x1].internals ^= 2;
        for(var y = v.y1, x = v.x1; (++y) < v.y2;){
          pointmap[y][x].edges |= 10;
        }
        pointmap[v.y2][v.x1].edges |= 8;
        pointmap[v.y2][v.x1].internals ^= 8;
      }

      // horizontals
      for(var j = keepers.n.length, h; --j;){
        if(!keepers.n[j]) continue;
        h = horizontals[j-1];
        pointmap[h.y1][h.x1].edges |= 4;
        pointmap[h.y1][h.x1].internals ^= 4;
        for(var x = h.x1, y = h.y1; (++x) < h.x2;){
          pointmap[y][x].edges |= 5;
        }
        pointmap[h.y1][h.x2].edges |= 1;
        pointmap[h.y1][h.x2].internals ^= 1;
      }

      /**resolve bad diagonals*/
      pointmap.forEach((r, y) => {
        r.forEach((i, x) => {
          if(bitCount(i.internals) === 2){
            switch(i.internals & 5){
              case 4:
                pointmap[y][x].edges |= 4;
                var j = x;
                while(!(pointmap[y][++j].edges & 10)){
                  pointmap[y][j].edges |= 5;
                }
                pointmap[y][j].edges |= 1;
              break;
              case 1:
                pointmap[y][x].edges |= 1;
                var j = x;
                while(!(pointmap[y][--j].edges & 10)){
                  pointmap[y][j].edges |= 5;
                }
                pointmap[y][j].edges |= 4;
            }
          }
        });
      });


      /**construct rectangles*/
      // scan the pointmap one final time
      pointmap.forEach((r, y) => {
        r.forEach((i, x) => {
          // if you find a corner that has edges going right and down, scan along those edges until they end. You have now found the top-left corner, width, and height of a rectangle.
          if((i.edges & 6) === 6 && i.adjacents & 4){
            let w = 0, h = 0;
            while(!(pointmap[y+(++h)][x].edges & 4)){}
            while(!(pointmap[y][x+(++w)].edges & 2)){}
            /**cache rectangles*/
            // if the current rectangle is of dimensions 1x2, cache it as two rectangles of dimensions 1x1. This prevents a one-character inneficiency.
            if(w === 1 && h === 2) {
              rectList.push({
                x:x+xOffset,
                y:y+yOffset,
                w:1,
                h:1,
                c:char
              });
              rectList.push({
                x:x+xOffset,
                y:y+1+yOffset,
                w:1,
                h:1,
                c:char
              });
            }
            // otherwise cache it normally
            else {
              rectList.push({
                x:x+xOffset,
                y:y+yOffset,
                w:w,
                h:h,
                c:char,
              });
            }
          }
        });
      });
    });

    // output string
    return "{\n  m:\"" +
    rectList

      // sort rectList by priorities, (Y, X) in ascending order. (Y: 0, X : 0) should come first.
      .sort((a, b) => a.y < b.y ? -1 : a.y > b.y ? 1 : a.x < b.x ? -1 : 1)

      // reduce each rectangle to the string format, "[width][-height][char]", omitting any width or height of one.
      .map(i =>(i.w > 1 ? i.w : '') + (i.h > 1 ? '-' + i.h : '') + i.c)

      // join the ordered string units
      .join('')+
    "\",\n  p:\"" +
    Object.keys(data.p)
      // for every character in the palette
      .map(c => {
        // if it is a whitespace char, skip it
        if(c === ' ' || c === '_') return;

        // get the rgba values
        // (I LOVE THIS SYNTAX)
        var [r, g, b, a] = cssToRgba(data.p[c]);

        // return a string with the KA-ified rgba values, followed by the color character
        return ((a << 24) & 4278190080 | (r << 16) & 16711680 | (g << 8) & 65280 | b & 255) + c
      })

      // join the string
      .join('') +
    "\",\n  w:" +
    bitmapWidth +
    ",\n  h:" +
    bitmapHeight +
    ",\n  s:" +

    // find the largest pixel size that fits a 400x400 canvas
    Math.floor(400 / Math.max(bitmapHeight, bitmapWidth)) + ",\n}";
  };

}).call(this);
