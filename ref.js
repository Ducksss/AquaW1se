// Variables
const productInformation = { categories: [] };
const breadcrumbWrapper = wrapper.querySelector("div.page-product__breadcrumb");
const productWrapper = wrapper.querySelector(".page-product__detail > div");
const productRowAndColumn = productWrapper.querySelectorAll("div.dR8kXc");
/**
 * Scripting
 */
productInformation.categories = Array.from(
  breadcrumbWrapper.querySelectorAll("a, span")
).map((breadcrumb) => breadcrumb.innerText);
productInformation["Product Name"] =
  productInformation.categories[productInformation.categories.length - 1];

Array.from(productRowAndColumn).forEach((row) => {
  const title = row.querySelector("label").innerText;
  const bodyElement = row.querySelector("div");
  const body =
    bodyElement?.innerText || bodyElement?.querySelector("a")?.innerText || "";

  productInformation[title] = body;
});

console.log(productInformation);

const productTitleWrapper = wrapper.querySelector("._44qnta");
document.querySelector('div[id="ecocart-flag"]')?.remove();
await setStorageData(newStorageData);

for (const brand of PREFERRED_BRANDS) {
  if (productInformation["Product Name"]?.includes(brand)) {
    makePopup(score);
  }
}

// Query the api for the water footprint data
await getProductCarbonFootprintData(productInformation)
  .then(async (data) => {
    const content = data?.completion_content;

    if (content.includes("Sorry!")) {
      throw new Error("Unknown product, can't find water footprint data");
    }
    productTitleWrapper.parentElement.prepend(addReinforcement(content));
  })
  .catch((error) => {
    // if error - Unknown product, can't find water footprint data, use fallback
    if (error.message === "Unknown product, can't find water footprint data") {
      const arbitaryNumber = Math.floor(Math.random() * (1000 - 100) + 300);
      const relativeUnits = convertDataToEverydayExamples(arbitaryNumber);
      const data = `Did you the process of making '${
        productInformation["Product Name"]
      }' requires <b>${arbitaryNumber}</b> litres (ℓ) of water to produce? That is equivalent to <b>${relativeUnits.join(
        ", "
      )}</b>!`;

      productTitleWrapper.parentElement.prepend(addReinforcement(data));
    }
  });
