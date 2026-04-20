import React, { useState, useEffect } from 'react';
import { Target, ChevronRight, CheckCircle2, ChevronDown, ChevronUp, Copy, AlertCircle, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { generateQuestions, evaluateAnswer, getFinalReport } from './api';

export default function App() {
  const [screen, setScreen] = useState(1); // 1: Setup, 2: Interview, 3: Final Report

  // Setup State
  const [role, setRole] = useState('Software Engineer');
  const [level, setLevel] = useState('Junior (1-3 yrs)');
  const [type, setType] = useState('Technical');
  const [count, setCount] = useState(5);

  // Interview State
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [qaData, setQaData] = useState([]);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  // Final Report State
  const [finalReport, setFinalReport] = useState(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ROLES = ['Software Engineer', 'Product Manager', 'Data Analyst', 'UX Designer', 'Marketing Manager', 'Business Analyst', 'DevOps Engineer'];
  const LEVELS = ['Fresher (0-1 yrs)', 'Junior (1-3 yrs)', 'Mid-level (3-6 yrs)', 'Senior (6+ yrs)'];
  const TYPES = ['Technical', 'Behavioral', 'HR', 'Mixed'];
  const COUNTS = [3, 5, 7];

  const handleStart = async () => {
    setError(null);
    setLoading(true);
    try {
      const gQuestions = await generateQuestions({ role, level, type, count });
      setQuestions(gQuestions);
      setScreen(2);
      setCurrentIdx(0);
      setQaData([]);
    } catch (err) {
      setError(err.message || 'Failed to generate questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }
    setError(null);
    setIsEvaluating(true);
    try {
      const evalRes = await evaluateAnswer({
        role,
        level,
        question: questions[currentIdx],
        answer
      });

      setFeedback(evalRes);

      setQaData(prev => [...prev, {
        question: questions[currentIdx],
        answer,
        score: evalRes.score,
        strength: evalRes.strength,
        improvement: evalRes.improvement,
        modelAnswer: evalRes.modelAnswer
      }]);
    } catch (err) {
      setError(err.message || 'Failed to evaluate answer.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setAnswer('');
      setFeedback(null);
      setShowModelAnswer(false);
    } else {
      // Go to final report
      setLoading(true);
      setError(null);
      try {
        const report = await getFinalReport({ role, qaData });
        setFinalReport(report);
        setScreen(3);
      } catch (err) {
        setError(err.message || 'Failed to generate final report.');
      } finally {
        setLoading(false);
      }
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 8) return 'badge-green';
    if (score >= 4) return 'badge-amber';
    return 'badge-red';
  };

  const renderSetupScreen = () => (
    <div className="app-container">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Target size={48} className="text-gradient" style={{ margin: '0 auto', marginBottom: '1rem' }} />
        <h1>AI Interview Prep Tool</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Practice. Get Feedback. Get Hired.</p>
      </div>

      {error && <div className="alert"><AlertCircle size={20} /> {error}</div>}

      <div className="card">
        <div className="input-group">
          <label>Job Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label>Experience Level</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} disabled={loading}>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label>Interview Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} disabled={loading}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label>Number of Questions</label>
          <select value={count} onChange={(e) => setCount(Number(e.target.value))} disabled={loading}>
            {COUNTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleStart}
          disabled={loading}
          style={{ marginTop: '1rem' }}
        >
          {loading ? <><Loader2 className="animate-spin" /> Generating...</> : <><ChevronRight /> Start Interview</>}
        </button>
      </div>
    </div>
  );

  const renderInterviewScreen = () => (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem' }}>{role} Interview</h2>
        <span style={{ color: 'var(--text-muted)' }}>Question {currentIdx + 1} of {questions.length}</span>
      </div>

      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {error && <div className="alert"><AlertCircle size={20} /> {error}</div>}

      <div className="card">
        <p style={{ fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.6 }}>{questions[currentIdx]}</p>
      </div>

      {!feedback ? (
        <>
          <div className="input-group">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              disabled={isEvaluating}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleSubmitAnswer}
            disabled={isEvaluating || !answer.trim()}
          >
            {isEvaluating ? <><Loader2 className="animate-spin" /> Evaluating your answer...</> : 'Submit Answer'}
          </button>
        </>
      ) : (
        <div className="card" style={{ borderLeft: `4px solid var(--score-${feedback.score >= 8 ? 'green' : feedback.score >= 4 ? 'amber' : 'red'})` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Feedback</h3>
            <span className={`feedback-badge ${getScoreBadgeClass(feedback.score)}`}>
              Score: {feedback.score}/10
            </span>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong><span style={{ color: 'var(--score-green)' }}>Strength:</span></strong> {feedback.strength}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong><span style={{ color: 'var(--score-amber)' }}>Improvement:</span></strong> {feedback.improvement}
          </div>

          <div className="collapsible">
            <button
              className="collapsible-trigger"
              onClick={() => setShowModelAnswer(!showModelAnswer)}
            >
              {showModelAnswer ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              See ideal answer
            </button>
            {showModelAnswer && (
              <div className="collapsible-content">
                <button
                  className="copy-btn"
                  title="Copy"
                  onClick={() => navigator.clipboard.writeText(feedback.modelAnswer)}
                >
                  <Copy size={16} />
                </button>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', paddingRight: '2rem' }}>
                  {feedback.modelAnswer}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {feedback && (
        <button className="btn btn-primary" onClick={handleNextQuestion} disabled={loading}>
          {loading ? <><Loader2 className="animate-spin" /> Generating Final Report...</> : (
            currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Interview'
          )}
        </button>
      )}
    </div>
  );

  const renderFinalReport = () => {
    const avgScore = qaData.length ? Math.round(qaData.reduce((acc, curr) => acc + curr.score, 0) / qaData.length) : 0;

    // Distribution for pie chart
    let excellent = 0, good = 0, needsWork = 0;
    qaData.forEach(d => {
      if (d.score >= 8) excellent++;
      else if (d.score >= 5) good++;
      else needsWork++;
    });

    const data = [
      { name: 'Excellent (8-10)', value: excellent, color: '#22c55e' },
      { name: 'Good (5-7)', value: good, color: '#f59e0b' },
      { name: 'Needs Work (0-4)', value: needsWork, color: '#ef4444' }
    ].filter(i => i.value > 0);

    return (
      <div className="app-container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <CheckCircle2 size={48} color="var(--score-green)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
          <h1>Interview Complete! Here's your report 📊</h1>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Overall Score</div>
            <div className={`text-gradient`} style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1 }}>
              <span style={{ color: `var(--score-${avgScore >= 8 ? 'green' : avgScore >= 5 ? 'amber' : 'red'})`, WebkitTextFillColor: `var(--score-${avgScore >= 8 ? 'green' : avgScore >= 5 ? 'amber' : 'red'})` }}>
                {avgScore}
              </span>
              <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', WebkitTextFillColor: 'var(--text-muted)' }}>/10</span>
            </div>
          </div>

          <div style={{ width: '300px', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderRadius: '0.5rem' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Strengths Summary</h3>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {finalReport?.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Areas for Improvement</h3>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {finalReport?.improvements.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Question Breakdown</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Q#</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Score</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {qaData.map((d, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', verticalAlign: 'top' }}>{i + 1}</td>
                    <td style={{ padding: '0.75rem', verticalAlign: 'top' }}>
                      <span className={`feedback-badge ${getScoreBadgeClass(d.score)}`} style={{ padding: '0.1rem 0.5rem' }}>
                        {d.score}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      <div style={{ marginBottom: '0.25rem' }}><strong>+</strong> {d.strength}</div>
                      <div><strong>-</strong> {d.improvement}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => { setScreen(1); setFinalReport(null); }}
        >
          Try Again
        </button>
      </div>
    );
  };

  return (
    <>
      {screen === 1 && renderSetupScreen()}
      {screen === 2 && renderInterviewScreen()}
      {screen === 3 && renderFinalReport()}

      <div className="footer">
      </div>
    </>
  );
}
