// Highzone Bio - Core Web Application Script
// Unified Cart, Toast, Navigation, Modal, and Storage Management

(function() {
  'use strict';

  // --- Cart State Management ---
  const CART_STORAGE_KEY = 'highzone_cart';

  const defaultProducts = {
    'redsol-500': { id: 'redsol-500', name: '바이오레드졸 500ml', price: 28000, img: 'assets/prod_1.png', tag: '냉해방지·특허' },
    'grow-500': { id: 'grow-500', name: '쑥쑥자라미2 500ml', price: 22000, img: 'assets/prod_2.png', tag: '생리활성·탄소' },
    'dobok-100': { id: 'dobok-100', name: '제5원소 도복왕 100ml', price: 15000, img: 'assets/prod_4.png', tag: '도복방지·이삭증수' },
    'goodbye-500': { id: 'goodbye-500', name: '굿바이충 500ml', price: 19000, img: 'assets/prod_5.png', tag: '친환경방제' },
    'silver-500': { id: 'silver-500', name: '순수 은수용액 Ag 500ml', price: 25000, img: 'assets/prod_6.png', tag: '천연살균' },
    'selenium-500': { id: 'selenium-500', name: '셀레늄 수용액 Se 500ml', price: 26000, img: 'assets/prod_7.png', tag: '항산화미네랄' },
    'synergy-set-1': { id: 'synergy-set-1', name: '바이오레드졸 + 시너지 인카 세트', price: 43000, img: 'assets/products_lineup.png', tag: '시너지특허세트' },
    'starter-balcony': { id: 'starter-balcony', name: '베란다 스타터 세트', price: 69000, img: 'assets/panel_balcony.png', tag: '가정용 수경재배' },
    'starter-cafe': { id: 'starter-cafe', name: '카페 인테리어 플랜터 세트', price: 129000, img: 'assets/panel_cafe.png', tag: '카페·상업용' },
    'starter-office': { id: 'starter-office', name: '사무실 데스크 미니 세트', price: 39000, img: 'assets/panel_smartfarm.png', tag: '오피스 데스크' }
  };

  window.HighzoneCart = {
    getItems: function() {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return [
        { id: 'redsol-500', name: '바이오레드졸 500ml', price: 28000, qty: 1, img: 'assets/prod_1.png', tag: '특허 냉해방지' },
        { id: 'synergy-set-1', name: '시너지 에이스 인카 500ml', price: 15000, qty: 1, img: 'assets/prod_2.png', tag: '칼슘 시너지' }
      ];
    },

    saveItems: function(items) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
      this.updateBadges();
      this.renderDrawer();
    },

    addItem: function(prodId, qty, customData) {
      qty = qty || 1;
      const items = this.getItems();
      const existing = items.find(item => item.id === prodId);
      if (existing) {
        existing.qty += qty;
      } else {
        const info = defaultProducts[prodId] || customData || {
          id: prodId,
          name: '하이존바이오 바이오 제품',
          price: 25000,
          img: 'assets/prod_1.png',
          tag: '친환경 공시'
        };
        items.push({
          id: info.id,
          name: info.name,
          price: info.price,
          qty: qty,
          img: info.img,
          tag: info.tag || '친환경'
        });
      }
      this.saveItems(items);
      window.HighzoneToast.show('🛒 장바구니에 상품이 담겼습니다.');
    },

    updateQty: function(prodId, delta) {
      let items = this.getItems();
      const item = items.find(i => i.id === prodId);
      if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
          items = items.filter(i => i.id !== prodId);
        }
      }
      this.saveItems(items);
    },

    removeItem: function(prodId) {
      let items = this.getItems().filter(i => i.id !== prodId);
      this.saveItems(items);
      window.HighzoneToast.show('상품이 삭제되었습니다.');
    },

    getTotalCount: function() {
      return this.getItems().reduce((acc, item) => acc + item.qty, 0);
    },

    getSubtotal: function() {
      return this.getItems().reduce((acc, item) => acc + (item.price * item.qty), 0);
    },

    updateBadges: function() {
      const count = this.getTotalCount();
      document.querySelectorAll('.cart-count-badge, [data-path="cart"] span.absolute, a[href="order.html"] span.absolute').forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      });
    },

    renderDrawer: function() {
      const container = document.getElementById('cart-drawer-items');
      const subtotalEl = document.getElementById('cart-drawer-subtotal');
      const totalEl = document.getElementById('cart-drawer-total');
      const shippingEl = document.getElementById('cart-drawer-shipping');
      if (!container) return;

      const items = this.getItems();
      if (items.length === 0) {
        container.innerHTML = `
          <div class="py-16 flex flex-col items-center justify-center text-center text-on-surface-variant">
            <span class="material-symbols-outlined text-[48px] text-outline/50 mb-2">shopping_bag</span>
            <p class="font-headline-sm text-headline-sm font-bold text-on-surface">장바구니가 비어 있습니다</p>
            <p class="font-body-sm text-body-sm mt-1">친환경 바이오 처방 솔루션을 만나보세요</p>
            <a href="products.html" class="mt-4 px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md">제품 보러가기</a>
          </div>
        `;
        if (subtotalEl) subtotalEl.textContent = '0원';
        if (totalEl) totalEl.textContent = '0원';
        if (shippingEl) shippingEl.textContent = '0원';
        return;
      }

      let subtotal = 0;
      let html = '';
      items.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        html += `
          <div class="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
            <img src="${item.img}" alt="${item.name}" class="w-16 h-16 object-contain bg-white rounded-lg p-1 border border-outline-variant/30 flex-shrink-0" onerror="this.src='assets/prod_1.png'">
            <div class="flex-1 min-w-0">
              <span class="font-label-sm text-[10px] text-primary font-semibold">${item.tag || '친환경 바이오'}</span>
              <h4 class="font-label-md text-label-md font-bold text-on-surface truncate">${item.name}</h4>
              <div class="flex items-center justify-between mt-1">
                <span class="font-headline-sm text-sm font-bold text-on-surface">${item.price.toLocaleString()}원</span>
                <div class="flex items-center border border-outline-variant rounded-lg bg-white overflow-hidden">
                  <button type="button" class="w-7 h-7 flex items-center justify-center hover:bg-surface-container text-on-surface" onclick="HighzoneCart.updateQty('${item.id}', -1)">-</button>
                  <span class="w-7 text-center font-bold text-xs">${item.qty}</span>
                  <button type="button" class="w-7 h-7 flex items-center justify-center hover:bg-surface-container text-on-surface" onclick="HighzoneCart.updateQty('${item.id}', 1)">+</button>
                </div>
              </div>
            </div>
            <button type="button" class="text-outline hover:text-error p-1" onclick="HighzoneCart.removeItem('${item.id}')" title="삭제">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        `;
      });
      container.innerHTML = html;

      const shipping = subtotal >= 30000 || subtotal === 0 ? 0 : 3000;
      const total = subtotal + shipping;

      if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString() + '원';
      if (shippingEl) shippingEl.textContent = shipping === 0 ? '무료 (3만원 이상)' : '3,000원';
      if (totalEl) totalEl.textContent = total.toLocaleString() + '원';
    },

    openDrawer: function() {
      const drawer = document.getElementById('cart-drawer');
      const backdrop = document.getElementById('cart-drawer-backdrop');
      if (drawer && backdrop) {
        this.renderDrawer();
        backdrop.classList.remove('hidden');
        setTimeout(() => {
          backdrop.classList.remove('opacity-0');
          drawer.classList.remove('translate-x-full');
        }, 10);
      }
    },

    closeDrawer: function() {
      const drawer = document.getElementById('cart-drawer');
      const backdrop = document.getElementById('cart-drawer-backdrop');
      if (drawer && backdrop) {
        drawer.classList.add('translate-x-full');
        backdrop.classList.add('opacity-0');
        setTimeout(() => {
          backdrop.classList.add('hidden');
        }, 300);
      }
    }
  };

  // --- Toast Notification Manager ---
  window.HighzoneToast = {
    show: function(message, duration) {
      duration = duration || 2500;
      let toast = document.getElementById('highzone-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'highzone-toast';
        toast.className = 'fixed top-20 inset-x-4 max-w-sm mx-auto z-[9999] flex items-center gap-3 p-3.5 rounded-xl bg-on-surface/95 text-surface shadow-2xl backdrop-blur-md transition-all duration-300 opacity-0 pointer-events-none -translate-y-4';
        toast.innerHTML = `
          <span class="material-symbols-outlined text-primary-fixed text-[22px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
          <span class="font-body-sm text-body-sm font-medium flex-1" id="highzone-toast-text">${message}</span>
        `;
        document.body.appendChild(toast);
      } else {
        document.getElementById('highzone-toast-text').textContent = message;
      }

      toast.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
      toast.classList.add('opacity-100', 'translate-y-0');

      clearTimeout(this._timeout);
      this._timeout = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
      }, duration);
    }
  };

  // --- Consultation / Inquiry Modal ---
  window.HighzoneConsult = {
    open: function() {
      let modal = document.getElementById('consult-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'consult-modal';
        modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200';
        modal.innerHTML = `
          <div class="bg-surface rounded-2xl w-full max-w-md p-6 shadow-2xl relative border border-primary/20">
            <button type="button" class="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface" onclick="HighzoneConsult.close()">
              <span class="material-symbols-outlined text-[24px]">close</span>
            </button>
            <div class="flex items-center gap-2 text-primary mb-1">
              <span class="material-symbols-outlined text-[22px]">contact_support</span>
              <span class="font-label-sm font-bold tracking-wider uppercase">농가·가드너 1:1 맞춤 상담</span>
            </div>
            <h3 class="font-headline-md font-bold text-on-surface mb-2">하이존바이오 전문가 처방 상담</h3>
            <p class="font-body-sm text-on-surface-variant mb-4 leading-relaxed">
              작물 상태나 재배 면적, 증상을 알려주시면 본사 생명공학 연구팀이 최적의 희석비와 처방을 무료로 안내해 드립니다.
            </p>
            <div class="flex flex-col gap-3">
              <a href="tel:063-855-5001" class="flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:bg-primary-container transition-transform active:scale-95">
                <span class="material-symbols-outlined text-[20px]">call</span>
                <span>본사 대표전화 상담 (063-855-5001)</span>
              </a>
              <a href="https://pf.kakao.com" target="_blank" rel="noopener" class="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-bold shadow-md hover:brightness-95 transition-transform active:scale-95">
                <span class="material-symbols-outlined text-[20px]">chat</span>
                <span>카카오톡 1초 간편 상담</span>
              </a>
              <a href="ai-hospital.html" class="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-container-high text-on-surface font-bold hover:bg-surface-container-highest transition-transform active:scale-95">
                <span class="material-symbols-outlined text-[20px] text-primary">psychology</span>
                <span>AI 식물병원 사진 진단 먼저 받기</span>
              </a>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }
      modal.classList.remove('hidden');
    },

    close: function() {
      const modal = document.getElementById('consult-modal');
      if (modal) modal.classList.add('hidden');
    }
  };

  // --- Search Dialog ---
  window.HighzoneSearch = {
    open: function() {
      let modal = document.getElementById('search-dialog');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'search-dialog';
        modal.className = 'fixed inset-0 z-[9999] flex flex-col p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200';
        modal.innerHTML = `
          <div class="bg-surface rounded-2xl w-full max-w-md mx-auto p-4 shadow-2xl relative border border-primary/20 mt-12">
            <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div class="flex items-center gap-2 text-primary font-bold">
                <span class="material-symbols-outlined">search</span>
                <span>처방 & 제품 검색</span>
              </div>
              <button type="button" class="text-on-surface-variant hover:text-on-surface" onclick="HighzoneSearch.close()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <form action="products.html" method="GET" class="mt-3 relative" onsubmit="HighzoneSearch.submit(event)">
              <input type="text" id="global-search-input" name="q" placeholder="토마토, 고추, 냉해, 버섯, 수경재배..." class="w-full h-12 pl-4 pr-12 rounded-xl bg-surface-container text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary">
              <button type="submit" class="absolute right-2 top-2 bottom-2 px-3 rounded-lg bg-primary text-white flex items-center justify-center">
                <span class="material-symbols-outlined text-[20px]">search</span>
              </button>
            </form>
            <div class="mt-4">
              <span class="font-label-sm text-outline text-[11px] uppercase tracking-wider">추천 검색어</span>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <a href="products.html?q=냉해" class="px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-xs text-on-surface">#냉해방지</a>
                <a href="products.html?q=바이오레드졸" class="px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-xs text-on-surface">#바이오레드졸</a>
                <a href="products.html?q=수경재배" class="px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-xs text-on-surface">#수경재배</a>
                <a href="products.html?q=도복왕" class="px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-xs text-on-surface">#도복왕</a>
                <a href="products.html?q=뿌리" class="px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high text-xs text-on-surface">#뿌리발근</a>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }
      modal.classList.remove('hidden');
      setTimeout(() => {
        const inp = document.getElementById('global-search-input');
        if (inp) inp.focus();
      }, 50);
    },

    close: function() {
      const modal = document.getElementById('search-dialog');
      if (modal) modal.classList.add('hidden');
    },

    submit: function(e) {
      e.preventDefault();
      const inp = document.getElementById('global-search-input');
      const val = inp ? inp.value.trim() : '';
      window.location.href = 'products.html' + (val ? '?q=' + encodeURIComponent(val) : '');
    }
  };

  // --- Create Shared Slide-over Drawer Markup on Every Page ---
  function ensureDrawerMarkup() {
    if (document.getElementById('cart-drawer')) return;

    const drawerHtml = `
      <div id="cart-drawer-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-xs z-[9990] hidden opacity-0 transition-opacity duration-300" onclick="HighzoneCart.closeDrawer()"></div>
      <div id="cart-drawer" class="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-surface z-[9995] shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300 ease-in-out">
        <!-- Header -->
        <div class="h-16 px-4 flex items-center justify-between border-b border-outline-variant/30 bg-surface-container-lowest">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[24px]">shopping_bag</span>
            <h3 class="font-headline-sm font-bold text-on-surface">장바구니</h3>
          </div>
          <button type="button" class="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant" onclick="HighzoneCart.closeDrawer()">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <!-- Scrollable Items -->
        <div id="cart-drawer-items" class="flex-1 overflow-y-auto p-4 flex flex-col gap-3"></div>
        <!-- Footer -->
        <div class="p-4 border-t border-outline-variant/30 bg-surface-container-lowest flex flex-col gap-3">
          <div class="flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>상품 금액</span>
            <span id="cart-drawer-subtotal" class="font-bold text-on-surface">0원</span>
          </div>
          <div class="flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>배송비</span>
            <span id="cart-drawer-shipping" class="text-primary font-bold">무료</span>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-outline-variant/20">
            <span class="font-headline-sm font-bold text-on-surface">최종 결제 금액</span>
            <span id="cart-drawer-total" class="font-headline-md font-extrabold text-primary">0원</span>
          </div>
          <a href="order.html" class="w-full py-3.5 rounded-full bg-primary hover:bg-primary-container active:scale-[0.98] text-on-primary font-label-md font-bold text-center shadow-lg transition-all flex items-center justify-center gap-2">
            <span>주문서 작성하기</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHtml);
  }

  // --- Attach Event Listeners on Page Load ---
  document.addEventListener('DOMContentLoaded', () => {
    ensureDrawerMarkup();
    HighzoneCart.updateBadges();

    // Attach Cart triggers
    document.querySelectorAll('[data-path="cart"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        HighzoneCart.openDrawer();
      });
    });

    // Attach Search triggers
    document.querySelectorAll('[data-path="search"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        HighzoneSearch.open();
      });
    });

    // Attach Consultation ("문의") buttons
    document.querySelectorAll('button, a').forEach(el => {
      const text = (el.textContent || '').trim();
      if (text === '문의' || text === '카카오 문의' || text === '상담하기' || text.includes('전문가 상담')) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          HighzoneConsult.open();
        });
      }
    });

    // Global Add to Cart interceptor for buttons containing "담기"
    document.querySelectorAll('button, a').forEach(el => {
      const text = (el.textContent || '').trim();
      if (text === '담기' || text.includes('장바구니 담기')) {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const card = el.closest('.flex-col, .product-card, article');
          const title = card ? card.querySelector('h2, h3, h4')?.textContent?.trim() : '하이존바이오 친환경 바이오';
          const priceText = card ? card.querySelector('.font-headline-sm, .font-headline-md, .text-headline-sm')?.textContent : '28,000';
          const price = parseInt((priceText || '').replace(/[^0-9]/g, '')) || 28000;
          const img = card ? card.querySelector('img')?.src : 'assets/prod_1.png';

          HighzoneCart.addItem('prod-' + Date.now(), 1, {
            id: 'prod-' + Date.now(),
            name: title || '하이존바이오 친환경 제품',
            price: price,
            img: img || 'assets/prod_1.png',
            tag: '친환경 특허'
          });
        });
      }
    });
  });

})();