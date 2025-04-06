import { API_BASE_URL } from '@/config'
import axios from 'axios'
import qs from 'qs'

export const sisgescAPI = axios.create({
  baseURL: API_BASE_URL,
  paramsSerializer: function (params) {
    return qs.stringify(params)
  }
})
