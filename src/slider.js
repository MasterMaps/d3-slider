import {select} from "d3-selection";  // https://github.com/d3/d3-selection
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
  var sliderEl,
      handle;

  function slider(selection) {
    selection.each(function() {

      // Create scale if not defined by user
      if (!scale) {
        //scale = linear().domain([min, max]);
      }
      scale.domain([0, 100]); // Percent

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
      moveHandle(scale(event.offsetX / parseInt(sliderEl.style("width"), 10) * 100));
    } else {
      moveHandle(scale(event.offsetY / parseInt(sliderEl.style("height"), 10) * 100));
    }
  }

  function moveHandle(value) {
    console.log("move", value, stepValue(value));
    handle.style((orientation === "horizontal") ? "left" : "bottom", scale.invert(value) + "%");
  }

  // Calculate nearest step value
  function stepValue(value) {
    var valueModStep = (value - scale.range()[0]) % step,
        alignValue = value - valueModStep;

    if (Math.abs(valueModStep) * 2 >= step) {
      alignValue += (valueModStep > 0) ? step : -step;
    }

    return alignValue;
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