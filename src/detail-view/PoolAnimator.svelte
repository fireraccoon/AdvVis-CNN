<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { get_matrix_slice_from_highlights_index, gridData,
    getVisualizationSizeConstraint
  } from './DetailviewUtils.js';
  import Dataview from './Dataview.svelte';

  export let stride;
  export let kernelLength;
  export let image;
  export let output;
  export let adversary = false;
  export let isPaused;
  export let dataRange;
  export let inputHighlightsIndex;
  export let outputHighlightsIndex;
  export let samplesDifferences;
  export let stressBounder;

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

  $: inputHighlightsIndex, outputHighlightsIndex, updateMatrixSlice();
  
  let interval;
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
    const inputMatrixSlice = get_matrix_slice_from_highlights_index(image, inputHighlightsIndex);
    testInputMatrixSlice = gridData(inputMatrixSlice);
    const outputMatrixSlice = get_matrix_slice_from_highlights_index(output, outputHighlightsIndex);
    testOutputMatrixSlice = gridData(outputMatrixSlice);
  }

  let testImage;
  let testOutput;
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

  <Dataview on:message={handleMouseover} data={testImage} highlightsIndex={inputHighlightsIndex} outputLength={output.length}
      isKernelMath={false} constraint={getVisualizationSizeConstraint(image.length)} {dataRange} {stride} {stressBounder}
      samplesDifference={samplesDifferences.prev}/>  
</div>
<div class="column has-text-centered">
  {#if !adversary}
    <div class="origin-header">Origin</div>
  {:else}
    <div class="adversary-header">Adversary</div>
  {/if}
  <span>
    max(
    <Dataview data={testInputMatrixSlice} isKernelMath={true} 
      constraint={getVisualizationSizeConstraint(kernelLength)} {dataRange}/>
    )
    =
    <Dataview data={testOutputMatrixSlice} isKernelMath={true} 
      constraint={getVisualizationSizeConstraint(kernelLength)} {dataRange}/>
  </span> 
</div>
<div class="column has-text-centered">
  <div class="header-text">
    Output ({testOutput.length}, {testOutput[0].length})
  </div>
  <Dataview on:message={handleMouseover} data={testOutput} highlightsIndex={outputHighlightsIndex} isKernelMath={false} 
      outputLength={output.length} constraint={getVisualizationSizeConstraint(output.length)} {dataRange} {stride} {stressBounder}
      samplesDifference={samplesDifferences.next}/>
</div>