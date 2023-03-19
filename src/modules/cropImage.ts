const cropImage = async (
  base64Image: string,
  xOffset: number,
  yOffset: number,
  radius: number
) => {
  const image = await new Promise((res: (value: HTMLImageElement) => void) => {
    const newImage = new Image();
    newImage.addEventListener("load", () => res(newImage));
    newImage.src = base64Image;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) return null;

  const radiusIsInteger = Number.isInteger(radius);
  const centerX = Math.trunc(canvas.width / 2);
  const centerY = Math.trunc(canvas.height / 2);

  const offsetCenterX = centerX + xOffset + (radiusIsInteger ? 0.5 : 0);
  const offsetCenterY = centerY + yOffset + (radiusIsInteger ? 0.5 : 0);

  croppedCanvas.width = croppedCanvas.height = radius * 2;

  const croppedImageData = croppedCtx.createImageData(
    croppedCanvas.width,
    croppedCanvas.height
  );

  const upperWhiteSpace =
    offsetCenterY - radius < 0 ? Math.trunc(radius - offsetCenterY) : 0;
  const lowerWhiteSpace =
    offsetCenterY + radius > canvas.height
      ? offsetCenterY + radius - canvas.height
      : 0;

  const leftWhiteSpace =
    offsetCenterX - radius < 0 ? Math.trunc(radius - offsetCenterX) : 0;
  const rightWhiteSpace =
    offsetCenterX + radius > canvas.width
      ? offsetCenterX + radius - canvas.width
      : 0;

  let croppedIndex = 0;

  for (let y = 0; y < upperWhiteSpace; y++) {
    for (let x = 0; x < croppedCanvas.width; x++) {
      for (let j = 0; j < 4; j++) {
        croppedImageData.data[croppedIndex + j] = 0;
      }
      croppedIndex += 4;
    }
  }

  for (let y = 0; y < canvas.height; y++) {
    const distanceY = Math.abs(offsetCenterY - y);
    if (distanceY > radius) continue;

    for (let x = 0; x < leftWhiteSpace; x++) {
      for (let j = 0; j < 4; j++) {
        croppedImageData.data[croppedIndex + j] = 0;
      }
      croppedIndex += 4;
    }

    for (let x = 0; x < canvas.width; x++) {
      const distanceX = Math.abs(offsetCenterX - x);
      if (distanceX > radius) continue;

      const index = (y * canvas.width + x) * 4;

      if (Math.sqrt(distanceX ** 2 + distanceY ** 2) <= radius) {
        for (let j = 0; j < 4; j++) {
          croppedImageData.data[croppedIndex + j] = imageData.data[index + j];
        }
      } else {
        for (let j = 0; j < 4; j++) {
          croppedImageData.data[croppedIndex + j] = 0;
        }
      }

      croppedIndex += 4;
    }

    for (let x = 0; x < rightWhiteSpace; x++) {
      for (let j = 0; j < 4; j++) {
        croppedImageData.data[croppedIndex + j] = 0;
      }
      croppedIndex += 4;
    }
  }

  for (let y = 0; y < lowerWhiteSpace; y++) {
    for (let x = 0; x < croppedCanvas.width; x++) {
      for (let j = 0; j < 4; j++) {
        croppedImageData.data[croppedIndex + j] = 0;
      }
      croppedIndex += 4;
    }
  }

  croppedCtx.putImageData(croppedImageData, 0, 0);
  return croppedCanvas.toDataURL();
};

export default cropImage;
