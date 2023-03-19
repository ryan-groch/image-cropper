import cropImage from "./modules/cropImage";

(() => {
  let originalImgSrc = "";
  let imgSrc = "";

  const inputImage = document.querySelector<HTMLInputElement>("#input-img");
  const currentImage = document.querySelector<HTMLImageElement>("#current-img");
  const cropControls = document.querySelector<HTMLElement>("#crop-controls");

  if (!inputImage || !currentImage || !cropControls) return;

  const originalW = document.querySelector<HTMLElement>("#original-width");
  const originalH = document.querySelector<HTMLElement>("#original-height");
  const widthElement = document.querySelector<HTMLElement>("#width");
  const heightElement = document.querySelector<HTMLElement>("#height");

  inputImage.addEventListener("change", () => {
    const file = inputImage.files ? inputImage.files[0] : null;
    if (!file) {
      cropControls.classList.add("hidden");
      currentImage.classList.add("hidden");
      originalW?.classList.add("hidden");
      originalH?.classList.add("hidden");
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", (event) => {
      const result = event.target?.result;
      if (!result || typeof result !== "string") return;

      currentImage.src = imgSrc = originalImgSrc = result;
      if (imgSrc) {
        cropControls.classList.remove("hidden");
        currentImage.classList.remove("hidden");

        if (!originalW || !originalH) return;

        const dummyImage = new Image();
        dummyImage.addEventListener("load", () => {
          originalW.textContent = `Original Width: ${dummyImage.width}`;
          originalH.textContent = `Original Height: ${dummyImage.height}`;
          originalW.classList.remove("hidden");
          originalH.classList.remove("hidden");

          if (!widthElement || !heightElement) return;
          widthElement.textContent = `Width: ${dummyImage.width}`;
          heightElement.textContent = `Height: ${dummyImage.height}`;
        });
        dummyImage.src = imgSrc;
      }
    });

    reader.readAsDataURL(file);
  });

  const xOffsetInput = document.querySelector<HTMLInputElement>("#x-offset");
  const yOffsetInput = document.querySelector<HTMLInputElement>("#y-offset");
  const radiusInput = document.querySelector<HTMLInputElement>("#radius");
  const cropButton = document.querySelector<HTMLButtonElement>("#crop");
  const downloadButton = document.querySelector<HTMLButtonElement>("#download");

  if (!xOffsetInput || !yOffsetInput || !radiusInput) return;

  cropButton?.addEventListener("click", async () => {
    const xOffset = xOffsetInput.valueAsNumber;
    const yOffset = yOffsetInput.valueAsNumber;
    const radius = radiusInput.valueAsNumber;
    for (const val of [xOffset, yOffset, radius]) {
      if (Number.isNaN(val) || val % 0.5) return;
    }

    if (radius <= 0) return;

    currentImage.src = imgSrc =
      (await cropImage(originalImgSrc, xOffset, yOffset, radius)) ?? "";

    const dummyImage = new Image();
    dummyImage.addEventListener("load", () => {
      if (!widthElement || !heightElement) return;
      widthElement.textContent = `Width: ${dummyImage.width}`;
      heightElement.textContent = `Height: ${dummyImage.height}`;
    });
    dummyImage.src = imgSrc;
  });

  downloadButton?.addEventListener("click", () => {
    if (!imgSrc) return;

    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = "cropped-image.png";
    document.body.appendChild(link);
    link.click();
  });
})();
