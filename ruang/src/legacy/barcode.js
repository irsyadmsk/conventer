// @ts-nocheck
/**
 * Barcode & QR Code Generator - 100% Offline & Standalone
 * Muhammad Irsyad Sirojul Khoeir - irsyads.com
 */

const BarcodeGenerator = {
  // --- CODE 128 BARCODE GENERATOR (Canvas Native) ---
  drawBarcode128: (canvas, text) => {
    if (!text) return false;
    const ctx = canvas.getContext('2d');
    
    // Code 128 Pattern Table (Subset B)
    const patterns = [
      "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
      "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
      "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
      "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
      "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
      "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
      "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
      "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
      "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
      "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
      "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
    ];

    const START_B = 104;
    const STOP = 106;
    let checksum = START_B;
    const values = [START_B];

    for (let i = 0; i < text.length; i++) {
      let code = text.charCodeAt(i) - 32;
      if (code < 0 || code > 95) code = 0;
      values.push(code);
      checksum += code * (i + 1);
    }
    values.push(checksum % 103);
    values.push(STOP);

    let patternStr = "";
    for (const val of values) {
      patternStr += patterns[val];
    }

    const barWidth = 2;
    const totalBars = patternStr.split('').reduce((sum, n) => sum + parseInt(n), 0);
    const padding = 24;
    canvas.width = totalBars * barWidth + padding * 2;
    canvas.height = 110;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x = padding;
    ctx.fillStyle = '#14183e';
    for (let i = 0; i < patternStr.length; i++) {
      const width = parseInt(patternStr[i]) * barWidth;
      if (i % 2 === 0) {
        ctx.fillRect(x, 15, width, 65);
      }
      x += width;
    }

    ctx.font = '13px "DM Mono", monospace';
    ctx.fillStyle = '#4f5573';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, 98);
    return true;
  },

  // --- QR CODE GENERATOR (100% Offline & Synchronous Canvas Renderer) ---
  drawQRCode: (canvas, text) => {
    if (!text || !canvas) return false;
    const ctx = canvas.getContext('2d');

    if (typeof QRCode !== 'undefined') {
      try {
        let tempDiv = document.getElementById('__temp_qr_holder');
        if (!tempDiv) {
          tempDiv = document.createElement('div');
          tempDiv.id = '__temp_qr_holder';
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.top = '-9999px';
          document.body.appendChild(tempDiv);
        }
        tempDiv.innerHTML = '';

        const qrInstance = new QRCode(tempDiv, {
          text: text,
          width: 256,
          height: 256,
          colorDark: "#14183e",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });

        // Direct synchronous module matrix drawing (Crisp, instant, zero timeout delay)
        if (qrInstance && qrInstance._oQRCode) {
          const model = qrInstance._oQRCode;
          const count = model.getModuleCount();
          const targetSize = 260;
          const padding = 16;
          const cellSize = (targetSize - padding * 2) / count;

          canvas.width = targetSize;
          canvas.height = targetSize;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetSize, targetSize);

          ctx.fillStyle = '#14183e';
          for (let r = 0; r < count; r++) {
            for (let c = 0; c < count; c++) {
              if (model.isDark(r, c)) {
                const x = Math.round(padding + c * cellSize);
                const y = Math.round(padding + r * cellSize);
                const w = Math.ceil(cellSize);
                const h = Math.ceil(cellSize);
                ctx.fillRect(x, y, w, h);
              }
            }
          }
          return true;
        }

        const internalCanvas = tempDiv.querySelector('canvas');
        if (internalCanvas) {
          canvas.width = 260;
          canvas.height = 260;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 260, 260);
          ctx.drawImage(internalCanvas, 10, 10, 240, 240);
          return true;
        }
      } catch (err) {
        console.warn('QR Code generation error:', err);
      }
    }

    // Fallback: draw placeholder
    canvas.width = 240;
    canvas.height = 240;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 240, 240);
    ctx.fillStyle = '#14183e';
    ctx.font = '13px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code Generator', 120, 110);
    ctx.font = '11px "DM Mono", monospace';
    ctx.fillText(text.slice(0, 25), 120, 135);
    return true;
  }
};

export default BarcodeGenerator;
