import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password, passwordConfirm) => {
    try {
        console.log('data');
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:3000/api/v1/users/signup',
            data: {
                name, 
                email, 
                password, 
                passwordConfirm
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Sign Up Successfully Please Confirm Your Account Via Email');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        console.log(err);
    }
};