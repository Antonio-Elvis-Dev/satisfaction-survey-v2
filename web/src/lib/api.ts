import axios from 'axios'

export const api = axios.create({
    baseURL: 'http://192.168.1.49:3333', // ip do server 
    withCredentials: true,
})

const token = localStorage.getItem('token')
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}