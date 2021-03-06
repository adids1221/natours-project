import axios from 'axios';
import { showAlert } from './alerts';

export const createReview = async (tourId, review, rating) => {
    try {
        const tour = tourId
        const url =`/api/v1/reviews`;
        const res = await axios({
            method: 'POST',
            url,
            data: {
                tour,
                rating,
                review
            }
        });

        if (res.data.status === 'success') {
            document.querySelector('.bg-modal').style.display = "none";
            showAlert('success', `review created Successfully`);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}