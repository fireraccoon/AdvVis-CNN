<script>
  export let data;
  export let highlightsIndex = [];
  export let isKernelMath;
  export let constraint;
  export let dataRange;
  export let outputLength = undefined;
  export let stride = undefined;
  export let colorScale = d3.interpolateRdBu;
  export let isInputLayer = false;
  export let samplesDifference = undefined;
  export let stressBounder = undefined;

  import { createEventDispatcher } from 'svelte';
  import { getDeltaStressIndex } from './DetailviewUtils'

  let grid_final;
  const textConstraintDivisor = 2.6;
  const standardCellColor = "ddd";
  const dispatch = createEventDispatcher();

  let oldHighlightsIndex;
  let oldStressBounder;
  let highlightUnitsLastStates;

  $: data, grid_final && redraw();
  $: stressBounder, data, grid_final && !isKernelMath && redrawStressUnits();
  $: highlightsIndex, grid_final && updateHighLights();

  const redraw = () => {
    d3.select(grid_final).selectAll("#grid > *").remove();
    highlightUnitsLastStates = Array.from({length: highlightsIndex.length}, () => "none");
    const constrainedSvgSize = data.length * constraint + 2;
    var grid = d3.select(grid_final).select("#grid")
      .attr("width", constrainedSvgSize + "px")
      .attr("height", constrainedSvgSize + "px")
      .append("svg")
      .attr("width", constrainedSvgSize + "px")
      .attr("height", constrainedSvgSize + "px")
    var row = grid.selectAll(".row")
      .data(data)
      .enter().append("g")
      .attr("class", "row");
    var column = row.selectAll(".square")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("class","square")
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("width", function(d) { return d.width; })
      .attr("height", function(d) { return d.height; })
      .style("opacity", 0.8)
      .style("fill", function(d) {
        let normalizedValue = d.text;
        if (isInputLayer){
          normalizedValue = 1 - d.text;
        } else {
          normalizedValue = (d.text + dataRange / 2) / dataRange;
        }
        return colorScale(normalizedValue);
      })
      .on('mouseover', function(d) {
        if (data.length != outputLength) {
          dispatch('message', {
            hoverH: Math.min(Math.floor(d.row / stride), outputLength - 1),
            hoverW: Math.min(Math.floor(d.col / stride), outputLength - 1)
          });
        } else {
          dispatch('message', {
            hoverH: Math.min(Math.floor(d.row / 1), outputLength - 1),
            hoverW: Math.min(Math.floor(d.col / 1), outputLength - 1)
          });
        }
      });
    if (isKernelMath) {
      var text = row.selectAll(".text")
        .data(function(d) { return d; })
        .enter().append("text")
        .attr("class","text")
        .style("font-size", Math.floor(constraint / textConstraintDivisor) + "px")
        .attr("x", function(d) { return d.x + d.width / 2; })
        .attr("y", function(d) { return d.y + d.height / 2; })
        .style("fill", function(d) {
        let normalizedValue = d.text;
          if (isInputLayer){
            normalizedValue = 1 - d.text;
          } else {
            normalizedValue = (d.text + dataRange / 2) / dataRange;
          }
          if (normalizedValue < 0.2 || normalizedValue > 0.8) {
            return 'white';
          } else {
            return 'black';
          }
        })
        .style("text-anchor", "middle")
        .style("dominant-baseline", "middle")
        .text(function(d) {
          return d.text.toString().replace('-', '－');
        })
      column = column.style("stroke", "black");
    }
    oldStressBounder = Infinity;
    oldHighlightsIndex = highlightsIndex;
  }

  const redrawStressUnits = () => {
    let stressUnitsIndex, border;
    if (stressBounder < oldStressBounder) {
      stressUnitsIndex = getDeltaStressIndex(samplesDifference, stressBounder, oldStressBounder);
      border = "red";
    } else {
      stressUnitsIndex = getDeltaStressIndex(samplesDifference, oldStressBounder, stressBounder);
      border = "none";
    }
    stressUnitsIndex.forEach(d => {
      d3.select(grid_final).select('#grid > svg')
        .select(`.row:nth-child(${d[0] + 1}) .square:nth-child(${d[1] + 1})`)
        .style("stroke", border);
    });
    let element, strokeStyle;
    highlightsIndex.forEach((d, i) => {
      element = d3.select(grid_final).select('#grid > svg')
        .select(`.row:nth-child(${d[0] + 1}) .square:nth-child(${d[1] + 1})`);
      strokeStyle = element.style("stroke");
      highlightUnitsLastStates[i] = (strokeStyle === "black" ? highlightUnitsLastStates[i] : strokeStyle);
      element.style("stroke", "black");
    });
    oldStressBounder = stressBounder;
  }

  const updateHighLights = () => {
    if (highlightsIndex != oldHighlightsIndex) {
      oldHighlightsIndex.forEach((d, i) => {
        d3.select(grid_final).select('#grid > svg')
          .select(`.row:nth-child(${d[0] + 1}) .square:nth-child(${d[1] + 1})`)
          .style("stroke", highlightUnitsLastStates[i]);
      });
      oldHighlightsIndex = highlightsIndex;
      let element;
      highlightUnitsLastStates = [];
      highlightsIndex.forEach(d => {
        element = d3.select(grid_final).select('#grid > svg')
          .select(`.row:nth-child(${d[0] + 1}) .square:nth-child(${d[1] + 1})`);
        highlightUnitsLastStates.push(element.style("stroke"));
        element.style("stroke", "black");
      });
    }
  }

</script>

<div style="display: inline-block; vertical-align: middle;" class="grid"
  bind:this={grid_final}>
  <svg id="grid" width=100% height=100%></svg>
</div>