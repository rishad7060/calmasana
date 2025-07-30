/**
 * Enhanced PDF Report Service
 * Professional, detailed PDF reports with rich visual design
 */

import jsPDF from 'jspdf'

export class EnhancedPDFService {
  constructor() {
    // Color palette
    this.colors = {
      primary: [102, 126, 234],      // #667eea
      secondary: [118, 75, 162],     // #764ba2
      accent: [59, 130, 246],        // #3b82f6
      success: [16, 185, 129],       // #10b981
      warning: [245, 158, 11],       // #f59e0b
      danger: [239, 68, 68],         // #ef4444
      text: [31, 41, 55],           // #1f2937
      textLight: [107, 114, 128],    // #6b7280
      background: [249, 250, 251],   // #f9fafb
      border: [229, 231, 235],       // #e5e7eb
      white: [255, 255, 255]
    }
    
    this.pageWidth = 210 // A4 width in mm
    this.pageHeight = 297 // A4 height in mm
    this.margin = 20
    this.contentWidth = this.pageWidth - (this.margin * 2)
  }

  // Generate comprehensive session report with extra details
  generateSessionReport(sessionData, userProfile) {
    const doc = new jsPDF()
    let currentY = this.margin

    // Header with branding
    currentY = this.addProfessionalHeader(doc, 'CalmAsana Yoga Session Report', currentY)
    currentY += 15

    // Session overview card with extra details
    currentY = this.addSessionOverviewCard(doc, sessionData, currentY)
    currentY += 15

    // Performance analysis with detailed metrics
    currentY = this.addPerformanceAnalysis(doc, sessionData, currentY)
    currentY += 15

    // Session timeline section (NEW)
    currentY = this.addSessionTimeline(doc, sessionData, currentY)
    currentY += 15

    // Pose breakdown with visual indicators
    if (sessionData.poseResults && sessionData.poseResults.length > 0) {
      currentY = this.addPoseBreakdownSection(doc, sessionData.poseResults, currentY)
      currentY += 15
    }

    // Progress indicators and achievements
    currentY = this.addProgressIndicators(doc, sessionData, currentY)
    currentY += 10

    // Health and wellness insights (NEW)
    currentY = this.addHealthInsights(doc, sessionData, userProfile, currentY)
    currentY += 15

    // Recommendations with icons
    currentY = this.addRecommendationsSection(doc, sessionData, userProfile, currentY)

    // Professional footer
    this.addProfessionalFooter(doc)

    return doc
  }

  // Generate comprehensive dashboard report
  generateDashboardReport(userProfile, allSessions) {
    const doc = new jsPDF()
    let currentY = this.margin

    // Professional header
    currentY = this.addProfessionalHeader(doc, 'CalmAsana Yoga Progress Overall', currentY)
    currentY += 15

    // Executive summary
    currentY = this.addExecutiveSummary(doc, userProfile, allSessions, currentY)
    currentY += 15

    // Statistics with visual charts
    currentY = this.addStatisticsSection(doc, allSessions, currentY)
    
    // New page for detailed analysis
    doc.addPage()
    currentY = this.margin + 10

    // Progress trends
    currentY = this.addProgressTrends(doc, allSessions, currentY)
    currentY += 15

    // Achievement showcase
    currentY = this.addAchievementShowcase(doc, userProfile, allSessions, currentY)
    currentY += 15

    // Goal progress analysis
    currentY = this.addGoalProgressAnalysis(doc, userProfile, allSessions, currentY)

    // Professional footer
    this.addProfessionalFooter(doc)

    return doc
  }

  // Professional header with branding
  addProfessionalHeader(doc, title, y) {
    try {
      // Simplified header background
      doc.setFillColor(...this.colors.primary)
      doc.rect(0, 0, this.pageWidth, 40, 'F')

      // // Logo area - simple rectangle instead of circle
      // doc.setFillColor(...this.colors.white)
      // doc.rect(25, 15, 25, 12, 'F')
      
      // Logo text - avoid emoji that might cause issues
      // doc.setFont('helvetica', 'bold')
      // doc.setFontSize(10)
      // doc.setTextColor(...this.colors.primary)
      // doc.text('CalmAsana', 27, 23)

      // Main title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(...this.colors.white)
      const titleX = this.pageWidth / 2
      doc.text(title, titleX, 30, { align: 'center' })

      // Date and time
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const now = new Date()
      const dateX = this.pageWidth - this.margin
      doc.text(now.toLocaleDateString(), dateX, 15, { align: 'right' })
      doc.text(now.toLocaleTimeString(), dateX, 25, { align: 'right' })
    } catch (error) {
      console.warn('Header rendering issue:', error)
      // Fallback simple header
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(...this.colors.text)
      doc.text(title, this.margin, 30)
    }

    return 50
  }

  // Session overview with visual cards
  addSessionOverviewCard(doc, sessionData, y) {
    try {
      const cardHeight = 50
      
      // Validate coordinates
      if (y < 0 || y > this.pageHeight - cardHeight) {
        y = Math.max(this.margin, Math.min(y, this.pageHeight - cardHeight - this.margin))
      }
      
      // Card background
      doc.setFillColor(...this.colors.background)
      doc.rect(this.margin, y, this.contentWidth, cardHeight, 'F')
      
      // Card border
      doc.setDrawColor(...this.colors.border)
      doc.setLineWidth(0.5)
      doc.rect(this.margin, y, this.contentWidth, cardHeight, 'S')

      // Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...this.colors.text)
      doc.text('SESSION OVERVIEW', this.margin + 5, y + 15)

      // Metrics in a more reliable layout
      const metrics = [
        { label: 'Duration', value: `${Math.round((sessionData.totalTime || 0) / 60)} min` },
        { label: 'Avg Score', value: `${sessionData.avgScore || 0}%` },
        { label: 'Poses', value: `${sessionData.posesAttempted || 1}` },
        { label: 'Perfect', value: `${sessionData.perfectPoses || 0}` }
      ]

      // Display metrics in a 2x2 grid
      metrics.forEach((metric, index) => {
        const col = index % 2
        const row = Math.floor(index / 2)
        const x = this.margin + 10 + (col * 80)
        const yPos = y + 25 + (row * 15)
        
        // Value
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(...this.colors.primary)
        doc.text(metric.value, x, yPos)
        
        // Label
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...this.colors.textLight)
        doc.text(metric.label, x, yPos + 8)
      })

      return y + cardHeight + 5
    } catch (error) {
      console.warn('Session overview card error:', error)
      return y + 30
    }
  }

  // Performance analysis with visual scoring
  addPerformanceAnalysis(doc, sessionData, y) {
    try {
      const sectionHeight = 40
      
      // Validate coordinates
      if (y < 0 || y > this.pageHeight - sectionHeight) {
        y = Math.max(this.margin, Math.min(y, this.pageHeight - sectionHeight - this.margin))
      }
      
      // Section title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...this.colors.text)
      doc.text('PERFORMANCE ANALYSIS', this.margin, y)

      // Performance score bar
      const score = Math.max(0, Math.min(100, sessionData.avgScore || 0))
      const barWidth = Math.max(50, this.contentWidth - 50)
      const barHeight = 10
      const barY = y + 18

      // Background bar
      doc.setFillColor(...this.colors.border)
      doc.rect(this.margin, barY, barWidth, barHeight, 'F')

      // Score bar with color based on performance
      let scoreColor = this.colors.danger
      if (score >= 90) scoreColor = this.colors.success
      else if (score >= 70) scoreColor = this.colors.primary
      else if (score >= 50) scoreColor = this.colors.warning

      // Calculate score bar width safely
      const scoreBarWidth = Math.max(0, (barWidth * score / 100))
      doc.setFillColor(...scoreColor)
      doc.rect(this.margin, barY, scoreBarWidth, barHeight, 'F')

      // Score text
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...this.colors.text)
      doc.text(`${score}%`, this.margin + barWidth + 8, barY + 7)

      // Performance level
      let level = 'Needs Improvement'
      if (score >= 90) level = 'Excellent'
      else if (score >= 80) level = 'Very Good'
      else if (score >= 70) level = 'Good'
      else if (score >= 50) level = 'Fair'

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...scoreColor)
      doc.text(`Performance Level: ${level}`, this.margin, barY + 20)

      return y + sectionHeight
    } catch (error) {
      console.warn('Performance analysis error:', error)
      return y + 25
    }
  }

  // Detailed pose breakdown with visual elements
  addPoseBreakdownSection(doc, poseResults, y) {
    try {
      // Validate input
      if (!Array.isArray(poseResults) || poseResults.length === 0) {
        return y
      }

      // Check if we need a new page
      const estimatedHeight = 15 + 12 + (poseResults.length * 12)
      if (y + estimatedHeight > this.pageHeight - 30) {
        doc.addPage()
        y = this.margin + 10
      }

      // Section title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...this.colors.text)
      doc.text('POSE PERFORMANCE BREAKDOWN', this.margin, y)
      
      let currentY = y + 18

      // Table header
      const headerHeight = 12
      doc.setFillColor(...this.colors.primary)
      doc.rect(this.margin, currentY, this.contentWidth, headerHeight, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...this.colors.white)
      doc.text('POSE NAME', this.margin + 3, currentY + 8)
      doc.text('SCORE', this.margin + 55, currentY + 8)
      doc.text('TIME', this.margin + 85, currentY + 8)
      doc.text('RATING', this.margin + 115, currentY + 8)

      currentY += headerHeight

      // Pose rows with bounds checking
      poseResults.slice(0, 10).forEach((pose, index) => { // Limit to 10 poses to prevent overflow
        const rowHeight = 12
        const isEven = index % 2 === 0
        
        // Check if we have space for this row
        if (currentY + rowHeight > this.pageHeight - 30) {
          return // Skip remaining poses if we run out of space
        }
        
        // Alternating row colors
        if (isEven) {
          doc.setFillColor(...this.colors.background)
          doc.rect(this.margin, currentY, this.contentWidth, rowHeight, 'F')
        }

        // Pose name - truncate if too long
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...this.colors.text)
        const poseName = (pose.name || 'Unknown').substring(0, 15)
        doc.text(poseName, this.margin + 3, currentY + 8)

        // Score with color coding
        const score = Math.max(0, Math.min(100, pose.score || 0))
        let scoreColor = this.colors.danger
        if (score >= 90) scoreColor = this.colors.success
        else if (score >= 70) scoreColor = this.colors.primary
        else if (score >= 50) scoreColor = this.colors.warning

        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...scoreColor)
        doc.text(`${score}%`, this.margin + 55, currentY + 8)

        // Hold time
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...this.colors.text)
        const time = Math.max(0, pose.time || 0)
        doc.text(`${time}s`, this.margin + 85, currentY + 8)

        // Performance rating
        let rating = 'Poor'
        if (score >= 90) rating = 'Excellent'
        else if (score >= 80) rating = 'Great'
        else if (score >= 70) rating = 'Good'
        else if (score >= 50) rating = 'Fair'

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...scoreColor)
        doc.text(rating, this.margin + 115, currentY + 8)

        currentY += rowHeight
      })

      return currentY + 10
    } catch (error) {
      console.warn('Pose breakdown error:', error)
      return y + 20
    }
  }

  // Session timeline section (NEW)
  addSessionTimeline(doc, sessionData, y) {
    try {
      // Check if we need a new page
      if (y + 40 > this.pageHeight - 30) {
        doc.addPage()
        y = this.margin + 10
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...this.colors.text)
      doc.text('SESSION TIMELINE & DETAILS', this.margin, y)

      let currentY = y + 18

      // Timeline details
      const timelineData = [
        { label: 'Session Started', value: new Date(sessionData.date || new Date()).toLocaleTimeString() },
        { label: 'Total Duration', value: `${Math.round((sessionData.totalTime || 0) / 60)} minutes ${(sessionData.totalTime || 0) % 60} seconds` },
        { label: 'Average Hold Time', value: `${sessionData.avgHoldTime || 0} seconds per pose` },
        { label: 'Rest Intervals', value: `${sessionData.restTime || 0} seconds total rest` },
        { label: 'Calories Burned', value: `~${Math.round((sessionData.totalTime || 0) * 0.05)} calories` },
        { label: 'Focus Areas', value: (sessionData.focusAreas || ['General Wellness']).join(', ') }
      ]

      timelineData.forEach((item, index) => {
        // Timeline dot
        doc.setFillColor(...this.colors.primary)
        doc.circle(this.margin + 5, currentY + 3, 2, 'F')

        // Timeline line
        if (index < timelineData.length - 1) {
          doc.setDrawColor(...this.colors.border)
          doc.setLineWidth(1)
          doc.line(this.margin + 5, currentY + 5, this.margin + 5, currentY + 13)
        }

        // Label and value
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(...this.colors.text)
        doc.text(item.label + ':', this.margin + 15, currentY + 5)

        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...this.colors.textLight)
        doc.text(item.value, this.margin + 80, currentY + 5)

        currentY += 12
      })

      return currentY + 10
    } catch (error) {
      console.warn('Session timeline error:', error)
      return y + 20
    }
  }

  // Health and wellness insights (NEW)
  addHealthInsights(doc, sessionData, userProfile, y) {
    try {
      // Check if we need a new page
      if (y + 50 > this.pageHeight - 30) {
        doc.addPage()
        y = this.margin + 10
      }

      // Section background
      doc.setFillColor(248, 250, 252) // Light blue background
      doc.rect(this.margin, y, this.contentWidth, 45, 'F')

      // Section border
      doc.setDrawColor(...this.colors.primary)
      doc.setLineWidth(1)
      doc.rect(this.margin, y, this.contentWidth, 45, 'S')

      // Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...this.colors.text)
      doc.text('HEALTH & WELLNESS INSIGHTS', this.margin + 5, y + 15)

      let currentY = y + 25

      // Health metrics
      const healthData = [
        { 
          metric: 'Flexibility Improvement', 
          value: `+${Math.round((sessionData.avgScore || 0) * 0.3)}%`,
          description: 'Based on pose accuracy and hold times'
        },
        { 
          metric: 'Stress Relief Index', 
          value: `${Math.min(95, 60 + (sessionData.avgScore || 0) * 0.4)}%`,
          description: 'Estimated stress reduction from this session'
        },
        { 
          metric: 'Mind-Body Connection', 
          value: sessionData.avgScore >= 80 ? 'Strong' : sessionData.avgScore >= 60 ? 'Good' : 'Developing',
          description: 'Your awareness and control during poses'
        }
      ]

      healthData.forEach((item, index) => {
        const x = this.margin + 10 + (index * 55)
        
        // Metric value
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...this.colors.primary)
        doc.text(item.value, x, currentY)

        // Metric name
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...this.colors.text)
        const lines = doc.splitTextToSize(item.metric, 50)
        lines.forEach((line, lineIndex) => {
          doc.text(line, x, currentY + 8 + (lineIndex * 4))
        })
      })

      return y + 50
    } catch (error) {
      console.warn('Health insights error:', error)
      return y + 30
    }
  }

  // Progress indicators with visual elements
  addProgressIndicators(doc, sessionData, y) {
    try {
      // Check if we need a new page
      if (y + 45 > this.pageHeight - 30) {
        doc.addPage()
        y = this.margin + 10
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...this.colors.text)
      doc.text('PROGRESS INDICATORS', this.margin, y)

      const indicators = [
        { label: 'Session Quality', value: this.getQualityScore(sessionData), max: 100 },
        { label: 'Consistency', value: this.getConsistencyScore(sessionData), max: 100 },
        { label: 'Improvement', value: this.getImprovementScore(sessionData), max: 100 }
      ]

      let currentY = y + 18

      indicators.forEach(indicator => {
        // Label
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(...this.colors.text)
        doc.text(indicator.label, this.margin, currentY + 5)

        // Progress bar
        const barWidth = 80
        const barHeight = 6
        const barX = this.margin + 50

        // Validate values
        const safeValue = Math.max(0, Math.min(100, indicator.value || 0))

        doc.setFillColor(...this.colors.border)
        doc.rect(barX, currentY + 2, barWidth, barHeight, 'F')

        doc.setFillColor(...this.colors.primary)
        doc.rect(barX, currentY + 2, (barWidth * safeValue / 100), barHeight, 'F')

        // Value
        doc.setFont('helvetica', 'bold')
        doc.text(`${safeValue}%`, barX + barWidth + 8, currentY + 6)

        currentY += 14
      })

      return currentY + 10
    } catch (error) {
      console.warn('Progress indicators error:', error)
      return y + 25
    }
  }

  // Recommendations with visual styling
  addRecommendationsSection(doc, sessionData, userProfile, y) {
    try {
      // Check if we need a new page
      if (y + 60 > this.pageHeight - 30) {
        doc.addPage()
        y = this.margin + 10
      }

      // Section background
      const sectionHeight = 55
      doc.setFillColor(254, 252, 191) // Light yellow background
      doc.rect(this.margin, y, this.contentWidth, sectionHeight, 'F')

      // Section border
      doc.setDrawColor(...this.colors.warning)
      doc.setLineWidth(1)
      doc.rect(this.margin, y, this.contentWidth, sectionHeight, 'S')

      // Title - avoid emoji that might cause issues
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...this.colors.text)
      doc.text('PERSONALIZED RECOMMENDATIONS', this.margin + 5, y + 15)

      // Recommendations
      const recommendations = this.generateRecommendations(sessionData, userProfile)
      let recY = y + 25

      recommendations.slice(0, 4).forEach((rec, index) => { // Limit to 4 recommendations
        // Check if we have space
        if (recY + 8 > y + sectionHeight - 5) {
          return
        }

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...this.colors.text)
        
        // Bullet point
        doc.setFillColor(...this.colors.warning)
        doc.circle(this.margin + 8, recY + 2, 1.5, 'F')
        
        // Recommendation text - truncate if too long
        const truncatedRec = rec.length > 80 ? rec.substring(0, 77) + '...' : rec
        const lines = doc.splitTextToSize(truncatedRec, this.contentWidth - 25)
        lines.slice(0, 2).forEach((line, lineIndex) => { // Max 2 lines per recommendation
          doc.text(line, this.margin + 15, recY + (lineIndex * 5))
        })
        
        recY += lines.length <= 2 ? 12 : 10
      })

      return y + sectionHeight + 5
    } catch (error) {
      console.warn('Recommendations section error:', error)
      return y + 40
    }
  }

  // Executive summary for dashboard
  addExecutiveSummary(doc, userProfile, allSessions, y) {
    try {
      const stats = this.calculateDetailedStats(allSessions)
      
      // Summary card - use simple rectangle instead of rounded
      const cardHeight = 65
      
      // Validate coordinates
      if (y + cardHeight > this.pageHeight - 30) {
        doc.addPage()
        y = this.margin + 10
      }
      
      doc.setFillColor(...this.colors.background)
      doc.rect(this.margin, y, this.contentWidth, cardHeight, 'F')
      
      doc.setDrawColor(...this.colors.border)
      doc.setLineWidth(0.5)
      doc.rect(this.margin, y, this.contentWidth, cardHeight, 'S')

      // Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...this.colors.text)
      doc.text('EXECUTIVE SUMMARY', this.margin + 5, y + 15)

      // Key metrics in a more reliable layout
      const keyMetrics = [
        { label: 'Total Sessions', value: `${stats.totalSessions}` },
        { label: 'Hours Practiced', value: `${stats.totalHours}h` },
        { label: 'Average Score', value: `${stats.averageScore}%` },
        { label: 'Current Streak', value: `${stats.currentStreak} days` }
      ]

      keyMetrics.forEach((metric, index) => {
        const col = index % 2
        const row = Math.floor(index / 2)
        const x = this.margin + 10 + (col * 85)
        const yPos = y + 25 + (row * 18)

        // Value
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(...this.colors.primary)
        doc.text(metric.value, x, yPos)
        
        // Label
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...this.colors.textLight)
        doc.text(metric.label, x, yPos + 8)
      })

      return y + cardHeight + 10
    } catch (error) {
      console.warn('Executive summary error:', error)
      return y + 40
    }
  }

  // Statistics section with visual charts
  addStatisticsSection(doc, allSessions, y) {
    try {
      // Check if we need a new page
      if (y + 80 > this.pageHeight - 30) {
        doc.addPage()
        y = this.margin + 10
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...this.colors.text)
      doc.text('DETAILED STATISTICS', this.margin, y)

      let currentY = y + 18

      // Create a simple chart representation
      const last7Days = this.getLast7DaysData(allSessions)
      
      // Chart title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('7-Day Practice Overview', this.margin, currentY)
      currentY += 15

      // Simple bar chart with bounds checking
      const chartWidth = Math.max(100, this.contentWidth - 40)
      const chartHeight = 35
      const barWidth = Math.max(15, chartWidth / 7)

      last7Days.forEach((day, index) => {
        // Calculate bar height with safety checks
        const sessions = Math.max(0, Math.min(10, day.sessions || 0)) // Cap at 10 sessions
        const barHeight = Math.max(2, Math.min(chartHeight - 5, sessions * 4)) // Minimum 2, max chartHeight-5
        
        const barX = this.margin + (index * barWidth)
        const barY = Math.max(currentY, currentY + chartHeight - barHeight)

        // Validate coordinates
        if (barX + barWidth <= this.pageWidth - this.margin && barY >= currentY) {
          // Bar
          doc.setFillColor(...this.colors.primary)
          doc.rect(barX + 2, barY, Math.max(1, barWidth - 4), barHeight, 'F')

          // Day label
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.setTextColor(...this.colors.textLight)
          doc.text(day.day || '', barX + 4, currentY + chartHeight + 10)

          // Value
          if (sessions > 0) {
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(7)
            doc.setTextColor(...this.colors.text)
            doc.text(sessions.toString(), barX + 6, Math.max(currentY + 10, barY - 2))
          }
        }
      })

      // Add summary statistics below chart
      currentY += chartHeight + 25
      
      const stats = this.calculateDetailedStats(allSessions)
      const summaryStats = [
        `Weekly Average: ${Math.round(stats.averageScore || 0)}%`,
        `Best Session: ${Math.round(stats.bestScore || 0)}%`,
        `Total Practice Time: ${stats.totalHours || 0} hours`,
        `Consistency: ${stats.currentStreak || 0} day streak`
      ]

      summaryStats.forEach((stat, index) => {
        const col = index % 2
        const row = Math.floor(index / 2)
        const x = this.margin + (col * 95)
        const yPos = currentY + (row * 12)
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...this.colors.textLight)
        doc.text(stat, x, yPos)
      })

      return currentY + 30
    } catch (error) {
      console.warn('Statistics section error:', error)
      return y + 50
    }
  }

  // Professional footer
  addProfessionalFooter(doc) {
    const footerY = this.pageHeight - 20
    
    // Footer line
    doc.setDrawColor(...this.colors.border)
    doc.setLineWidth(0.5)
    doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5)

    // Footer text
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...this.colors.textLight)
    doc.text('Generated by CalmAsana - Your AI Yoga Companion', this.margin, footerY)
    doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, this.pageWidth - this.margin, footerY, { align: 'right' })
    doc.text(new Date().toLocaleString(), this.pageWidth / 2, footerY, { align: 'center' })
  }

  // Helper methods for calculations
  calculateDetailedStats(sessions) {
    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        totalHours: 0,
        averageScore: 0,
        bestScore: 0,
        currentStreak: 0
      }
    }

    const totalTime = sessions.reduce((sum, s) => sum + (s.totalTime || 0), 0)
    const scores = sessions.map(s => s.avgScore || 0).filter(s => s > 0)
    
    return {
      totalSessions: sessions.length,
      totalHours: Math.round(totalTime / 3600 * 10) / 10, // Hours with 1 decimal
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      bestScore: Math.max(...scores, 0),
      currentStreak: this.calculateStreak(sessions)
    }
  }

  getLast7DaysData(sessions) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const data = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayName = days[date.getDay()]
      
      const daySessions = sessions.filter(s => 
        new Date(s.date).toDateString() === date.toDateString()
      )
      
      data.push({
        day: dayName,
        sessions: daySessions.length,
        avgScore: daySessions.length > 0 ? 
          Math.round(daySessions.reduce((sum, s) => sum + (s.avgScore || 0), 0) / daySessions.length) : 0
      })
    }
    
    return data
  }

  calculateStreak(sessions) {
    // Implementation from previous service
    if (sessions.length === 0) return 0
    const sortedSessions = sessions.sort((a, b) => new Date(b.date) - new Date(a.date))
    const sessionDates = sortedSessions.map(s => new Date(s.date).toDateString())
    const uniqueDates = [...new Set(sessionDates)]
    let streak = 0
    const today = new Date().toDateString()
    let currentDate = uniqueDates.includes(today) ? new Date() : new Date(Date.now() - 86400000)
    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toDateString()
      if (uniqueDates.includes(dateStr)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  }

  getQualityScore(sessionData) {
    return Math.min(100, Math.max(0, sessionData.avgScore || 0))
  }

  getConsistencyScore(sessionData) {
    // Simple consistency score based on session completion
    return sessionData.totalTime >= 600 ? 85 : Math.round((sessionData.totalTime || 0) / 600 * 85)
  }

  getImprovementScore(sessionData) {
    // Simple improvement indicator
    return sessionData.perfectPoses > 0 ? 90 : 70
  }

  generateRecommendations(sessionData, userProfile) {
    const recommendations = []
    const score = sessionData.avgScore || 0

    if (score >= 90) {
      recommendations.push('Excellent performance! Consider trying more challenging pose variations.')
      recommendations.push('Focus on maintaining this consistency across different sessions.')
    } else if (score >= 70) {
      recommendations.push('Great job! Try holding poses 5-10 seconds longer to improve scores.')
      recommendations.push('Focus on breathing technique to enhance stability.')
    } else if (score >= 50) {
      recommendations.push('Good effort! Practice the same poses multiple times to build muscle memory.')
      recommendations.push('Consider shorter, more frequent sessions to build consistency.')
    } else {
      recommendations.push('Keep practicing! Focus on proper form over speed.')
      recommendations.push('Try starting with easier poses and gradually increasing difficulty.')
    }

    if ((sessionData.totalTime || 0) < 600) {
      recommendations.push('Extend your practice time gradually for greater benefits.')
    }

    return recommendations
  }

  // Progress trends analysis for dashboard
  addProgressTrends(doc, sessions, y) {
    try {
      // Check if we need a new page
      if (y + 60 > this.pageHeight - 30) {
        doc.addPage()
        y = this.margin + 10
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...this.colors.text)
      doc.text('PROGRESS TRENDS', this.margin, y)

      let currentY = y + 18

      // Calculate trend data
      const recentSessions = sessions.slice(0, 10)
      const olderSessions = sessions.slice(10, 20)
      
      const recentAvg = recentSessions.length > 0 ? 
        recentSessions.reduce((sum, s) => sum + (s.avgScore || 0), 0) / recentSessions.length : 0
      const olderAvg = olderSessions.length > 0 ? 
        olderSessions.reduce((sum, s) => sum + (s.avgScore || 0), 0) / olderSessions.length : 0
      
      const trend = recentAvg - olderAvg

      // Trend indicators
      const trendData = [
        { 
          label: 'Performance Trend', 
          value: trend >= 0 ? `+${Math.round(trend)}%` : `${Math.round(trend)}%`,
          color: trend >= 0 ? this.colors.success : this.colors.danger
        },
        { 
          label: 'Session Frequency', 
          value: `${Math.round(sessions.length / 30 * 7)} per week`,
          color: this.colors.primary
        },
        { 
          label: 'Average Duration', 
          value: `${Math.round((sessions.reduce((sum, s) => sum + (s.totalTime || 0), 0) / sessions.length) / 60)} min`,
          color: this.colors.primary
        }
      ]

      trendData.forEach((item, index) => {
        const yPos = currentY + (index * 15)
        
        // Label
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(...this.colors.text)
        doc.text(item.label + ':', this.margin, yPos)
        
        // Value
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...item.color)
        doc.text(item.value, this.margin + 80, yPos)
      })

      return currentY + 50
    } catch (error) {
      console.warn('Progress trends error:', error)
      return y + 30
    }
  }

  // Achievement showcase for dashboard
  addAchievementShowcase(doc, userProfile, sessions, y) {
    try {
      // Check if we need a new page
      if (y + 70 > this.pageHeight - 30) {
        doc.addPage()
        y = this.margin + 10
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...this.colors.text)
      doc.text('ACHIEVEMENT HIGHLIGHTS', this.margin, y)

      let currentY = y + 18

      // Calculate achievements
      const stats = this.calculateDetailedStats(sessions)
      const achievements = [
        { 
          title: 'Practice Milestone', 
          description: `Completed ${stats.totalSessions} yoga sessions`,
          earned: stats.totalSessions > 0
        },
        { 
          title: 'Consistency Champion', 
          description: `Current streak: ${stats.currentStreak} days`,
          earned: stats.currentStreak >= 3
        },
        { 
          title: 'Excellence Achiever', 
          description: `Best score: ${stats.bestScore}%`,
          earned: stats.bestScore >= 80
        },
        { 
          title: 'Dedication Badge', 
          description: `${stats.totalHours} hours of practice`,
          earned: stats.totalHours >= 1
        }
      ]

      achievements.forEach((achievement, index) => {
        const yPos = currentY + (index * 12)
        
        // Achievement status indicator
        doc.setFillColor(...(achievement.earned ? this.colors.success : this.colors.border))
        doc.circle(this.margin + 5, yPos + 3, 2, 'F')
        
        // Achievement title
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(...this.colors.text)
        doc.text(achievement.title, this.margin + 15, yPos + 2)
        
        // Achievement description
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...this.colors.textLight)
        doc.text(achievement.description, this.margin + 15, yPos + 8)
      })

      return currentY + 55
    } catch (error) {
      console.warn('Achievement showcase error:', error)
      return y + 40
    }
  }

  // Goal progress analysis for dashboard
  addGoalProgressAnalysis(doc, userProfile, sessions, y) {
    try {
      // Check if we need a new page
      if (y + 50 > this.pageHeight - 30) {
        doc.addPage()
        y = this.margin + 10
      }

      // Section background
      doc.setFillColor(248, 250, 252) // Light background
      doc.rect(this.margin, y, this.contentWidth, 45, 'F')
      
      doc.setDrawColor(...this.colors.border)
      doc.setLineWidth(0.5)
      doc.rect(this.margin, y, this.contentWidth, 45, 'S')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...this.colors.text)
      doc.text('WELLNESS GOALS PROGRESS', this.margin + 5, y + 15)

      let currentY = y + 25

      // Goal analysis
      const stats = this.calculateDetailedStats(sessions)
      const goalData = [
        { 
          goal: 'Regular Practice', 
          progress: Math.min(100, (stats.currentStreak / 7) * 100),
          target: '7 days/week'
        },
        { 
          goal: 'Skill Improvement', 
          progress: Math.min(100, (stats.averageScore / 90) * 100),
          target: '90% average'
        },
        { 
          goal: 'Practice Duration', 
          progress: Math.min(100, (stats.totalHours / 10) * 100),
          target: '10+ hours'
        }
      ]

      goalData.forEach((item, index) => {
        const x = this.margin + 10 + (index * 55)
        
        // Goal name
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...this.colors.text)
        doc.text(item.goal, x, currentY)
        
        // Progress percentage
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(...this.colors.primary)
        doc.text(`${Math.round(item.progress)}%`, x, currentY + 8)
        
        // Target
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...this.colors.textLight)
        doc.text(item.target, x, currentY + 15)
      })

      return y + 50
    } catch (error) {
      console.warn('Goal progress error:', error)
      return y + 35
    }
  }

  // Helper method to validate coordinates
  validateCoordinates(x, y, width = 0, height = 0) {
    return {
      x: Math.max(0, Math.min(x || 0, this.pageWidth - width)),
      y: Math.max(0, Math.min(y || 0, this.pageHeight - height)),
      width: Math.max(0, Math.min(width || 0, this.pageWidth)),
      height: Math.max(0, Math.min(height || 0, this.pageHeight))
    }
  }

  // Helper method to safely add elements
  safeAddElement(doc, elementType, params) {
    try {
      const validated = this.validateCoordinates(params.x, params.y, params.width, params.height)
      
      switch (elementType) {
        case 'text':
          doc.text(params.text || '', validated.x, validated.y, params.options || {})
          break
        case 'rect':
          doc.rect(validated.x, validated.y, validated.width, validated.height, params.style || 'S')
          break
        case 'circle':
          const radius = Math.min(params.radius || 5, 20) // Max radius of 20
          doc.circle(validated.x, validated.y, radius, params.style || 'S')
          break
        case 'line':
          doc.line(validated.x, validated.y, 
                  Math.min(params.x2 || validated.x, this.pageWidth),
                  Math.min(params.y2 || validated.y, this.pageHeight))
          break
      }
    } catch (error) {
      console.warn(`Safe element addition failed for ${elementType}:`, error)
    }
  }

  // Public download methods with enhanced error handling
  downloadSessionReport(sessionData, userProfile) {
    try {
      // Validate and sanitize session data
      if (!sessionData) {
        throw new Error('Session data is required')
      }

      // Sanitize session data to prevent PDF generation issues
      const sanitizedSessionData = {
        date: sessionData.date || new Date().toISOString(),
        totalTime: Math.max(0, Math.min(7200, sessionData.totalTime || 0)), // Max 2 hours
        avgScore: Math.max(0, Math.min(100, sessionData.avgScore || 0)),
        posesAttempted: Math.max(1, Math.min(20, sessionData.posesAttempted || 1)), // Max 20 poses
        perfectPoses: Math.max(0, Math.min(20, sessionData.perfectPoses || 0)),
        avgHoldTime: Math.max(0, Math.min(300, sessionData.avgHoldTime || 0)), // Max 5 minutes
        poseResults: Array.isArray(sessionData.poseResults) ? 
          sessionData.poseResults.slice(0, 10).map(pose => ({
            name: (pose.name || 'Unknown').substring(0, 30),
            score: Math.max(0, Math.min(100, pose.score || 0)),
            time: Math.max(0, Math.min(300, pose.time || 0)),
            attempts: Math.max(1, Math.min(50, pose.attempts || 1))
          })) : [],
        restTime: Math.max(0, Math.min(600, sessionData.restTime || 0)),
        focusAreas: Array.isArray(sessionData.focusAreas) ? 
          sessionData.focusAreas.slice(0, 5) : ['General Wellness']
      }

      const doc = this.generateSessionReport(sanitizedSessionData, userProfile || {})
      const fileName = `CalmAsana-Session-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      return true
    } catch (error) {
      console.error('Error downloading session report:', error)
      throw new Error(`Failed to generate session report: ${error.message}`)
    }
  }

  downloadDashboardReport(userProfile, allSessions) {
    try {
      // Validate and sanitize data
      if (!Array.isArray(allSessions)) {
        allSessions = []
      }

      // Sanitize sessions data
      const sanitizedSessions = allSessions.slice(0, 100).map(session => ({
        date: session.date || new Date().toISOString(),
        totalTime: Math.max(0, Math.min(7200, session.totalTime || 0)),
        avgScore: Math.max(0, Math.min(100, session.avgScore || 0)),
        posesAttempted: Math.max(1, Math.min(20, session.posesAttempted || 1)),
        perfectPoses: Math.max(0, Math.min(20, session.perfectPoses || 0))
      }))

      const doc = this.generateDashboardReport(userProfile || {}, sanitizedSessions)
      const fileName = `CalmAsana-Progress-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      return true
    } catch (error) {
      console.error('Error downloading dashboard report:', error)
      throw new Error(`Failed to generate progress report: ${error.message}`)
    }
  }
}

// Export enhanced service instance
export const enhancedPdfService = new EnhancedPDFService()