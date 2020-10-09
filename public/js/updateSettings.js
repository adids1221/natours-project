/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
    console.log(data,type);
    //type is 'password' or 'data'
    //updateMyPassword
    try {
        const url = type === 'password' ? 'http://localhost:3000/api/v1/users/updateMyPassword'
            : 'http://localhost:3000/api/v1/users/updateMe';
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} Updated Successfully`);
            window.setTimeout(() => {
                location.assign('/me');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
        console.log(err);
    }
};