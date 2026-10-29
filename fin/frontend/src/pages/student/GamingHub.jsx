
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Brain, Target, Car, Bike, Puzzle, Trophy, ChevronLeft, Play, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GamingHub = () => {
    const navigate = useNavigate();
    const [scores, setScores] = useState([]);
    const [activeGame, setActiveGame] = useState(null);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get('http://127.0.0.1:5000/api/student/game/scores', config);
                setScores(data);
            } catch (error) {
                console.error('Error fetching scores', error);
            }
        };
        fetchScores();
    }, []);

    const games = [
        { id: 'mind', title: 'Mind Mastery', icon: <Brain />, color: 'from-purple-500 to-indigo-600', description: 'Test your memory and pattern recognition skills.' },
        { id: 'problem-solving', title: 'Logic Leap', icon: <Target />, color: 'from-emerald-500 to-teal-600', description: 'Solve complex puzzles and bridge logical gaps.' },
        { id: 'car', title: 'Nitro Drift', icon: <Car />, color: 'from-orange-500 to-red-600', description: 'Fast-paced racing to test your reaction time.' },
        { id: 'bike', title: 'Moto X-treme', icon: <Bike />, color: 'from-blue-500 to-cyan-600', description: 'Balance and speed in a high-octane bike race.' },
        { id: 'puzzle', title: 'Zen Blocks', icon: <Puzzle />, color: 'from-pink-500 to-rose-600', description: 'A relaxing yet challenging visual-spatial puzzle.' }
    ];

    const getBestScore = (gameId) => {
        const gameScore = scores.find(s => s.gameType === gameId);
        return gameScore ? gameScore.bestScore : 0;
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <button
                onClick={() => navigate('/student/dashboard')}
                className="flex items-center text-gray-400 hover:text-white mb-8 transition"
            >
                <ChevronLeft size={20} /> Back to Dashboard
            </button>

            <div className="mb-12">
                <h1 className="text-4xl font-bold flex items-center gap-3">
                    <Gamepad2 size={40} className="text-emerald-400" />
                    Student Skill Hub: Gaming Edition
                </h1>
                <p className="text-gray-400 mt-2">Sharpen your cognitive skills through immersive play.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {games.map((game) => (
                    <motion.div
                        key={game.id}
                        whileHover={{ y: -8 }}
                        className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group cursor-pointer"
                        onClick={() => setActiveGame(game.id)}
                    >
                        <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            <div className="scale-150 transform group-hover:scale-[1.8] transition-transform duration-500">
                                {React.cloneElement(game.icon, { size: 48 })}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">{game.title}</h3>
                                    <p className="text-xs text-gray-400 mt-1">{game.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                                        <Trophy size={14} />
                                        <span>{getBestScore(game.id)}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase">Best Score</div>
                                </div>
                            </div>

                            <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl transition flex items-center justify-center gap-2 font-bold">
                                <Play size={16} fill="white" />
                                Start Training
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Game Implementation Overlay or Route would go here */}
            {activeGame && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-3xl p-12 relative">
                        <button
                            onClick={() => setActiveGame(null)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-white"
                        >
                            <XCircle size={32} />
                        </button>

                        <div className="w-full">
                            {activeGame === 'mind' ? (
                                <MemoryGame onSaveScore={(s) => handleSaveScore('mind', s)} />
                            ) : activeGame === 'problem-solving' ? (
                                <LogicGame onSaveScore={(s) => handleSaveScore('problem-solving', s)} />
                            ) : activeGame === 'car' || activeGame === 'bike' ? (
                                <RacingGame type={activeGame} onSaveScore={(s) => handleSaveScore(activeGame, s)} />
                            ) : activeGame === 'puzzle' ? (
                                <PuzzleGame onSaveScore={(s) => handleSaveScore('puzzle', s)} />
                            ) : (
                                <div className="text-center py-20">
                                    <h2 className="text-3xl font-bold mb-4 uppercase tracking-widest text-emerald-400">
                                        [ {activeGame.replace('-', ' ')} Game ]
                                    </h2>
                                    <p className="text-gray-400">Precision engineering in progress...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const handleSaveScore = async (gameType, score) => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.post('http://127.0.0.1:5000/api/student/game/score', { gameType, score }, config);
    } catch (error) {
        console.error('Error saving score', error);
    }
};

const MemoryGame = ({ onSaveScore }) => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [solved, setSolved] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const allIcons = ['🚀', '🧠', '💻', '⚡', '🤖', '🌍', '🔥', '💎', '🎮', '💡', '🏹', '🎨'];
    const [level, setLevel] = useState(1);

    useEffect(() => {
        initializeGame();
    }, [level]);

    const initializeGame = () => {
        const pairCount = Math.min(3 + level, 12);
        const icons = allIcons.slice(0, pairCount);
        const shuffledCards = [...icons, ...icons]
            .sort(() => Math.random() - 0.5)
            .map((icon, index) => ({ id: index, icon }));
        setCards(shuffledCards);
        setFlipped([]);
        setSolved([]);
        setMoves(0);
        setGameOver(false);
    };

    const handleClick = (id) => {
        if (flipped.length === 2 || flipped.includes(id) || solved.includes(id)) return;
        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            if (cards[newFlipped[0]].icon === cards[newFlipped[1]].icon) {
                const newSolved = [...solved, ...newFlipped];
                setSolved(newSolved);
                setFlipped([]);
                if (newSolved.length === cards.length) {
                    if (level < 5) {
                        setTimeout(() => setLevel(l => l + 1), 1000);
                    } else {
                        setGameOver(true);
                        onSaveScore(Math.max(50, 500 - moves * 5));
                    }
                }
            } else {
                setTimeout(() => setFlipped([]), 800);
            }
        }
    };

    return (
        <div className="text-center">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-purple-400 mb-2">Mind Mastery: Level {level}</h2>
                <div className="flex justify-center gap-8 text-sm text-gray-400 uppercase tracking-widest font-bold">
                    <span>Moves: <span className="text-white">{moves}</span></span>
                    <span>Solved: <span className="text-white">{solved.length / 2} / {cards.length / 2}</span></span>
                </div>
            </div>

            {gameOver ? (
                <div className="py-12">
                    <Trophy size={80} className="mx-auto text-yellow-500 mb-6" />
                    <h3 className="text-4xl font-bold mb-4">Brilliant Focus!</h3>
                    <p className="text-gray-400 mb-8 font-mono">Cognitive Score: <span className="text-emerald-400">{Math.max(50, 500 - moves * 5)}</span></p>
                    <button onClick={() => { setLevel(1); initializeGame(); }} className="px-10 py-4 bg-indigo-600 rounded-2xl font-bold hover:scale-110 transition">Restart Hub</button>
                </div>
            ) : (
                <div className={`grid gap-4 max-w-2xl mx-auto ${cards.length > 16 ? 'grid-cols-6' : 'grid-cols-4'}`}>
                    {cards.map(card => (
                        <div
                            key={card.id}
                            onClick={() => handleClick(card.id)}
                            className={`h-16 w-16 md:h-20 md:w-20 flex items-center justify-center text-3xl rounded-2xl cursor-pointer transition-all duration-300 transform ${flipped.includes(card.id) || solved.includes(card.id) ? 'bg-indigo-600 rotate-y-180' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                        >
                            {flipped.includes(card.id) || solved.includes(card.id) ? card.icon : '?'}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const LogicGame = ({ onSaveScore }) => {
    const [question, setQuestion] = useState({ a: 0, b: 0, op: '+', ans: 0 });
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [timeLeft, setTimeLeft] = useState(20);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        if (gameStarted && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            if (score > 0) onSaveScore(score * 10 * level);
            setGameStarted(false);
        }
    }, [timeLeft, gameStarted]);

    const generateQuestion = () => {
        // Adaptive difficulty: Scale range based on level
        const range = 10 + (level * 5);
        const a = Math.floor(Math.random() * range) + 1;
        const b = Math.floor(Math.random() * range) + 1;

        const ops = level > 3 ? ['+', '-', '*'] : ['+', '-'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let ans;
        if (op === '+') ans = a + b;
        else if (op === '-') ans = a - b;
        else ans = a * b;
        setQuestion({ a, b, op, ans });
    };

    const handleAnswer = (e) => {
        if (parseInt(e.target.value) === question.ans) {
            const newScore = score + 1;
            setScore(newScore);
            // Level up every 5 correct answers
            if (newScore % 5 === 0) setLevel(l => Math.min(l + 1, 10));
            e.target.value = '';
            generateQuestion();
        }
    };

    const start = () => {
        setScore(0);
        setTimeLeft(20);
        setGameStarted(true);
        generateQuestion();
    };

    return (
        <div className="text-center py-10">
            <h2 className="text-3xl font-bold text-emerald-400 mb-8">Logic Leap: Speed Math</h2>
            {!gameStarted ? (
                <div>
                    <Trophy size={64} className="mx-auto text-emerald-500 mb-6" />
                    <p className="text-gray-400 mb-8">Solve as many as possible in 20 seconds!</p>
                    {timeLeft === 0 && <p className="mb-4 text-2xl font-bold">Final Score: {score * 10}</p>}
                    <button onClick={start} className="px-10 py-4 bg-emerald-600 rounded-2xl font-bold hover:scale-105 transition">Start Challenge</button>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="text-5xl font-mono text-gray-500">Time: <span className={timeLeft < 5 ? 'text-red-500' : 'text-white'}>{timeLeft}s</span></div>
                    <div className="text-6xl font-black">{question.a} {question.op} {question.b} = ?</div>
                    <input
                        type="number"
                        autoFocus
                        style={{ appearance: 'none' }}
                        className="bg-white/10 text-4xl text-center w-32 border-b-4 border-emerald-500 outline-none p-4 rounded-xl"
                        onChange={handleAnswer}
                    />
                    <div className="text-xl text-gray-400">Streak: <span className="text-emerald-400">{score}</span></div>
                </div>
            )}
        </div>
    );
};

const RacingGame = ({ type, onSaveScore }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const canvasRef = React.useRef(null);

    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;

        let player = { x: 175, y: 300, w: 50, h: 80 };
        let obstacles = [];
        let speed = 5;
        let frame = 0;

        const loop = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Adaptive difficulty: Speed scales with score/level
            const currentLevel = Math.floor(score / 50) + 1;
            const adaptiveSpeed = speed + (currentLevel * 0.5);

            // Road
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#334155';
            ctx.setLineDash([20, 20]);
            ctx.beginPath(); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke();

            // Player
            ctx.fillStyle = type === 'car' ? '#f97316' : '#3b82f6';
            ctx.fillRect(player.x, player.y, player.w, player.h);

            // Obstacles
            const spawnRate = Math.max(20, 60 - (currentLevel * 4));
            if (frame % spawnRate === 0) {
                obstacles.push({ x: Math.random() * (canvas.width - 50), y: -100, w: 50, h: 80 });
                setScore(s => s + 10);
            }

            obstacles.forEach((obs, i) => {
                obs.y += adaptiveSpeed;
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

                // Collision
                if (player.x < obs.x + obs.w && player.x + player.w > obs.x &&
                    player.y < obs.y + obs.h && player.y + player.h > obs.y) {
                    setGameOver(true);
                    cancelAnimationFrame(animationId);
                    onSaveScore(score);
                }
            });

            obstacles = obstacles.filter(obs => obs.y < canvas.height);
            animationId = requestAnimationFrame(loop);
        };

        const handleKeys = (e) => {
            if (e.key === 'ArrowLeft') player.x = Math.max(0, player.x - 20);
            if (e.key === 'ArrowRight') player.x = Math.min(canvas.width - player.w, player.x + 20);
        };

        window.addEventListener('keydown', handleKeys);
        animationId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('keydown', handleKeys);
            cancelAnimationFrame(animationId);
        };
    }, [isPlaying, gameOver]);

    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-orange-400 mb-6 uppercase tracking-[0.2em]">{type === 'car' ? 'Nitro Drift' : 'Moto X-treme'}</h2>
            {!isPlaying ? (
                <div className="p-12">
                    <Play size={80} className="mx-auto text-white/20 mb-6 animate-pulse" />
                    <p className="text-gray-400 mb-8 font-mono">Control with Arrow Keys. Avoid obstacles.</p>
                    <button onClick={() => setIsPlaying(true)} className="px-12 py-4 bg-orange-600 rounded-full font-black hover:scale-110 transition shadow-xl shadow-orange-600/20">GNITE ENGINE</button>
                </div>
            ) : gameOver ? (
                <div className="py-12">
                    <h3 className="text-5xl font-black text-red-500 mb-4 italic">CRASHED!</h3>
                    <p className="text-2xl text-white mb-8">Distance: <span className="text-orange-400">{score}m</span></p>
                    <button onClick={() => { setGameOver(false); setScore(0); setIsPlaying(true); }} className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition">Restart Race</button>
                </div>
            ) : (
                <div className="relative inline-block border-4 border-white/10 rounded-3xl overflow-hidden">
                    <canvas ref={canvasRef} width={400} height={500} className="bg-slate-800" />
                    <div className="absolute top-4 right-4 text-3xl font-black text-white/50">{score}m</div>
                </div>
            )}
        </div>
    );
};

const PuzzleGame = ({ onSaveScore }) => {
    const [tiles, setTiles] = useState([]);
    const [moves, setMoves] = useState(0);
    const [solved, setSolved] = useState(false);

    useEffect(() => {
        shuffle();
    }, []);

    const shuffle = () => {
        let newTiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
        do {
            newTiles.sort(() => Math.random() - 0.5);
        } while (!isSolvable(newTiles));
        setTiles(newTiles);
        setMoves(0);
        setSolved(false);
    };

    const isSolvable = (arr) => {
        let inversions = 0;
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i] && arr[j] && arr[i] > arr[j]) inversions++;
            }
        }
        return inversions % 2 === 0;
    };

    const move = (idx) => {
        const emptyIdx = tiles.indexOf(0);
        const canMove = [idx - 1, idx + 1, idx - 3, idx + 3].includes(emptyIdx);

        if (canMove) {
            const newTiles = [...tiles];
            [newTiles[idx], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[idx]];
            setTiles(newTiles);
            setMoves(m => m + 1);
            if (newTiles.every((t, i) => t === (i + 1) % 9)) {
                setSolved(true);
                // Difficulty Multiplier based on efficiency
                const efficiency = Math.max(1, 40 - moves);
                onSaveScore(efficiency * 25);
            }
        }
    };

    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold text-rose-400 mb-8 underline decoration-pink-500 underline-offset-8">Zen Blocks: 8-Puzzle</h2>
            {solved ? (
                <div className="py-12">
                    <Trophy size={80} className="mx-auto text-pink-500 mb-6" />
                    <h3 className="text-4xl font-bold mb-4">Ascended!</h3>
                    <p className="text-gray-400 mb-8">Moves: {moves}</p>
                    <button onClick={shuffle} className="px-10 py-4 bg-pink-600 rounded-2xl font-bold">New Puzzle</button>
                </div>
            ) : (
                <div className="max-w-xs mx-auto">
                    <div className="grid grid-cols-3 gap-2 bg-white/5 p-4 rounded-[32px] border border-white/10">
                        {tiles.map((tile, i) => (
                            <div
                                key={i}
                                onClick={() => move(i)}
                                className={`h-20 w-20 flex items-center justify-center text-2xl font-bold rounded-2xl transition-all ${tile === 0 ? 'bg-transparent' : 'bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 text-pink-400 cursor-pointer hover:scale-95'}`}
                            >
                                {tile !== 0 && tile}
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-sm uppercase tracking-widest text-gray-500 font-black">Moves: <span className="text-white">{moves}</span></div>
                </div>
            )}
        </div>
    );
};

export default GamingHub;

