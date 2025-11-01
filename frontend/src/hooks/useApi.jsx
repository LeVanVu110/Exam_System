"use client"

import { useState, useCallback } from "react"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api"

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (endpoint, options = {}) => {
    try {
      setLoading(true)
      setError(null)

      const url = `${API_BASE_URL}${endpoint}`
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { request, loading, error }
}
