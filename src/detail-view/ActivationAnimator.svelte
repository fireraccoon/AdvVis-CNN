<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { getMatrixSliceFromOutputHighlights, gridData,
    getVisualizationSizeConstraint, getMatrixSliceFromInputHighlights
  } from './DetailviewUtils.js';
  import Dataview from './Dataview.svelte';

  export let image;
  export let output;
  export let adversary = false;
  export let isPaused;
  export let dataRange;
  export let inputHighlights;
  export let outputHighlights;

  const dispatch = createEventDispatcher();

  let gridInputMatrixSlice = gridData([[0]]);
  let gridOutputMatrixSlice = gridData([[0]]);
  let interval;
  $ : inputHighlights, outputHighlights, updateMatrixSlice();

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
    const inputMatrixSlice = getMatrixSliceFromInputHighlights(image, inputHighlights, 1);
    gridInputMatrixSlice = gridData(inputMatrixSlice);
    const outputMatrixSlice = getMatrixSliceFromOutputHighlights(output, outputHighlights);
    gridOutputMatrixSlice = gridData(outputMatrixSlice);
  }

  if (!adversary) startRelu();
  let gridImage = gridData(image);
  let gridOutput = gridData(output);
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
  <Dataview on:message={handleMouseover} data={gridImage} highlights={inputHighlights} outputLength={output.length}
      isKernelMath={false} constraint={getVisualizationSizeConstraint(image.length)} dataRange={dataRange} stride={1}/>  
</div>
<div class="column has-text-centered">
  {#if !adversary}
    <div class="origin-header">Origin</div>
  {:else}
    <div class="adversary-header">Adversary</div>
  {/if}
  <span>
    max(
    <Dataview data={gridData([[0]])} highlights={outputHighlights} isKernelMath={true} 
    constraint={20} dataRange={dataRange}/>
    ,
    <Dataview data={gridInputMatrixSlice} highlights={outputHighlights} isKernelMath={true} 
    constraint={20} dataRange={dataRange}/>
    )
    =
    <Dataview data={gridOutputMatrixSlice} highlights={outputHighlights} isKernelMath={true} 
      constraint={20} dataRange={dataRange}/>
  </span> 
</div>
<div class="column has-text-centered">
  <div class="header-text">
    Output ({output.length}, {output[0].length})
  </div>
  <Dataview on:message={handleMouseover} data={gridOutput} highlights={outputHighlights} isKernelMath={false} 
      outputLength={output.length} constraint={getVisualizationSizeConstraint(output.length)} dataRange={dataRange} stride={1}/>
</div>