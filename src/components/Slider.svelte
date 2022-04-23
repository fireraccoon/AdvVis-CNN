<script>
  import { createEventDispatcher, onMount } from 'svelte';

  export let value = 3;
  export let ranges = [0, 6];

  console.assert(ranges[0] < ranges[1], `Illegal ranges: [${ranges}].`);

  let extent = ranges[1] - ranges[0];
  let rectifyMin = ranges[0] * 0.0005;
  let rectifyMax = ranges[1] * 0.9995;

  let runwayContainer;
  let textFormatter = d3.format(".4f");

  let xStart;
  let oldValue;
  let slideBorder = [-1, -1];
  let showTooltip = false;

  const dispatch = createEventDispatcher();

  const handleButtonMouseDown = (event) => {
    showTooltip = true;
    oldValue = value;
    xStart = event.clientX;
    slideBorder[0] = event.clientX - value / extent * runwayContainer.offsetWidth;
    slideBorder[1] = (1 - value / extent) * runwayContainer.offsetWidth + event.clientX;
    runwayContainer.removeEventListener("click", handlerRunwayClick);
    document.addEventListener("mousemove", handleDocumentMouseMove);
    document.addEventListener("mouseup", handleDocumentMouseUp);
  }

  const handleDocumentMouseMove = (event) => {
    event.preventDefault();
    let newValue = oldValue + (event.clientX - xStart) * extent / runwayContainer.offsetWidth;
    newValue = Math.max(Math.min(newValue, ranges[1]), ranges[0]);
    if (newValue === value) return;
    dispatch("message", { value: newValue < rectifyMin ? ranges[0] : newValue > rectifyMax ? ranges[1] : newValue });
  }

  const handleDocumentMouseUp = (event) => {
    showTooltip = false;
    document.removeEventListener("mousemove", handleDocumentMouseMove);
    document.removeEventListener("mouseup", handleDocumentMouseUp);
    runwayContainer.addEventListener("click", handlerRunwayClick);
  }

  const handlerRunwayClick = (event) => {
    if (!event.srcElement.className.includes("button")) {
      let newValue = event.offsetX / runwayContainer.offsetWidth * extent;
      if (newValue === value) return;
      dispatch("message", { value: newValue });
    }
  }

  onMount(() => {
    runwayContainer.addEventListener("click", handlerRunwayClick);
  });

</script>

<style>

  .slider-runway {
    width: calc(100% - 2 * 10px);
    height: 6px;
    margin: 16px 10px;
    border-radius: 3px;
    position: relative;
    cursor: pointer;
    vertical-align: middle;
  }

  .slider-tooltip {
    position: absolute;
    top: -35px;
    z-index: 2000;
  }

  .slider-tooltip-text {
    border-radius: 3px;
    padding: 5px 3px;
    background-color: #303133;
    color: white;
    font-size: 12px;
  }

  .slider-tooltip-arrow {
    width: 0;
    height: 0;
    border-color: #303133 transparent transparent transparent;
    border-width: 6px;
    border-style: solid;
  }

  .slider-bar {
    height: 6px;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    position: absolute;
    transition: width .2s ease-out;
  }

  .slider-button-wrapper {
    height: 36px;
    width: 36px;
    position: absolute;
    z-index: 500;
    top: -15px;
    transform: translateX(-50%);
    background-color: transparent;
    text-align: center;
    user-select: none;
    line-height: normal;
    transition: left .2s ease-out;
  }

  .slider-button {
    width: 16px;
    height: 16px;
    border: 2px solid hsl(348, 100%, 61%);
    border-radius: 50%;
    transition: .2s;
    user-select: none;
    display: inline-block;
    vertical-align: middle;
    cursor: grabbing;
  }

  .slider-button-wrapper:hover {
    cursor: grabbing;
  }

  .slider-button-wrapper:hover .slider-button {
    width: 20px;
    height: 20px;
  }

</style>

<div class="is-flex is-align-items-center" style="width: 100%;">

  <span class="tag is-flex-grow-0 is-size-6">{textFormatter(ranges[0])}</span>

  <div class="is-flex-grow-1" role="slider" aria-valuemin={ranges[0]} aria-valuemax={ranges[1]} aria-orientation="horizontal">
    <div class="slider-runway has-background-white-ter" bind:this={runwayContainer}>

      {#if showTooltip}
        <div role="tooltip" class="slider-tooltip is-flex is-flex-direction-column is-align-items-center"
          style={`left: calc(${ (value - ranges[0]) / extent * 100 }% - 20px);`}>
          <div class="slider-tooltip-text">{textFormatter(value)}</div>
          <div class="slider-tooltip-arrow"></div>
        </div>
      {/if}

      <div class="slider-bar has-background-danger"
        style={`width: ${ (value - ranges[0]) / extent * 100 }%; left: 0%;`}></div>

      <div class="slider-button-wrapper is-flex is-justify-content-center is-align-items-center"
        style={`left: ${ (value - ranges[0]) / extent * 100 }%;`} on:mousedown={handleButtonMouseDown}>
        <div class="slider-button has-background-white"></div>
      </div>

    </div>
  </div>

  <span class="tag is-flex-grow-0 is-size-6">{textFormatter(ranges[1])}</span>

</div>
