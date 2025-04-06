import dotenv from 'dotenv'

const baseEnv = process.env

if (!baseEnv) {
  dotenv.config()
}

export const isProd = baseEnv.NODE_ENV === 'production'

export const API_BASE_URL =
  baseEnv.VUE_APP_API_BASE_URL || baseEnv.VITE_API_BASE_URL

export const FIREBASE_API_KEY =
  baseEnv.VUE_APP_FIREBASE_API_KEY || baseEnv.VITE_FIREBASE_API_KEY

export const FIREBASE_AUTH_DOMAIN =
  baseEnv.VUE_APP_FIREBASE_AUTH_DOMAIN || baseEnv.VITE_FIREBASE_AUTH_DOMAIN

export const FIREBASE_DATABASE_URL =
  baseEnv.APP_FIREBASE_DATABASE_URL || baseEnv.VITE_FIREBASE_DATABASE_URL

export const FIREBASE_PROJECT_ID =
  baseEnv.VUE_APP_FIREBASE_PROJECT_ID || baseEnv.VITE_FIREBASE_PROJECT_ID

export const FIREBASE_STORAGE_BUCKET =
  baseEnv.VUE_APP_FIREBASE_STORAGE_BUCKET ||
  baseEnv.VITE_FIREBASE_STORAGE_BUCKET

export const FIREBASE_MESSAGING_SENDER_I =
  baseEnv.VUE_APP_FIREBASE_MESSAGING_SENDER_ID ||
  baseEnv.VITE_FIREBASE_MESSAGING_SENDER_ID
