// /* eslint-disable */
// import axios from 'axios';
// import { showAlert } from './alerts';
// import Stripe from 'stripe';
// const stripe = Stripe(
//   'pk_test_51PdwjWRr1P63D3kAIyAqOo4SyltyK1idHmIf57sqdrAMEGwpCHvtPMeeveBYwkIrhJcVT6IS6ZJaR0TWqyRuCe6r00vKPzsWmK'
// );

// export const bookTour = async (tourId) => {
//   try {
//     // 1) Get checkout session from API
//     const session = await axios(
//       `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
//     );
//     console.log(session);

//     // 2) Create checkout form + chanre credit card
//     await stripe.redirectToCheckout({
//       sessionId: session.data.session.id,
//     });
//   } catch (err) {
//     console.log(err);
//     showAlert('error', err);
//   }
// };

/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import { loadStripe } from '@stripe/stripe-js';

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const response = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    const session = response.data.session;

    // 2) Create checkout form + charge credit card
    const stripe = await loadStripe(
      'pk_test_51PdwjWRr1P63D3kAIyAqOo4SyltyK1idHmIf57sqdrAMEGwpCHvtPMeeveBYwkIrhJcVT6IS6ZJaR0TWqyRuCe6r00vKPzsWmK'
    );

    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      showAlert('error', error.message);
    }
  } catch (err) {
    console.error('Error:', err);
    showAlert('error', err.message);
  }
};
