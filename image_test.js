function hexKAColor(c){
  return "#"+[((c & 16711680) >>> 16).toString(16), ((c & 65280) >>> 8).toString(16), ((c & 255)).toString(16), ((c & 4278190080) >>> 24).toString(16)].map(s=>s.length===1?"0"+s:s).join("")
}

const pixel_art_bitmaps = {
  smileyFace:{m:"2 6h2  h6 h -6h-5 -3h4-5 -3h-5 -6h  hh2 4h2  h6 h 2 6h2 ",p:"-16777216h",w:10,h:10,s:40},
};

class pixArt {
  constructor(data){
    this.s = data.s
    this.w = data.w
    this.h = data.h
    this.width = this.w*this.s
    this.height = this.h*this.s
    this.img = new OffscreenCanvas(this.width, this.height)
    var ctx = this.img.getContext('2d')
    this.colors = Object.fromEntries(data.p.split(/(?<=[^\d-])/).map(c => [c.charAt(c.length-1), hexKAColor(c.substr(0, c.length-1))]))
    
    var x, y, w, h, c, bitmap = Array(this.h).fill().map(()=>Array(this.w).fill(false))
    for(var s of data.m.split(/(?<=[^\d-])/)){
      y = bitmap.findIndex(function(r){
        x=r.indexOf(false);
        return x>-1;
      });
      c = s.substr(0, s.length-1).split(/-/)
      w = parseInt(c[0], 10) || 1
      h = parseInt(c[1], 10) || 1
      for(var Y = y; Y < y+h; Y++){
        for(var X = x; X < x+w; X++){
          bitmap[Y][X] = true;
        }
      }
      if(s.charAt(s.length-1) !== " "){
        ctx.fillStyle = this.colors[s.charAt(s.length-1)]
        ctx.fillRect(x*this.s, y*this.s, w*this.s, h*this.s)
      }
    }
  }
}

const IMAGES = Object.fromEntries(Object.keys(pixel_art_bitmaps).map(k => [k, pixArt(k).img]))
