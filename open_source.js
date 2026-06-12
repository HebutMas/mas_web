/**
 * 山海机甲战队 — GitHub 开源项目加载器
 * 通过 GitHub API 拉取组织仓库并渲染为卡片列表
 */
(function () {
  'use strict';

  var GITHUB_ORG = 'SCU-Hotpot'; // GitHub 组织名
  var API_URL = 'https://api.github.com/orgs/' + GITHUB_ORG + '/repos?sort=updated&per_page=30';

  document.addEventListener('DOMContentLoaded', function () {
    var listEl = document.getElementById('projects-list');
    var searchInput = document.getElementById('repo-search-input');
    if (!listEl) return;

    var allRepos = [];

    // --- 渲染卡片 ---
    function renderCards(repos) {
      listEl.innerHTML = '';

      if (repos.length === 0) {
        listEl.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:40px;">没有找到匹配的项目</p>';
        return;
      }

      repos.forEach(function (repo) {
        var card = document.createElement('a');
        card.className = 'repo-card';
        card.href = repo.html_url;
        card.target = '_blank';
        card.rel = 'noopener';

        var langTag = repo.language
          ? '<span class="repo-lang">' + escapeHtml(repo.language) + '</span>'
          : '';

        card.innerHTML =
          '<div class="repo-card-inner">' +
            '<h3 class="repo-name">' + (repo.fork ? '🍴 ' : '📦 ') + escapeHtml(repo.name) + '</h3>' +
            '<p class="repo-desc">' + escapeHtml(repo.description || '暂无描述') + '</p>' +
            '<div class="repo-meta">' +
              langTag +
              '<span>⭐ ' + repo.stargazers_count + '</span>' +
              '<span>🔄 ' + repo.forks_count + '</span>' +
              '<span class="repo-updated">' + formatDate(repo.updated_at) + '</span>' +
            '</div>' +
          '</div>';

        listEl.appendChild(card);
      });
    }

    // --- 搜索过滤 ---
    function filterRepos() {
      var query = (searchInput && searchInput.value || '').trim().toLowerCase();
      if (!query) {
        renderCards(allRepos);
        return;
      }
      var filtered = allRepos.filter(function (repo) {
        var name = repo.name.toLowerCase();
        var desc = (repo.description || '').toLowerCase();
        return name.indexOf(query) !== -1 || desc.indexOf(query) !== -1;
      });
      renderCards(filtered);
    }

    if (searchInput) {
      searchInput.addEventListener('input', debounce(filterRepos, 300));
    }

    // --- 加载仓库 ---
    function loadRepos() {
      listEl.innerHTML = '<p style="text-align:center;color:var(--text-muted);grid-column:1/-1;padding:40px;">正在加载项目...</p>';

      fetch(API_URL)
        .then(function (res) {
          if (!res.ok) throw new Error('GitHub API error: ' + res.status);
          return res.json();
        })
        .then(function (repos) {
          allRepos = repos;
          renderCards(repos);
        })
        .catch(function (err) {
          console.warn('GitHub 仓库加载失败:', err.message);
          listEl.innerHTML =
            '<div style="text-align:center;grid-column:1/-1;padding:40px;color:var(--text-muted);">' +
              '<p>⚠️ 无法加载 GitHub 仓库（可能是 API 限流，请稍后刷新页面）</p>' +
              '<p style="margin-top:12px;">' +
                '<a href="https://github.com/' + GITHUB_ORG + '" target="_blank" rel="noopener" ' +
                   'style="color:var(--accent-color);font-weight:500;">直接在 GitHub 上查看 →</a>' +
              '</p>' +
            '</div>';
        });
    }

    loadRepos();
  });

  // --- 工具函数 ---
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr);
    var now = new Date();
    var diff = now - d;
    var days = Math.floor(diff / 86400000);
    if (days < 1) return '今天';
    if (days < 30) return days + ' 天前';
    if (days < 365) return Math.floor(days / 30) + ' 个月前';
    return Math.floor(days / 365) + ' 年前';
  }

  function debounce(fn, delay) {
    var timer;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
    };
  }
})();
