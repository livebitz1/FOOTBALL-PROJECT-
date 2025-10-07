"use client"
import React, { useMemo, useState } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Custom tooltip to display detailed info on hover
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload || {}
  return (
    <div className="bg-slate-950/95 border border-white/6 rounded-lg p-3 text-sm text-slate-200 shadow-2xl">
      <div className="font-bold text-cyan-400 mb-1">{d.name}</div>
      {d.team && (
        <div className="text-xs text-slate-400">Team: <span className="text-slate-100 font-medium ml-1">{d.team}</span></div>
      )}
      {d.position && (
        <div className="text-xs text-slate-400">Position: <span className="text-slate-100 font-medium ml-1">{d.position}</span></div>
      )}
      <div className="mt-2 text-xs text-slate-400 flex justify-between">
        <span>Votes</span>
        <span className="text-slate-100 font-semibold">{(d.votes || 0).toLocaleString()}</span>
      </div>
    </div>
  )
}

export default function VoteChart({ teams = [], players = [] }) {
  const [view, setView] = useState("teams") // "teams" or "players"
  const [metric, setMetric] = useState("votes") // "votes" or "percentage"
  const [sortBy, setSortBy] = useState("votes") // "votes" or "name"
  const [teamFilter, setTeamFilter] = useState("All") // used when view === 'players'

  // map team name -> color for consistent coloring
  const teamColorMap = useMemo(() => {
    const map = {}
    teams.forEach((t) => {
      map[t.name] = t.color || "#06b6d4"
    })
    return map
  }, [teams])

  // Prepare team data
  const totalTeamVotes = useMemo(() => teams.reduce((s, t) => s + (t.votes || 0), 0), [teams])
  const teamData = useMemo(() => {
    return teams.map((t) => ({
      key: t.id ?? t.name,
      name: t.name,
      votes: t.votes || 0,
      percentage: totalTeamVotes > 0 ? (t.votes / totalTeamVotes) * 100 : 0,
      color: t.color || "#06b6d4",
    }))
  }, [teams, totalTeamVotes])

  // Prepare player data (use all players, but allow filtering by team)
  const totalPlayerVotes = useMemo(() => players.reduce((s, p) => s + (p.votes || 0), 0), [players])
  const playerData = useMemo(() => {
    return players.map((p) => ({
      key: p.id ?? p.name,
      name: p.name,
      shortName: p.name.split(" ")[0],
      team: p.team || "",
      position: p.position || "",
      votes: p.votes || 0,
      percentage: totalPlayerVotes > 0 ? (p.votes / totalPlayerVotes) * 100 : 0,
      color: teamColorMap[p.team] || "#22d3ee",
    }))
  }, [players, totalPlayerVotes, teamColorMap])

  // Choose displayed dataset
  const displayed = useMemo(() => {
    const src = view === "teams" ? [...teamData] : [...playerData]
    // apply team filter for players
    let filtered = src
    if (view === "players" && teamFilter !== "All") {
      filtered = src.filter((x) => x.team === teamFilter)
    }
    if (sortBy === "votes") filtered.sort((a, b) => b.votes - a.votes)
    else filtered.sort((a, b) => a.name.localeCompare(b.name))
    return filtered
  }, [view, teamData, playerData, sortBy, teamFilter])

  const valueKey = metric === "votes" ? "votes" : "percentage"

  // Determine top index for highlighting
  const topIndex = displayed.reduce((best, cur, i) => (cur.votes > (displayed[best]?.votes || -1) ? i : best), 0)

  // Tooltip formatter
  const tooltipFormatter = (value, name) => {
    if (name === "percentage") return [`${Number(value).toFixed(1)}%`, "Share"]
    return [Number(value).toLocaleString(), name === "votes" ? "Votes" : name]
  }

  // Top-by-position summary (for players view)
  const topByPosition = useMemo(() => {
    if (view !== "players") return []
    const groups = {}
    displayed.forEach((p) => {
      const pos = p.position || "Other"
      if (!groups[pos]) groups[pos] = []
      groups[pos].push(p)
    })
    const result = Object.keys(groups).map((pos) => ({
      position: pos,
      top: groups[pos].sort((a, b) => b.votes - a.votes)[0] || null,
    }))
    return result
  }, [view, displayed])

  // Build list of teams for filter
  const teamOptions = useMemo(() => ["All", ...teams.map((t) => t.name)], [teams])

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 border border-white/5 shadow-lg">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-50 flex items-center gap-3">
            <span className="text-2xl">📊</span>
            Live Voting Results
          </h3>
          <p className="text-xs text-slate-400">Interactive bar chart — reflects football squads and positions</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/3 rounded-md p-1">
            <button className={`px-2 py-1 text-xs rounded ${view === "teams" ? "bg-cyan-400 text-slate-900" : "text-slate-300"}`} onClick={() => setView("teams")}>Teams</button>
            <button className={`px-2 py-1 text-xs rounded ${view === "players" ? "bg-cyan-400 text-slate-900" : "text-slate-300"}`} onClick={() => setView("players")}>Players</button>
          </div>

          <div className="flex items-center bg-white/3 rounded-md p-1">
            <button className={`px-2 py-1 text-xs rounded ${metric === "votes" ? "bg-white/10 text-slate-50" : "text-slate-300"}`} onClick={() => setMetric("votes")}>Votes</button>
            <button className={`px-2 py-1 text-xs rounded ${metric === "percentage" ? "bg-white/10 text-slate-50" : "text-slate-300"}`} onClick={() => setMetric("percentage")}>%</button>
          </div>

          <div className="flex items-center bg-white/3 rounded-md p-1">
            <button className={`px-2 py-1 text-xs rounded ${sortBy === "votes" ? "bg-white/10 text-slate-50" : "text-slate-300"}`} onClick={() => setSortBy("votes")}>Sort: Votes</button>
            <button className={`px-2 py-1 text-xs rounded ${sortBy === "name" ? "bg-white/10 text-slate-50" : "text-slate-300"}`} onClick={() => setSortBy("name")}>Sort: Name</button>
          </div>

          {view === "players" && (
            <div className="flex items-center bg-white/3 rounded-md p-1">
              {teamOptions.map((opt) => (
                <button
                  key={opt}
                  className={`px-2 py-1 text-xs rounded ${teamFilter === opt ? "bg-cyan-400 text-slate-900" : "text-slate-300"}`}
                  onClick={() => setTeamFilter(opt)}
                >
                  {opt === "All" ? "All Teams" : opt.split(" ")[1] || opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayed} margin={{ top: 16, right: 24, left: 8, bottom: 36 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey={view === "teams" ? "name" : "shortName"}
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
              interval={Math.max(0, Math.floor(displayed.length / 8))}
              angle={0}
              dy={6}
            />
            <YAxis stroke="#94a3b8" tickFormatter={(v) => (metric === "percentage" ? `${v}%` : v.toLocaleString())} />
            {/* Use custom tooltip to show votes, team, position, percentage */}
            <Tooltip content={<CustomTooltip />} />

            <Bar dataKey={valueKey} animationDuration={500} radius={[6, 6, 0, 0]}>
              {displayed.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={entry.color || (view === "teams" ? "#06b6d4" : "#22d3ee")}
                  opacity={idx === topIndex ? 1 : 0.9}
                  stroke={idx === topIndex ? "rgba(255,255,255,0.06)" : "transparent"}
                  strokeWidth={idx === topIndex ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-start justify-between text-xs text-slate-400 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-cyan-400" />
              <span>Primary color = team</span>
            </div>
            <div className="flex items-center gap-2">
              <ChevronLeft size={14} className="text-slate-400" />
              <span className="text-slate-300">Use horizontal scroll on small screens</span>
              <ChevronRight size={14} className="text-slate-400" />
            </div>
          </div>

          {view === "players" && (
            <div>
              <div className="text-xs text-slate-300 font-semibold">Top by position</div>
              <div className="flex gap-3 mt-2 flex-wrap">
                {topByPosition.map((item) => (
                  <div key={item.position} className="bg-white/3 px-3 py-1 rounded-md text-xs text-slate-200 flex items-center gap-2">
                    <span className="font-medium">{item.position}</span>
                    {item.top ? (
                      <span className="text-cyan-300">{item.top.name.split(" ")[0]} ({item.top.votes})</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-right">
          <div>
            <span className="font-medium text-slate-200">Total:</span>
            <span className="ml-2 text-cyan-400 font-bold">{view === "teams" ? totalTeamVotes.toLocaleString() : totalPlayerVotes.toLocaleString()}</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">Showing {displayed.length} {view === 'teams' ? 'teams' : 'players'}</div>
        </div>
      </div>
    </div>
  )
}
