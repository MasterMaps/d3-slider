import {select} from "d3-selection";  // https://github.com/d3/d3-selection
import {format} from "d3-format";     // https://github.com/d3/d3-format
//import {linear} from "d3-scale";    // https://github.com/d3/d3-scale

export default function () {

  // Public variables width default settings
  var min = 0,
      max = 100,
      orientation = "horizontal",
      value,
      scale;

  // Private variables
  var formatPercent = format(".2%"),
      handle;

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

      // Slider handle
      handle = div.append("a")
          .class("d3-slider-handle", true)
          .attr("xlink:href", "#");

      // Horizontal slider
      if (orientation === "horizontal") {
        moveHandle(value);
      }

    });
  }

  function moveHandle(newValue) {
    var position = (orientation === "horizontal") ? "left" : "bottom";
    handle.style(position, formatPercent(scale(newValue)));
  }

  slider.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return slider;
  };

  slider.value = function(_) {
    if (!arguments.length) return value;
    value = _;
    return slider;
  };

  return slider;
};