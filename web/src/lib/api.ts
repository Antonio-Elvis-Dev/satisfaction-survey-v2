import axios from 'axios'

export const api = axios.create({
    baseURL: 'http://localhost:3333',
    withCredentials: true,
})

const token = localStorage.getItem('token')
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}