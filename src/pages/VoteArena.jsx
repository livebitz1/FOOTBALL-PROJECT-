"use client"

import { useState, useEffect, useCallback } from "react"
import VoteChart from "../components/VoteChart"

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
	// Team Alpha (11 players)
	{ id: 1, name: "Sara Khan", team: "Team Alpha", image: "🧤", votes: 12, position: "Goalkeeper" },
	{ id: 2, name: "Maya Chen", team: "Team Alpha", image: "🛡️", votes: 8, position: "Defender" },
	{ id: 3, name: "Isha Roy", team: "Team Alpha", image: "🛡️", votes: 7, position: "Defender" },
	{ id: 4, name: "Olivia Park", team: "Team Alpha", image: "🛡️", votes: 9, position: "Defender" },
	{ id: 5, name: "Emma Stone", team: "Team Alpha", image: "🛡️", votes: 6, position: "Defender" },
	{ id: 6, name: "Ava Patel", team: "Team Alpha", image: "⚽", votes: 10, position: "Midfielder" },
	{ id: 7, name: "Sophia Lee", team: "Team Alpha", image: "⚽", votes: 11, position: "Midfielder" },
	{ id: 8, name: "Zoe Martinez", team: "Team Alpha", image: "⚽", votes: 9, position: "Midfielder" },
	{ id: 9, name: "Liam Walker", team: "Team Alpha", image: "⚡", votes: 15, position: "Forward" },
	{ id: 10, name: "Alex Morgan", team: "Team Alpha", image: "⚡", votes: 13, position: "Forward" },
	{ id: 11, name: "Noah Reed", team: "Team Alpha", image: "⚡", votes: 14, position: "Forward" },

	// Team Beta (11 players)
	{ id: 12, name: "Ethan Brooks", team: "Team Beta", image: "🧤",
         votes: 11, position: "Goalkeeper" },
	{ id: 13, name: "Daniel Cruz", team: "Team Beta", image: "🛡️", votes: 9, position: "Defender" },
	{ id: 14, name: "Mateo Silva", team: "Team Beta", image: "🛡️", votes: 8, position: "Defender" },
	{ id: 15, name: "Omar Ali", team: "Team Beta", image: "🛡️", votes: 7, position: "Defender" },
	{ id: 16, name: "Lucas Hart", team: "Team Beta", image: "🛡️", votes: 10, position: "Defender" },
	{ id: 17, name: "Oliver Grant", team: "Team Beta", image: "⚽", votes: 12, position: "Midfielder" },
	{ id: 18, name: "Caleb Young", team: "Team Beta", image: "⚽", votes: 9, position: "Midfielder" },
	{ id: 19, name: "Mason King", team: "Team Beta", image: "⚽", votes: 11, position: "Midfielder" },
	{ id: 20, name: "Ethan Cole", team: "Team Beta", image: "⚡", votes: 14, position: "Forward" },
	{ id: 21, name: "Aiden Park", team: "Team Beta", image: "⚡", votes: 13, position: "Forward" },
	{ id: 22, name: "Chris Nolan", team: "Team Beta", image: "⚡", votes: 12, position: "Forward" },
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
		<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-4">
			{/* Header */}
			<div className="max-w-[1400px] mx-auto py-6">
				<div className="flex justify-between items-center flex-wrap gap-4 mb-8">
					<div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-sm">
						<span
							className={`w-2 h-2 rounded-full ${!hasSubmitted && timeRemaining > 0 ? "bg-emerald-500 animate-pulse" : "bg-gray-500"}`}
						></span>
						<span>
							Status: <strong>{!hasSubmitted && timeRemaining > 0 ? "Open" : "Closed"}</strong>
						</span>
					</div>

					<div
						className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${timeRemaining === 0 ? "bg-gray-500/10 border border-gray-500/30" : "bg-red-500/10 border border-red-500/30"}`}
					>
						<span>⏱️</span>
						<span>{formatTime(timeRemaining)}</span>
					</div>

					<button
						className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-cyan-500/20 hover:-translate-y-0.5"
						onClick={() => setShowStats(!showStats)}
					>
						{showStats ? "📊 Hide Stats" : "📊 Show Stats"}
					</button>
				</div>

				<div className="text-center mb-8">
					<h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-slate-50 bg-clip-text text-transparent mb-2">
						Vote Arena
					</h1>
					<p className="text-base text-slate-400">Cast your vote and predict the champions</p>
				</div>
			</div>

			{/* Stats Panel */}
			<div
				className={`max-w-[1400px] mx-auto mb-8 p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 transition-all duration-300 ${showStats ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0 overflow-hidden"}`}
			>
				<div className="text-center">
					<div className="text-3xl font-bold text-cyan-400 mb-1">{totalVoters.toLocaleString()}</div>
					<div className="text-sm text-slate-400">Total Voters</div>
				</div>
				<div className="text-center">
					<div className="text-3xl font-bold text-cyan-400 mb-1">{teams.reduce((sum, t) => sum + t.votes, 0)}</div>
					<div className="text-sm text-slate-400">Team Votes</div>
				</div>
				<div className="text-center">
					<div className="text-3xl font-bold text-cyan-400 mb-1">{players.reduce((sum, p) => sum + p.votes, 0)}</div>
					<div className="text-sm text-slate-400">MVP Votes</div>
				</div>
				<div className="text-center">
					<div className="text-3xl font-bold text-cyan-400 mb-1">{hasSubmitted ? getWinner() : "—"}</div>
					<div className="text-sm text-slate-400">Leading Team</div>
				</div>
			</div>

			{/* Winner Banner */}
			{hasSubmitted && (
				<div className="max-w-[1400px] mx-auto mb-8 p-8 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-2 border-emerald-500/30 rounded-2xl text-center">
					<div className="text-2xl font-bold text-emerald-400 mb-2">🏆 Current Leader</div>
					<div className="text-3xl font-extrabold text-slate-50">{getWinner()}</div>
				</div>
			)}

			{/* Main Content */}
			<div className="max-w-[1400px] mx-auto flex flex-col gap-8">
				{/* Teams Section */}
				<div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 transition-all duration-300 hover:border-white/20">
					<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
						<span className="text-3xl">🏆</span>
						Predict the Winner
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{teams.map((team) => {
							const percentage = getTeamPercentage(team.votes)
							const isSelected = teamVote === team.id
							const isLocked = lockedTeam || hasSubmitted || timeRemaining === 0

							return (
								<div
									key={team.id}
									className={`p-6 bg-white/[0.03] rounded-xl border-2 transition-all duration-300 cursor-pointer ${
										isSelected ? "border-cyan-500/50 bg-cyan-500/10" : "border-transparent"
									} ${isLocked ? "cursor-not-allowed opacity-70" : "hover:-translate-y-1 hover:bg-white/5"}`}
									onClick={() => !isLocked && voteTeam(team.id)}
								>
									<div className="flex items-center gap-4 mb-4">
										<div
											className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
											style={{ background: `${team.color}33` }}
										>
											{team.logo}
										</div>
										<div className="flex-1">
											<div className="text-lg font-semibold mb-1">{team.name}</div>
											<div className="text-xs text-slate-400 uppercase tracking-wider">Team</div>
										</div>
										<button
											className={`px-4 py-2 rounded-lg border-none font-semibold text-sm transition-all duration-200 ${
												isSelected && isLocked
													? "bg-emerald-500 text-white"
													: isLocked
													? "bg-gray-700 text-gray-500 cursor-not-allowed"
													: "bg-cyan-400 text-slate-900 hover:bg-cyan-500 hover:scale-105"
											}`}
											onClick={(e) => {
												e.stopPropagation()
												voteTeam(team.id)
											}}
											disabled={isLocked}
										>
											{isSelected && isLocked ? "✓ Voted" : "Vote"}
										</button>
									</div>

									<div className="mt-4">
										<div className="w-full h-2 bg-white/10 rounded overflow-hidden mb-2">
											<div
												className="h-full rounded transition-all duration-500"
												style={{
													width: `${percentage}%`,
													background: `linear-gradient(90deg, ${team.color} 0%, ${team.color}cc 100%)`,
												}}
											></div>
										</div>
										<div className="flex justify-between text-xs text-slate-400">
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
				<div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 transition-all duration-300 hover:border-white/20">
					<h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
						<span className="text-3xl">⭐</span>
						Vote for MVP
					</h2>
					<div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
						{players.map((player) => {
							const percentage = getPlayerPercentage(player.votes)
							const isSelected = mvpVote === player.id
							const isLocked = lockedMvp || hasSubmitted || timeRemaining === 0
							const teamColor = getTeamColor(player.team)

							return (
								<div
									key={player.id}
									className={`p-5 bg-white/[0.03] rounded-xl border-2 transition-all duration-300 cursor-pointer text-center ${
										isSelected ? "border-cyan-500/50 bg-cyan-500/10" : "border-transparent"
									} ${isLocked ? "cursor-not-allowed opacity-70" : "hover:-translate-y-1 hover:bg-white/5"}`}
									onClick={() => !isLocked && voteMvp(player.id)}
								>
									<div
										className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-3"
										style={{ background: `${teamColor}33` }}
									>
										{player.image}
									</div>
									<div className="text-sm font-semibold mb-1">{player.name}</div>
									<div className="text-xs text-slate-400 mb-1">{player.team}</div>
									<div className="text-[0.7rem] text-cyan-400 uppercase tracking-wider mb-3">{player.position}</div>

									<button
										className={`w-full px-2 py-2 rounded-md border-none font-semibold text-xs transition-all duration-200 mb-3 ${
											isSelected && isLocked
												? "bg-emerald-500 text-white"
												: isLocked
												? "bg-gray-700 text-gray-500 cursor-not-allowed"
												: "bg-cyan-400 text-slate-900 hover:bg-cyan-500"
										}`}
										onClick={(e) => {
											e.stopPropagation()
											voteMvp(player.id)
										}}
										disabled={isLocked}
									>
										{isSelected && isLocked ? "✓ Voted" : "Vote MVP"}
									</button>

									<div>
										<div className="w-full h-2 bg-white/10 rounded overflow-hidden mb-2">
											<div
												className="h-full rounded transition-all duration-500"
												style={{
													width: `${percentage}%`,
													background: `linear-gradient(90deg, ${teamColor} 0%, ${teamColor}cc 100%)`,
												}}
											></div>
										</div>
										<div className="flex justify-between text-xs text-slate-400">
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
				<div className="max-w-[1400px] mx-auto mt-8 p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
					<h3 className="text-xl font-bold mb-4">Your Vote History</h3>
					<div className="flex flex-col gap-3">
						{voteHistory.map((vote, index) => (
							<div key={index} className="flex justify-between items-center p-3 bg-white/[0.03] rounded-lg text-sm">
								<div className="flex items-center gap-3">
									<span
										className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
										vote.type === "team" ? "bg-cyan-500/20 text-cyan-400" : "bg-purple-500/20 text-purple-400"
										}`}
									>
										{vote.type}
									</span>
									<span>{vote.targetName}</span>
								</div>
								<span className="text-slate-400">{new Date(vote.timestamp).toLocaleTimeString()}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Submit Section */}
			<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex gap-4 max-md:flex-col max-md:w-[calc(100%-2rem)] max-md:max-w-[400px]">
				<button
					className={`px-8 py-4 rounded-xl border-none font-bold text-base transition-all duration-300 ${
						!teamVote || !mvpVote || hasSubmitted
							? "bg-white/10 text-gray-500 cursor-not-allowed shadow-none"
							: "bg-gradient-to-br from-cyan-400 to-cyan-600 text-slate-900 shadow-[0_10px_30px_rgba(34,211,238,0.3)] hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(34,211,238,0.4)]"
					}`}
					onClick={submitVotes}
					disabled={!teamVote || !mvpVote || hasSubmitted}
				>
					{hasSubmitted ? "✓ Votes Submitted" : "Submit Votes"}
				</button>
				{hasSubmitted && (
					<button
						className="px-8 py-4 rounded-xl border-2 border-white/20 bg-white/5 text-white font-semibold text-base transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
						onClick={resetVotes}
					>
						Reset Demo
					</button>
				)}
			</div>

			{/* Confirmation Modal */}
			<div
				className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/95 backdrop-blur-md px-12 py-8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-[200] text-center transition-opacity duration-300 ${
					showConfirmation ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
			>
				<div className="text-5xl mb-4">✓</div>
				<div className="text-xl font-bold">Votes Successfully Submitted!</div>
			</div>

			{/* Vote Chart Section (live results) */}
			<div className="max-w-[1400px] mx-auto mb-8">
				<VoteChart teams={teams} players={players} />
			</div>

			{/* Footer */}
			<div className="max-w-[1400px] mx-auto mt-12 mb-4 text-center text-xs text-slate-500 pb-24">
				<p>This is a demo voting arena. All votes are simulated and stored locally in your browser.</p>
				<p className="mt-2">Real-time updates are simulated for demonstration purposes.</p>
			</div>
		</div>
	)
}
