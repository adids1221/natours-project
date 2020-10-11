/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import { login } from './login';

export const confirm = async (req, res, next) => {
    showAlert('success', 'User confirmed and you are logged in!');
    window.setTimeout(() => {
        location.assign('/');
    }, 500);
}





