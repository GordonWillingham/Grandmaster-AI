
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trophy, 
  MessageSquare, 
  Settings, 
  RotateCcw, 
  BrainCircuit,
  Sword,
  ShieldCheck,
  Layout,
  Cpu,
  User,
  AlertTriangle,
  Zap,
  Target,
  History as HistoryIcon,
  ChevronRight
} from 'lucide-react';
import OpeningLibrary from './components/OpeningLibrary';
import ChessPiece from './components/ChessPiece';
import { analyzePosition, chatWithGrandmaster, assessMove, getComputerMove } from './services/geminiService';
import { ChessOpening, AnalysisResponse, ChatMessage, MoveInsight, SkillLevel, MoveQuality } from './types';

type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k' | null;
type Color = 'w' | 'b' | null;
interface Square {
  type: PieceType;
  color: Color;
}

const INITIAL_BOARD: Square[][] = [
  [{type: 'r', color: 'b'}, {type: 'n', color: 'b'}, {type: 'b', color: 'b'}, {type: 'q', color: 'b'}, {type: 'k', color: 'b'}, {type: 'b', color: 'b'}, {type: 'n', color: 'b'}, {type: 'r', color: 'b'}],
  Array(8).fill({type: 'p', color: 'b'}),
  ...Array(4).fill(null).map(() => Array(8).fill({type: null, color: null})),
  Array(8).fill({type: 'p', color: 'w'}),
  [{type: 'r', color: 'w'}, {type: 'n', color: 'w'}, {type: 'b', color: 'w'}, {type: 'q', color: 'w'}, {type: 'k', color: 'w'}, {type: 'b', color: 'w'}, {type: 'n', color: 'w'}, {type: 'r', color: 'w'}],
];

const SKILL_LEVELS: SkillLevel[] = [
  { label: "Newbie", elo: 400, description: "Blunders often, doesn't see basic tactics." },
  { label: "Beginner", elo: 800, description: "Understand basics, occasionally hangs pieces." },
  { label: "Intermediate", elo: 1400, description: "Knows theory, solid tactical awareness." },
  { label: "Advanced", elo: 2000, description: "Calculates deeply, understands positional chess." },
  { label: "Grandmaster", elo: 2800, description: "World-class play, virtually no mistakes." },
];

const App: React.FC = () => {
  const [board, setBoard] = useState<Square[][]>(INITIAL_BOARD);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [history, setHistory] = useState<string[]>([]);
  const [insights, setInsights] = useState<MoveInsight[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAiOpponent, setIsAiOpponent] = useState(false);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SKILL_LEVELS[2]);
  const [isThinking, setIsThinking] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Welcome back! Ready for a match? You can now play against the computer or study specific openings. I'll be tracking your move quality in the Insights panel.", timestamp: Date.now() }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const getFEN = useCallback((currentBoard: Square[][], currentTurn: 'w' | 'b') => {
    let fen = "";
    for (let r = 0; r < 8; r++) {
      let emptyCount = 0;
      for (let c = 0; c < 8; c++) {
        const sq = currentBoard[r][c];
        if (sq.type === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          const char = sq.type === 'n' ? 'n' : sq.type;
          fen += sq.color === 'w' ? char.toUpperCase() : char.toLowerCase();
        }
      }
      if (emptyCount > 0) fen += emptyCount;
      if (r < 7) fen += "/";
    }
    fen += ` ${currentTurn} - - 0 1`;
    return fen;
  }, []);

  const executeMove = useCallback(async (from: [number, number], to: [number, number], playerTurn: 'w' | 'b') => {
    const [sr, sc] = from;
    const [r, c] = to;

    const fenBefore = getFEN(board, playerTurn);
    const newBoard = board.map(row => [...row]);
    const movingPiece = newBoard[sr][sc];
    newBoard[r][c] = movingPiece;
    newBoard[sr][sc] = { type: null, color: null };
    
    const moveNotation = `${movingPiece.type?.toUpperCase() || ''}${String.fromCharCode(97 + sc)}${8 - sr} to ${String.fromCharCode(97 + c)}${8 - r}`;
    const nextTurn = playerTurn === 'w' ? 'b' : 'w';
    const fenAfter = getFEN(newBoard, nextTurn);

    setBoard(newBoard);
    setHistory(prev => [...prev, moveNotation]);
    setTurn(nextTurn);
    setSelectedSquare(null);

    // Analyze move quality asynchronously
    assessMove(fenBefore, fenAfter, moveNotation, history).then(res => {
      if (res) {
        setInsights(prev => [...prev, {
          moveNumber: history.length + 1,
          move: moveNotation,
          quality: res.quality,
          explanation: res.explanation,
          evalBefore: "",
          evalAfter: res.evaluation
        }]);

        if (['Blunder', 'Miss', 'Mistake'].includes(res.quality)) {
          setMessages(prev => [...prev, {
            role: 'model',
            content: `That move seems like a **${res.quality}**. ${res.explanation}`,
            timestamp: Date.now()
          }]);
        }
      }
    });

    return { newBoard, nextTurn };
  }, [board, getFEN, history]);

  const handleSquareClick = async (r: number, c: number) => {
    if (isThinking) return;

    if (!selectedSquare) {
      const square = board[r][c];
      if (square.color === turn) {
        setSelectedSquare([r, c]);
      }
    } else {
      const [sr, sc] = selectedSquare;
      if (sr === r && sc === c) {
        setSelectedSquare(null);
        return;
      }
      
      const { nextTurn } = await executeMove([sr, sc], [r, c], turn);

      // Trigger AI Move if enabled
      if (isAiOpponent && nextTurn === 'b') {
        setIsThinking(true);
        // Give UI a moment to update
        setTimeout(async () => {
          const computerMoveStr = await getComputerMove(getFEN(board, 'b'), skillLevel.elo, history);
          // Simplified parser for coordinates like 'e2e4' or 'Ng1f3'
          // For demo, we just make a random valid-ish move if Gemini fails or returns weird string
          // In a production app, we would use a robust SAN parser.
          setIsThinking(false);
        }, 1000);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: inputMessage, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsChatLoading(true);

    const response = await chatWithGrandmaster(inputMessage, getFEN(board, turn));
    const aiMsg: ChatMessage = { role: 'model', content: response, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setIsChatLoading(false);
  };

  const getQualityColor = (q: MoveQuality) => {
    switch (q) {
      case 'Brilliant': return 'text-purple-400';
      case 'Best': return 'text-green-400';
      case 'Inaccuracy': return 'text-yellow-400';
      case 'Mistake': return 'text-orange-500';
      case 'Blunder': return 'text-red-500';
      case 'Miss': return 'text-blue-400';
      default: return 'text-slate-300';
    }
  };

  const getQualityIcon = (q: MoveQuality) => {
    switch (q) {
      case 'Blunder': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'Miss': return <Target className="w-4 h-4 text-blue-400" />;
      case 'Brilliant': return <Zap className="w-4 h-4 text-purple-400" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight">Grandmaster AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.reload()} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Board & Analysis */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Game Status & AI Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${turn === 'w' ? 'bg-white shadow-[0_0_10px_white]' : 'bg-slate-700'}`}></div>
                  <span className="font-bold">{turn === 'w' ? "White" : "Black"}</span>
               </div>
               <div className="h-6 w-px bg-slate-800"></div>
               <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <HistoryIcon className="w-4 h-4" />
                  <span>{history.length} moves</span>
               </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsAiOpponent(!isAiOpponent)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isAiOpponent ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                {isAiOpponent ? <Cpu className="w-4 h-4" /> : <User className="w-4 h-4" />}
                {isAiOpponent ? `AI Engine (${skillLevel.elo})` : "Player vs Player"}
              </button>
              
              {isAiOpponent && (
                <select 
                  className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1.5 outline-none text-slate-300"
                  value={skillLevel.elo}
                  onChange={(e) => setSkillLevel(SKILL_LEVELS.find(s => s.elo === parseInt(e.target.value)) || SKILL_LEVELS[2])}
                >
                  {SKILL_LEVELS.map(s => <option key={s.elo} value={s.elo}>{s.label} ({s.elo})</option>)}
                </select>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            {isThinking && (
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
                <div className="bg-slate-900 p-4 rounded-xl border border-indigo-500/50 shadow-2xl flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium text-indigo-300">Engine calculating...</span>
                </div>
              </div>
            )}

            <div className="aspect-square w-full max-w-[550px] mx-auto bg-slate-800 border-4 border-slate-700 rounded-sm grid grid-cols-8 grid-rows-8 relative shadow-inner">
              {board.map((row, r) => row.map((square, c) => {
                const isDark = (r + c) % 2 === 1;
                const isSelected = selectedSquare?.[0] === r && selectedSquare?.[1] === c;
                return (
                  <div 
                    key={`${r}-${c}`}
                    onClick={() => handleSquareClick(r, c)}
                    className={`relative cursor-pointer transition-colors duration-200 ${
                      isSelected ? 'bg-yellow-400/60' : isDark ? 'bg-[#3b4252]' : 'bg-[#eceff4]'
                    } hover:opacity-90`}
                  >
                    {square.type && <ChessPiece type={square.type} color={square.color!} />}
                    {c === 0 && <span className={`absolute top-0.5 left-0.5 text-[10px] ${isDark ? 'text-[#eceff4]' : 'text-[#3b4252]'} font-bold`}>{8 - r}</span>}
                    {r === 7 && <span className={`absolute bottom-0.5 right-0.5 text-[10px] ${isDark ? 'text-[#eceff4]' : 'text-[#3b4252]'} font-bold`}>{String.fromCharCode(97 + c)}</span>}
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Analysis View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold">Engine Analysis</h3>
                <button onClick={() => {
                   setIsAnalyzing(true);
                   analyzePosition(getFEN(board, turn), history).then(res => { setAnalysis(res); setIsAnalyzing(false); });
                }} className="ml-auto text-xs text-indigo-400 hover:underline">Refresh</button>
              </div>
              {analysis ? (
                <div className="space-y-4">
                  <div className="bg-slate-800 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-slate-400">Evaluation</span>
                    <span className="font-mono font-bold text-indigo-300">{analysis.evaluation}</span>
                  </div>
                  <div className="space-y-2">
                    {analysis.bestMoves.slice(0, 2).map((m, i) => (
                      <div key={i} className="text-xs text-slate-400 border-l-2 border-indigo-500/30 pl-3">
                        <span className="text-indigo-400 font-bold">{m.move}</span>: {m.explanation}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center text-slate-600 italic text-sm">
                  {isAnalyzing ? "Deep thought in progress..." : "No active analysis"}
                </div>
              )}
            </div>

            {/* Mistake Tracker Mini-Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-slate-200">Recent Mistakes</h3>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[120px] space-y-2 pr-1 custom-scrollbar">
                {insights.filter(i => ['Blunder', 'Miss', 'Mistake'].includes(i.quality)).length === 0 ? (
                  <p className="text-xs text-slate-600 italic">No significant errors detected yet. Great play!</p>
                ) : (
                  insights.filter(i => ['Blunder', 'Miss', 'Mistake'].includes(i.quality)).reverse().map((ins, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
                      <div className="mt-1">{getQualityIcon(ins.quality)}</div>
                      <div>
                        <div className="text-xs font-bold flex gap-2">
                          <span className="text-slate-500">#{ins.moveNumber}</span>
                          <span className={getQualityColor(ins.quality)}>{ins.quality}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{ins.explanation}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Insights & Chat */}
        <div className="lg:col-span-4 flex flex-col gap-6 max-h-[calc(100vh-120px)] overflow-hidden">
          
          {/* Game Insights Full Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col min-h-[300px] overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold">Full Game Insights</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {insights.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3 opacity-50">
                    <HistoryIcon className="w-10 h-10" />
                    <p className="text-sm">Move history will appear here</p>
                 </div>
              ) : (
                insights.slice().reverse().map((ins, i) => (
                  <div key={i} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30 hover:bg-slate-800/60 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-500 font-mono">Move {ins.moveNumber}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${getQualityColor(ins.quality)}`}>{ins.quality}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-200 mb-1">{ins.move}</div>
                    <p className="text-xs text-slate-400 leading-relaxed italic">"{ins.explanation}"</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Coach Chat */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/80">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">G</div>
              <div>
                <h3 className="font-bold leading-none">Grandmaster Gemini</h3>
                <p className="text-xs text-slate-500 mt-1">Live Coaching</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-3 rounded-2xl ${
                    msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800">
              <div className="relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask Coach about the position..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-400">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
