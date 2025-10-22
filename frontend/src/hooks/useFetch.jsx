"use client"

import { useState, useEffect } from "react"

// Lấy base URL từ file .env
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8006"

export const useFetch = (endpoint, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!endpoint) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const fullUrl = endpoint.startsWith("http")
          ? endpoint
          : `${BASE_URL}${endpoint}`

        const response = await fetch(fullUrl, {
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          ...options,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        console.error("❌ Fetch error:", err)
        setError(err.message)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint])

  return { data, loading, error }
}
