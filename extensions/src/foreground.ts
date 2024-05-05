// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
console.info('chrome-ext template-vanilla-js content script');

import axios from 'axios';
import { setStorageData, getStorageData } from './storage';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
// Switch for the popup
let activePopup = false;
let counter = 0;
let theNewssite, haveNetflix, theSport, theHobby;

interface ProductInformation {
  title: string;
  category: string[];
  overview: { [key: string]: string }[];
  features: string[][];
  technicalDetails: { [key: string]: string }[];
  ships_from: string;
  ships_to: string;
}

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

const INSPIRATIONAL_ENIVORNMENTAL_QUOTES = [
  {
    quote:
      'The greatest threat to our planet is the belief that someone else will save it.',
    author: 'Robert Swan',
  },
  {
    quote:
      "There is sufficiency in the world for man's need but not for man's greed.",
    author: 'Mohandas K. Gandhi',
  },
  {
    quote:
      'Nature provides a free lunch, but only if we control our appetites.',
    author: 'William Ruckelshaus',
  },
  {
    quote: 'We never know the worth of water till the well is dry.',
    author: 'Thomas Fuller',
  },
  {
    quote:
      'The sun, the moon and the stars would have disappeared long ago... had they happened to be within the reach of predatory human hands.',
    author: 'Havelock Ellis',
  },
  {
    quote: 'The earth is what we all have in common.',
    author: 'Wendell Berry',
  },
  {
    quote:
      'The environment is where we all meet; where all have a mutual interest; it is the one thing all of us share.',
    author: 'Lady Bird Johnson',
  },
  {
    quote: 'We won’t have a society if we destroy the environment.',
    author: 'Margaret Mead',
  },
  {
    quote: 'The environment is everything that isn’t me.',
    author: 'Albert Einstein',
  },
  {
    quote:
      'The environment and the economy are really both two sides of the same coin. If we cannot sustain the environment, we cannot sustain ourselves.',
    author: 'Wangari Maathai',
  },
];

chrome.storage.local.get('newsSite', (data) => {
  if (chrome.runtime.lastError) {
    return;
  }
  theNewssite = data.newsSite;
});

chrome.storage.local.get('netFlix', (data) => {
  if (chrome.runtime.lastError) {
    return;
  }
  haveNetflix = data.netFlix;
});

chrome.storage.local.get('mySport', (data) => {
  if (chrome.runtime.lastError) {
    return;
  }
  theSport = data.mySport;
});

chrome.storage.local.get('myHobby', (data) => {
  if (chrome.runtime.lastError) {
    return;
  }
  theHobby = data.myHobby;
});

const makePopup = function (score: number) {
  // Check if element exists, otherwise make one
  let alertPopup = document.getElementById('alertPopup');
  if (alertPopup) document.getElementById('alertPopup').remove();

  alertPopup = document.createElement('div');
  alertPopup.setAttribute('id', 'alertPopup');

  document.body.prepend(alertPopup);
  document.documentElement.classList.add('alertedPopup');

  // This would be so much easier with jQuery but lets not load a whole library to do one thing
  // $(alertPopup).load("theHtmlFile.html"); though
  const request = new XMLHttpRequest();

  // eslint-disable-next-line no-undef
  request.open('GET', chrome.runtime.getURL('overlay.html'), true);
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      alertPopup.innerHTML = request.responseText;
      genPopup(alertPopup, score);
    }
  };

  request.send();

  const genPopup = function (elem, score) {
    const { quote, author } =
      INSPIRATIONAL_ENIVORNMENTAL_QUOTES[
        Math.floor(Math.random() * INSPIRATIONAL_ENIVORNMENTAL_QUOTES.length)
      ];
    const populateNav = function (theNav) {
      if (theNav) {
        if (haveNetflix)
          theNav.innerHTML += '<a href="http://netflix.com">Netflix</a>';
        theNav.innerHTML += newsLink(theNewssite);
        theNav.innerHTML +=
          '<span>' +
          theSport[0].toUpperCase() +
          theSport.substring(1) +
          '</span>';
        theNav.innerHTML +=
          '<span>' +
          theHobby[0].toUpperCase() +
          theHobby.substring(1) +
          '</span>';
      }

      function newsLink(theNewssite) {
        let link;
        switch (theNewssite) {
          case 'gnn':
            link =
              '<a href="http://www.goodnewsnetwork.org">Good News Network</a>';
            break;
          case 'pn':
            link = '<a href="http://www.positive.news">Positive News</a>';
            break;
          case 'od':
            link = '<a href="http://www.optimistdaily.com">Optimist Daily</a>';
            break;
          case 'reddit':
            link =
              '<a href="http://reddit.com/r/UpliftingNews">r/UpliftingNews</a>';
            break;
          default:
            link = '';
            break;
        } //switch
        return link;
      }
    };
    // score should range from -0.5 to 0.5 (normalized)
    // lower is worse, if 100% turn off
    // go back to [0, 1] then subtract
    // populateNav(elem.querySelectorAll('.popupContent nav')[0]);

    let close1 = elem.querySelectorAll('.popupContent .cls')[0];
    let close2 = elem.querySelectorAll('.popupContent .fx')[0];

    elem.querySelectorAll('.popupContent .vIq')[0].innerHTML = quote;
    elem.querySelectorAll('.popupContent .vIqAuthor')[0].innerHTML =
      ' - ' + author;

    close1.style.visibility = 'hidden';
    setTimeout(function () {
      close1.style.visibility = 'visible';
      close2.style.visibility = 'hidden';
    }, 0); //10s timer

    // Bind events
    close1.addEventListener('click', removePopup);
    close2.addEventListener('click', forceClosePopup);

    if (document.getElementsByClassName('petalbloom')[0] === undefined) return;
    // Kill some plants yo
    killFlower(score);
  };
};

// Function to kill the plants
const killFlower = function (score = 1) {
  // if the score is 1, kill 4 plants
  if (score == 1) {
    document.getElementsByClassName('pb1')[0].classList.add('dead');
    document.getElementsByClassName('pb2')[0].classList.add('dead');
    document.getElementsByClassName('pb3')[0].classList.add('dead');
    document.getElementsByClassName('pb4')[0].classList.add('dead');
    return;
  }

  // if the score is 2 kill 3 plants
  if (score == 2) {
    document.getElementsByClassName('pb1')[0].classList.add('dead');
    document.getElementsByClassName('pb2')[0].classList.add('dead');
    document.getElementsByClassName('pb3')[0].classList.add('dead');
    return;
  }

  // if the score is 3 kill 2 plants
  if (score == 3) {
    document.getElementsByClassName('pb1')[0].classList.add('dead');
    document.getElementsByClassName('pb2')[0].classList.add('dead');
    return;
  }

  // if the score is 4 kill 1 plant
  if (score == 4) {
    document.getElementsByClassName('pb1')[0].classList.add('dead');
    return;
  }

  // if the score is 5 kill 0 plants
  console.log('full');
};

// Function to remove the popup gently and reset the score
const removePopup = function (): void {
  const thePopup = document.getElementById('alertPopup');
  if (thePopup) thePopup.remove();

  document.documentElement.classList.remove('alertedPopup');

  // Reset score
  // totalScore = 0;
  activePopup = false;
  counter = 0;
};

// Function to force the popup to close
const forceClosePopup = function (): void {
  const thePopup = document.getElementById('alertPopup');
  if (thePopup) thePopup.remove();

  document.documentElement.classList.remove('alertedPopup');

  // Turn off the popup trigger
  activePopup = false;

  // Set timer to turn it on again
  activePopup = setTimeout(function () {
    return true;
  }, 2500);
};

// Get the wrapper element
function getWrapper(): Element | null {
  return document.querySelectorAll('div#dp')[0];
}

/**
 * Function to convert data to everyday examples
 * @param {number} litres - The amount of litres to convert
 * @returns {Array} - An array of strings with the converted units
 * @example
 * convertDataToEverydayExamples(1) // ['0.0066666666666667 Showers', '0.02 Washing machine', '0.00000025 Olmpic swimming pools'
 */
function convertDataToEverydayExamples(litres: number): Array<string> {
  const units = [
    { label: 'Showers', conversion: 150 },
    { label: 'Washing machine', conversion: 50 },
    { label: 'Olmpic swimming pools', conversion: 4000000 },
    // Add more units and their conversion factors as needed
  ];

  const convertedUnits = units.map((unit) => {
    const quantity = Math.round(litres / unit.conversion);
    return `${quantity} ${unit.label}`;
  });

  return convertedUnits;
}

async function getProductCarbonFootprintData(
  productInformation: ProductInformation,
) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

    const generationConfig = {
      temperature: 0.5,
      topK: 0,
      topP: 0.95,
      maxOutputTokens: 256,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });

    const formattedChatMessage = `
    Give a fun-fact related to environmental conservation, related to the given product.
    Product title: ${productInformation.title}
    Product category: ${productInformation.category.join(', ')}
    Product overview: ${productInformation.overview}
    Product features: ${productInformation.features}
    Product technical details: ${productInformation.technicalDetails}
    Ships from: ${productInformation.ships_from}
    Ships to: ${productInformation.ships_to}
    
    Give an answer no matter what, give a rough estimate based on the product title, category, overview, features, technical details, ships from, and ships to.
    Or else, give a random fun-fact related to environmental conservation based on the based on the product title, category, overview, features, technical details, ships from, and ships to.
    The units of conversion are as such: [
      { label: 'Showers', conversion: 150 },
      { label: 'Washing machine', conversion: 50 },
      { label: 'Olmpic swimming pools', conversion: 4000000 },
    ];  

    Reply strictly in the following template format:
    Did you know that the process of manufacturing and shipping ${productInformation.title} requires approximately X litres of water? This is equivalent to Y showers, Z washing machine cycles, and A Olympic swimming pools!
    `;

    const result = await chat.sendMessage(formattedChatMessage);
    const response = result.response;
    return response.text()
  } catch (error) {
    console.log(
      "getProductCarbonFootprintData error: error occured while fetching product's carbon footprint data",
      error,
    );
  }
}

// Function to call on product pagex
const runScriptProductPage = async function (wrapper: Element) {
  try {
    /**
     * Data state and management for pop up
     */
    let newStorageData = {};
    const currentStorageData = await getStorageData();
    const score = currentStorageData.score;
    newStorageData = Object.assign({}, currentStorageData, {
      score: score >= 5 ? 0 : score + 1,
    });

    /**
     * Scripts to fetch product information on Amazon
     */
    const productInformation: ProductInformation = {
      title: document.querySelector('h1#title').textContent.trim(),
      category: Array.from(
        document
          .querySelector('div#wayfinding-breadcrumbs_feature_div')
          .querySelectorAll('li:not(.a-breadcrumb-divider)'),
      ).map((item) => item.textContent.trim()),
      overview: [
        Array.from(
          document
            .querySelector('div#productOverview_feature_div')
            .querySelector('tbody')
            .querySelectorAll('tr'),
        ).reduce(
          (obj, row) => ({
            ...obj,
            [row.querySelector('.a-span3').textContent.trim()]: row
              .querySelector('.a-span9')
              .textContent.trim(),
          }),
          {},
        ),
      ],
      features: [
        Array.from(
          document
            .querySelector('div#feature-bullets')
            .querySelectorAll('span.a-list-item'),
        ).map((item) => item.textContent.trim()),
      ],
      technicalDetails: [
        Object.fromEntries(
          Array.from(
            document.querySelectorAll(
              '#productDetails_techSpec_section_1 tbody tr',
            ),
          ).map((row) => [
            row.querySelector('th').textContent.trim(),
            row.querySelector('td').textContent.trim(),
          ]),
        ),
      ],
      ships_from: document
        .querySelector('div#merchant-info')
        .textContent.trim(),
      ships_to: document
        .querySelector('span#contextualIngressPtLabel')
        .textContent.trim(),
    };

    document.querySelector('div[id="water-footprint-alert"]')?.remove();
    await setStorageData(newStorageData);
    for (const brand of PREFERRED_BRANDS) {
      if (productInformation['title']?.includes(brand)) {
        makePopup(score);
      }
    }

    await getProductCarbonFootprintData(productInformation)
      .then((response) => {
        if (response.includes('Unfortunately') || response.includes('cannot')) {
          throw new Error("Unknown product, can't find water footprint data");
        }

        document.querySelector('h1#title').prepend(createAlertBannerNode(response));
      })
      .catch((error) => {
        if(error.message === "Unknown product, can't find water footprint data") {
          const arbitaryNumber = Math.floor(Math.random() * (1000 - 100) + 300);
          const relativeUnits = convertDataToEverydayExamples(arbitaryNumber);
          const data = `Did you the process of making '${
            productInformation['Product Name']
          }' requires <b>${arbitaryNumber}</b> litres (ℓ) of water to produce? That is equivalent to <b>${relativeUnits.join(
            ', ',
          )}</b>!`;
  
          document
            .querySelector('h1#title')
            .parentElement.prepend(createAlertBannerNode(data));

            return;
        }
        
        console.error("getProductCarbonFootprintData func error:", error)
      });
  } catch (error) {
    console.log('runScriptProductPage function error:', error);
  }
};

// Insert banner into the page
const createAlertBannerNode = function (data: string) {
  // Escape if there already is a 'water-footprint-alert' alert banner.
  if (document.getElementById('water-footprint-alert')) {
    return;
  }

  const node = document.createElement('div');
  node.id = 'water-footprint-alert';
  node.innerHTML = `
    <div class="water-footprint-alert" style="border: 1px solid let(--petalc); color: let(--petalc); background: #D1E0FF; padding: 1rem; font: 0.9rem sans-serif; margin-bottom: 1rem; padding-left: 1rem; padding-top: 1rem; padding-bottom: 1rem; border-radius: 5px;">
      <span style="display: flex; justify-content: center; align-items: center;">
        <span class="tooltip">
          <img src="https://cdn-icons-png.flaticon.com/512/665/665049.png" style="height: 17px; width: 17px; margin-right: 10px;">
          <span class="tooltiptext">Source generated from <a style="color: #79afe0; text-decoration: underline; " href="https://openai.com/" target="_blank" rel="noopener noreferrer">OpenAI</a></span>
        </span>
        <p>
          ${data}
        </p>
      </span>
      <div style="display: flex; justify-content: flex-end; align-items: center;">
        <img src="http://localhost:3002/favicon.ico" style="height: 17px; width: 17px; margin-right: 10px;" />
        <h1 style="font-size: 12px;">AquaWise</h1>
      </div>  
    </div>`;

  return node;
};

const loadCSS = function () {
  const $ = document;
  const head = $.getElementsByTagName('head')[0];
  const link = $.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL('overlay.css');
  link.media = 'all';
  head.appendChild(link);
};

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
  1000,
  (wrapper: Element | null) => wrapper !== null,
  async function () {
    try {
      // Priority to load css first
      loadCSS();
      // Run script for product page
      await runScriptProductPage(getWrapper()); // Run script for product page
    } catch (error) {
      console.log('foreground error:', error);
    }
  },
);
