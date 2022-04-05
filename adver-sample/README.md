# Attack a model

This directory includes code and data to attack a CNN model.

## Installation

First, you want to unzip `data.zip`. The file structure would be something like:

```text
.
├── data
│   ├── origin
│   │   └── *_(\d).jpeg [image examples use for the website]
│   └── class_dict_10.json
├── adver-sample.ipynb
├── data.zip
└── requirements.txt
```

To install all dependencies, run the following code

```sh
pip3 install -r requirements.txt
```

## Preparation

1. You could prepare a CNN model or run the project in `/tiny-vgg` to get one.
2. Put it in the directory and rename it to `model.h5`.

## Attacking

To attack the model and get some adversarial samples, run the following code

```sh
ipython -c "%run adver-sample.ipynb"
```

After attacking, you will get some adversarial samples in the path `data/adversary`.
You can use these for CNN Explainer.
For examples, put these in `/public/assets/img/adversary`
