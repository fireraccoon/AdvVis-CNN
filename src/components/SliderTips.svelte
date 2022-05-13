<script>
  export let stressRanges;
  export let stressBounder;

  let textFormatter = d3.format(".4f");
</script>

<style>

  .self-label {
    border: 2px solid var(--green);
    font-size: .8em;
  }

  .contrast-label {
    border: 2px solid var(--red);
    font-size: .8em;
  }

  .self-legend {
    width: .8em;
    height: .8em;
    display: inline-block;
    background-color: var(--green);
  }

  .contrast-legend {
    width: .8em;
    height: .8em;
    display: inline-block;
    background-color: var(--red);
  }

</style>

<div class="is-flex is-align-items-center">
  <div class="self-legend"></div>
  <span>self &nbsp;&nbsp;</span> 
  <div class="contrast-legend"></div>
  <span>contrast : &nbsp;&nbsp;</span>
  <span>
    |
    <span class="self-label">self</span>
    - 
    <span class="contrast-label">contrast</span>
    | {stressRanges[0] === 0 ? '>': stressBounder === stressRanges[0] ? '>=' : '>'}
    {textFormatter(stressBounder)}
  </span>
</div>
