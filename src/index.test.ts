import SvgFill from './index';
import Color from 'color';
import cheerio from 'cheerio';
import { Buffer } from 'buffer';
import stream from 'stream';
import path from 'path';
import fs from 'fs';

const redHex = '#FF0000';
const redColor = new Color(redHex);
const greenHex = '#00FF00';
const greenColor = new Color(greenHex);

// Example SVG taken from:
// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes
const simpleSvgData = `<?xml version="1.0" standalone="no"?>
<svg width="200" height="250" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>
  <rect x="60" y="10" rx="10" ry="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>
  <circle cx="25" cy="75" r="20" stroke="red" fill="transparent" stroke-width="5"/>
  <ellipse cx="75" cy="75" rx="20" ry="5" stroke="red" fill="transparent" stroke-width="5"/>
  <line x1="10" x2="50" y1="110" y2="150" stroke="orange" stroke-width="5"/>
  <polyline points="60 110 65 120 70 115 75 130 80 125 85 140 90 135 95 150 100 145"
      stroke="orange" fill="transparent" stroke-width="5"/>
  <polygon points="50 160 55 180 70 180 60 190 65 205 50 195 35 205 40 190 30 180 45 180"
      stroke="green" fill="transparent" stroke-width="5"/>
  <path d="M20,230 Q40,205 50,230 T90,230" fill="none" stroke="blue" stroke-width="5"/>
</svg>`;

describe('SvgFill class', () => {
  let svgFill: SvgFill;

  beforeEach(() => {
    svgFill = new SvgFill(redHex);
  });

  it('should create (using a hex string)', () => {
    expect(svgFill).toBeTruthy();
  });

  it('should create (using a Color object)', () => {
    svgFill = new SvgFill('#ff0000');
    expect(svgFill).toBeTruthy();
  });

  it('should expose fill color as Color object', () => {
    const fillColor = svgFill.getFillColor();
    expect(fillColor).toBeInstanceOf(Color);
    expect(fillColor.rgbNumber()).toBe(redColor.rgbNumber());
  });

  it('should let you change the fill color (using a hex string)', () => {
    svgFill.setFillColor(greenHex);
    expect(svgFill.getFillColor().rgbNumber()).toBe(greenColor.rgbNumber());
  });

  it('should let you change the fill color (using a Color object)', () => {
    svgFill.setFillColor(greenColor);
    expect(svgFill.getFillColor().rgbNumber()).toBe(greenColor.rgbNumber());
  });

  describe('fillSvg() (using string)', () => {
    it('should return a string', () => {
      expect(typeof svgFill.fillSvg(simpleSvgData)).toBe('string');
    });

    it('should return a value that matches the snapshot', () => {
      expect(svgFill.fillSvg(simpleSvgData)).toMatchSnapshot();
    });

    it('should set the fill color on the SVG element', () => {
      const filledSvgData = svgFill.fillSvg(simpleSvgData);
      const $ = cheerio.load(filledSvgData, { xmlMode: true });
      expect($('svg').attr('fill')).toBe(redColor.hex());
    });
  });

  describe('fillSvg() (using Buffer)', () => {
    const simpleSvgBuffer = new Buffer(simpleSvgData);

    it('should return a string', () => {
      expect(typeof svgFill.fillSvg(simpleSvgBuffer)).toBe('string');
    });

    it('should return a value that matches the snapshot', () => {
      expect(svgFill.fillSvg(simpleSvgBuffer)).toMatchSnapshot();
    });

    it('should set the fill color on the SVG element', () => {
      const filledSvgData = svgFill.fillSvg(simpleSvgBuffer);
      const $ = cheerio.load(filledSvgData, { xmlMode: true });
      expect($('svg').attr('fill')).toBe(redColor.hex());
    });
  });

  describe('fillSvgStream()', () => {
    const testFilePath = path.resolve(__dirname, '..', 'test', 'test-star.svg');

    it('should return a stream', () => {
      expect(svgFill.fillSvgStream()).toBeInstanceOf(stream.Stream);
    });

    xit('should process SVG data that is piped in', (done) => {
      let filledSvgData: Buffer = undefined;
      fs.createReadStream(testFilePath, {
        highWaterMark: 1024 // Ensure our test file is broken into multiple chunks
      })
        .pipe(svgFill.fillSvgStream())
        .on('data', function(chunk){
          if (filledSvgData === undefined) {
            filledSvgData = chunk;
          }
          else {
            filledSvgData = Buffer.concat([filledSvgData, chunk]);
          }
        })
        .on('end', function(){
          const $ = cheerio.load(filledSvgData, { xmlMode: true });
          expect($('svg').attr('fill')).toBe(redColor.hex());
          done();
        });
    });
  });
});
