import axios from 'axios'

const service = axios.create({
    timeout: 9000 // 请求超时时间
})

service.interceptors.response.use((response) => {
    return response.data
}, (error) => {
    return Promise.reject(error)
})

export {
    service as axios
}