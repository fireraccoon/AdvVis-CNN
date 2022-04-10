<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { getMatrixSliceFromOutputHighlights, gridData,
    getVisualizationSizeConstraint, getMatrixSliceFromInputHighlights
  } from './DetailviewUtils.js';
  import Dataview from './Dataview.svelte';

  export let stride;
  export let kernelLength;
  export let image;
  export let output;
  export let adversary = false;
  export let isPaused;
  export let dataRange;
  export let inputHighlights;
  export let outputHighlights;

  const dispatch = createEventDispatcher();

  // Dummy data for original state of component.
  let testInputMatrixSlice = [];
  for (let i = 0; i < kernelLength; i++) {
    testInputMatrixSlice.push([]);
    for (let j = 0; j < kernelLength; j++) {
      testInputMatrixSlice[i].push(0)
    }
  }
  testInputMatrixSlice = gridData(testInputMatrixSlice)
  let testOutputMatrixSlice = gridData([[0]]);

  let interval;
  $ : inputHighlights, outputHighlights, updateMatrixSlice();
  
  let counter;

  // lots of replication between mouseover and start-pool. TODO: fix this.
  function startMaxPool(stride) {
    counter = 0;
    if (stride <= 0) return;
    dispatch('message', { isPaused: false });
    if (interval) clearInterval(interval);
    interval = setInterval(() => {
      if (isPaused) return;
      const flat_animated = counter % (output.length * output.length);
      dispatch("highlightsUpdate", {
        hoverH: Math.floor(flat_animated / output.length),
        hoverW: flat_animated % output.length
      });
      counter++;
    }, 250)
  }

  function handleMouseover(event) {
    dispatch("highlightsUpdate", {
      hoverH: event.detail.hoverH,
      hoverW: event.detail.hoverW
    });
    dispatch('message', { isPaused: true });
  }

  const updateMatrixSlice = () => {
    const inputMatrixSlice = getMatrixSliceFromInputHighlights(image, inputHighlights, kernelLength);
    testInputMatrixSlice = gridData(inputMatrixSlice);
    const outputMatrixSlice = getMatrixSliceFromOutputHighlights(output, outputHighlights);
    testOutputMatrixSlice = gridData(outputMatrixSlice);
  }

  if (!adversary) startMaxPool(stride);
  let testImage = gridData(image);
  let testOutput = gridData(output);
  $ : {
    if (!adversary) startMaxPool(stride);
    testImage = gridData(image);
    testOutput = gridData(output);
  }
  onDestroy(() => interval ? clearInterval(interval) : void(0));
</script>

<style>
  .column {
    padding: 5px;
  }
</style>

<div class="column has-text-centered">
  <div class="header-text">
    Input ({testImage.length}, {testImage[0].length})
  </div>

  <Dataview on:message={handleMouseover} data={testImage} highlights={inputHighlights} outputLength={output.length}
      isKernelMath={false} constraint={getVisualizationSizeConstraint(image.length)} dataRange={dataRange} stride={stride}/>  
</div>
<div class="column has-text-centered">
  {#if !adversary}
    <div class="origin-header">Origin</div>
  {:else}
    <div class="adversary-header">Adversary</div>
  {/if}
  <span>
    max(
    <Dataview data={testInputMatrixSlice} highlights={outputHighlights} isKernelMath={true} 
      constraint={getVisualizationSizeConstraint(kernelLength)} dataRange={dataRange}/>
    )
    =
    <Dataview data={testOutputMatrixSlice} highlights={outputHighlights} isKernelMath={true} 
      constraint={getVisualizationSizeConstraint(kernelLength)} dataRange={dataRange}/>
  </span> 
</div>
<div class="column has-text-centered">
  <div class="header-text">
    Output ({testOutput.length}, {testOutput[0].length})
  </div>
  <Dataview on:message={handleMouseover} data={testOutput} highlights={outputHighlights} isKernelMath={false} 
      outputLength={output.length} constraint={getVisualizationSizeConstraint(output.length)} dataRange={dataRange} stride={stride}/>
</div>