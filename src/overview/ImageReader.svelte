<script>

    import { createEventDispatcher } from 'svelte';
  
    export let index;
    export let showLoading = false;
  
    let valiImg;
    let inputValue = '';
    let files;
    let usingURL = true;
    let statusInfo = {
      show: false,
      type: 1,
      message: ''
    };
    
    const ERROR_TYPE = 0;
    const SUCCESS_TYPE = 1;
    const IMAGE_TYPE = index == 0 ? "original" : "adversarial";
  
    const dispatch = createEventDispatcher();
  
    $ : showLoading ? readImage() : undefined
  
    const imageUpload = () => {
      usingURL = false;
      let reader = new FileReader();
      reader.onload = (event) => {
        valiImg.src = event.target.result;
      }
      reader.readAsDataURL(files[0]);
    }
  
    const readImage = () => {
      // Validate the input URL
      statusInfo.show = false;
      valiImg.crossOrigin = "Anonymous";
      valiImg.src = inputValue;
    }
  
    const errorCallback = () => {
      // The URL is invalid, show an error message on the UI
      showLoading = false;
      statusInfo.show = true;
      statusInfo.type = ERROR_TYPE;
      statusInfo.message = usingURL ? `We can't find the ${IMAGE_TYPE} image at that URL.` :
        `Not a valid ${IMAGE_TYPE} image file.`;
      dispatch('upload', {src: '', index: index});
    }
  
    const loadCallback = () => {
      // The URL is valid, but we are not sure if loading it to canvas would be
      // blocked by crossOrigin setting. Try it here before dispatch to parent.
  
      // https://stackoverflow.com/questions/13674835/canvas-tainted-by-cross-origin-data
      let canvas = document.createElement("canvas");
      let context = canvas.getContext("2d");
  
      canvas.width = valiImg.width;
      canvas.height = valiImg.height;
      context.drawImage(valiImg, 0, 0);
  
      try {
        context.getImageData(0, 0, valiImg.width, valiImg.height);
        // If the foreign image does support CORS -> use this image
        // dispatch to parent component to use the input image
        showLoading = false;
        statusInfo.show = true;
        statusInfo.type = SUCCESS_TYPE;
        statusInfo.message = `${IMAGE_TYPE[0].toUpperCase() + IMAGE_TYPE.substring(1)} image upload complete!`
        dispatch('upload', {src: valiImg.src, index: index});
        inputValue = null;
      } catch(err) {
        // If the foreign image does not support CORS -> use this image
        showLoading = false;
        statusInfo.show = true;
        statusInfo.type = ERROR_TYPE;
        statusInfo.message = `No permission to load this ${IMAGE_TYPE} image.`
        dispatch('upload', {src: '', index: index});
      }
    }
  
  </script>
  
  <style>
  
    .modal-card-body {
      padding-bottom: 0px;
    }
  
    .modal-card-body:not(:first-child) {
      padding-top: 5px;
    }
  
    .small-font {
      font-size: 15px;
    }
  
    .control {
      width: 100%;
    }
  
    .or-label {
      font-size: 15px;
      margin: 0 10px;
      padding: 0.5em 0;
    }
  
    .field {
      display: flex;
      justify-content: space-between;
      margin: 0 !important;
    }
  
    .error-message {
      font-size: 15px;
      color: #F22B61;
    }
  
    .success-message {
      font-size: 15px;
      color: #39cf20;
    }
  
  </style>
  
  <section class="modal-card-body">
  
    <div class="field">
  
      <div class="control has-icons-left" class:is-loading={showLoading}>
        <input class="input small-font" type="url"
          bind:value={inputValue} placeholder="Paste URL of {IMAGE_TYPE} image..." />
  
        <span class="icon small-font is-left">
          <i class="fas fa-link" />
        </span>
      </div>
  
      <div class="or-label">or</div>
  
      <div class="file">
        <label class="file-label">
  
          <input class="file-input" type="file" name="image"
            accept=".png,.jpeg,.tiff,.jpg,.png" bind:files on:change={imageUpload} />
  
          <span class="file-cta small-font">
            <span class="file-icon">
              <i class="fas fa-upload" />
            </span>
  
            <span class="file-label"> Upload </span>
          </span>
  
        </label>
  
      </div>
  
    </div>
  
    <div class={statusInfo.type == ERROR_TYPE ? "error-message" : "success-message"}
      class:hidden={!statusInfo.show}>
      {statusInfo.message ? statusInfo.message : '&#nbsp;'}
    </div>
  
    <!-- An invisible image to check if the user input URL is valid -->
    <img style="display: none"
      id="vali-image"
      alt="hidden image"
      bind:this={valiImg}
      on:error={errorCallback}
      on:load={loadCallback} />
  
  </section>
  