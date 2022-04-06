<script>
  /* global d3 */

  import { onMount, createEventDispatcher } from 'svelte';
  import { modalStore } from '../stores.js';

  import ImageReader from './ImageReader.svelte';

  let modalComponent;
  let images = [
    { id: 0, showLoading: false, src: '' },
    { id: 1, showLoading: false, src: '' }
  ]
  const dispatch = createEventDispatcher();

  let modalInfo = {
    show: false
  };
  modalStore.set(modalInfo);
  modalStore.subscribe(value => {modalInfo = value});

  const crossClicked = () => {
    modalInfo.show = false;
    modalStore.set(modalInfo);
    // Dispatch the parent component
    dispatch('xClicked', {preImage: modalInfo.preImage});
  }

  const addClicked = () => {
    images.forEach(d => d.showLoading = true );
    images = images;
  }

  const updateImage = (event) => {
    images[event.detail.index].showLoading = false;
    images[event.detail.index].src = event.detail.src;
    if (images.filter(d => d.src == '').length == 0) {
      modalInfo.show = false;
      modalStore.set(modalInfo);
      dispatch('urlTyped', {urls: images.map(d => d.src)});
    }
  }

  onMount(() => {
    let modal = d3.select(modalComponent)
      .select('#input-modal');
  })

</script>

<style>
  .modal-card {
    max-width: 500px;
  }

  .modal-card-title {
    font-size: 20px;
  }

  .modal-card-head {
    padding: 15px 20px;
  }

  .modal-card-foot {
    padding: 12px 20px;
    justify-content: flex-end;
  }

  .is-smaller {
    font-size: 15px;
    padding: 0.5em 0.8em;
    max-height: 2.2em;
  }

</style>


<div class="modal-component"
  bind:this={modalComponent}>

  <div class="modal"
    id="input-modal"
    class:is-active={modalInfo.show}>

    <div class="modal-background" on:click={crossClicked}></div>

    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Add Input Images</p>
        <button class="delete" aria-label="close" on:click={crossClicked}></button>
      </header>

      <div class="images-reader">
        {#each images as image (image.id)}
          <ImageReader index={image.id} showLoading={image.showLoading} on:upload={updateImage}/>
        {/each}
      </div>

      <footer class="modal-card-foot">

        <div class="button-container">
          <button class="button is-smaller"
            on:click={crossClicked}>
            Cancel
          </button>

          <button class="button is-success is-smaller"
            on:click={addClicked}>
            Add
          </button>
        </div>


      </footer>
    </div>

  </div>

</div>
