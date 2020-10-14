/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import { login } from './login';

export const confirm = async (req, res, next) => {
    try {
        const token = req.originalUrl.split('confirm/')[1];
    } catch (err) {
        console.log(err);
    }
}





