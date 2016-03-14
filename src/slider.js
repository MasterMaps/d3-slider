d3.slider = function module() {
  "use strict";

  // Public variables width default settings
  var domain = [0, 100],
      step = 1,
      orientation = "horizontal",      
      value,
      scale, 
      innerScale,
      axis,
      ticks,
      tickFormat;    

  // Private variables
  var sliderEl,
      rangeEl,
      lowerHandle,
      upperHandle,
      axisScale,
      tickFormat = d3.format(".0"),
      dispatch = d3.dispatch("drag", "dragstart", "dragend");

  var drag = d3.behavior.drag()
      .on("drag", onDrag)
      .on("dragstart", onDragStart)
      .on("dragend", onDragEnd);

  function slider(selection) {
    selection.each(function() {

      // Create scale if not defined by user
      if (!scale) {
        scale = d3.scale.linear().domain(domain);
      }
      scale.range([0, 100]); // Percent
      scale.clamp(true); 

      // Create slider div
      sliderEl = d3.select(this).classed("d3-slider d3-slider-" + orientation, true)
          .on("click", onClick);

      rangeEl = sliderEl.append("div")
          .classed("d3-slider-range", true);

      // Create slider handle
      lowerHandle = drawHandle("lower");

      if (value && value.length === 2) { // Two handles
        upperHandle = drawHandle("upper");
      }

      moveHandle(value || scale.range()[0]); 

      if (axis) {
        drawAxis();
      }

    });
  }

  function drawHandle(position) {
    return sliderEl.append("div")
        .classed("d3-slider-handle d3-slider-handle-" + position, true)
        .attr("xlink:href", "#")
        .on("click", stopPropagation)
        .call(drag)
  }

  function drawAxis() {

    // Remove axis before redraw
    sliderEl.select("svg").remove();

    // Create axis if not defined by user
    if (typeof axis === "boolean") {
      axis = d3.svg.axis()
          .orient((orientation === "horizontal") ? "bottom" : "right"); 
      } 

      if (ticks) {
        axis.ticks(ticks);
      }

      if (tickFormat) {
        axis.tickFormat(tickFormat);
      }

      //console.log(axis);

      // Copy slider scale to move from percentages to pixels
      axisScale = scale.copy().range([0, getSliderLength() - 1]);
      axis.scale(axisScale);

      // Create SVG axis container
      var svg = sliderEl.append("svg")
        .classed("d3-slider-axis d3-slider-axis-" + axis.orient(), true)
        .on("click", stopPropagation);

      var g = svg.append("g");

      // Horizontal axis
      if (orientation === "horizontal") {
        //svg.style("left", -margin);
        svg.attr({ 
           width: getSliderLength()
        });  
      }

      g.call(axis);  
  }

  function onClick() {
    var pos = d3.mouse(sliderEl[0][0])[(orientation === "horizontal") ? 0 : 1], // TODO: Find cleaner wau to get dom element
        newValue = clampToInnerScale(stepValue(scale.invert(pos / getSliderLength() * 100)));

    if (value.length === 2) { // Two handles
      if (Math.abs(value[0] - newValue) > Math.abs(value[1] - newValue)) {
        moveHandle([value[0], newValue]);
        dispatch.drag(d3.event.sourceEvent, [newValue, value[1]]);
      } else {
        moveHandle([newValue, value[1]]);
        dispatch.drag(d3.event.sourceEvent, [value[0], newValue]);
      }
    } else { // Single handle
      moveHandle(newValue);
      dispatch.dragend(d3.event.sourceEvent, value);
    }
  }

  function onDrag() {
    var pos = d3.event[(orientation === "horizontal") ? "x" : "y"],
        newValue = clampToInnerScale(stepValue(scale.invert(pos / getSliderLength() * 100))),
        lowerHandle = d3.select(this).classed("d3-slider-handle-lower")

    if (value.length === 2) { // Two handles
      //console.log(lowerHandle, newValue, value);
      if (lowerHandle && newValue <= value[1]) {
        moveHandle([newValue, value[1]]);
        dispatch.drag(d3.event.sourceEvent, [newValue, value[1]]);
      } else if (!lowerHandle && newValue >= value[0]) {
        moveHandle([value[0], newValue]); 
        dispatch.drag(d3.event.sourceEvent, [value[0], newValue]);
      }
    } else if (newValue !== value) {
      moveHandle(newValue);
      dispatch.drag(d3.event.sourceEvent, newValue);
    }
  }

  function onDragStart() {
    dispatch.dragstart(d3.event.sourceEvent, value);
  }

  function onDragEnd() {
    dispatch.dragend(d3.event.sourceEvent, value);
  }

  function clampToInnerScale(value) {
    if (innerScale) {
      if (value.length !== 1) {
       if (innerScale(value) > 1) {
          return innerScale.invert(1);
        }
      }
    }
    return value;
  }

  // Move slider handle if value is different
  function moveHandle(newValue) {
    if (lowerHandle) {
      var pos = (orientation === "horizontal") ? ["left", "right"] : ["bottom", "top"];

      if (newValue.length === 2) { // Two handles
        lowerHandle.style(pos[0], scale(newValue[0]) + "%");
        upperHandle.style(pos[0], scale(newValue[1]) + "%");
        rangeEl.style(pos[0], scale(newValue[0]) + "%");
        rangeEl.style(pos[1], (100 - scale(newValue[1])) + "%");
      } else  { // Single handle
        lowerHandle.style(pos[0], scale(newValue) + "%");
        rangeEl.style(pos[1], (100 - scale(newValue)) + "%");
      }

      value = newValue;
    }
  }

  // Calculate nearest step value
  function stepValue(value) {
    var valueModStep = (value - scale.domain()[0]) % step,
        alignValue = value - valueModStep;

    if (Math.abs(valueModStep) * 2 >= step) {
      alignValue += (valueModStep > 0) ? step : -step;
    }

    return alignValue;
  }

  function getSliderLength() {
    return parseInt(sliderEl.style((orientation === "horizontal") ? "width" : "height"), 10);
  }

  function stopPropagation() {
    d3.event.stopPropagation();
  }

  slider.axis = function(_) {
    if (!arguments.length) return axis;
    axis = _;
    return slider;
  }   

  slider.domain = function(_) {
    if (!arguments.length) return domain;
    domain = _;
    return slider;
  }   

  slider.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return slider;
  };

  slider.innerScale = function(_) {
    if (!arguments.length) return innerScale;
    innerScale = _;
    return slider;
  };

  slider.value = function(_) {
    if (!arguments.length) return value;
    value = _;
    moveHandle(value);
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

  slider.ticks = function(_) {
    if (!arguments.length) return ticks;
    ticks = _;
    return slider;
  }  

  slider.tickFormat = function(_) {
    if (!arguments.length) return tickFormat;
    tickFormat = _;
    return slider;
  }  

  slider.resize = function() {
    drawAxis();
    return slider;
  }

  d3.rebind(slider, dispatch, "on");
  
  return slider;

}

/* 

Other sliders: 
http://api.jqueryui.com/slider/
http://refreshless.com/nouislider/

*/
