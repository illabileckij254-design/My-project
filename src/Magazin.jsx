import React, { useState, useEffect } from 'react';
import { Counter } from './Counter';
import Button from './Button';

const HotDogGame = () => {
  const getInitialUpgrades = () => ({
    mustard: { cost: 10, multiplier: 1.2, level: 0 },
    chef: { cost: 50, multiplier: 1.2, level: 0 },
    factory: { cost: 1000, multiplier: 1.2, level: 0 },
    truck: { cost: 5000, multiplier: 1.2, level: 0 },
    bonus: { cost: 10000, multiplier: 1.5, level: 0 }
  });

  // --- LOCAL STORAGE ---
  const [count, setCount] = useState(() => Number(localStorage.getItem('hd_count')) || 0);
  const [visualCount, setVisualCount] = useState(count);
  const [clickValue, setClickValue] = useState(() => Number(localStorage.getItem('hd_clickValue')) || 1);
  const [autoClickValue, setAutoClickValue] = useState(() => Number(localStorage.getItem('hd_autoClickValue')) || 0);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [clicks, setClicks] = useState([]);
  const [cursorStyle, setCursorStyle] = useState('default');

  // Ребьорти
  const [rebirths, setRebirths] = useState(() => Number(localStorage.getItem('hd_rebirths')) || 0);
  const [rebirthMultiplier, setRebirthMultiplier] = useState(() => Number(localStorage.getItem('hd_rebirthMultiplier')) || 1);

  // Покращення
  const [upgrades, setUpgrades] = useState(() => {
    const saved = localStorage.getItem('hd_upgrades');
    return saved ? JSON.parse(saved) : getInitialUpgrades();
  });

  // Бос та х3 Буст
  const [boss, setBoss] = useState(null); 
  const [bossMultiplier, setBossMultiplier] = useState(1); 
  const [boostTimeLeft, setBoostTimeLeft] = useState(0); 

  // Падаючі предмети та їх бусти
  const [fallingItem, setFallingItem] = useState(null); 
  const [itemBoost, setItemBoost] = useState({ clickMul: 1, autoMul: 1, text: '', timeLeft: 0 });

  // --- КАЗІНО 1: РУЛЕТКА МНОЖНИКІВ ---
  const [isCasinoOpen, setIsCasinoOpen] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [casinoResult, setCasinoResult] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  // --- КАЗІНО 2: ЧЕРВОНЕ АБО ЧОРНЕ (З КОЛЕСОМ КРУТІННЯ) ---
  const [rouletteChoice, setRouletteChoice] = useState('red'); 
  const [rouletteResult, setRouletteResult] = useState('');
  const [isRouletteSpinning, setIsRouletteSpinning] = useState(false);
  const [rouletteScreenColor, setRouletteScreenColor] = useState('transparent');

  // Масив з 20 секторів (10 червоних, 10 чорних)
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

  // --- LOCAL STORAGE ЗБЕРЕЖЕННЯ ---
  useEffect(() => { localStorage.setItem('hd_count', count); }, [count]);
  useEffect(() => { localStorage.setItem('hd_clickValue', clickValue); }, [clickValue]);
  useEffect(() => { localStorage.setItem('hd_autoClickValue', autoClickValue); }, [autoClickValue]);
  useEffect(() => { localStorage.setItem('hd_rebirths', rebirths); }, [rebirths]);
  useEffect(() => { localStorage.setItem('hd_rebirthMultiplier', rebirthMultiplier); }, [rebirthMultiplier]);
  useEffect(() => { localStorage.setItem('hd_upgrades', JSON.stringify(upgrades)); }, [upgrades]);

  // Логіка автокліку
  useEffect(() => {
    const timer = setInterval(() => {
      if (autoClickValue > 0) {
        const finalAuto = autoClickValue * bossMultiplier * itemBoost.autoMul;
        setCount(prev => prev + finalAuto);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [autoClickValue, bossMultiplier, itemBoost.autoMul]);

  // Спеціальний бонус
  useEffect(() => {
    if (upgrades.bonus.level > 0) {
      const bonusTimer = setInterval(() => {
        setCount(prev => prev + 5000);
      }, 60000);
      return () => clearInterval(bonusTimer);
    }
  }, [upgrades.bonus.level]);

  useEffect(() => {
    setVisualCount(Math.ceil(count));
  }, [count]);

  // Логіка боса
  useEffect(() => {
    const bossSpawnTimer = setInterval(() => {
      if (!boss) setBoss({ hp: 15, maxHp: 15, timeLeft: 15 });
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
    const boostTimer = setInterval(() => {
      setBoostTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(boostTimer);
  }, [boostTimeLeft]);

  // Спавн предметів
  useEffect(() => {
    const itemSpawnTimer = setInterval(() => {
      const itemsList = [
        { emoji: '🍅', text: 'Кетчуп', type: 'click_boost' },
        { emoji: '🥤', text: 'Кола', type: 'auto_boost' },
        { emoji: '🌶️', text: 'Гострий соус', type: 'instant_money' }
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
      setItemBoost({ clickMul: 1.5, autoMul: 1, text: '🍅 Кетчуп: Кліки +50%', timeLeft: 10 });
    } else if (fallingItem.type === 'auto_boost') {
      setItemBoost({ clickMul: 1, autoMul: 2, text: '🥤 Кола: Автоклік x2', timeLeft: 10 });
    } else if (fallingItem.type === 'instant_money') {
      const reward = Math.max(100, Math.round(clickValue * 50));
      setCount(prev => prev + reward);
    }
    setFallingItem(null);
  };

  const handleMainClick = () => {
    const currentClick = clickValue * bossMultiplier * itemBoost.clickMul;
    setCount(count + currentClick);
    const id = Date.now();
    const randomX = Math.random() * 120 - 60;
    setClicks(prev => [...prev, { id, x: randomX, value: Math.round(currentClick) }]);
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

  // --- КАЗІНО 1: КРУТІННЯ РУЛЕТКИ (МНОЖНИКІВ) ---
  const handlePlayCasino = () => {
    if (count < betAmount || betAmount <= 0 || isSpinning || isRouletteSpinning) return;

    setIsSpinning(true);
    setCount(prev => prev - betAmount);

    const rouletteItems = ['❌ x0', '🎰 x2', '❌ x0', '💎 x5', '❌ x0', '👑 x10', '🎰 x2', '❌ x0'];
    let counter = 0;

    // Збільшено ліміт до 55 ітерацій (Довге крутіння)
    const spinInterval = setInterval(() => {
      const fakeResult = rouletteItems[Math.floor(Math.random() * rouletteItems.length)];
      setCasinoResult(`🎰 [ ${fakeResult} ] 🎰`);
      counter++;

      if (counter >= 55) {
        clearInterval(spinInterval);
        const rand = Math.random();
        if (rand < 0.5) {
          setCasinoResult('❌ Програш! Спробуй ще.');
        } else if (rand < 0.8) {
          const win = betAmount * 2;
          setCount(prev => prev + win);
          setCasinoResult(`🎰 Виграш x2! +${win} 🌭`);
        } else if (rand < 0.95) {
          const win = betAmount * 5;
          setCount(prev => prev + win);
          setCasinoResult(`💎 МЕГА Виграш x5! +${win} 🌭`);
        } else {
          const win = betAmount * 10;
          setCount(prev => prev + win);
          setCasinoResult(`👑 ДЖЕКПОТ x10!!! +${win} 🌭`);
        }
        setIsSpinning(false);
      }
    }, 100); 
  };

  // --- КАЗІНО 2: ЧЕРВОНЕ АБО ЧОРНЕ (З КРУТЯЩИМСЯ КОЛЕСОМ) ---
  const handlePlayRoulette = () => {
    if (count < betAmount || betAmount <= 0 || isRouletteSpinning || isSpinning) return;

    setIsRouletteSpinning(true);
    setCount(prev => prev - betAmount);
    setRouletteResult('Крутимо колесо...');

    let counter = 0;
    const colors = ['#e74c3c', '#2c3e50'];

    // Збільшено ліміт до 65 ітерацій (Дуже довга анімка)
    const rouletteInterval = setInterval(() => {
      const currentColor = colors[counter % 2];
      setRouletteScreenColor(currentColor);
      setRouletteResult(currentColor === '#e74c3c' ? '🔴 ЧЕРВОНЕ 🔴' : '⚫ ЧОРНЕ ⚫');
      counter++;

      if (counter >= 65) {
        clearInterval(rouletteInterval);
        const finalColor = Math.random() < 0.5 ? 'red' : 'black';
        
        if (finalColor === 'red') {
          setRouletteScreenColor('#e74c3c');
          if (rouletteChoice === 'red') {
            const win = betAmount * 2;
            setCount(prev => prev + win);
            setRouletteResult(`🎉 ЧЕРВОНЕ! Виграш: +${win} 🌭`);
          } else {
            setRouletteResult('❌ ЧЕРВОНЕ! Ти програв.');
          }
        } else {
          setRouletteScreenColor('#111');
          if (rouletteChoice === 'black') {
            const win = betAmount * 2;
            setCount(prev => prev + win);
            setRouletteResult(`🎉 ЧОРНЕ! Виграш: +${win} 🌭`);
          } else {
            setRouletteResult('❌ ЧОРНЕ! Ти програв.');
          }
        }
        setIsRouletteSpinning(false);
      }
    }, 80);
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
    if (count >= 2000000) {
      const nextRebirths = rebirths + 1;
      setRebirths(nextRebirths);
      setRebirthMultiplier(1 + nextRebirths * 0.2); 
      setCount(0);
      setClickValue(1);
      setAutoClickValue(0);
      setUpgrades(getInitialUpgrades());
    }
  };

  return (
    <div className={`game-wrapper cursor-${cursorStyle}`}>
      
      {/* ПАДАЮЧИЙ ПРЕДМЕТ */}
      {fallingItem && (
        <div className="falling-loot" style={{ left: `${fallingItem.x}%` }} onClick={handleItemClick}>
          <span className="loot-emoji">{fallingItem.emoji}</span>
          <span className="loot-text">{fallingItem.text}</span>
        </div>
      )}

      {/* АКТИВНІ БУСТИ */}
      <div className="active-boosts-container">
        {boostTimeLeft > 0 && <div className="boost-alert">🔥 ПРЕДМЕТ З БОСА: БУСТ x3! ({boostTimeLeft}с)</div>}
        {itemBoost.timeLeft > 0 && <div className="boost-alert item-boost">{itemBoost.text} ({itemBoost.timeLeft}с)</div>}
      </div>

      {/* Контейнер Боса */}
      {boss && (
        <div className="boss-container" onClick={handleBossClick}>
          <div className="boss-window-mini">
            <div className="boss-title">👑👹 БОС (Клікай!)</div>
            <div className="boss-hp-bar">
              <div className="boss-hp-fill" style={{ width: `${(boss.hp / boss.maxHp) * 100}%` }}></div>
            </div>
            <div className="boss-meta">Хитів: {boss.hp} | ⏳ {boss.timeLeft}с</div>
          </div>
        </div>
      )}

      <div className="score-board">
        <Counter>{visualCount}</Counter>
        <p>⚡ {Math.round(clickValue * bossMultiplier * itemBoost.clickMul)} за клік | 🤖 {Math.round(autoClickValue * bossMultiplier * itemBoost.autoMul)} / сек</p>
        {rebirths > 0 && <p style={{color: '#9b59b6'}}>🧬 Ребьорти: {rebirths} (Бонус: {rebirthMultiplier.toFixed(1)}х)</p>}
      </div>

      <div className="click-area">
        {clicks.map((c) => (
          <div key={c.id} className="flying-item" style={{ '--random-x': `${c.x}px` }}>
            <span className="emoji">🌭</span>
            <span className="value">+{c.value}</span>
          </div>
        ))}
        <Button onClick={handleMainClick}/>
      </div>

      {/* КНОПКИ МЕНЮ */}
      <div className="menu-buttons-container">
        <button className="casino-toggle-btn" onClick={() => setIsCasinoOpen(true)}>
          🎰 Казино Вегас
        </button>
        <button className={`shop-toggle-btn ${isShopOpen ? 'active' : ''}`} onClick={() => setIsShopOpen(!isShopOpen)}>
          {isShopOpen ? '❌' : '🛒 Магазин'}
        </button>
      </div>

      {/* МОДАЛЬНЕ ВІКНО КАЗІНО З ОБОМА ІГРАМИ */}
      {isCasinoOpen && (
        <div className="casino-overlay" onClick={() => setIsCasinoOpen(false)}>
          <div className="casino-window" onClick={(e) => e.stopPropagation()}>
            <div className="casino-header">
              <h2>🎰 Хот-Дог Клуб «Удача»</h2>
              <button className="close-casino" onClick={() => setIsCasinoOpen(false)}>❌</button>
            </div>
            
            <div className="casino-games-split">
              
              {/* ГРА 1: РУЛЕТКА МНОЖНИКІВ */}
              <div className="casino-game-box">
                <h3>🎰 Рулетка Множників</h3>
                <div className={`casino-screen ${isSpinning ? 'spinning' : ''}`}>
                  {casinoResult || '👉 Виграй до х10!'}
                </div>
                <button 
                  className={`spin-btn ${isSpinning ? 'active-spin' : ''}`} 
                  onClick={handlePlayCasino} 
                  disabled={isSpinning || isRouletteSpinning || count < betAmount || betAmount <= 0}
                >
                  {isSpinning ? '🎰 КРУТИМО...' : 'КРУТИТЬ РУЛЕТКУ 🚀'}
                </button>
              </div>

              {/* ГРА 2: ЧЕРВОНЕ АБО ЧОРНЕ (КОЛЕСО З 20 СЕКТОРІВ) */}
              <div className="casino-game-box">
                <h3>🎯 Червоне або Чорне</h3>
                
                {/* Крутящеся колесо секторів */}
                <div className="roulette-wheel-container">
                  <div className="wheel-pointer">▼</div>
                  <div className={`wheel-visual ${isRouletteSpinning ? 'spinning-wheel-anim' : ''}`}>
                    {fullWheelSectors.map((sector, idx) => (
                      <div 
                        key={idx} 
                        className={`sector ${sector.type}-sector`} 
                        style={{ '--sector-index': idx }}
                      >
                        {sector.type === 'red' ? '🔴' : '⚫'}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`casino-screen roulette-screen`} style={{ backgroundColor: rouletteScreenColor }}>
                  {rouletteResult || '🔴 Вибери колір та став х2! ⚫'}
                </div>

                <div className="color-chooser">
                  <button 
                    className={`choice-btn red-choice ${rouletteChoice === 'red' ? 'selected' : ''}`}
                    onClick={() => setRouletteChoice('red')}
                    disabled={isRouletteSpinning}
                  >
                    🔴 Червоне
                  </button>
                  <button 
                    className={`choice-btn black-choice ${rouletteChoice === 'black' ? 'selected' : ''}`}
                    onClick={() => setRouletteChoice('black')}
                    disabled={isRouletteSpinning}
                  >
                    ⚫ Чорне
                  </button>
                </div>

                <button 
                  className={`spin-btn roulette-spin-btn ${isRouletteSpinning ? 'active-spin' : ''}`} 
                  onClick={handlePlayRoulette} 
                  disabled={isRouletteSpinning || isSpinning || count < betAmount || betAmount <= 0}
                >
                  {isRouletteSpinning ? '🔄 КОЛЕСО КРУТИТЬСЯ...' : 'СТАВИТИ (х2) 🎰'}
                </button>
              </div>

            </div>

            {/* КЕРУВАННЯ СТАВКОЮ ДЛЯ ОБОХ ІГОР */}
            <div className="bet-controls-shared">
              <label>Ставка (🌭):</label>
              <input 
                type="number" 
                value={betAmount} 
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                disabled={isSpinning || isRouletteSpinning}
              />
              <div className="quick-bets">
                <button onClick={() => setBetAmount(100)} disabled={isSpinning || isRouletteSpinning}>100</button>
                <button onClick={() => setBetAmount(1000)} disabled={isSpinning || isRouletteSpinning}>1k</button>
                <button onClick={() => setBetAmount(10000)} disabled={isSpinning || isRouletteSpinning}>10k</button>
                <button onClick={() => setBetAmount(Math.floor(count / 2))} disabled={isSpinning || isRouletteSpinning}>50%</button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* МАГАЗИН */}
      {isShopOpen && (
        <div className="shop-overlay" onClick={() => setIsShopOpen(false)}>
          <div className="shop-window" onClick={(e) => e.stopPropagation()}>
            <h2>🌭 Hot-Shop</h2>
            <div className="shop-scroll">
              <div className="shop-section"><div className="cursor-grid"></div></div>
              <div className="shop-section" style={{marginBottom: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '12px', border: '2px solid #9b59b6'}}>
                <h3 style={{color: '#9b59b6', margin: '0 0 10px 0'}}>Переродження</h3>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <div style={{fontWeight: 'bold', fontSize: '0.9rem'}}>Ціна: 2,000,000 🌭</div>
                    <div style={{fontSize: '0.8rem', color: '#666'}}>Поточний бонус: {rebirthMultiplier.toFixed(1)}х</div>
                  </div>
                  <button disabled={count < 2000000} onClick={triggerRebirth} style={{background: count >= 2000000 ? '#9b59b6' : '#dfe6e9', color: count >= 2000000 ? '#fff' : '#b2bec3', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: count >= 2000000 ? 'pointer' : 'not-allowed'}}>Ребьорт</button>
                </div>
              </div>
              <div className="shop-section">
                <h3>Покращення</h3>
                <UpgradeItem title="🚀 Гірчиця" price={upgrades.mustard.cost} canBuy={count >= upgrades.mustard.cost} onBuy={() => buyItem('mustard', 'click', 1)} />
                <UpgradeItem title="🤖 Кухар-авто клік +1" price={upgrades.chef.cost} canBuy={count >= upgrades.chef.cost} onBuy={() => buyItem('chef', 'auto', 1)} />
                <UpgradeItem title="🏭 Завод-авто клік +20" price={upgrades.factory.cost} canBuy={count >= upgrades.factory.cost} onBuy={() => buyItem('factory', 'auto', 20)} />
                <UpgradeItem title="🚚 Фудтрак-авто клік +50" price={upgrades.truck.cost} canBuy={count >= upgrades.truck.cost} onBuy={() => buyItem('truck', 'click', 50)} />
                <UpgradeItem title="💎 Мега-Бонус (5к/хв)" price={upgrades.bonus.cost} canBuy={count >= upgrades.bonus.cost && upgrades.bonus.level === 0} onBuy={() => buyItem('bonus', 'special', 0)} label={upgrades.bonus.level > 0 ? "КУПЛЕНО" : "Купити"} />
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
    <div className="text">
      <span className="name">{title}</span>
      <span className="price">{price} 🌭</span>
    </div>
    <button disabled={!canBuy} onClick={onBuy}>{label}</button>
  </div>
);

export default HotDogGame;