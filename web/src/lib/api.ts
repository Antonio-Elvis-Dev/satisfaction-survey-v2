import axios from 'axios'

export const api = axios.create({
    baseURL: 'http://192.168.2.31:3333',
    withCredentials: true,
})

const token = localStorage.getItem('token')
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}