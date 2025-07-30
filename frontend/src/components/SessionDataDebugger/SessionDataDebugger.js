/**
 * Session Data Debugger Component
 * Shows exactly what data is being passed to verify accuracy
 */

import React from 'react'

export const SessionDataDebugger = ({ sessionData, title = "Session Data Debug" }) => {
  if (!sessionData) {
    return (
      <div style={{ 
        background: '#f3f4f6', 
        padding: '10px', 
        margin: '10px 0', 
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <strong>{title}:</strong> No session data
      </div>
    )
  }

  const formatValue = (key, value) => {
    if (key.includes('Time') && typeof value === 'number') {
      return `${value}s (${Math.round(value/60*100)/100}min)`
    }
    if (key.includes('Score') && typeof value === 'number') {
      return `${value}%`
    }
    if (Array.isArray(value)) {
      return `[${value.length} items]`
    }
    if (typeof value === 'object' && value !== null) {
      return `{${Object.keys(value).length} properties}`
    }
    return String(value)
  }

  return (
    <div style={{ 
      background: '#f3f4f6', 
      padding: '15px', 
      margin: '10px 0', 
      borderRadius: '8px',
      fontSize: '11px',
      fontFamily: 'monospace',
      maxHeight: '300px',
      overflow: 'auto',
      border: '1px solid #d1d5db'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#374151' }}>
        🔍 {title}
      </div>
      
      {Object.entries(sessionData).map(([key, value]) => (
        <div key={key} style={{ 
          display: 'flex', 
          marginBottom: '4px',
          padding: '2px 0'
        }}>
          <span style={{ 
            color: '#6b7280', 
            minWidth: '120px',
            marginRight: '10px'
          }}>
            {key}:
          </span>
          <span style={{ 
            color: value === null || value === undefined ? '#ef4444' : '#059669',
            wordBreak: 'break-all'
          }}>
            {formatValue(key, value)}
          </span>
        </div>
      ))}
      
      {sessionData.poseResults && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontWeight: 'bold', color: '#374151' }}>
            Pose Results:
          </div>
          {sessionData.poseResults.map((pose, index) => (
            <div key={index} style={{ 
              marginLeft: '20px', 
              fontSize: '10px',
              color: '#6b7280'
            }}>
              {pose.name}: {pose.score}% ({pose.time}s, {pose.attempts} attempts)
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Hook to log session data changes
export const useSessionDataLogger = (sessionData, label = "Session Data") => {
  React.useEffect(() => {
    if (sessionData) {
      console.group(`📊 ${label} Updated`)
      console.log('Raw data:', sessionData)
      console.log('Data types:', Object.entries(sessionData).reduce((acc, [key, value]) => {
        acc[key] = typeof value
        return acc
      }, {}))
      console.groupEnd()
    }
  }, [sessionData, label])
}

export default SessionDataDebugger