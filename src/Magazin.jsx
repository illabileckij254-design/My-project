import React, { useState, useEffect } from 'react';
import './HotDogGame.scss';

const HotDogGame = () => {
  // Основні стани гри
  const [money, setMoney] = useState(0);
  const [clickValue, setClickValue] = useState(1);
  const [autoClickValue, setAutoClickValue] = useState(0);
  
  // Стан для магазину (відкрито/закрито)
  const [isShopOpen, setIsShopOpen] = useState(false);

  // Ціни
  const [clickCost, setClickCost] = useState(10);
  const [autoCost, setAutoCost] = useState(50);

  // Логіка автокліку (працює кожну секунду)
  useEffect(() => {
    const timer = setInterval(() => {
      if (autoClickValue > 0) {
        setMoney((prev) => prev + autoClickValue);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [autoClickValue]);

  const handleMainClick = () => {
    setMoney(money + clickValue);
  };

  const buyUpgrade = (type) => {
    if (type === 'click' && money >= clickCost) {
      setMoney(money - clickCost);
      setClickValue(clickValue + 1);
      setClickCost(Math.floor(clickCost * 1.5));
    } else if (type === 'auto' && money >= autoCost) {
      setMoney(money - autoCost);
      setAutoClickValue(autoClickValue + 1);
      setAutoCost(Math.floor(autoCost * 1.8));
    }
  };

  return (
    <div className="game-wrapper">
      {/* Верхня панель з балансом */}
      <div className="score-board">
        <h1>🌭 {money}</h1>
        <p>Прибуток: {autoClickValue} / сек</p>
      </div>

      {/* Головний хот-дог для клікання */}
      <div className="click-area">
        <button className="hotdog-main-button" onClick={handleMainClick} />
      </div>

      {/* КНОПКА МАГАЗИНУ (Toggle) */}
      <button 
        className={`shop-toggle-btn ${isShopOpen ? 'active' : ''}`} 
        onClick={() => setIsShopOpen(!isShopOpen)}
      >
        {isShopOpen ? '❌ Закрити' : '🛒 Магазин'}
      </button>

      {/* ВІКНО МАГАЗИНУ (З'являється тільки якщо isShopOpen === true) */}
      {isShopOpen && (
        <div className="shop-overlay">
          <div className="shop-window">
            <h2>Покращення</h2>
            
            <div className="upgrade-item">
              <div className="text">
                <span className="name">🚀 Супер Гірчиця (+1 клік)</span>
                <span className="price">Ціна: {clickCost} 🌭</span>
              </div>
              <button 
                disabled={money < clickCost} 
                onClick={() => buyUpgrade('click')}
              >
                Купити
              </button>
            </div>

            <div className="upgrade-item">
              <div className="text">
                <span className="name">🤖 Авто-Кухар (+1/сек)</span>
                <span className="price">Ціна: {autoCost} 🌭</span>
              </div>
              <button 
                disabled={money < autoCost} 
                onClick={() => buyUpgrade('auto')}
              >
                Купити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotDogGame;