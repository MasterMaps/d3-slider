import {select} from "d3-selection";  // https://github.com/d3/d3-selection
//import {linear} from "d3-scale";    // https://github.com/d3/d3-scale

export default function () {

  // Public variables width default settings
  var range = [0, 100],
      step = 1,
      orientation = "horizontal",
      value,
      scale;      

  // Private variables
  var sliderEl,
      rangeEl,
      lowerHandle,
      upperHandle;

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

      rangeEl = sliderEl.append("div")
          .class("d3-slider-range", true);

      // Create slider handle
      lowerHandle = createHandle("lower");

      if (value && value.length === 2) { // Two handles
        upperHandle = createHandle("upper");
      }

      moveHandle(value || scale.domain()[0]); 
    });
  }

  function createHandle(position) {
    return sliderEl.append("a")
        .class("d3-slider-handle d3-slider-handle-" + position, true)
        .attr("xlink:href", "#");
  }

  function onSliderClick() {
    var pos = (orientation === "horizontal") ? ["offsetX", "width"] : ["offsetY", "height"],
        newValue = scale(event[pos[0]] / parseInt(sliderEl.style(pos[1]), 10) * 100);

    console.log(event);

    if (value.length === 2) { // Two handles
      console.log(event.target, newValue, value, Math.abs(value[0] - newValue), Math.abs(value[1] - newValue));
    } else { // Single handle
      moveHandle(newValue);
    }
  }

  function moveHandle(newValue) {
    var pos = (orientation === "horizontal") ? ["left", "right"] : ["bottom", "top"];

    value = newValue;

    if (value.length === 2) { // Two handles
      lowerHandle.style(pos[0], scale.invert(value[0]) + "%");
      upperHandle.style(pos[0], scale.invert(value[1]) + "%");
      rangeEl.style(pos[0], scale.invert(value[0]) + "%");
      rangeEl.style(pos[1], (100 - scale.invert(value[1])) + "%");
    } else { // Single handle
      lowerHandle.style(pos[0], scale.invert(value) + "%");
      rangeEl.style(pos[1], (100 - scale.invert(value)) + "%");
    }
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

  return slider;
};

/* 

Other sliders: 
http://api.jqueryui.com/slider/
http://refreshless.com/nouislider/

*/