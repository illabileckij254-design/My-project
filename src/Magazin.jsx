import React, { useState, useEffect } from 'react';
import { Counter } from './Counter';
import Button from './Button';

const CasinoChipGame = () => {
  const getInitialUpgrades = () => ({
    cardDeck: { cost: 15, multiplier: 1.2, level: 0 },
    dealer: { cost: 100, multiplier: 1.2, level: 0 },
    slotMachine: { cost: 1500, multiplier: 1.2, level: 0 },
    vipTable: { cost: 8000, multiplier: 1.2, level: 0 },
    vault: { cost: 25000, multiplier: 1.5, level: 0 }
  });

  // --- LOCAL STORAGE ---
  const [count, setCount] = useState(() => Number(localStorage.getItem('cc_count')) || 0);
  const [visualCount, setVisualCount] = useState(count);
  const [clickValue, setClickValue] = useState(() => Number(localStorage.getItem('cc_clickValue')) || 1);
  const [autoClickValue, setAutoClickValue] = useState(() => Number(localStorage.getItem('cc_autoClickValue')) || 0);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [clicks, setClicks] = useState([]);

  // Загальна кількість кліків для визначення рівня фішки
  const [totalClicks, setTotalClicks] = useState(() => Number(localStorage.getItem('cc_totalClicks')) || 0);

  // Ребьорти
  const [rebirths, setRebirths] = useState(() => Number(localStorage.getItem('cc_rebirths')) || 0);
  const [rebirthMultiplier, setRebirthMultiplier] = useState(() => Number(localStorage.getItem('cc_rebirthMultiplier')) || 1);

  // Покращення
  const [upgrades, setUpgrades] = useState(() => {
    const saved = localStorage.getItem('cc_upgrades');
    return saved ? JSON.parse(saved) : getInitialUpgrades();
  });

  // Бос та Бусти
  const [boss, setBoss] = useState(null); 
  const [bossMultiplier, setBossMultiplier] = useState(1); 
  const [boostTimeLeft, setBoostTimeLeft] = useState(0); 

  // Предмети
  const [fallingItem, setFallingItem] = useState(null); 
  const [itemBoost, setItemBoost] = useState({ clickMul: 1, autoMul: 1, text: '', timeLeft: 0 });

  // --- КАЗІНО НАЛАШТУВАННЯ ---
  const [isCasinoOpen, setIsCasinoOpen] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [activeCasinoTab, setActiveCasinoTab] = useState('wheel'); 

  // ГРА 1: КОЛЕСО МНОЖНИКІВ
  const [casinoResult, setCasinoResult] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  // ГРА 2: ЧЕРВОНЕ АБО ЧОРНЕ
  const [rouletteChoice, setRouletteChoice] = useState('red'); 
  const [rouletteResult, setRouletteResult] = useState('');
  const [isRouletteSpinning, setIsRouletteSpinning] = useState(false);
  const [rouletteScreenColor, setRouletteScreenColor] = useState('transparent');

  // ГРА 3: БЛЕКДЖЕК
  const [bjStage, setBjStage] = useState('bet'); 
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [bjResultText, setBjResultText] = useState('');

  const fullWheelSectors = [
    { type: 'red', num: 1 }, { type: 'black', num: 1 },
    { type: 'red', num: 2 }, { type: 'black', num: 2 },
    { type: 'red', num: 3 }, { type: 'black', num: 3 },
    { type: 'red', num: 4 }, { type: 'black', num: 4 },
    { type: 'red', num: 5 }, { type: 'black', num: 5 },
    { type: 'red', num: 6 }, { type: 'black', num: 6 },
    { type: 'red', num: 7 }, { type: 'black', num: 7 },
    { type: 'red', num: 8 }, { type: 'black', num: 8 },
    { type: 'red', num: 9 }, { type: 'black', num: 9 },
    { type: 'red', num: 10 }, { type: 'black', num: 10 }
  ];

  // Динамічний розрахунок рівня фішки на основі загальних кліків
  const getChipDetails = () => {
    if (totalClicks >= 100000) {
      return { level: 3, className: 'chip-lvl-3', text: 'ROYAL VIP', nextAt: 'MAX' };
    } else if (totalClicks >= 50000) {
      return { level: 2, className: 'chip-lvl-2', text: 'HIGH ROLLER', nextAt: '100k' };
    } else if (totalClicks >= 10000) {
      return { level: 1, className: 'chip-lvl-1', text: 'STANDARD', nextAt: '50k' };
    } else {
      return { level: 0, className: 'chip-lvl-0', text: 'NOVICE', nextAt: '10k' };
    }
  };

  const chipDetails = getChipDetails();

  // --- ЕФЕКТИ ТА ЗБЕРЕЖЕННЯ ---
  useEffect(() => { localStorage.setItem('cc_count', count); }, [count]);
  useEffect(() => { localStorage.setItem('cc_clickValue', clickValue); }, [clickValue]);
  useEffect(() => { localStorage.setItem('cc_autoClickValue', autoClickValue); }, [autoClickValue]);
  useEffect(() => { localStorage.setItem('cc_rebirths', rebirths); }, [rebirths]);
  useEffect(() => { localStorage.setItem('cc_rebirthMultiplier', rebirthMultiplier); }, [rebirthMultiplier]);
  useEffect(() => { localStorage.setItem('cc_upgrades', JSON.stringify(upgrades)); }, [upgrades]);
  useEffect(() => { localStorage.setItem('cc_totalClicks', totalClicks); }, [totalClicks]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (autoClickValue > 0) {
        setCount(prev => prev + (autoClickValue * bossMultiplier * itemBoost.autoMul));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [autoClickValue, bossMultiplier, itemBoost.autoMul]);

  useEffect(() => {
    if (upgrades.vault.level > 0) {
      const bonusTimer = setInterval(() => {
        setCount(prev => prev + 10000);
      }, 60000);
      return () => clearInterval(bonusTimer);
    }
  }, [upgrades.vault.level]);

  useEffect(() => { setVisualCount(Math.ceil(count)); }, [count]);

  useEffect(() => {
    const bossSpawnTimer = setInterval(() => {
      if (!boss) setBoss({ hp: 20, maxHp: 20, timeLeft: 15 });
    }, 60000);
    return () => clearInterval(bossSpawnTimer);
  }, [boss]);

  useEffect(() => {
    if (!boss) return;
    const bossTimer = setInterval(() => {
      setBoss(prev => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) return null; 
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(bossTimer);
  }, [boss]);

  useEffect(() => {
    if (boostTimeLeft <= 0) {
      setBossMultiplier(1);
      return;
    }
    const boostTimer = setInterval(() => { setBoostTimeLeft(prev => prev - 1); }, 1000);
    return () => clearInterval(boostTimer);
  }, [boostTimeLeft]);

  useEffect(() => {
    const itemSpawnTimer = setInterval(() => {
      const itemsList = [
        { emoji: '🎲', text: 'Щасливі кубики', type: 'click_boost' },
        { emoji: '🍸', text: 'Коктейль удачі', type: 'auto_boost' },
        { emoji: '💵', text: 'Пачка купюр', type: 'instant_money' }
      ];
      const randomType = itemsList[Math.floor(Math.random() * itemsList.length)];
      setFallingItem({
        id: Date.now(),
        emoji: randomType.emoji,
        text: randomType.text,
        type: randomType.type,
        x: Math.random() * 80 + 10 
      });
      setTimeout(() => { setFallingItem(null); }, 8000);
    }, 15000);
    return () => clearInterval(itemSpawnTimer);
  }, []);

  useEffect(() => {
    if (itemBoost.timeLeft <= 0) {
      setItemBoost({ clickMul: 1, autoMul: 1, text: '', timeLeft: 0 });
      return;
    }
    const timer = setInterval(() => {
      setItemBoost(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [itemBoost.timeLeft]);

  const handleItemClick = (e) => {
    e.stopPropagation();
    if (!fallingItem) return;
    if (fallingItem.type === 'click_boost') {
      setItemBoost({ clickMul: 2, autoMul: 1, text: '🎲 Кубики: Кліки x2', timeLeft: 12 });
    } else if (fallingItem.type === 'auto_boost') {
      setItemBoost({ clickMul: 1, autoMul: 2, text: '🍸 Коктейль: Автоматизація x2', timeLeft: 12 });
    } else if (fallingItem.type === 'instant_money') {
      setCount(prev => prev + Math.max(200, Math.round(clickValue * 40)));
    }
    setFallingItem(null);
  };

  const handleMainClick = () => {
    const currentClick = clickValue * bossMultiplier * itemBoost.clickMul;
    setCount(count + currentClick);
    setTotalClicks(prev => prev + 1); // Збільшуємо лічильник загальних кліків
    
    const id = Date.now();
    setClicks(prev => [...prev, { id, x: Math.random() * 120 - 60, value: Math.round(currentClick) }]);
    setTimeout(() => setClicks(prev => prev.filter(c => c.id !== id)), 1000);
  };

  const handleBossClick = () => {
    if (!boss) return;
    setBoss(prev => {
      if (prev.hp <= 1) {
        setBossMultiplier(3);
        setBoostTimeLeft(20);
        return null;
      }
      return { ...prev, hp: prev.hp - 1 };
    });
  };

  // --- ГРА 1: КОЛЕСО МНОЖНИКІВ ---
  const handlePlayCasino = () => {
    if (count < betAmount || betAmount <= 0 || isSpinning) return;

    setIsSpinning(true);
    setCount(prev => prev - betAmount);

    const rouletteItems = ['❌ x0', '🎰 x1', '🎰 x2', '📉 x0.5', '💎 x4', '👑 x10'];
    let counter = 0;

    const spinInterval = setInterval(() => {
      const fakeResult = rouletteItems[Math.floor(Math.random() * rouletteItems.length)];
      setCasinoResult(`🎰 [ ${fakeResult} ] 🎰`);
      counter++;

      if (counter >= 35) {
        clearInterval(spinInterval);
        const rand = Math.random();
        
        if (rand < 0.30) { 
          setCasinoResult('❌ Програш. Спробуйте ще раз!');
        } else if (rand < 0.40) { 
          const win = Math.floor(betAmount * 0.5);
          setCount(prev => prev + win);
          setCasinoResult(`📉 Повернено 50%: +${win} 🪙`);
        } else if (rand < 0.50) { 
          setCount(prev => prev + betAmount);
          setCasinoResult(`🎰 Повернення x1: +${betAmount} 🪙`);
        } else if (rand < 0.85) { 
          const win = betAmount * 2;
          setCount(prev => prev + win);
          setCasinoResult(`🎉 Перемога x2! +${win} 🪙`);
        } else if (rand < 0.96) { 
          const win = betAmount * 4;
          setCount(prev => prev + win);
          setCasinoResult(`💎 Крупний виграш x4! +${win} 🪙`);
        } else { 
          const win = betAmount * 10;
          setCount(prev => prev + win);
          setCasinoResult(`👑 ДЖЕКПОТ x10!!! +${win} 🪙`);
        }
        setIsSpinning(false);
      }
    }, 100); 
  };

  // --- ГРА 2: ЧЕРВОНЕ АБО ЧОРНЕ ---
  const handlePlayRoulette = () => {
    if (count < betAmount || betAmount <= 0 || isRouletteSpinning) return;

    setIsRouletteSpinning(true);
    setCount(prev => prev - betAmount);
    setRouletteResult('Кулька крутиться...');

    let counter = 0;
    const colors = ['#e74c3c', '#2c3e50'];

    const rouletteInterval = setInterval(() => {
      const currentColor = colors[counter % 2];
      setRouletteScreenColor(currentColor);
      setRouletteResult(currentColor === '#e74c3c' ? '🔴 ЧЕРВОНЕ 🔴' : '⚫ ЧОРНЕ ⚫');
      counter++;

      if (counter >= 40) {
        clearInterval(rouletteInterval);
        const finalColor = Math.random() < 0.5 ? 'red' : 'black';

        if (finalColor === 'red') {
          setRouletteScreenColor('#e74c3c');
          if (rouletteChoice === 'red') {
            const win = betAmount * 2;
            setCount(prev => prev + win);
            setRouletteResult(`🎉 ЧЕРВОНЕ! Виграш: +${win} 🪙`);
          } else {
            setRouletteResult('❌ ЧЕРВОНЕ! Ставка програла.');
          }
        } else {
          setRouletteScreenColor('#111');
          if (rouletteChoice === 'black') {
            const win = betAmount * 2;
            setCount(prev => prev + win);
            setRouletteResult(`🎉 ЧОРНЕ! Виграш: +${win} 🪙`);
          } else {
            setRouletteResult('❌ ЧОРНЕ! Ставка програла.');
          }
        }
        setIsRouletteSpinning(false);
      }
    }, 80);
  };

  // --- ГРА 3: БЛЕКДЖЕК ---
  const generateCard = () => {
    const suits = ['♠️', '♥️', '♦️', '♣️'];
    const ranks = [
      { name: '2', val: 2 }, { name: '3', val: 3 }, { name: '4', val: 4 },
      { name: '5', val: 5 }, { name: '6', val: 6 }, { name: '7', val: 7 },
      { name: '8', val: 8 }, { name: '9', val: 9 }, { name: '10', val: 10 },
      { name: 'J', val: 10 }, { name: 'Q', val: 10 }, { name: 'K', val: 10 },
      { name: 'A', val: 11 }
    ];
    return { ...ranks[Math.floor(Math.random() * ranks.length)], suit: suits[Math.floor(Math.random() * suits.length)] };
  };

  const calculateHandScore = (hand) => {
    let score = hand.reduce((acc, card) => acc + card.val, 0);
    let acesCount = hand.filter(card => card.name === 'A').length;
    while (score > 21 && acesCount > 0) { score -= 10; acesCount -= 1; }
    return score;
  };

  const startBlackjack = () => {
    if (count < betAmount || betAmount <= 0 || bjStage === 'playing') return;

    setCount(prev => prev - betAmount);
    const p1 = generateCard(); const p2 = generateCard();
    const d1 = generateCard(); const d2 = generateCard();

    const initialPlayerHand = [p1, p2];
    const initialDealerHand = [d1, d2];

    setPlayerHand(initialPlayerHand);
    setDealerHand(initialDealerHand);
    setBjStage('playing');
    setBjResultText('');

    if (calculateHandScore(initialPlayerHand) === 21) {
      handleBlackjackStand(initialPlayerHand, initialDealerHand);
    }
  };

  const handleBlackjackHit = () => {
    if (bjStage !== 'playing') return;
    const newHand = [...playerHand, generateCard()];
    setPlayerHand(newHand);

    if (calculateHandScore(newHand) > 21) {
      setBjStage('ended');
      setBjResultText('❌ Перебір очок! Ставка переходить казино.');
    }
  };

  const handleBlackjackStand = (currentPHand = playerHand, currentDHand = dealerHand) => {
    let finalDealerHand = [...currentDHand];
    while (calculateHandScore(finalDealerHand) < 17) { finalDealerHand.push(generateCard()); }
    setDealerHand(finalDealerHand);
    setBjStage('ended');

    const playerScore = calculateHandScore(currentPHand);
    const dealerScore = calculateHandScore(finalDealerHand);

    if (dealerScore > 21) {
      const win = betAmount * 2;
      setCount(prev => prev + win);
      setBjResultText(`🎉 Дилер перебрав! Виграш: +${win} 🪙`);
    } else if (playerScore > dealerScore) {
      const win = betAmount * 2;
      setCount(prev => prev + win);
      setBjResultText(`🎉 Перемога за очками: +${win} 🪙`);
    } else if (playerScore < dealerScore) {
      setBjResultText(`❌ У дилера ${dealerScore} очок. Ви програли.`);
    } else {
      setCount(prev => prev + betAmount);
      setBjResultText(`🤝 Нічия (${playerScore} очок). Ставка повернена.`);
    }
  };

  const buyItem = (key, type, value) => {
    const item = upgrades[key];
    if (count >= item.cost) {
      setCount(count - item.cost);
      const boostedValue = value * rebirthMultiplier;
      if (type === 'click') setClickValue(prev => prev + boostedValue);
      if (type === 'auto') setAutoClickValue(prev => prev + boostedValue);

      setUpgrades(prev => ({
        ...prev,
        [key]: {
          ...item,
          level: item.level + 1,
          multiplier: prev[key].multiplier + 0.2,
          cost: Math.floor(item.cost * (prev[key].multiplier))
        }
      }));
    }
  };

  const triggerRebirth = () => {
    if (count >= 1000000) {
      const nextRebirths = rebirths + 1;
      setRebirths(nextRebirths);
      setRebirthMultiplier(1 + nextRebirths * 0.3); 
      setCount(0);
      setClickValue(1);
      setAutoClickValue(0);
      setTotalClicks(0); // Скидаємо лічильник для нових рівнів фішки
      setUpgrades(getInitialUpgrades());
    }
  };

  return (
    <div className="game-wrapper physical-casino">
      {fallingItem && (
        <div className="falling-loot" style={{ left: `${fallingItem.x}%` }} onClick={handleItemClick}>
          <span className="loot-emoji">{fallingItem.emoji}</span>
          <span className="loot-text">{fallingItem.text}</span>
        </div>
      )}

      <div className="active-boosts-container">
        {boostTimeLeft > 0 && <div className="boost-alert">🔥 КРУПЬЄ ОШОЛОМЛЕНИЙ: БУСТ х3! ({boostTimeLeft}с)</div>}
        {itemBoost.timeLeft > 0 && <div className="boost-alert item-boost">{itemBoost.text} ({itemBoost.timeLeft}с)</div>}
      </div>

      {boss && (
        <div className="boss-container" onClick={handleBossClick}>
          <div className="boss-window-mini">
            <div className="boss-title">🕴️ КРУПЬЄ СЕКРЕТНОГО СТОЛУ</div>
            <div className="boss-hp-bar"><div className="boss-hp-fill" style={{ width: `${(boss.hp / boss.maxHp) * 100}%` }}></div></div>
            <div className="boss-meta">Кліків до зламу: {boss.hp} | ⏳ {boss.timeLeft}с</div>
          </div>
        </div>
      )}

      <div className="score-board">
        <Counter>{visualCount}</Counter>
        <p>🪙 {Math.round(clickValue * bossMultiplier * itemBoost.clickMul)} / клік | ⚙️ {Math.round(autoClickValue * bossMultiplier * itemBoost.autoMul)} / сек</p>
        <div className="chip-level-badge">
          Рівень Фішки: {chipDetails.level} ({chipDetails.text}) 
          {chipDetails.nextAt !== 'MAX' && <span className="next-level-info"> | Наступний: {totalClicks.toLocaleString()}/{chipDetails.nextAt}</span>}
        </div>
        {rebirths > 0 && <p style={{color: '#f1c40f', marginTop: '5px'}}>💎 VIP Рівень: {rebirths} (+{((rebirthMultiplier - 1) * 100).toFixed(0)}% доходу)</p>}
      </div>

      <div className="click-area">
        {clicks.map((c) => (
          <div key={c.id} className="flying-item" style={{ '--random-x': `${c.x}px` }}>
            <span className="emoji">🪙</span>
            <span className="value" style={{color: '#2ecc71'}}>+{c.value}</span>
          </div>
        ))}
        {/* Динамічний клас фішки на основі розрахованого рівня */}
        <button className={`main-casino-chip-button ${chipDetails.className}`} onClick={handleMainClick}>
          <div className="chip-inner-border">
            <span>{chipDetails.text}</span>
          </div>
        </button>
      </div>

      <div className="menu-buttons-container">
        <button className="casino-toggle-btn" onClick={() => setIsCasinoOpen(true)}>🃏 Зробити Ставку</button>
        <button className={`shop-toggle-btn ${isShopOpen ? 'active' : ''}`} onClick={() => setIsShopOpen(!isShopOpen)}>
          {isShopOpen ? '❌' : '🏢 Ігровий Зал'}
        </button>
      </div>

      {isCasinoOpen && (
        <div className="casino-overlay" onClick={() => setIsCasinoOpen(false)}>
          <div className="casino-window" onClick={(e) => e.stopPropagation()}>
            <div className="casino-header">
              <h2>🎲 VIP Столи Розваг</h2>
              <button className="close-casino" onClick={() => setIsCasinoOpen(false)}>❌</button>
            </div>

            <div className="casino-tabs">
              <button className={`tab-btn ${activeCasinoTab === 'wheel' ? 'active' : ''}`} onClick={() => bjStage !== 'playing' && setActiveCasinoTab('wheel')}>🎰 Колесо Фортуни</button>
              <button className={`tab-btn ${activeCasinoTab === 'roulette' ? 'active' : ''}`} onClick={() => bjStage !== 'playing' && setActiveCasinoTab('roulette')}>🎯 Класична Рулетка</button>
              <button className={`tab-btn ${activeCasinoTab === 'blackjack' ? 'active' : ''}`} onClick={() => bjStage !== 'playing' && setActiveCasinoTab('blackjack')}>🃏 Блекджек</button>
            </div>
            
            <div className="casino-game-content">
              {activeCasinoTab === 'wheel' && (
                <div className="casino-game-box single-game">
                  <h3>🎰 Колесо Фортуни (Множники до х10)</h3>
                  <div className={`casino-screen ${isSpinning ? 'spinning' : ''}`}>{casinoResult || '👉 Крути колесо та помножуй фішки!'}</div>
                  <button className={`spin-btn ${isSpinning ? 'active-spin' : ''}`} onClick={handlePlayCasino} disabled={isSpinning || count < betAmount || betAmount <= 0}>
                    {isSpinning ? '🎲 СТАВКА ПРИЙНЯТА...' : 'ОБЕРТАТИ КОЛЕСО 🚀'}
                  </button>
                </div>
              )}

              {activeCasinoTab === 'roulette' && (
                <div className="casino-game-box single-game">
                  <h3>🎯 Ставка на Колір (50% на виграш)</h3>
                  <div className="roulette-wheel-container">
                    <div className="wheel-pointer">▼</div>
                    <div className={`wheel-visual ${isRouletteSpinning ? 'spinning-wheel-anim' : ''}`}>
                      {fullWheelSectors.map((sector, idx) => (
                        <div key={idx} className={`sector ${sector.type}-sector`} style={{ '--sector-index': idx }}>{sector.type === 'red' ? '🔴' : '⚫'}</div>
                      ))}
                    </div>
                  </div>
                  <div className={`casino-screen roulette-screen`} style={{ backgroundColor: rouletteScreenColor }}>{rouletteResult || '🔴 Оберіть колір фішок: ⚫'}</div>
                  <div className="color-chooser">
                    <button className={`choice-btn red-choice ${rouletteChoice === 'red' ? 'selected' : ''}`} onClick={() => setRouletteChoice('red')} disabled={isRouletteSpinning}>🔴 Red (x2)</button>
                    <button className={`choice-btn black-choice ${rouletteChoice === 'black' ? 'selected' : ''}`} onClick={() => setRouletteChoice('black')} disabled={isRouletteSpinning}>⚫ Black (x2)</button>
                  </div>
                  <button className={`spin-btn roulette-spin-btn ${isRouletteSpinning ? 'active-spin' : ''}`} onClick={handlePlayRoulette} disabled={isRouletteSpinning || count < betAmount || betAmount <= 0}>
                    {isRouletteSpinning ? '🔄 КУЛЬКА ОБЕРТАЄТЬСЯ...' : 'ЗАПУСТИТИ РУЛЕТКУ 🎰'}
                  </button>
                </div>
              )}

              {activeCasinoTab === 'blackjack' && (
                <div className="casino-game-box blackjack-game">
                  <h3>🃏 Блекджек (Класичні правила 21)</h3>
                  <div className="blackjack-table">
                    <div className="bj-hand-section">
                      <h4>Карти Дилера: {bjStage === 'playing' ? '?' : calculateHandScore(dealerHand)}</h4>
                      <div className="bj-cards-container">
                        {dealerHand.map((card, idx) => (
                          <div key={idx} className="bj-card">
                            {bjStage === 'playing' && idx === 1 ? <div className="card-back">❓</div> : <><span className="card-suit">{card.suit}</span><span className="card-name">{card.name}</span></>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bj-hand-section">
                      <h4>Ваша рука: {playerHand.length > 0 ? calculateHandScore(playerHand) : 0}</h4>
                      <div className="bj-cards-container">
                        {playerHand.map((card, idx) => (
                          <div key={idx} className="bj-card"><span className="card-suit">{card.suit}</span><span className="card-name">{card.name}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {bjStage === 'ended' && <div className="casino-screen bj-result-screen">{bjResultText}</div>}
                  <div className="bj-controls">
                    {bjStage === 'bet' || bjStage === 'ended' ? (
                      <button className="spin-btn start-bj-btn" onClick={startBlackjack} disabled={count < betAmount || betAmount <= 0}>Зробити ставку у Блекджек 🃏</button>
                    ) : (
                      <div className="bj-action-buttons">
                        <button className="bj-action-btn hit" onClick={handleBlackjackHit}>Взяти карту</button>
                        <button className="bj-action-btn stand" onClick={() => handleBlackjackStand()}>Пас / Досить</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bet-controls-shared">
              <label>Розмір вашої ставки:</label>
              <input type="number" value={betAmount} onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))} disabled={isSpinning || isRouletteSpinning || bjStage === 'playing'} />
              <div className="quick-bets">
                <button onClick={() => setBetAmount(100)} disabled={isSpinning || isRouletteSpinning || bjStage === 'playing'}>100</button>
                <button onClick={() => setBetAmount(1000)} disabled={isSpinning || isRouletteSpinning || bjStage === 'playing'}>1k</button>
                <button onClick={() => setBetAmount(10000)} disabled={isSpinning || isRouletteSpinning || bjStage === 'playing'}>10k</button>
                <button onClick={() => setBetAmount(Math.floor(count / 2))} disabled={isSpinning || isRouletteSpinning || bjStage === 'playing'}>50%</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isShopOpen && (
        <div className="shop-overlay" onClick={() => setIsShopOpen(false)}>
          <div className="shop-window" onClick={(e) => e.stopPropagation()}>
            <h2>🏢 Управління Казино</h2>
            <div className="shop-scroll">
              <div className="shop-section" style={{marginBottom: '20px', padding: '10px', background: '#2c3e50', borderRadius: '12px', border: '2px solid #f1c40f', color: '#fff'}}>
                <h3 style={{color: '#f1c40f', margin: '0 0 10px 0'}}>VIP Статус (Престиж)</h3>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <div style={{fontWeight: 'bold', fontSize: '0.9rem'}}>Ціна: 1,000,000 🪙</div>
                    <div style={{fontSize: '0.8rem', color: '#bdc3c7'}}>Поточний бонус: +{((rebirthMultiplier - 1) * 100).toFixed(0)}%</div>
                  </div>
                  <button disabled={count < 1000000} onClick={triggerRebirth} style={{background: count >= 1000000 ? '#f1c40f' : '#7f8c8d', color: '#000', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: count >= 1000000 ? 'pointer' : 'not-allowed'}}>Скинути</button>
                </div>
              </div>
              <div className="shop-section">
                <h3>Купити Столи та Обладнання</h3>
                <UpgradeItem title="🃏 Нова колода карт (+1 клік)" price={upgrades.cardDeck.cost} canBuy={count >= upgrades.cardDeck.cost} onBuy={() => buyItem('cardDeck', 'click', 1)} />
                <UpgradeItem title="🕴️ Професійний Круп'є (+1 авто)" price={upgrades.dealer.cost} canBuy={count >= upgrades.dealer.cost} onBuy={() => buyItem('dealer', 'auto', 1)} />
                <UpgradeItem title="🎰 Ігровий Автомат (+20 авто)" price={upgrades.slotMachine.cost} canBuy={count >= upgrades.slotMachine.cost} onBuy={() => buyItem('slotMachine', 'auto', 20)} />
                <UpgradeItem title="🛋️ Закритий VIP Стіл (+50 авто)" price={upgrades.vipTable.cost} canBuy={count >= upgrades.vipTable.cost} onBuy={() => buyItem('vipTable', 'auto', 50)} />
                <UpgradeItem title="🔐 Головне сховище (10к/хв)" price={upgrades.vault.cost} canBuy={count >= upgrades.vault.cost && upgrades.vault.level === 0} onBuy={() => buyItem('vault', 'special', 0)} label={upgrades.vault.level > 0 ? "КУПЛЕНО" : "Купити"} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UpgradeItem = ({ title, price, onBuy, canBuy, label = "Купити" }) => (
  <div className="upgrade-item">
    <div className="text"><span className="name">{title}</span><span className="price">{price} 🪙</span></div>
    <button disabled={!canBuy} onClick={onBuy}>{label}</button>
  </div>
);

export default CasinoChipGame;