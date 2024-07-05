self.onmessage = function(e) {
    const { audioBuffer } = e.data;
  
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const blockAlign = numberOfChannels * bitDepth / 8;
    const byteRate = sampleRate * blockAlign;
  
    const buffer = new ArrayBuffer(44 + audioBuffer.length * numberOfChannels * 2);
    const view = new DataView(buffer);
  
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + audioBuffer.length * numberOfChannels * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, audioBuffer.length * numberOfChannels * 2, true);
  
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        view.setInt16(44 + 2 * (i * numberOfChannels + channel), sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      }
    }
  
    self.postMessage(view.buffer, [view.buffer]);
  
    function writeString(view, offset, string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }
  };
  