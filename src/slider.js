import {select} from "d3-selection";  // https://github.com/d3/d3-selection
import {format} from "d3-format";     // https://github.com/d3/d3-format
//import {linear} from "d3-scale";    // https://github.com/d3/d3-scale

export default function () {

  // Public variables width default settings
  var range = [0, 100],
      step = 1,
      orientation = "horizontal",
      animate = true,
      value,
      scale;      

  // Private variables
  var formatPercent = format(".2%"),
      sliderEl,
      handle;

  function slider(selection) {
    selection.each(function() {

      // Create scale if not defined by user
      if (!scale) {
        //scale = linear().domain([min, max]);
      }

      // Create slider div
      sliderEl = select(this).class("d3-slider d3-slider-" + orientation, true)
          .event("click", onSliderClick);

      // Create slider handle
      handle = sliderEl.append("a")
          .class("d3-slider-handle", true)
          .attr("xlink:href", "#");

      moveHandle(value || scale.domain()[0]);
    });
  }

  function onSliderClick() {
    if (orientation === "horizontal") {
      moveHandle(scale.invert(event.offsetX / parseInt(sliderEl.style("width"), 10)));
    } else {
      moveHandle(scale.invert(event.offsetY / parseInt(sliderEl.style("height"), 10)));
    }
  }

  function moveHandle(value) {
    handle.style((orientation === "horizontal") ? "left" : "bottom", formatPercent(scale(value)));
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

  slider.orientation = function(_) {
    if (!arguments.length) return orientation;
    orientation = _;
    return slider;
  }  

  slider.step = function(_) {
    if (!arguments.length) return step;
    step = _;
    return slider;
  }   

  slider.animate = function(_) {
    if (!arguments.length) return animate;
    animate = _;
    return slider;
  } 

  return slider;
};

/* 

Other sliders: 
http://refreshless.com/nouislider/

*/