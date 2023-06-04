// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { createClient, User } from '@supabase/supabase-js';
import { getCurrentUser, supabase } from './popup';
import axios from 'axios';

(() => {
  function getWrapper(): Element | null {
    try {
      const wrapper = document.querySelector('div > .rnocow');
      if (wrapper === null) {
        throw new Error('Wrapper element not found');
      }

      return wrapper;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  const overrideCheckoutButton = async function (wrapper): Promise<void> {
    console.log('running overrideCheckoutButton');
    const allProductTitles = document.querySelectorAll('.LAQKxn');
    const productsArr = [];
    for (const productTitle of allProductTitles) {
      const productTitleAnchor = productTitle.querySelector('a');
      const productTitleRaw = productTitleAnchor.getAttribute('title');
      productsArr.push(productTitleRaw);
    }

    let response = null;
    try {
      response = await axios.post(
        'http://localhost:3002/api/generate-cart-water-footprint',
        {
          product_titles: productsArr,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
          },
        },
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }

    const checkoutFooter = wrapper.querySelector('.rnocow > div.c2pfrq');
    // Create a div
    const node = document.createElement('button');
    node.id = 'ecocart-button';
    node.classList.add('shopee-button-solid', 'shopee-button-solid--primary');
    // Make a node a button
    node.innerHTML = `
              <span class="btn__content">
                  <span class="btn__text">Checkout</span>
              </span>
          `;

    const node2 = document.createElement('div');
    node2.id = 'ecocart-text';
    // total water usage for the cart
    const arbitaryNumber = Math.floor(Math.random() * (100 - 10) + 100);
    node2.innerHTML = `<p style="padding-left: .5rem;">Estimated Water Usage: ${
      response
        ? response?.data?.co2_footprint
        : arbitaryNumber * allProductTitles.length
    } kg</p>`;
    // Insert the button before the checkout button if there are no existing buttons with the same id
    if (checkoutFooter.querySelector('#ecocart-button') === null) {
      // Insert it before the last child
      checkoutFooter.insertBefore(node2, checkoutFooter.lastChild);
      checkoutFooter.insertBefore(node, checkoutFooter.lastChild);
      node.addEventListener('click', () => {
        console.log('clicked');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // set opacity to 0.5
        node.style.opacity = 0.5;
        node.innerText = 'Processing...';
        node.disabled = true;
        getCurrentUser().then(async (resp) => {
          if (resp) {
            console.log('user found and inserting to transaction db...');
            const { error } = await supabase.from('transactions').insert({
              user_uuid: resp.user.id,
              water_footprint: response
                ? response.data.water_footprint
                : arbitaryNumber * allProductTitles.length,
              merchant: 'Shopee',
              transaction_link: 'https://shopee.sg/cart',
            });
            console.log(error);
          } else {
            console.log('user is not found');
          }
        });
      });
      // Destroy the last child
      checkoutFooter.removeChild(checkoutFooter.lastChild);
    }
  };

  // Function to call on product page
  const runScriptProductPage = (function () {
    return async function (wrapper) {
      console.log('running script');
      console.log(wrapper);
      await overrideCheckoutButton(wrapper);
    };
  })();

  const waitFor = function (
    varSetter: any,
    sleepTime: number,
    condition: any,
    continuation: any,
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
    function (wrapper: Element) {
      // Check if the url is a product page or search page by checking the url
      try {
        runScriptProductPage(wrapper);
      } catch (err) {
        console.log(err);
      }
    },
  );
})();
