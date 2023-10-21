import axios from "axios";

const API_URL = 'http://localhost:5000'

const token = localStorage.getItem('user');

const tokenId = JSON.parse(token)?.stsTokenManager?.accessToken

// const tokenId = JSON.parse(token)
const instance = axios.create({
    baseURL: API_URL,
    headers:{
    'Content-Type':'application/json',
    'Authorization': `Bearer ${tokenId}`
    }
})

export default instance;
export {API_URL};