"use client"

import { useState, useEffect, useCallback } from "react"

// Initial data
const teamsInit = [
  {
    id: "A",
    name: "Team Alpha",
    logo: "🔵",
    votes: 48,
    color: "#3b82f6",
  },
  {
    id: "B",
    name: "Team Beta",
    logo: "🔴",
    votes: 52,
    color: "#ef4444",
  },
]

const playersInit = [
  { id: 1, name: "Sara Khan", team: "Team Alpha", image: "👩", votes: 24, position: "Forward" },
  { id: 2, name: "Liam Walker", team: "Team Beta", image: "👨", votes: 31, position: "Midfielder" },
  { id: 3, name: "Isha Roy", team: "Team Alpha", image: "👩", votes: 18, position: "Defender" },
  { id: 4, name: "Noah Reed", team: "Team Beta", image: "👨", votes: 27, position: "Goalkeeper" },
  { id: 5, name: "Maya Chen", team: "Team Alpha", image: "👩", votes: 15, position: "Midfielder" },
  { id: 6, name: "Alex Turner", team: "Team Beta", image: "👨", votes: 22, position: "Forward" },
]

export default function VoteArena() {
  const [teams, setTeams] = useState(teamsInit)
  const [players, setPlayers] = useState(playersInit)
  const [teamVote, setTeamVote] = useState(null)
  const [mvpVote, setMvpVote] = useState(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [lockedTeam, setLockedTeam] = useState(false)
  const [lockedMvp, setLockedMvp] = useState(false)
  const [voteHistory, setVoteHistory] = useState([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [showStats, setShowStats] = useState(false)
  const [totalVoters, setTotalVoters] = useState(1247)
  const [realtimeInterval, setRealtimeInterval] = useState(null)

  // Timer countdown
  useEffect(() => {
    if (!isTimerActive || hasSubmitted) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTimerActive, hasSubmitted])

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate percentages
  const getTeamPercentage = (teamVotes) => {
    const total = teams.reduce((sum, t) => sum + t.votes, 0)
    return total > 0 ? Math.round((teamVotes / total) * 100) : 0
  }

  const getPlayerPercentage = (playerVotes) => {
    const total = players.reduce((sum, p) => sum + p.votes, 0)
    return total > 0 ? Math.round((playerVotes / total) * 100) : 0
  }

  // Vote for team
  const voteTeam = useCallback(
    (id) => {
      if (lockedTeam || hasSubmitted || timeRemaining === 0) return

      const team = teams.find((t) => t.id === id)
      if (!team) return

      setTeamVote(id)
      setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, votes: t.votes + 1 } : t)))
      setLockedTeam(true)

      setVoteHistory((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          type: "team",
          targetId: id,
          targetName: team.name,
        },
      ])

      setTotalVoters((prev) => prev + 1)
    },
    [lockedTeam, hasSubmitted, timeRemaining, teams],
  )

  // Vote for MVP
  const voteMvp = useCallback(
    (pid) => {
      if (lockedMvp || hasSubmitted || timeRemaining === 0) return

      const player = players.find((p) => p.id === pid)
      if (!player) return

      setMvpVote(pid)
      setPlayers((prev) => prev.map((p) => (p.id === pid ? { ...p, votes: p.votes + 1 } : p)))
      setLockedMvp(true)

      setVoteHistory((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          type: "mvp",
          targetId: pid,
          targetName: player.name,
        },
      ])
    },
    [lockedMvp, hasSubmitted, timeRemaining, players],
  )

  // Submit votes
  const submitVotes = useCallback(() => {
    if (!teamVote || !mvpVote || hasSubmitted) return

    setHasSubmitted(true)
    setShowConfirmation(true)
    setIsTimerActive(false)

    // Start real-time simulation
    simulateRealtimeProgress()

    // Hide confirmation after 3 seconds
    setTimeout(() => {
      setShowConfirmation(false)
    }, 3000)
  }, [teamVote, mvpVote, hasSubmitted])

  // Simulate real-time progress
  const simulateRealtimeProgress = () => {
    const interval = setInterval(() => {
      setTeams((prev) =>
        prev.map((t) => ({
          ...t,
          votes: t.votes + (Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0),
        })),
      )

      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          votes: p.votes + (Math.random() > 0.6 ? Math.floor(Math.random() * 2) : 0),
        })),
      )

      setTotalVoters((prev) => prev + Math.floor(Math.random() * 5))
    }, 2000)

    setRealtimeInterval(interval)

    // Stop after 15 seconds
    setTimeout(() => {
      clearInterval(interval)
    }, 15000)
  }

  // Get winner
  const getWinner = () => {
    const sorted = [...teams].sort((a, b) => b.votes - a.votes)
    if (sorted[0].votes === sorted[1].votes) return "Tie"
    return sorted[0].name
  }

  // Get MVP leader
  const getMvpLeader = () => {
    const sorted = [...players].sort((a, b) => b.votes - a.votes)
    return sorted[0]
  }

  // Reset votes (for demo purposes)
  const resetVotes = () => {
    setTeams(teamsInit)
    setPlayers(playersInit)
    setTeamVote(null)
    setMvpVote(null)
    setHasSubmitted(false)
    setLockedTeam(false)
    setLockedMvp(false)
    setVoteHistory([])
    setTimeRemaining(300)
    setIsTimerActive(true)
    setTotalVoters(1247)
    if (realtimeInterval) {
      clearInterval(realtimeInterval)
    }
  }

  // Get team by player
  const getTeamColor = (teamName) => {
    const team = teams.find((t) => t.name === teamName)
    return team?.color || "#6b7280"
  }

  return (
    <div className="vote-arena-container">
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .vote-arena-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
          padding: 1rem;
        }

        .header {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem 0;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.875rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .status-dot.active {
          background: #10b981;
        }

        .status-dot.inactive {
          background: #6b7280;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .timer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .timer.expired {
          background: rgba(107, 114, 128, 0.1);
          border-color: rgba(107, 114, 128, 0.3);
        }

        .stats-toggle {
          padding: 0.5rem 1rem;
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 8px;
          color: #22d3ee;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .stats-toggle:hover {
          background: rgba(34, 211, 238, 0.2);
          transform: translateY(-1px);
        }

        .title-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .main-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #22d3ee 0%, #f8fafc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 1rem;
          color: #94a3b8;
          font-weight: 400;
        }

        .stats-panel {
          max-width: 1400px;
          margin: 0 auto 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .stats-panel.visible {
          opacity: 1;
          max-height: 500px;
          margin-bottom: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #22d3ee;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        /* Changed layout to vertical stacking instead of side-by-side grid */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .section-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .section-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-icon {
          font-size: 1.75rem;
        }

        .teams-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .teams-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .team-card {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .team-card:hover:not(.locked) {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.05);
        }

        /* Updated selected state to use cyan color */
        .team-card.selected {
          border-color: rgba(34, 211, 238, 0.5);
          background: rgba(34, 211, 238, 0.1);
        }

        .team-card.locked {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .team-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .team-logo {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          background: rgba(255, 255, 255, 0.1);
        }

        .team-info {
          flex: 1;
        }

        .team-name {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .team-label {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Updated button colors to cyan */
        .vote-button {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: none;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #22d3ee;
          color: #0f172a;
        }

        .vote-button:hover:not(:disabled) {
          background: #06b6d4;
          transform: scale(1.05);
        }

        .vote-button:disabled {
          background: #374151;
          color: #6b7280;
          cursor: not-allowed;
        }

        .vote-button.voted {
          background: #10b981;
          color: white;
        }

        .progress-section {
          margin-top: 1rem;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        /* Updated default progress bar to cyan gradient */
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #22d3ee 0%, #06b6d4 100%);
          transition: width 0.5s ease;
          border-radius: 4px;
        }

        .progress-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .players-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1rem;
        }

        .player-card {
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          cursor: pointer;
          text-align: center;
        }

        .player-card:hover:not(.locked) {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.05);
        }

        /* Updated selected state to use cyan color */
        .player-card.selected {
          border-color: rgba(34, 211, 238, 0.5);
          background: rgba(34, 211, 238, 0.1);
        }

        .player-card.locked {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .player-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 0.75rem;
        }

        .player-name {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .player-team {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-bottom: 0.25rem;
        }

        .player-position {
          font-size: 0.7rem;
          color: #22d3ee;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        /* Updated player button colors to cyan */
        .player-vote-button {
          width: 100%;
          padding: 0.5rem;
          border-radius: 6px;
          border: none;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #22d3ee;
          color: #0f172a;
          margin-bottom: 0.75rem;
        }

        .player-vote-button:hover:not(:disabled) {
          background: #06b6d4;
        }

        .player-vote-button:disabled {
          background: #374151;
          color: #6b7280;
          cursor: not-allowed;
        }

        .player-vote-button.voted {
          background: #10b981;
          color: white;
        }

        .submit-section {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          gap: 1rem;
        }

        /* Updated submit button to cyan gradient */
        .submit-button {
          padding: 1rem 2rem;
          border-radius: 12px;
          border: none;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
          color: #0f172a;
          box-shadow: 0 10px 30px rgba(34, 211, 238, 0.3);
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(34, 211, 238, 0.4);
        }

        .submit-button:disabled {
          background: rgba(255, 255, 255, 0.1);
          color: #6b7280;
          cursor: not-allowed;
          box-shadow: none;
        }

        .reset-button {
          padding: 1rem 2rem;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .reset-button:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .confirmation-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(16, 185, 129, 0.95);
          backdrop-filter: blur(10px);
          padding: 2rem 3rem;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          z-index: 200;
          text-align: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .confirmation-modal.visible {
          opacity: 1;
        }

        .confirmation-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .confirmation-text {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .vote-history-section {
          max-width: 1400px;
          margin: 2rem auto;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .history-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .history-type {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        /* Updated history type colors to cyan */
        .history-type.team {
          background: rgba(34, 211, 238, 0.2);
          color: #22d3ee;
        }

        .history-type.mvp {
          background: rgba(168, 85, 247, 0.2);
          color: #c084fc;
        }

        .footer {
          max-width: 1400px;
          margin: 3rem auto 1rem;
          text-align: center;
          font-size: 0.75rem;
          color: #64748b;
          padding-bottom: 6rem;
        }

        .winner-banner {
          max-width: 1400px;
          margin: 2rem auto;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 16px;
          text-align: center;
        }

        .winner-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #10b981;
          margin-bottom: 0.5rem;
        }

        .winner-name {
          font-size: 2rem;
          font-weight: 800;
          color: #f8fafc;
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 2rem;
          }

          .section-card {
            padding: 1.5rem;
          }

          .submit-section {
            flex-direction: column;
            width: calc(100% - 2rem);
            max-width: 400px;
          }

          .players-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          }
        }

        @media (max-width: 480px) {
          .header-top {
            flex-direction: column;
            align-items: stretch;
          }

          .status-badge,
          .timer,
          .stats-toggle {
            justify-content: center;
          }

          .teams-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <div className="header-top">
          <div className="status-badge">
            <span className={`status-dot ${!hasSubmitted && timeRemaining > 0 ? "active" : "inactive"}`}></span>
            <span>
              Status: <strong>{!hasSubmitted && timeRemaining > 0 ? "Open" : "Closed"}</strong>
            </span>
          </div>

          <div className={`timer ${timeRemaining === 0 ? "expired" : ""}`}>
            <span>⏱️</span>
            <span>{formatTime(timeRemaining)}</span>
          </div>

          <button className="stats-toggle" onClick={() => setShowStats(!showStats)}>
            {showStats ? "📊 Hide Stats" : "📊 Show Stats"}
          </button>
        </div>

        <div className="title-section">
          <h1 className="main-title">Vote Arena</h1>
          <p className="subtitle">Cast your vote and predict the champions</p>
        </div>
      </div>

      {/* Stats Panel */}
      <div className={`stats-panel ${showStats ? "visible" : ""}`}>
        <div className="stat-item">
          <div className="stat-value">{totalVoters.toLocaleString()}</div>
          <div className="stat-label">Total Voters</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{teams.reduce((sum, t) => sum + t.votes, 0)}</div>
          <div className="stat-label">Team Votes</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{players.reduce((sum, p) => sum + p.votes, 0)}</div>
          <div className="stat-label">MVP Votes</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{hasSubmitted ? getWinner() : "—"}</div>
          <div className="stat-label">Leading Team</div>
        </div>
      </div>

      {/* Winner Banner */}
      {hasSubmitted && (
        <div className="winner-banner">
          <div className="winner-title">🏆 Current Leader</div>
          <div className="winner-name">{getWinner()}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Teams Section */}
        <div className="section-card">
          <h2 className="section-title">
            <span className="section-icon">🏆</span>
            Predict the Winner
          </h2>
          <div className="teams-grid">
            {teams.map((team) => {
              const percentage = getTeamPercentage(team.votes)
              const isSelected = teamVote === team.id
              const isLocked = lockedTeam || hasSubmitted || timeRemaining === 0

              return (
                <div
                  key={team.id}
                  className={`team-card ${isSelected ? "selected" : ""} ${isLocked ? "locked" : ""}`}
                  onClick={() => !isLocked && voteTeam(team.id)}
                >
                  <div className="team-header">
                    <div className="team-logo" style={{ background: `${team.color}33` }}>
                      {team.logo}
                    </div>
                    <div className="team-info">
                      <div className="team-name">{team.name}</div>
                      <div className="team-label">Team</div>
                    </div>
                    <button
                      className={`vote-button ${isSelected && isLocked ? "voted" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        voteTeam(team.id)
                      }}
                      disabled={isLocked}
                    >
                      {isSelected && isLocked ? "✓ Voted" : "Vote"}
                    </button>
                  </div>

                  <div className="progress-section">
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${percentage}%`,
                          background: `linear-gradient(90deg, ${team.color} 0%, ${team.color}cc 100%)`,
                        }}
                      ></div>
                    </div>
                    <div className="progress-stats">
                      <span>{team.votes} votes</span>
                      <span>{percentage}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Players Section */}
        <div className="section-card">
          <h2 className="section-title">
            <span className="section-icon">⭐</span>
            Vote for MVP
          </h2>
          <div className="players-grid">
            {players.map((player) => {
              const percentage = getPlayerPercentage(player.votes)
              const isSelected = mvpVote === player.id
              const isLocked = lockedMvp || hasSubmitted || timeRemaining === 0
              const teamColor = getTeamColor(player.team)

              return (
                <div
                  key={player.id}
                  className={`player-card ${isSelected ? "selected" : ""} ${isLocked ? "locked" : ""}`}
                  onClick={() => !isLocked && voteMvp(player.id)}
                >
                  <div className="player-avatar" style={{ background: `${teamColor}33` }}>
                    {player.image}
                  </div>
                  <div className="player-name">{player.name}</div>
                  <div className="player-team">{player.team}</div>
                  <div className="player-position">{player.position}</div>

                  <button
                    className={`player-vote-button ${isSelected && isLocked ? "voted" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      voteMvp(player.id)
                    }}
                    disabled={isLocked}
                  >
                    {isSelected && isLocked ? "✓ Voted" : "Vote MVP"}
                  </button>

                  <div className="progress-section">
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${percentage}%`,
                          background: `linear-gradient(90deg, ${teamColor} 0%, ${teamColor}cc 100%)`,
                        }}
                      ></div>
                    </div>
                    <div className="progress-stats">
                      <span>{player.votes}</span>
                      <span>{percentage}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Vote History */}
      {voteHistory.length > 0 && (
        <div className="vote-history-section">
          <h3 className="history-title">Your Vote History</h3>
          <div className="history-list">
            {voteHistory.map((vote, index) => (
              <div key={index} className="history-item">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className={`history-type ${vote.type}`}>{vote.type}</span>
                  <span>{vote.targetName}</span>
                </div>
                <span>{new Date(vote.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Section */}
      <div className="submit-section">
        <button className="submit-button" onClick={submitVotes} disabled={!teamVote || !mvpVote || hasSubmitted}>
          {hasSubmitted ? "✓ Votes Submitted" : "Submit Votes"}
        </button>
        {hasSubmitted && (
          <button className="reset-button" onClick={resetVotes}>
            Reset Demo
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      <div className={`confirmation-modal ${showConfirmation ? "visible" : ""}`}>
        <div className="confirmation-icon">✓</div>
        <div className="confirmation-text">Votes Successfully Submitted!</div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>This is a demo voting arena. All votes are simulated and stored locally in your browser.</p>
        <p style={{ marginTop: "0.5rem" }}>Real-time updates are simulated for demonstration purposes.</p>
      </div>
    </div>
  )
}
