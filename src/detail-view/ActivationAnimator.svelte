<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { gridData, get_matrix_slice_from_highlights_index,
    getVisualizationSizeConstraint
  } from './DetailviewUtils.js';
  import Dataview from './Dataview.svelte';

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

  let gridInputMatrixSlice = gridData([[0]]);
  let gridOutputMatrixSlice = gridData([[0]]);

  $ : inputHighlightsIndex, outputHighlightsIndex, updateMatrixSlice();

  let interval;
  let counter;

  // lots of replication between mouseover and start-relu. TODO: fix this.
  function startRelu() {
    counter = 0;
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
    gridInputMatrixSlice = gridData(inputMatrixSlice);
    const outputMatrixSlice = get_matrix_slice_from_highlights_index(output, outputHighlightsIndex);
    gridOutputMatrixSlice = gridData(outputMatrixSlice);
  }

  let gridImage;
  let gridOutput;
  $ : {
    if (!adversary) startRelu();
    gridImage = gridData(image);
    gridOutput = gridData(output);
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
  <Dataview on:message={handleMouseover} data={gridImage} highlightsIndex={inputHighlightsIndex} outputLength={output.length}
      isKernelMath={false} constraint={getVisualizationSizeConstraint(image.length)} {dataRange} stride={1}
      {stressBounder} samplesDifference={samplesDifferences.prev}/>  
</div>
<div class="column has-text-centered">
  {#if !adversary}
    <div class="origin-header">Origin</div>
  {:else}
    <div class="adversary-header">Adversary</div>
  {/if}
  <span>
    max(
    <Dataview data={gridData([[0]])} isKernelMath={true} 
    constraint={20} {dataRange}/>
    ,
    <Dataview data={gridInputMatrixSlice} isKernelMath={true} 
    constraint={20} {dataRange}/>
    )
    =
    <Dataview data={gridOutputMatrixSlice} isKernelMath={true} 
      constraint={20} {dataRange}/>
  </span> 
</div>
<div class="column has-text-centered">
  <div class="header-text">
    Output ({output.length}, {output[0].length})
  </div>
  <Dataview on:message={handleMouseover} data={gridOutput} highlightsIndex={outputHighlightsIndex} isKernelMath={false} 
      outputLength={output.length} constraint={getVisualizationSizeConstraint(output.length)} {dataRange} stride={1}
      {stressBounder} samplesDifference={samplesDifferences.next}/>
</div>