<script>
	import ConvolutionAnimator from './ConvolutionAnimator.svelte';
  import { singleConv } from '../utils/cnn.js';
  import { array1d, generateOutputMappings,
    compute_input_multiplies_with_weight
  } from './DetailviewUtils.js';
  import { createEventDispatcher } from 'svelte';

  export let input;
  export let inputAdver;
  export let kernel;
  export let dataRange;
  export let colorScale = d3.interpolateRdBu;
  export let isInputInputLayer = false;
  export let isExited = false;
  // export let output;
  const dispatch = createEventDispatcher();
	let stride = 1;
  const dilation = 1;
  var isPaused = false;
  var outputFinal = singleConv(input, kernel, stride);
  var outputAdverFinal = singleConv(inputAdver, kernel, stride);
  $: if (stride > 0) {
    try { 
      outputFinal = singleConv(input, kernel, stride);
      outputAdverFinal = singleConv(inputAdver, kernel, stride);
    } catch {
      console.log("Cannot handle stride of " + stride);
    }
  }
  
  const padding = 0;
  let padded_input_size = input.length + padding * 2;
  $: padded_input_size = input.length + padding * 2;

  let inputHighlights = [];
  let outputHighlights = array1d(outputFinal.length * outputFinal.length, (i) => true);

  function handleClickPause() {
    isPaused = !isPaused;
  }

  function handleScroll() {
    let svgHeight = Number(d3.select('#cnn-svg').style('height').replace('px', '')) + 150;
    let scroll = new SmoothScroll('a[href*="#"]', {offset: -svgHeight});
    let anchor = document.querySelector(`#article-convolution`);
    scroll.animateScroll(anchor);
  }

  function handlePauseFromInteraction(event) {
    isPaused = event.detail.isPaused;
  }

  const highlightsUpdateHandler = (event) => {
    const animatedH = event.detail.hoverH;
    const animatedW = event.detail.hoverW;
    let outputMappings = generateOutputMappings(stride, outputFinal, kernel.length, padded_input_size, dilation);
    outputHighlights = array1d(outputFinal.length * outputFinal.length, (i) => false);
    outputHighlights[animatedH * outputFinal.length + animatedW] = true;
    inputHighlights = compute_input_multiplies_with_weight(animatedH, animatedW, padded_input_size, kernel.length, outputMappings, kernel.length);
  }

  function handleClickX() {
    isExited = true;
    dispatch('message', {
      text: isExited
    });
  }
</script>

<style>
  .control-pannel {
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;
  }

  .buttons {
    cursor: pointer;
    position: absolute;
    top: 0px;
    right: 0px;
  }

  .control-button {
    color: gray;
    font-size: 15px;
    opacity: 0.4;
    cursor: pointer;
  }

  .control-button:not(:first-child) {
    margin-left: 5px;
  }

  .annotation {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left : 10px;
    font-size: 12px;
  }

  .annotation > img {
    width: 17px;
    margin-right: 5px;
  }

  .control-button:hover {
    opacity: 0.8;
  }

  .box {
    padding: 5px 15px 10px 15px;
  }

  .container {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .title-text {
    font-size: 1.2em;
    font-weight: 500;
    color: #4a4a4a;
  }
</style>

{#if !isExited}
  <div class="container" id="detailview-container">

    <!-- old stride input -->
    <!-- <div class="columns is-mobile">
      <div class="column is-half is-offset-one-quarter">
        <div class="field is-grouped">
          <p class="control is-expanded">
            <input class="input" type="text" placeholder="Stride" bind:value={stride} />
          </p>
          <p class="control">
            <button class="button is-success" on:click={handleClickPause}>
              Toggle Movement
            </button>
          </p>
        </div>
      </div>
    </div> -->

    <div class="box">

      <div class="control-pannel">

        <div class="title-text">
          Convolution
        </div>

        <div class="buttons">
          <div class="control-button" on:click={handleScroll} title="Jump to article section">
            <i class="fas fa-info-circle"></i>
          </div>

          <div class="play-button control-button" on:click={handleClickPause} title="Play animation">
            {@html isPaused ?
              '<i class="fas fa-play-circle play-icon"></i>' :
              '<i class="fas fa-pause-circle"></i>'}
          </div>

          <div class="delete-button control-button" on:click={handleClickX} title="Close">
            <i class="fas control-icon fa-times-circle"></i>
          </div>
        </div>
      </div>

      <div class="container is-centered">
        <ConvolutionAnimator on:message={handlePauseFromInteraction} 
          on:highlightsUpdate={highlightsUpdateHandler}
          {kernel} image={input} output={outputFinal}
          {stride} {isPaused} {inputHighlights} {outputHighlights}
          {dataRange} {colorScale} {isInputInputLayer} />
      </div>

      <div class="container is-centered">
        <ConvolutionAnimator on:message={handlePauseFromInteraction} 
          on:highlightsUpdate={highlightsUpdateHandler}
          {kernel} image={inputAdver} output={outputAdverFinal}
          {stride} {isPaused} {inputHighlights} {outputHighlights}
          {colorScale} {dataRange} {isInputInputLayer} adversary/>
      </div>

      <div class="annotation">
        <img src='PUBLIC_URL/assets/img/pointer.svg' alt='pointer icon'>
        <div class="annotation-text">
          <span style="font-weight:600">Hover over</span> the matrices to change kernel position.
        </div>
      </div>

    </div>
  </div>
{/if}