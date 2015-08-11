export function Slider (root, depth) { 
  this._root = root;
  this._depth = depth;

  console.log("Slider", root, depth);
};

function slider() {
  return new Transition([document.documentElement], 1);
}

Slider.prototype = slider.prototype = {

};


export default slider;