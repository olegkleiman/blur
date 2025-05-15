"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var util_1 = require("util");
var minimist_1 = require("minimist");
var jimp_1 = require("jimp");
var canvas_1 = require("canvas");
var faceapi = require("face-api.js");
faceapi.env.monkeyPatch({ Canvas: canvas_1.Canvas, Image: canvas_1.Image, ImageData: canvas_1.ImageData }); // Cast to any for type compatibility
function loadModels() {
    return __awaiter(this, void 0, void 0, function () {
        var modelsPath, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    modelsPath = path.join(__dirname, '../models');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log("Loading models from: ".concat(modelsPath));
                    // Load the SSD MobileNetV1 face detection model
                    return [4 /*yield*/, faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath)];
                case 2:
                    // Load the SSD MobileNetV1 face detection model
                    _a.sent();
                    // You can load other models as needed (e.g., for face landmarks, recognition)
                    // await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
                    // await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
                    console.log("Face detection models loaded successfully.");
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error loading models:", error_1);
                    throw error_1; // Re-throw to stop execution if models can't be loaded
                case 4: return [2 /*return*/];
            }
        });
    });
}
// (../<parent>/images/person0.jpg, 'blurred') => ../<parent>/blured/person0-blured.jpg
var getDestinationFilePath = function (originalPath, outputDir) {
    var dir = path.dirname(originalPath);
    var segments = dir.split(path.sep);
    segments[segments.length - 1] = outputDir;
    dir = segments.join(path.sep);
    var ext = path.extname(originalPath);
    ext = ext.replace(/^\./, '');
    var base = path.basename(originalPath, ext);
    base = base.replace(/\.$/, '');
    return {
        path: path.join(dir, "".concat(base, "-").concat(outputDir)),
        ext: ext
    };
};
// central function
// executed for each input image
var blurImage = function (filePath, outputDir) { return __awaiter(void 0, void 0, void 0, function () {
    var image, imageBuffer, canvasImage, nodeCanvasElement, ctx, detections;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Processing ".concat(filePath));
                return [4 /*yield*/, jimp_1.Jimp.read(filePath)];
            case 1:
                image = _a.sent();
                return [4 /*yield*/, image.getBuffer(jimp_1.JimpMime.jpeg)];
            case 2:
                imageBuffer = _a.sent();
                canvasImage = new canvas_1.Image();
                // The 'onload' and 'onerror' handlers are good practice for robustness
                return [4 /*yield*/, new Promise(function (resolve, reject) {
                        canvasImage.onload = function () { return resolve(); };
                        canvasImage.onerror = function (err) { return reject(err); };
                        canvasImage.src = imageBuffer;
                    })];
            case 3:
                // The 'onload' and 'onerror' handlers are good practice for robustness
                _a.sent();
                nodeCanvasElement = new canvas_1.Canvas(canvasImage.width, canvasImage.height);
                ctx = nodeCanvasElement.getContext('2d');
                if (ctx) {
                    ctx.drawImage(canvasImage, 0, 0, canvasImage.width, canvasImage.height);
                }
                return [4 /*yield*/, faceapi.detectAllFaces(nodeCanvasElement, new faceapi.SsdMobilenetv1Options())];
            case 4:
                detections = _a.sent();
                if (detections.length > 0) {
                    console.log("\tDetected ".concat(detections.length, " faces in ").concat(filePath));
                    detections.forEach(function (detection) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, x, y, width, height, pixelationOptions, _b, path, ext;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _a = detection.box, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
                                    console.log("\tx: ".concat(x, ", y: ").concat(y, ", width: ").concat(width, ", height: ").concat(height));
                                    pixelationOptions = {
                                        size: 40,
                                        x: x,
                                        y: y,
                                        w: width,
                                        h: height
                                    };
                                    _b = getDestinationFilePath(filePath, "blurred"), path = _b.path, ext = _b.ext;
                                    console.log("\t\tOutput file name: ".concat(path, ".").concat(ext));
                                    return [4 /*yield*/, image.pixelate(pixelationOptions)
                                            .write("".concat(path, ".").concat(ext))];
                                case 1:
                                    _c.sent(); // ${path}.${ext}`)
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                }
                console.log("\tProcessed: ".concat(filePath));
                return [2 /*return*/];
        }
    });
}); };
var args = (0, minimist_1.default)(process.argv.slice(2));
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var imagesDir, outputDir, mkdir, readdir, files, images, tasks, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                imagesDir = args.inputPath;
                outputDir = args.outputPath;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, loadModels()];
            case 2:
                _a.sent();
                //
                // Prepare directories
                //
                if (!fs.existsSync(imagesDir)) {
                    console.log("Input directory does not exist: ".concat(imagesDir));
                    process.exit(1);
                }
                if (!fs.existsSync(outputDir)) {
                    console.log("Output directory does not exist");
                }
                mkdir = (0, util_1.promisify)(fs.mkdir);
                return [4 /*yield*/, mkdir(outputDir, { recursive: true })];
            case 3:
                _a.sent();
                readdir = (0, util_1.promisify)(fs.readdir);
                return [4 /*yield*/, readdir(imagesDir)];
            case 4:
                files = _a.sent();
                images = files.filter(function (file) { return path.extname(file) === '.jpg'
                    || path.extname(file) === '.jpeg'
                    || path.extname(file) === '.png'; });
                console.log("".concat(images.length, " image files found in ").concat(imagesDir));
                tasks = images.map(function (name) { return blurImage(path.join(imagesDir, name), outputDir); } // the task will be a call to blurImage() function
                );
                //
                // execute all tasks
                //
                return [4 /*yield*/, Promise.all(tasks)];
            case 5:
                //
                // execute all tasks
                //
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                err_1 = _a.sent();
                console.error(err_1);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); })();
