import React, { useState, useEffect } from 'react';
import { Counter } from './Counter';
import Button from './Button';

const HotDogGame = () => {
  const [count, setCount] = useState(0);
  const [clickValue, setClickValue] = useState(1);
  const [autoClickValue, setAutoClickValue] = useState(0);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [clicks, setClicks] = useState([]);
  
  // Поточний стиль курсору
  const [cursorStyle, setCursorStyle] = useState('default');

  // Ціни та рівні (початковий множник 1.2, крок +0.2)
  const [upgrades, setUpgrades] = useState({
    mustard: { cost: 10, multiplier: 1.2, level: 0 },
    chef: { cost: 50, multiplier: 1.2, level: 0 },
    factory: { cost: 1000, multiplier: 1.2, level: 0 },
    truck: { cost: 5000, multiplier: 1.2, level: 0 },
    bonus: { cost: 10000, multiplier: 1.5, level: 0 }
  });

  // Логіка автокліку
  useEffect(() => {
    const timer = setInterval(() => {
      if (autoClickValue > 0) setCount(prev => prev + autoClickValue);
    }, 1000);
    return () => clearInterval(timer);
  }, [autoClickValue]);

  // Спеціальний бонус: раз на хвилину +5000 (якщо куплено)
  useEffect(() => {
    if (upgrades.bonus.level > 0) {
      const bonusTimer = setInterval(() => {
        setCount(prev => prev + 5000);
        // Можна додати сповіщення "Бонус +5000!"
      }, 60000);
      return () => clearInterval(bonusTimer);
    }
  }, [upgrades.bonus.level]);

  const handleMainClick = () => {
    setCount(count + clickValue);
    const id = Date.now();
    const randomX = Math.random() * 120 - 60;
    setClicks(prev => [...prev, { id, x: randomX, value: clickValue }]);
    setTimeout(() => setClicks(prev => prev.filter(c => c.id !== id)), 1000);
  };

  const buyItem = (key, type, value) => {
    const item = upgrades[key];
    if (count >= item.cost) {
      setCount(count - item.cost);
      
      // Логіка покращення
      if (type === 'click') setClickValue(prev => prev + value);
      if (type === 'auto') setAutoClickValue(prev => prev + value);

      // Оновлення ціни: множник зростає з кожною покупкою
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

  return (
    <div className={`game-wrapper cursor-${cursorStyle}`}>
      <div className="score-board">
        <Counter>{count}</Counter>
        <p>⚡ {clickValue} за клік | 🤖 {autoClickValue} / сек</p>
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

      <button className={`shop-toggle-btn ${isShopOpen ? 'active' : ''}`} onClick={() => setIsShopOpen(!isShopOpen)}>
        {isShopOpen ? '❌' : '🛒 Магазин'}
      </button>

      {isShopOpen && (
        <div className="shop-overlay" onClick={() => setIsShopOpen(false)}>
          <div className="shop-window" onClick={(e) => e.stopPropagation()}>
            <h2>🌭 Hot-Shop</h2>
            
            <div className="shop-scroll">
              {/* СЕКЦІЯ КУРСОРІВ */}
              <div className="shop-section">
                <h3>Курсори</h3>
                <div className="cursor-grid">
                  <button onClick={() => setCursorStyle('golden')}>✨ Золотий</button>
                  <button onClick={() => setCursorStyle('fire')}>🔥 Вогняний</button>
                  <button onClick={() => setCursorStyle('cyber')}>💻 Кібер</button>
                </div>
              </div>

              {/* СЕКЦІЯ ТОВАРІВ */}
              <div className="shop-section">
                <h3>Покращення</h3>
                
                <UpgradeItem 
                  title="🚀 Гірчиця" price={upgrades.mustard.cost} 
                  canBuy={count >= upgrades.mustard.cost} 
                  onBuy={() => buyItem('mustard', 'click', 1)} 
                />
                <UpgradeItem 
                  title="🤖 Кухар-авто клік +1" price={upgrades.chef.cost} 
                  canBuy={count >= upgrades.chef.cost} 
                  onBuy={() => buyItem('chef', 'auto', 1)} 
                />
                <UpgradeItem 
                  title="🏭 Завод-авто клік +20" price={upgrades.factory.cost} 
                  canBuy={count >= upgrades.factory.cost} 
                  onBuy={() => buyItem('factory', 'auto', 20)} 
                />
                <UpgradeItem 
                  title="🚚 Фудтрак-авто клік +50" price={upgrades.truck.cost} 
                  canBuy={count >= upgrades.truck.cost} 
                  onBuy={() => buyItem('truck', 'click', 50)} 
                />
                <UpgradeItem 
                  title="💎 Мега-Бонус (5к/хв)" price={upgrades.bonus.cost} 
                  canBuy={count >= upgrades.bonus.cost && upgrades.bonus.level === 0} 
                  onBuy={() => buyItem('bonus', 'special', 0)} 
                  label={upgrades.bonus.level > 0 ? "КУПЛЕНО" : "Купити"}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Допоміжний компонент для рядка в магазині
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