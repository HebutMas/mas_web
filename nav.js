/**
 * 山海机甲战队 — 导航栏交互 & 深色模式切换
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var menuToggle = document.querySelector('.menu-toggle');
    var navMenu = document.querySelector('nav ul');
    var header = document.querySelector('header');
    var navLinks = document.querySelectorAll('nav ul li a');
    var nav = document.querySelector('nav');

    // ========== 注入深色模式切换按钮 ==========
    var themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', '切换深色模式');
    themeToggle.setAttribute('title', '切换深色/浅色模式');
    themeToggle.innerHTML = getThemeIcon();
    if (nav && menuToggle) {
      nav.insertBefore(themeToggle, menuToggle);
    }

    // ========== 深色模式逻辑 ==========
    var STORAGE_KEY = 'mas-theme';

    function getThemeIcon() {
      return document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
    }

    function applyTheme(theme) {
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      if (themeToggle) themeToggle.innerHTML = getThemeIcon();
    }

    function toggleTheme() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      var next = isDark ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
    }

    // 初始化：读取本地存储或系统偏好
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    }

    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // 监听系统主题变化
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        var hasSaved = false;
        try { hasSaved = localStorage.getItem(STORAGE_KEY) !== null; } catch (ex) { /* ignore */ }
        if (!hasSaved) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }

    // ========== 汉堡菜单逻辑 ==========
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = navMenu.classList.toggle('active');
      menuToggle.classList.toggle('active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    document.addEventListener('click', function (e) {
      if (!navMenu.classList.contains('active')) return;
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMenu();
        menuToggle.focus();
      }
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth > 968 && navMenu.classList.contains('active')) {
          closeMenu();
        }
      }, 150);
    });

    function closeMenu() {
      if (!navMenu.classList.contains('active')) return;
      navMenu.classList.remove('active');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }

    // ========== 导航栏滚动阴影 ==========
    window.addEventListener('scroll', function () {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  });
})();
