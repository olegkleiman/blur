import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import minimist from 'minimist';
import { Jimp, JimpMime } from 'jimp';
import { Canvas, Image, ImageData } from 'canvas';
import * as faceapi from 'face-api.js';


faceapi.env.monkeyPatch({ Canvas: Canvas as any, Image: Image as any, ImageData: ImageData as any }); // Cast to any for type compatibility

async function loadModels() {
    // Path to the downloaded models directory
    // Assumes models are in /Users/oleg/dev/sources/blur/models/
    const modelsPath = path.join(__dirname, '../models'); 
    try {
        console.log(`Loading models from: ${modelsPath}`);
        // Load the SSD MobileNetV1 face detection model
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
        // You can load other models as needed (e.g., for face landmarks, recognition)
        // await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
        // await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
        console.log("Face detection models loaded successfully.");
    } catch (error) {
        console.error("Error loading models:", error);
        throw error; // Re-throw to stop execution if models can't be loaded
    }
}

// (../<parent>/images/person0.jpg, 'blurred') => ../<parent>/blured/person0-blured.jpg
const getDestinationFilePath = (originalPath: string, outputDir: string) => {
    var dir = path.dirname(originalPath)
    const segments = dir.split(path.sep);
    segments[segments.length - 1] = outputDir;
    dir = segments.join(path.sep);
    var ext = path.extname(originalPath)
    ext = ext.replace(/^\./, '');
    var base = path.basename(originalPath, ext)
    base = base.replace(/\.$/, '');
    
    return { 
            path: path.join(dir, `${base}-${outputDir}`), 
            ext: ext 
    }
}

// central function
// executed for each input image
const blurImage = async (filePath: string, outputDir: string) => {

    console.log(`Processing ${filePath}`);
    let image = await Jimp.read(filePath);

    // 1. Get buffer from Jimp image
    const imageBuffer = await image.getBuffer(JimpMime.jpeg);

    // 2. Create a canvas.Image from the buffer
    const canvasImage = new Image();

    // The 'onload' and 'onerror' handlers are good practice for robustness
    await new Promise<void>((resolve, reject) => {
        canvasImage.onload = () => resolve();
        canvasImage.onerror = (err) => reject(err);
        canvasImage.src = imageBuffer;
    });

    // Convert canvas.Image to HTMLCanvasElement for face-api.js
    const nodeCanvasElement = new Canvas(canvasImage.width, canvasImage.height);
    const ctx = nodeCanvasElement.getContext('2d');
    if (ctx) {
        ctx.drawImage(canvasImage, 0, 0, canvasImage.width, canvasImage.height);
    }

    const detections = await faceapi.detectAllFaces(nodeCanvasElement as any, 
                                                    new faceapi.SsdMobilenetv1Options());
    if (detections.length > 0) {
        console.log(`\tDetected ${detections.length} faces in ${filePath}`)
        detections.forEach( async(detection) => {
            const { x, y, width, height } = detection.box;
            console.log(`\tx: ${x}, y: ${y}, width: ${width}, height: ${height}`)
                const pixelationOptions = { 
                    size: 40,
                    x: x,
                    y: y,
                    w: width,
                    h: height
            };

            const { path, ext } = getDestinationFilePath(filePath, "blurred");
            console.log(`\t\tOutput file name: ${path}.${ext}`)

            await image.pixelate(pixelationOptions)
            .write(`${path}.${ext}`); // ${path}.${ext}`)

        })
    }

    console.log(`\tProcessed: ${filePath}`);
};

const args = minimist(process.argv.slice(2));

(async () => {
    const imagesDir = args.inputPath;
    const outputDir = args.outputPath;

    try {
        await loadModels();

        //
        // Prepare directories
        //
        if( !fs.existsSync(imagesDir) ) {
            console.log(`Input directory does not exist: ${imagesDir}`);
            process.exit(1);
        }

        if( !fs.existsSync(outputDir) ) {
            console.log(`Output directory does not exist`);
        }

        const mkdir = promisify(fs.mkdir);

        await mkdir(outputDir, { recursive: true });

        //
        // Enumerate files in input directory
        //
        const readdir = promisify(fs.readdir);
        const files = await readdir(imagesDir);
        const images = files.filter( file => path.extname(file) === '.jpg' 
                                            || path.extname(file) === '.jpeg' 
                                            || path.extname(file) === '.png' )
        console.log(`${images.length} image files found in ${imagesDir}`);
        
        //
        // create task for each file
        //
        var tasks = images.map(
            name => blurImage(path.join(imagesDir, name), outputDir) // the task will be a call to blurImage() function
        )
        //
        // execute all tasks
        //
        await Promise.all(tasks)

    } catch(err) {
        console.error(err);
    }
})()

