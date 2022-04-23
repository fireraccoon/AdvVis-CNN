<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { getDataRange, gridData, getVisualizationSizeConstraint,
    get_matrix_slice_from_highlights_index
  } from './DetailviewUtils.js';
  import Dataview from './Dataview.svelte';
  import KernelMathView from './KernelMathView.svelte';
  // image: nxn array -- prepadded.
  // kernel: mxm array.
  // stride: int
  export let stride;
  export let kernel;
  export let image;
  export let output;
  export let adversary = false;
  export let isPaused;
  export let dataRange;
  export let colorScale;
  export let inputHighlightsIndex;
  export let outputHighlightsIndex;
  export let isInputInputLayer = false;
  export let samplesDifferences;
  export let stressBounder;
  export let showAllDifference;

  const dispatch = createEventDispatcher();

  // Dummy data for original state of component.
  let testInputMatrixSlice = [];
  for (let i = 0; i < kernel.length; i++) {
    testInputMatrixSlice.push([]);
    for (let j = 0; j < kernel.length; j++) {
      testInputMatrixSlice[i].push(0)
    }
  }
  testInputMatrixSlice = gridData(testInputMatrixSlice)
  let testOutputMatrixSlice = gridData([0]);

  $: inputHighlightsIndex, outputHighlightsIndex, updateMatrixSlice();

  let interval;
  let counter;

  function startConvolution(stride) {
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
      })
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
  let testKernel;
  $ : {
    if (!adversary) startConvolution(stride);
    testImage = gridData(image);
    testOutput = gridData(output);
    testKernel = gridData(kernel);
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
    Input ({image.length}, {image[0].length})
  </div>
  <Dataview on:message={handleMouseover} data={testImage} highlightsIndex={inputHighlightsIndex} outputLength={output.length}
      isKernelMath={false} constraint={getVisualizationSizeConstraint(image.length)}
      {dataRange} {stride} {colorScale} isInputLayer={isInputInputLayer} {stressBounder}
      samplesDifference={samplesDifferences.prev} {showAllDifference} {adversary}/>
</div>
<div class="column has-text-centered">
  {#if !adversary}
    <div class="origin-header">Origin</div>
  {:else}
    <div class="adversary-header">Adversary</div>
  {/if}
  <KernelMathView data={testInputMatrixSlice} kernel={testKernel} constraint={getVisualizationSizeConstraint(kernel.length)}
                  dataRange={dataRange} kernelRange={getDataRange(kernel)} colorScale={colorScale}
                  isInputLayer={isInputInputLayer}/>
  <Dataview data={testOutputMatrixSlice} isKernelMath={true} 
      constraint={getVisualizationSizeConstraint(kernel.length)} {dataRange}/>
</div>
<div class="column has-text-centered">
  <div class="header-text">
    Output ({output.length}, {output[0].length})
  </div>
  <Dataview on:message={handleMouseover} data={testOutput} highlightsIndex={outputHighlightsIndex} isKernelMath={false}
      outputLength={output.length} constraint={getVisualizationSizeConstraint(output.length)} {dataRange} {stride}
      {stressBounder} samplesDifference={samplesDifferences.next} {showAllDifference} {adversary}/>
</div>