/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import { canvasToBlob } from './logo-image';

export const isScreenshotSupported = () => {
  return Boolean(navigator.mediaDevices?.getDisplayMedia);
};

export const captureScreenshot = async () => {
  const options = { video: true, audio: false, preferCurrentTab: true };

  const stream = await navigator.mediaDevices.getDisplayMedia(options);

  try {
    const video = document.createElement('video');

    video.muted = true;
    video.srcObject = stream;

    await video.play();
    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    const blob = await canvasToBlob(canvas, 'image/png');

    return new File(
      [blob],
      `screenshot_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.png`,
      { type: 'image/png' }
    );
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
};
