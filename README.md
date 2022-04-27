# AdvVis CNN

An interactive visualization system designed to help non-experts learn about the Manifestation of Adversarial Examples on Convolutional Neural Networks (CNNs).

[![build](https://github.com/fireraccoon/AdvVis-CNN/workflows/build/badge.svg)](https://github.com/fireraccoon/AdvVis-CNN/actions)

## Live Demo

For a live demo, visit: https://advvis-cnn.raccooncc.top/

## Running Locally

Clone or download this repository:

```bash
git clone git@github.com:fireraccoon/AdvVis-CNN.git

# use degit if you don't want to download commit histories
degit fireraccoon/AdvVis-CNN
```

Install the dependencies:

```bash
npm install
```

Then run AdvVis CNN:

```bash
npm run dev
```

Navigate to [localhost:5000](https://localhost:5000). You should see AdvVis CNN running in your broswer :).

To see how to train the CNN, visit the directory [`./tiny-vgg/`](tiny-vgg).
To see how to attack for the adversarial samples, visit the directory [`./adver-sample/`](adver-sample).

## Credits

**AdvVis CNN** is based on [CNN Explainer](https://github.com/poloclub/cnn-explainer), and was created by [fireraccoon](https://github.com/fireraccoon).

## License

The software is available under the [MIT License](https://github.com/fireraccoon/AdvVis-CNN/blob/master/LICENSE).

## Contact

If you have any questions, feel free to [open an issue](https://github.com/fireraccoon/AdvVis-CNN/pulls) or contact [fireraccoon](mailto:raccooncctop@163.com).
