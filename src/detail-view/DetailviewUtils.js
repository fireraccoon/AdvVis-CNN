import { matrixSlice } from '../utils/cnn.js';

export function array1d(length, f) {
  return Array.from({length: length}, f ? ((v, i) => f(i)) : undefined);
}

function array2d(height, width, f) {
  return Array.from({length: height}, (v, i) => Array.from({length: width}, f ? ((w, j) => f(i, j)) : undefined));
}

export function generateOutputMappings(stride, output, kernelLength, padded_input_size, dilation) {
  const outputMapping = array2d(output.length, output.length, (i, j) => array2d(kernelLength, kernelLength));
  for (let h_out = 0; h_out < output.length; h_out++) {
    for (let w_out = 0; w_out < output.length; w_out++) {
      for (let h_kern = 0; h_kern < kernelLength; h_kern++) {
        for (let w_kern = 0; w_kern < kernelLength; w_kern++) {
          const h_im = h_out * stride + h_kern * dilation;
          const w_im = w_out * stride + w_kern * dilation;
          outputMapping[h_out][w_out][h_kern][w_kern] = h_im * padded_input_size + w_im;
        }
      }
    }
  }
  return outputMapping;
}

export function compute_input_multiplies_with_weight(hoverH, hoverW, 
                                              padded_input_size, weight_dims, outputMappings, kernelLength) {
  
  const [h_weight, w_weight] = weight_dims;
  const input_multiplies_with_weight = array1d(padded_input_size * padded_input_size);
  for (let h_weight = 0; h_weight < kernelLength; h_weight++) {
    for (let w_weight = 0; w_weight < kernelLength; w_weight++) {
      const flat_input = outputMappings[hoverH][hoverW][h_weight][w_weight];
      if (typeof flat_input === "undefined") continue;
      input_multiplies_with_weight[flat_input] = [h_weight, w_weight];
    }
  }
  return input_multiplies_with_weight;
}

export function getMatrixSliceFromInputHighlights(matrix, highlights, kernelLength) {
  var indices = highlights.reduce((total, value, index) => {
  if (value != undefined) total.push(index);
    return total;
  }, []);
  return matrixSlice(matrix, Math.floor(indices[0] / matrix.length), Math.floor(indices[0] / matrix.length) + kernelLength, indices[0] % matrix.length, indices[0] % matrix.length + kernelLength);
}

export function getMatrixSliceFromOutputHighlights(matrix, highlights) {
  var indices = highlights.reduce((total, value, index) => {
  if (value != false) total.push(index);
    return total;
  }, []);
  return matrixSlice(matrix, Math.floor(indices[0] / matrix.length), Math.floor(indices[0] / matrix.length) + 1, indices[0] % matrix.length, indices[0] % matrix.length + 1);
}

// Edit these values to change size of low-level conv visualization.
export function getVisualizationSizeConstraint(imageLength) {
  let sizeOfGrid = 150;
  let maxSizeOfGridCell = 20;
  return sizeOfGrid / imageLength > maxSizeOfGridCell ? maxSizeOfGridCell : sizeOfGrid / imageLength;
}

export function getDataRange(image) {
  let maxRow = image.map(function(row){ return Math.max.apply(Math, row); });
  let max = Math.max.apply(null, maxRow);
  let minRow = image.map(function(row){ return Math.min.apply(Math, row); });
  let min = Math.min.apply(null, minRow);
  let range = {
    range: 2 * Math.max(Math.abs(min), Math.abs(max)),
    min: min,
    max: max
  };
  return range;
}

export function gridData(image, constraint=getVisualizationSizeConstraint(image.length)) {
  // Constrain grids based on input image size.
  var data = new Array();
  var xpos = 1;
  var ypos = 1;
  var width = constraint;
  var height = constraint;
  for (var row = 0; row < image.length; row++) {
    data.push( new Array() );
    for (var column = 0; column < image[0].length; column++) {
      data[row].push({
        text: Math.round(image[row][column] * 100) / 100,
        row: row,
        col: column,
        x: xpos,
        y: ypos,
        width: width,
        height: height
      })
      xpos += width;
    }
    xpos = 1;
    ypos += height; 
  }
  return data;
}

/**
 * Compute all input indexs with output index
 * (the result is computed with padding).
 * @param {[Number, Number]} outputIndex Index of the output element
 * @param {Number} kernelLength Length of the kernel
 * @param {Number} stride The stride
 * @param {Number} padding The padding
 * @returns {[[Number, Number]]} All input indexs
 */
export const compute_input_index_with_output_index = (outputIndex, kernelLength, stride, padding=0) => {
  console.assert(outputIndex.length === 2, "Input index could be a array of shape 2.");
  let inputIndex_1st = outputIndex.map(d => d * stride);
  return array1d(kernelLength * kernelLength, i => [
    inputIndex_1st[0] + Math.floor(i / kernelLength),
    inputIndex_1st[1] + i % kernelLength
  ]);
}

/**
 * Compute output index with input index
 * (the result is computed with padding).
 * @param {[Number, Number]} inputIndex Index of the 1st element of the input map
 * @param {Number} kernelLength Length of the kernel
 * @param {Number} stride The stride
 * @param {Number} padding The padding
 * @returns {[[Number, Number]]} Index of the output element 
 */
export const compute_output_index_with_input_index = (inputIndex, kernelLength, stride, padding=0) => {
  console.assert(inputIndex.length === 2, "Input index could be a array of shape 2.");
  return [inputIndex];
}

export const get_matrix_slice_from_highlights_index = (image, highlightsIndex) => {
  let kernelLength = Math.sqrt(highlightsIndex.length);
  console.assert(kernelLength % 1 === 0, "Illegal highlights index.");
  return array2d(kernelLength, kernelLength, (i, j) => {
    let curIndex = highlightsIndex[i * kernelLength + j];
    return image[curIndex[0]][curIndex[1]];
  });
}

/**
 * 
 * @param {[[Number]]} diffs 
 * @param {Number} stressBorderMax 
 * @param {Number} stressBorderMin 
 * @returns {[[Number]]}
 */
export const getDeltaStressIndex = (diffs, stressBorderMin, stressBorderMax) => {
  let stressIndex = [];
  diffs.forEach((d, i) => {
    d.forEach((dd, ii) => {
      if (dd <= stressBorderMax && dd > stressBorderMin) {
        stressIndex.push([i, ii]);
      }
    });
  });
  return stressIndex;
}

/**
 * 
 * @param {[[Number]]} originImage 
 * @param {[[Number]]} adversaryImage
 * @returns {[[[Number]], {min: Number, max: Number}]} 
 */
export const get_single_conv_diff_Ranges = (originImage, adversaryImage) => {
  console.assert(adversaryImage.length === originImage.length, "Shapes could be the same.");
  let ranges = { min: Infinity, max: -Infinity };
  return [originImage.map((d, i) => 
    d.map((dd, ii) => {
      let diff = Math.abs(dd - adversaryImage[i][ii]);
      ranges.min = Math.min(ranges.min, diff);
      ranges.max = Math.max(ranges.max, diff);
      return diff;
    })
  ), ranges];
}