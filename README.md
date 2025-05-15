# Batch Blur

## How to build 
1. Download SSD_MobileMetv1 model from https://github.com/justadudewhohacks/face-api.js-models (3 files) into /models directory
2. Setup the TypeScript with Node
3. When possible use Tf with GPU (@tensorflow/tfjs-node) or even with CUDA @tensorflow/tfjs-node-gpu 

### How to run
Don't forget pass path to images directory (see launnch.json)
Run from terminal:
``` bash
blur % npx ts-node ./src/index.ts --inputPath=images --outputPath=blurred
```