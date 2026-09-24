/* ===== 全部逻辑封装进 initFeatPlayer() ===== */
function initFeatPlayer() {

    /* ---------- 主题明暗检测：直接读 daisyUI 变量 ---------- */
    var html = document.documentElement;

    function readLuminance(varName) {
        var v = getComputedStyle(html).getPropertyValue(varName).trim();
        if (!v) return null;
        var m = v.match(/[\d.]+/g);
        if (!m || !m.length) return null;
        var L = parseFloat(m[0]);
        return isNaN(L) ? null : L;
    }

    function detectDark() {
        var lb1 = readLuminance('--b1');
        if (lb1 === null) lb1 = readLuminance('--color-base-100');
        if (lb1 !== null) return lb1 < 0.5;

        var lbc = readLuminance('--bc');
        if (lbc === null) lbc = readLuminance('--color-base-content');
        if (lbc !== null) return lbc > 0.5;

        var bg = getComputedStyle(document.body).backgroundColor || '';
        var m = bg.match(/[\d.]+/g);
        if (m && m.length >= 3) {
            var lum = (0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2]) / 255;
            return lum < 0.5;
        }
        return false;
    }

    function updateFeatTheme() {
        var isDark = detectDark();
        document.querySelectorAll('.feat-tag').forEach(function (el) {
            el.classList.toggle('on-dark', isDark);
        });
    }

    updateFeatTheme();

    /* 监听主题切换（data-theme / class 变化时重新判断） */
    if (!window.__featThemeObserver) {
        window.__featThemeObserver = true;
        var pending = false;
        function schedule() {
            if (pending) return;
            pending = true;
            requestAnimationFrame(function () {
                pending = false;
                var isDark = detectDark();
                document.querySelectorAll('.feat-tag').forEach(function (el) {
                    el.classList.toggle('on-dark', isDark);
                });
            });
        }
        new MutationObserver(schedule).observe(html, {
            attributes: true,
            attributeFilter: ['data-theme', 'class'],
        });
    }

    /* ---------- 裂隙动画：默认暂停，hover 才跑 ---------- */
    document.querySelectorAll('.feat-wrap').forEach(function (wrap) {
        if (wrap.dataset.featInit) return;     // 避免重复绑定
        wrap.dataset.featInit = '1';

        var svg = wrap.querySelector('svg');
        if (!svg) return;

        function pauseNow() {
            try { svg.pauseAnimations(); } catch (e) {}
        }
        pauseNow();
        setTimeout(pauseNow, 0);
        setTimeout(pauseNow, 200);

        wrap.addEventListener('mouseenter', function () {
            try { svg.unpauseAnimations(); } catch (e) {}
        });
        wrap.addEventListener('mouseleave', function () {
            try { svg.pauseAnimations(); } catch (e) {}
        });
    });

    /* 切到后台时暂停所有（只绑一次） */
    if (!window.__featVisibilityBound) {
        window.__featVisibilityBound = true;
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                document.querySelectorAll('.feat-wrap svg').forEach(function (svg) {
                    try { svg.pauseAnimations(); } catch (e) {}
                });
            }
        });
    }

    /* ---------- 播放器逻辑 ---------- */
    var palettes = [
        { bg: 'linear-gradient(90deg,#7b5cff,#ff6bd6,#46e0ff,#7b5cff)', glow: 'rgba(123,92,255,.7)',   tag: '#d4c4ff', tagGlow: '#7b5cff' },
        { bg: 'linear-gradient(90deg,#ff512f,#dd2476,#ff512f)',          glow: 'rgba(255,81,47,.7)',    tag: '#ffc4a8', tagGlow: '#ff512f' },
        { bg: 'linear-gradient(90deg,#00c6ff,#0072ff,#00c6ff)',          glow: 'rgba(0,168,255,.7)',    tag: '#a8e4ff', tagGlow: '#00a8ff' },
        { bg: 'linear-gradient(90deg,#11998e,#38ef7d,#11998e)',          glow: 'rgba(17,153,142,.7)',   tag: '#a8f5c4', tagGlow: '#11998e' },
        { bg: 'linear-gradient(90deg,#f7971e,#ffd200,#f7971e)',          glow: 'rgba(247,151,30,.7)',   tag: '#ffe0a8', tagGlow: '#f7971e' },
        { bg: 'linear-gradient(90deg,#8e2de2,#4a00e0,#8e2de2)',          glow: 'rgba(142,45,226,.7)',   tag: '#c8a8ff', tagGlow: '#8e2de2' },
        { bg: 'linear-gradient(90deg,#ff6a00,#ee0979,#ff6a00)',          glow: 'rgba(255,106,0,.7)',    tag: '#ffc4b0', tagGlow: '#ff6a00' },
        { bg: 'linear-gradient(90deg,#06beb6,#48b1bf,#06beb6)',          glow: 'rgba(6,190,182,.7)',    tag: '#a8eae4', tagGlow: '#06beb6' },
        { bg: 'linear-gradient(90deg,#c471ed,#f64f59,#c471ed)',          glow: 'rgba(196,113,237,.7)',  tag: '#f0c4ff', tagGlow: '#c471ed' },
        { bg: 'linear-gradient(90deg,#2c3e50,#fd746c,#2c3e50)',          glow: 'rgba(253,116,108,.7)',  tag: '#ffc8c0', tagGlow: '#fd746c' },
        { bg: 'linear-gradient(90deg,#e96443,#904e95,#e96443)',          glow: 'rgba(233,100,67,.7)',   tag: '#e8b4c8', tagGlow: '#e96443' },
        { bg: 'linear-gradient(90deg,#43cea2,#185a9d,#43cea2)',          glow: 'rgba(67,206,162,.7)',   tag: '#a8e8d4', tagGlow: '#43cea2' }
    ];

    function getPlayingAudio() {
        return document.querySelector('.feat-player audio:not([data-paused])');
    }

    document.querySelectorAll('.feat-player').forEach(function (player) {
        if (player.dataset.featInit) return;   // 避免重复绑定
        player.dataset.featInit = '1';

        var p = palettes[Math.floor(Math.random() * palettes.length)];
        player.style.setProperty('--feat-bg', p.bg);
        player.style.setProperty('--feat-glow', p.glow);
        player.style.setProperty('--feat-tag', p.tag);
        player.style.setProperty('--feat-tag-glow', p.tagGlow);

        var btn   = player.querySelector('.feat-btn');
        var audio = player.querySelector('audio');
        var fill  = player.querySelector('.feat-progress-fill');
        var bar   = player.querySelector('.feat-progress');
        var time  = player.querySelector('.feat-time');
        var vol   = player.querySelector('.feat-volume-slider');

        if (!audio) return;

        if (btn) {
            btn.addEventListener('click', function () {
                if (audio.paused) {
                    /* 暂停其他所有正在播放的音频 */
                    document.querySelectorAll('.feat-player audio').forEach(function (a) {
                        if (a !== audio) a.pause();
                    });
                    audio.play();
                } else {
                    audio.pause();
                }
            });
        }

        audio.addEventListener('play',  function () { if (btn) btn.classList.add('is-playing');    });
        audio.addEventListener('pause', function () { if (btn) btn.classList.remove('is-playing'); });
        audio.addEventListener('ended', function () {
            if (btn) btn.classList.remove('is-playing');
            if (fill) fill.style.width = '0%';
        });

        audio.addEventListener('timeupdate', function () {
            if (!audio.duration) return;
            if (fill) fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
            if (time) time.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
        });

        if (bar) {
            bar.addEventListener('click', function (e) {
                if (!audio.duration) return;
                var rect = bar.getBoundingClientRect();
                var ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                audio.currentTime = ratio * audio.duration;
            });
        }

        if (vol) {
            audio.volume = parseFloat(vol.value);
            vol.addEventListener('input', function () {
                audio.volume = parseFloat(vol.value);
                audio.muted = audio.volume === 0;
            });
        }
    });

    function fmt(s) {
        if (!isFinite(s)) return '0:00';
        var m = Math.floor(s / 60);
        var sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }
}

/* ===== 首次加载执行 ===== */
initFeatPlayer();

/* ===== 每次页面切换后重新执行 ===== */
document.addEventListener('astro:page-load', initFeatPlayer);