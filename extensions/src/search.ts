// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { getStorageData, setStorageData } from './storage';

// Generate a list of preferred brands that are environmentally conscious and friendly
const PREFERRED_BRANDS = [
  'Uniqlo',
  'MUJI',
  'ITO EN',
  'The Body Shop',
  'Shiseido',
  'Innisfree',
  'Cosrx',
  'H&M Conscious',
  'Etude House',
  'Amorepacific',
  'Tata Power Solar',
  'Himalaya Herbals',
  'Neemrana Hotels',
  'Dabur',
  'Kao Corporation',
  'Lotte Group',
  'BYD',
  'Haier',
  'Samsung',
  'Tencent',
];

function getWrapper(): Element | null {
  try {
    return document.querySelector('.s-search-results');
  } catch (error: Error | unknown) {
    console.error(error);
    return null;
  }
}

// Function to call on product page
const runScriptProductPage = function (wrapper: Element) {
  const cards = wrapper.querySelectorAll(
    'div.sg-col-4-of-12.s-result-item'
  );

  // Loop through the cards and see if the title contains any of the preferred brands
  for (const card of cards) {
    const cardBody = card.querySelector('div[data-cy="title-recipe"]');
    const cardTitle = cardBody.querySelector('div > h2 > span');
    const cardDescription = cardBody.querySelector('h2 > a > span');

    const cardTitleContent = cardTitle.textContent.trim();

    if (cardTitleContent !== null || cardTitleContent !== undefined) {
      const lowercasedCardTitleContent = cardTitleContent?.toLowerCase();

      for (const brand of PREFERRED_BRANDS) {
        if (lowercasedCardTitleContent?.includes(brand.toLocaleLowerCase())) {
          // Prepend the pill to the card
          // Add a pill saying this is a preferred brand
          const pill = document.createElement('div');
          pill.innerHTML = `
                  <div style="color: #528BFF; width: 100%; border-radius: 3px; border: 1px solid #004EEB; white-space: nowrap; display: inline-block; font-size: 0.8em; padding: 0.125rem 0.25rem; text-align: center; margin-bottom: 10px;">
                    <img src="${chrome.runtime.getURL("img/logo-34.png")}" style="height: 10px; width: 10px; margin-right: 5px;" />
                    <span>AquaWise Preferred</span>
                  </div>
                `;
          cardDescription?.prepend(pill);
          cardDescription.style = 'display: flex; flex-direction: column; height: 100%; align-items: start; justify-content: flex-end';
          cardDescription.style = 'flex-grow: 0';
        }
      }
    }
  }
}

const waitFor = function (
  varSetter: (element: Element | null) => boolean,
  sleepTime: number,
  condition: (element: Element | null) => boolean,
  continuation: (element: Element) => void,
) {
  const variable = varSetter();

  if (!condition(variable)) {
    setTimeout(
      () => waitFor(varSetter, sleepTime, condition, continuation),
      sleepTime,
    );
  } else {
    continuation(variable);
  }
};

waitFor(
  getWrapper,
  2500,
  (wrapper: Element | null) => wrapper !== null,
  function (wrapper: Element) {
    // Check if the URL is a product page or search page by inspecting the URL
    try {
      runScriptProductPage(wrapper);
    } catch (err) {
      console.log(err);
    }
  },
);

