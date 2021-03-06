/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId, startDateId) => {
    try {
        const stripe = Stripe('pk_test_51Hb5QgEQE2aP1WNPHH2UpTVQt8MPqAtudsZ61dCJPLemilXhCkK6yVerbeleuH91HSLXAlouBW2aSSeqfRMBYWj200CrwALw0L');
        //Get checkout session from the server
        const session = await axios(
            `/api/v1/bookings/checkout-session/${tourId}/${startDateId}`
        );

        //Create checkout form + charge the credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
}
