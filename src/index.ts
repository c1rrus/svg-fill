import cheerio from 'cheerio';
import Color from 'color';
import through2 from 'through2';
import stream from 'stream';

export default class SvgFill {
  private _fillColor: Color;

  constructor(fillColor: Color | string) {
    this.setFillColor(fillColor);
  }

  setFillColor(fillColor: Color | string) {
    this._fillColor = fillColor instanceof Color ? fillColor : new Color(fillColor);
  }

  getFillColor(): Color {
    return this._fillColor;
  }

  /**
   * Fills all shapes in the SVG with the fill color.
   *
   * Note, this is currently a naive solution that simply adds a fill
   * attribute with the chosen fill color to the SVG element. For SVGs
   * without styling attributes, such as ones to be composed into
   * a symbol sprite, this should work fine. For anything else, the
   * results will be hit and miss.
   *
   * @param svgData A string or buffer containing valid SVG data.
   */
  fillSvg(svgData: Buffer | string): string {
    // Forcing svgData to be "string" for TypeScript's benefit.
    // In actual fact, cheerio.load() does accept Buffers too.
    const $ = cheerio.load(svgData, {xmlMode: true});
    $('svg').attr('fill', this.getFillColor().hex());
    return $.xml();
  }

  /**
   * Returns a transform stream that the SVG data can be
   * piped into. It will output the filled SVG data.
   *
   * Note: This function is primarily for developer convenience.
   * Internally, it waits until the entire SVG data has been received,
   * before doing the transform and outputting it. Therefore, you
   * don't really reap the benefits of streams, as any consumer will be
   * stuck waiting until the full SVG data has been buffered and
   * transformed.
   */
  fillSvgStream(): stream.Transform {
    let svgData: Buffer = undefined;
    let svgFill = this;
    return through2(
      function(chunk, enc, cb) {
        // accumulate data
        if (svgData === undefined) {
          svgData = chunk;
        }
        else {
          svgData = Buffer.concat([svgData, chunk]);
        }
        cb();
      },
      function(cb) {
        // Now fill the SVG and push the result
        this.push(svgFill.fillSvg(svgData));
        cb();
      }
    );
  }
}
