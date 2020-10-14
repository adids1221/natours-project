import "@babel/polyfill";
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { signup } from './signup';
import { bookTour } from './stripe';
import { createReview } from './review';

//DOM Elements 
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.from--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const accountForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const signupForm = document.querySelector('.form--signup');
const bookBtn = document.getElementById('book-tour');
const selectStartDate = document.querySelector('.selectStartDate');
const reviewBtn = document.querySelector('.btn--review');
const reviewSave = document.querySelector('.review-save');
const closeReview = document.querySelector('.close');
//const confirmBtn = document.getElementById('token-log');

//Delegation
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

if (accountForm) {
    accountForm.addEventListener('submit', e => {
        e.preventDefault();
        //set multipart form data
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        console.log(form);
        updateSettings(form, 'data');
    });
}

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
        document.querySelector('.btn--save-password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password-').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--signup').textContent = 'Sign Up...';
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordconfirm').value;
        await signup(name, email, password, passwordConfirm);
    });
};

if (bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...'
        const { tourId } = e.target.dataset;
        const startDateId = selectStartDate.options[selectStartDate.selectedIndex].value;
        console.log(`startDateId: ${startDateId}   ||   tourID: ${tourId}`);
        bookTour(tourId, startDateId);
    });
}

if (reviewBtn) {
    reviewBtn.addEventListener('click', () => {
        document.querySelector('.bg-modal').style.display = "flex";
    });
}

if (closeReview) {
    closeReview.addEventListener("click", () => {
        document.querySelector('.bg-modal').style.display = "none";
    });
}

if (reviewSave) {
    reviewSave.addEventListener("click", async e => {
        const review = document.getElementById('review').value;
        const rating = document.getElementById('ratings').value;
        const { tourId } = e.target.dataset;
        await createReview(tourId, review, rating);
    });
}

/* if (confirmBtn) {
    confirmBtn.addEventListener('click', e => {
        const { token } = e.target.dataset;
        confirm(token);
    });
} */