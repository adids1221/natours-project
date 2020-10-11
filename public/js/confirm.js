/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import { login } from './login';

export const confirm = async (req, res, next) => {
    try {
        const token = await axios(
            `http://localhost:3000/api/v1/bookings/checkout-session/${token}`
        );
        console.log(token);
    } catch (err) {
        console.log(err);
    }
}





