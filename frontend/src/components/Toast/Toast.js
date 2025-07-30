import React, { useState, useEffect } from 'react'
import './Toast.css'

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(() => {
        setIsVisible(false)
        onClose && onClose()
      }, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  return (
    <div className={`toast toast-${type} ${isLeaving ? 'toast-leave' : 'toast-enter'}`}>
      <div className="toast-icon">
        <span>{icons[type]}</span>
      </div>
      <div className="toast-content">
        <p>{message}</p>
      </div>
      <button 
        className="toast-close"
        onClick={() => {
          setIsLeaving(true)
          setTimeout(() => {
            setIsVisible(false)
            onClose && onClose()
          }, 300)
        }}
      >
        ×
      </button>
    </div>
  )
}