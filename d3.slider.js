/*
    D3.js Slider
    Inspired by jQuery UI Slider
    Copyright (c) 2013, Bjorn Sandvik - http://blog.thematicmapping.org
    BSD license: http://opensource.org/licenses/BSD-3-Clause
*/
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['d3'], factory);
  } else if (typeof exports === 'object') {
    if (process.browser) {
      // Browserify. Import css too using cssify.
      require('./d3.slider.css');
    }
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('d3'));
  } else {
    // Browser globals (root is window)
    root.d3.slider = factory(root.d3);
  }
}(this, function (d3) {
return function module() {
  "use strict";

  // Public variables width default settings
  var min = 0,
      max = 100,
      step = 0.01,
      animate = true,
      orientation = "horizontal",
      axis = false,
      margin = 50,
      value,
      active = 1,
      snap = false,
      scale;

  // Private variables
  var percentFromRangeVal,
      dispatch = d3.dispatch("slide", "slideend"),
      formatPercent = d3.format(".2%"),
      tickFormat = d3.format(".0"),
      handle1,
      handle2 = null,
      divRange,
      sliderLength;

  function slider(selection) {
    selection.each(function() {

      // DIV container
      var div = d3.select(this).classed("d3-slider d3-slider-" + orientation, true);

      // Get container bounding rectangle, a DOMRect object
      var divRect = div.node().getBoundingClientRect();
      // Get slider length from container bounding rect
      sliderLength = orientation === "horizontal" ? divRect.width : divRect.height;

      // Translate a value from the slider range into a formatted percentage of sliderLength
      percentFromRangeVal = function(rangeVal) { return formatPercent(rangeVal/sliderLength); };

      // Create scale if not defined by user
      if (!scale) {
        scale = d3.scale.linear().domain([min, max]);
        scale.ticks ? scale.range([0, sliderLength]) : scale.rangePoints([0, sliderLength], 0.5);
      }

      // Start value
      value = value || scale.domain()[0];

      var drag = d3.behavior.drag();
      drag.on('dragend', function () {
        dispatch.slideend(d3.event, value);
      });

      // Slider handle
      //if range slider, create two
      // var divRange;

      if (toType(value) == "array" && value.length == 2) {
        handle1 = div.append("a")
          .classed("d3-slider-handle", true)
          .attr("xlink:href", "#")
          .attr('id', "handle-one")
          .on("click", stopPropagation)
          .call(drag);
        handle2 = div.append("a")
          .classed("d3-slider-handle", true)
          .attr('id', "handle-two")
          .attr("xlink:href", "#")
          .on("click", stopPropagation)
          .call(drag);
      } else {
        handle1 = div.append("a")
          .classed("d3-slider-handle", true)
          .attr("xlink:href", "#")
          .attr('id', "handle-one")
          .on("click", stopPropagation)
          .call(drag);
      }
      
      // Horizontal slider
      if (orientation === "horizontal") {

        div.on("click", onClickHorizontal);
        
        if (toType(value) == "array" && value.length == 2) {
          divRange = d3.select(this).append('div').classed("d3-slider-range", true);

          handle1.style("left", percentFromRangeVal(scale(value[ 0 ])));
          divRange.style("left", percentFromRangeVal(scale(value[ 0 ])));
          drag.on("drag", onDragHorizontal);

          var width = 100 - parseFloat(percentFromRangeVal(scale(value[ 1 ])));
          handle2.style("left", percentFromRangeVal(scale(value[ 1 ])));
          divRange.style("right", width+"%");
          drag.on("drag", onDragHorizontal);

        } else {
          handle1.style("left", percentFromRangeVal(scale(value)));
          drag.on("drag", onDragHorizontal);
        }
        
        sliderLength = parseInt(div.style("width"), 10);

      } else { // Vertical

        div.on("click", onClickVertical);
        drag.on("drag", onDragVertical);
        if (toType(value) == "array" && value.length == 2) {
          divRange = d3.select(this).append('div').classed("d3-slider-range-vertical", true);

          handle1.style("bottom", percentFromRangeVal(scale(value[ 0 ])));
          divRange.style("bottom", percentFromRangeVal(scale(value[ 0 ])));
          drag.on("drag", onDragVertical);

          var top = 100 - parseFloat(percentFromRangeVal(scale(value[ 1 ])));
          handle2.style("bottom", percentFromRangeVal(scale(value[ 1 ])));
          divRange.style("top", top+"%");
          drag.on("drag", onDragVertical);

        } else {
          handle1.style("bottom", percentFromRangeVal(scale(value)));
          drag.on("drag", onDragVertical);
        }
        
      }
      
      if (axis) {
        createAxis(div);
      }


      function createAxis(dom) {

        // Create axis if not defined by user
        if (typeof axis === "boolean") {

          axis = d3.svg.axis()
              .ticks(Math.round(sliderLength / 100))
              .tickFormat(tickFormat)
              .orient((orientation === "horizontal") ? "bottom" :  "right");

        }

        axis.scale(scale);

        // Create SVG axis container
        var svg = dom.append("svg")
            .classed("d3-slider-axis d3-slider-axis-" + axis.orient(), true)
            .on("click", stopPropagation);

        var g = svg.append("g");

        // Horizontal axis
        if (orientation === "horizontal") {

          svg.style("margin-left", -margin + "px");

          svg.attr({
            width: sliderLength + margin * 2,
            height: margin
          });

          if (axis.orient() === "top") {
            svg.style("top", -margin + "px");
            g.attr("transform", "translate(" + margin + "," + margin + ")");
          } else { // bottom
            g.attr("transform", "translate(" + margin + ",0)");
          }

        } else { // Vertical

          svg.style("top", -margin + "px");

          svg.attr({
            width: margin,
            height: sliderLength + margin * 2
          });

          if (axis.orient() === "left") {
            svg.style("left", -margin + "px");
            g.attr("transform", "translate(" + margin + "," + margin + ")");
          } else { // right          
            g.attr("transform", "translate(" + 0 + "," + margin + ")");
          }

        }

        g.call(axis)
          .selectAll(".tick text") // select generated ticks
          .call(wrap, sliderLength / axis.tickValues().length); // wrap generated ticks

      }

      function onClickHorizontal() {
        if (toType(value) != "array") {
          var pos = Math.max(0, Math.min(sliderLength, d3.event.offsetX || d3.event.layerX));
          moveHandle(scale.invert ? 
                      stepValue(scale.invert(pos))
                    : nearestTick(pos));
        }
      }

      function onClickVertical() {
        if (toType(value) != "array") {
          var pos = sliderLength - Math.max(0, Math.min(sliderLength, d3.event.offsetY || d3.event.layerY));
          moveHandle(scale.invert ? 
                      stepValue(scale.invert(pos))
                    : nearestTick(pos));
        }
      }

      function onDragHorizontal() {
        if ( d3.event.sourceEvent.target.id === "handle-one") {
          active = 1;
        } else if ( d3.event.sourceEvent.target.id == "handle-two" ) {
          active = 2;
        }
        var pos = Math.max(0, Math.min(sliderLength, d3.event.x));
        moveHandle(scale.invert ? 
                    stepValue(scale.invert(pos))
                  : nearestTick(pos));
      }

      function onDragVertical() {
        if ( d3.event.sourceEvent.target.id === "handle-one") {
          active = 1;
        } else if ( d3.event.sourceEvent.target.id == "handle-two" ) {
          active = 2;
        }
        var pos = sliderLength - Math.max(0, Math.min(sliderLength, d3.event.y));
        moveHandle(scale.invert ? 
                    stepValue(scale.invert(pos))
                  : nearestTick(pos));
      }

      function stopPropagation() {
        d3.event.stopPropagation();
      }

    });

  }

  // Move slider handle on click/drag
  function moveHandle(newValue) {
    var currentValue = toType(value) == "array"  && value.length == 2 ? value[active - 1]: value,
        oldPos = percentFromRangeVal(scale(stepValue(currentValue))),
        newPos = percentFromRangeVal(scale(stepValue(newValue))),
        position = (orientation === "horizontal") ? "left" : "bottom";
    if (oldPos !== newPos) {

      if (toType(value) == "array" && value.length == 2) {
        value[ active - 1 ] = newValue;
        if (d3.event) {
          dispatch.slide(d3.event, value );
        }
      } else {
        if (d3.event) {
          dispatch.slide(d3.event.sourceEvent || d3.event, value = newValue);
        }
      }

      if ( value[ 0 ] >= value[ 1 ] ) return;
      if ( active === 1 ) {
        if (toType(value) == "array" && value.length == 2) {
          (position === "left") ? divRange.style("left", newPos) : divRange.style("bottom", newPos);
        }

        if (animate) {
          handle1.transition()
              .styleTween(position, function() { return d3.interpolate(oldPos, newPos); })
              .duration((typeof animate === "number") ? animate : 250);
        } else {
          handle1.style(position, newPos);
        }
      } else {
        
        var width = 100 - parseFloat(newPos);
        var top = 100 - parseFloat(newPos);

        (position === "left") ? divRange.style("right", width + "%") : divRange.style("top", top + "%");
        
        if (animate) {
          handle2.transition()
              .styleTween(position, function() { return d3.interpolate(oldPos, newPos); })
              .duration((typeof animate === "number") ? animate : 250);
        } else {
          handle2.style(position, newPos);
        }
      }
    }
  }

  // Calculate nearest step value
  function stepValue(val) {

    if (val === scale.domain()[0] || val === scale.domain()[1]) {
      return val;
    }

    var alignValue = val;
    if (snap) {
      alignValue = nearestTick(scale(val));
    } else{
      var valModStep = (val - scale.domain()[0]) % step;
      alignValue = val - valModStep;

      if (Math.abs(valModStep) * 2 >= step) {
        alignValue += (valModStep > 0) ? step : -step;
      }
    }

    return alignValue;

  }

  // Find the nearest tick
  function nearestTick(pos) {
    var ticks = scale.ticks ? scale.ticks() : scale.domain();
    var dist = ticks.map(function(d) {return pos - scale(d);});
    var i = -1,
        index = 0,
        r = scale.ticks ? scale.range()[1] : scale.rangeExtent()[1];
    do {
        i++;
        if (Math.abs(dist[i]) < r) {
          r = Math.abs(dist[i]);
          index = i;
        }
    } while (dist[i] > 0 && i < dist.length - 1);

    return ticks[index];
  }

  // Return the type of an object
  function toType(v) {
    return ({}).toString.call(v).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  }

  // Wrap label text. From: http://bl.ocks.org/mbostock/7555321
  function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

  // Getter/setter functions
  slider.min = function(_) {
    if (!arguments.length) return min;
    min = _;
    return slider;
  };

  slider.max = function(_) {
    if (!arguments.length) return max;
    max = _;
    return slider;
  };

  slider.step = function(_) {
    if (!arguments.length) return step;
    step = _;
    return slider;
  };

  slider.animate = function(_) {
    if (!arguments.length) return animate;
    animate = _;
    return slider;
  };

  slider.orientation = function(_) {
    if (!arguments.length) return orientation;
    orientation = _;
    return slider;
  };

  slider.axis = function(_) {
    if (!arguments.length) return axis;
    axis = _;
    return slider;
  };

  slider.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return slider;
  };

  slider.value = function(_) {
    if (!arguments.length) return value;
    if (value) {
      moveHandle(stepValue(_));
    }
    value = _;
    return slider;
  };

  slider.snap = function(_) {
    if (!arguments.length) return snap;
    snap = _;
    return slider;
  };

  slider.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return slider;
  };

  d3.rebind(slider, dispatch, "on");

  return slider;

}
}));
