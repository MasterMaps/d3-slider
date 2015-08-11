import {select} from "d3-selection";  // https://github.com/d3/d3-selection
//import {linear} from "d3-scale";      // https://github.com/d3/d3-scale

export default function () {
  var min = 0,
      max = 100,
      orientation = "horizontal",
      value,
      scale;

  function slider(selection) {
    selection.each(function() {

      // Create scale if not defined by user
      if (!scale) {
        //scale = linear().domain([min, max]);
      }

      // Start value
      value = value || scale.domain()[0];

      // DIV container
      var div = select(this).class("d3-slider d3-slider-" + orientation, true);

    });
  }

  slider.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return slider;
  };

  return slider;
};