import "@babel/polyfill";
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateData } from './updateSettings'

//TODO: fix user-1.jpg route pug

//DOM Elements 
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.from--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const accountForm = document.querySelector('.form-user-data');

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

if(accountForm){
    accountForm.addEventListener('submit', e=> {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        updateData(name, email);
    });
}