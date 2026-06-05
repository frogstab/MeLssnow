---
title: 大数据挖掘-简答
description: 大数据挖掘简答题汇总
pubDate: 2026-06-05T10:41
image: >-
  https://origin.picgo.net/2026/06/05/1_X03Tp-r3RdNSZHsaEsmNrA4885eaab27686383.png
draft: false
tags: []
categories:
  - 期末复习
---
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>海浪 · 冷月净空 · 深地平线</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        .wave-container {
            position: relative;
            width: 100%;
            height: 70vh;
            min-height: 460px;
            max-height: 85vh;
            background: #030b14;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 35px -12px rgba(0,0,0,0.4);
            margin: 1.5rem 0;
        }
        .wave-container canvas {
            display: block;
            width: 100%;
            height: 100%;
            cursor: default;
        }
        body {
            background: #0a111f;
            margin: 0;
            padding: 0;
        }
        @media (max-width: 640px) {
            .wave-container {
                height: 50vh;
                min-height: 340px;
                border-radius: 18px;
            }
        }
    </style>
</head>
<body>
<div class="wave-container">
    <canvas id="waveCanvas"></canvas>
</div>
<script>
    (function() {
        // ---------- 平缓海浪 + 净空（无噪点）+ 深色微动地平线 + 清冷白月 ----------
        const canvas = document.getElementById('waveCanvas');
        let ctx = null;
        let width = 0, height = 0;
        let curves = [];
        let animationId = null;
        let elapsedTime = 0;
        let lastFrameMs = 0;
        let horizonY = 0;
        // 波浪参数 ———— 平缓优雅
        const WAVE = {
            freq1: 0.0068,   speed1: 1.20,  amp1: 22,
            freq2: 0.015,    speed2: 1.95,  amp2: 12,
            freq3: 0.032,    speed3: 2.50,  amp3: 6,
            freqY: 0.010,    speedY: 1.40,  ampY: 9,
            crossMod: 0.020, crossSpeed: 1.8, crossAmp: 5,
        };
        let baseSpacing = 24;
        let minSpacing = 6;
        // 星星数组
        let stars = [];
        const STAR_COUNT = 280;
        function initStarsStatic() {
            stars = [];
            for (let i = 0; i < STAR_COUNT; i++) {
                stars.push({
                    x: Math.random(),
                    y: Math.random(),
                    radius: 0.8 + Math.random() * 2.2,
                    baseAlpha: 0.4 + Math.random() * 0.6,
                    twinkleSpeed: 0.6 + Math.random() * 1.4,
                    twinklePhase: Math.random() * Math.PI * 2,
                });
            }
        }
        function updateHorizon() {
            horizonY = height * 0.52;
            if (horizonY < 40) horizonY = height * 0.52;
        }
        // 重新生成海浪曲线 (底部饱满)
        function regenerateCurves() {
            if (!ctx || height === 0 || horizonY <= 0) return;
            const startY = height - 1;
            const endY = Math.max(horizonY - 8, startY - 500);
            if (startY <= endY) {
                curves = [];
                return;
            }
            const totalDistance = startY - endY;
            let yPositions = [];
            let currentY = startY;
            let iter = 0;
            while (currentY > endY && iter < 500) {
                yPositions.push(currentY);
                let t = (startY - currentY) / totalDistance;
                t = Math.min(0.99, Math.max(0, t));
                let spacing = baseSpacing - (baseSpacing - minSpacing) * Math.pow(t, 0.65);
                spacing = Math.max(minSpacing, spacing);
                currentY -= spacing;
                iter++;
            }
            if (yPositions.length > 0 && yPositions[yPositions.length-1] > endY + 3) {
                yPositions.push(endY);
            }
            curves = [];
            for (let idx = 0; idx < yPositions.length; idx++) {
                const yBase = yPositions[idx];
                let t = (startY - yBase) / totalDistance;
                t = Math.min(0.98, Math.max(0, t));
                const ampFactor = (1 - t * 0.75) * (1 + (1 - t) * 0.2);
                const lineWidthMain = 1.6 + (1 - t) * 1.6;
                const lineWidthSub = lineWidthMain * 0.7;
                curves.push({
                    yBase, t, ampFactor,
                    lineWidthMain, lineWidthSub,
                    phaseOff: idx * 0.62,
                    phaseOffY: idx * 0.38,
                });
            }
        }
        // 波浪偏移 (平缓)
        function getWaveOffset(x, yBase, timeSec, curve) {
            const { ampFactor, phaseOff, phaseOffY, t } = curve;
            const effectiveAmp = ampFactor * (1 - t * 0.2);
            const off1 = Math.sin(x * WAVE.freq1 + timeSec * WAVE.speed1 + phaseOff) * WAVE.amp1 * effectiveAmp;
            const off2 = Math.sin(x * WAVE.freq2 - timeSec * WAVE.speed2 * 1.1 + phaseOff * 0.7) * WAVE.amp2 * effectiveAmp;
            const off3 = Math.sin(x * WAVE.freq3 + timeSec * WAVE.speed3 * 1.2 + phaseOff * 0.9) * WAVE.amp3 * effectiveAmp;
            const yNorm = (yBase / Math.max(1, height)) * Math.PI;
            const offY = Math.sin(yNorm + timeSec * WAVE.speedY + phaseOffY) * WAVE.ampY * effectiveAmp * (1 - t*0.4);
            const cross = Math.sin(x * WAVE.crossMod + yBase * 0.006 + timeSec * WAVE.crossSpeed) * WAVE.crossAmp * effectiveAmp;
            let total = off1 + off2 + off3 + offY + cross;
            const maxAmp = 36 * effectiveAmp + 8;
            total = Math.min(maxAmp, Math.max(-maxAmp, total));
            return total;
        }
        // 曲线颜色 (青绿→深蓝)
        function getCurveColor(x, yBase, offsetY, curve, timeSec) {
            const { t } = curve;
            const nearR = 70, nearG = 205, nearB = 245;
            const midR = 58, midG = 158, midB = 218;
            const farR = 38, farG = 90, farB = 168;
            let rCol, gCol, bCol;
            if (t < 0.5) {
                const p = t / 0.5;
                rCol = nearR * (1-p) + midR * p;
                gCol = nearG * (1-p) + 158 * p;
                bCol = nearB * (1-p) + midB * p;
            } else {
                const p = (t-0.5)/0.5;
                rCol = midR * (1-p) + farR * p;
                gCol = 158 * (1-p) + farG * p;
                bCol = midB * (1-p) + farB * p;
            }
            let intensity = 1.0;
            const absOffset = Math.abs(offsetY);
            if (absOffset > 14 && offsetY > 0) intensity += 0.25 * (absOffset / 40) * (1 - t*0.4);
            const flicker = 0.9 + Math.sin(timeSec * 3.0 + x * 0.018) * 0.1;
            let finalR = Math.min(255, rCol * intensity * flicker);
            let finalG = Math.min(255, gCol * intensity * flicker * 1.04);
            let finalB = Math.min(255, bCol * intensity * flicker * 1.08);
            let alpha = 0.68 + (1 - t) * 0.3;
            if (absOffset > 18) alpha += 0.1;
            alpha = Math.min(0.92, alpha);
            return `rgba(${finalR}, ${finalG}, ${finalB}, ${alpha})`;
        }
        // 绘制单条曲线
        function drawCurve(ctx, curve, timeSec) {
            const { yBase, lineWidthMain, lineWidthSub } = curve;
            if (yBase < horizonY - 25) return;
            const steps = Math.max(75, Math.floor(width / 15));
            const points = [];
            for (let i = 0; i <= steps; i++) {
                const x = (i / steps) * width;
                let offsetY = getWaveOffset(x, yBase, timeSec, curve);
                let y = yBase + offsetY;
                if (y < horizonY - 1) y = horizonY - 1;
                points.push({ x, y, offsetY });
            }
            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            for (let seg = 0; seg < points.length - 1; seg++) {
                const p1 = points[seg];
                const p2 = points[seg+1];
                const col = getCurveColor(p1.x, yBase, p1.offsetY, curve, timeSec);
                ctx.beginPath();
                ctx.lineWidth = lineWidthMain;
                ctx.strokeStyle = col;
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
            for (let seg = 0; seg < points.length - 1; seg++) {
                const p1 = points[seg];
                const p2 = points[seg+1];
                let brightCol = getCurveColor(p1.x, yBase, p1.offsetY, curve, timeSec);
                brightCol = brightCol.replace(/[\d\.]+\)$/g, match => {
                    let alpha = parseFloat(match) * 0.72;
                    return `${alpha.toFixed(2)})`;
                });
                ctx.beginPath();
                ctx.lineWidth = lineWidthSub;
                ctx.strokeStyle = brightCol;
                ctx.moveTo(p1.x, p1.y - 0.5);
                ctx.lineTo(p2.x, p2.y - 0.5);
                ctx.stroke();
            }
            ctx.restore();
        }
        // 绘制纯净星空 + 冷白月亮 (更小更白)
        function drawSkyAndMoon(timeSec) {
            if (!ctx || horizonY <= 0) return;
            // 天空渐变
            const grad = ctx.createLinearGradient(0, 0, 0, horizonY);
            grad.addColorStop(0, '#020617');
            grad.addColorStop(0.45, '#0a1a3a');
            grad.addColorStop(1, '#102b4e');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, horizonY);
            // 星星
            for (let s of stars) {
                const starX = s.x * width;
                const starY = s.y * horizonY;
                const twinkle = 0.55 + 0.45 * Math.sin(timeSec * s.twinkleSpeed + s.twinklePhase);
                let alpha = s.baseAlpha * (0.5 + twinkle * 0.6);
                alpha = Math.min(0.9, Math.max(0.2, alpha));
                ctx.beginPath();
                ctx.arc(starX, starY, s.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 245, 220, ${alpha})`;
                ctx.fill();
                if (s.radius > 1.6 && twinkle > 0.7) {
                    ctx.beginPath();
                    ctx.arc(starX, starY, s.radius * 1.4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 230, ${alpha * 0.3})`;
                    ctx.fill();
                }
            }
            // ========= 月亮：更小，更白，冷色调 =========
            const moonX = width - width * 0.16;      // 稍微左移一点让比例更好
            const moonY = horizonY * 0.22;
            const moonRadius = Math.min(width, height) * 0.055;  // 缩小约35%
            ctx.save();
            // 外层光晕 (冷白)
            const outerGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.2, moonX, moonY, moonRadius * 1.4);
            outerGlow.addColorStop(0, 'rgba(255, 250, 245, 0.85)');
            outerGlow.addColorStop(0.6, 'rgba(220, 230, 250, 0.45)');
            outerGlow.addColorStop(1, 'rgba(180, 200, 230, 0)');
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonRadius * 1.15, 0, Math.PI * 2);
            ctx.fill();
            // 月亮本体：纯白微冷
            const moonGrad = ctx.createRadialGradient(moonX - moonRadius*0.2, moonY - moonRadius*0.2, moonRadius*0.2, moonX, moonY, moonRadius);
            moonGrad.addColorStop(0, '#ffffff');
            moonGrad.addColorStop(0.8, '#f0f4fa');
            moonGrad.addColorStop(1, '#e2e8f5');
            ctx.fillStyle = moonGrad;
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
            ctx.fill();
            // 极淡柔光 (微呼吸感)
            ctx.globalCompositeOperation = 'lighter';
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonRadius * 1.25, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(235, 245, 255, ${0.08 + Math.sin(timeSec * 0.6) * 0.03})`;
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();
        }
        // 海洋背景
        function drawOceanBackground() {
            if (!ctx || horizonY <= 0) return;
            const grad = ctx.createLinearGradient(0, horizonY, 0, height);
            grad.addColorStop(0, '#0a2a48');
            grad.addColorStop(0.35, '#093a5c');
            grad.addColorStop(0.7, '#0d5078');
            grad.addColorStop(1, '#136e96');
            ctx.fillStyle = grad;
            ctx.fillRect(0, horizonY, width, height - horizonY);
            // 极淡海底纹理
            ctx.fillStyle = 'rgba(160, 210, 240, 0.03)';
            for (let i = 0; i < 80; i++) {
                ctx.fillRect(Math.random() * width, horizonY + Math.random() * (height - horizonY), 1.5, 1.5);
            }
        }
        // 地平线 (深色但清晰)
        function drawHorizonGlow(timeSec) {
            if (!ctx || horizonY <= 0) return;
            ctx.save();
            ctx.beginPath();
            const amp = 0.9;
            const freq = 0.01;
            const speed = 0.5;
            const steps = Math.max(80, Math.floor(width / 12));
            let points = [];
            for (let i = 0; i <= steps; i++) {
                const x = (i / steps) * width;
                const waveY = horizonY + Math.sin(x * freq + timeSec * speed) * amp;
                points.push({ x, y: waveY });
            }
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = 'rgba(65, 125, 185, 0.85)';
            ctx.shadowBlur = 3;
            ctx.shadowColor = 'rgba(50, 100, 150, 0.4)';
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y - 0.4);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y - 0.4);
            }
            ctx.lineWidth = 0.9;
            ctx.strokeStyle = 'rgba(90, 155, 210, 0.55)';
            ctx.stroke();
            ctx.restore();
        }
        // 环境柔光
        function drawAmbient() {
            if (!ctx || horizonY <= 0) return;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const grad = ctx.createLinearGradient(0, horizonY + 15, 0, height);
            grad.addColorStop(0, 'rgba(60, 130, 180, 0)');
            grad.addColorStop(1, 'rgba(80, 150, 200, 0.06)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, horizonY, width, height - horizonY);
            ctx.restore();
        }
        function renderAllWaves(currentTime) {
            if (!ctx || width === 0 || height === 0) return;
            drawSkyAndMoon(currentTime);
            drawOceanBackground();
            const sorted = [...curves].sort((a,b) => b.t - a.t);
            for (let curve of sorted) {
                drawCurve(ctx, curve, currentTime);
            }
            drawAmbient();
            drawHorizonGlow(currentTime);
        }
        // ----- 自适应 -----
        function resizeCanvas() {
            if (!canvas || !canvas.parentElement) return;
            const container = canvas.parentElement;
            let newWidth = container.clientWidth;
            let newHeight = container.clientHeight;
            if (newWidth === 0) newWidth = window.innerWidth;
            if (newHeight === 0) newHeight = window.innerHeight * 0.7;
            if (newWidth === 0 || newHeight === 0) return;
            width = newWidth;
            height = newHeight;
            canvas.width = width;
            canvas.height = height;
            updateHorizon();
            regenerateCurves();
            if (ctx) renderAllWaves(elapsedTime);
        }
        let resizeTimer;
        function handleResize() {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => resizeCanvas(), 80);
        }
        function animate(nowMs) {
            if (!ctx) return;
            if (lastFrameMs === 0) {
                lastFrameMs = nowMs;
                requestAnimationFrame(animate);
                return;
            }
            let delta = Math.min(0.033, (nowMs - lastFrameMs) / 1000);
            if (delta > 0.002) elapsedTime += delta * 0.98;
            lastFrameMs = nowMs;
            renderAllWaves(elapsedTime);
            animationId = requestAnimationFrame(animate);
        }
        function init() {
            if (!canvas) return;
            ctx = canvas.getContext('2d');
            if (!ctx) return;
            initStarsStatic();
            const container = canvas.parentElement;
            if (container) {
                width = container.clientWidth || window.innerWidth;
                height = container.clientHeight || (window.innerHeight * 0.7);
                if (width === 0) width = window.innerWidth;
                if (height === 0) height = 500;
                canvas.width = width;
                canvas.height = height;
            } else {
                width = window.innerWidth;
                height = window.innerHeight * 0.7;
                canvas.width = width;
                canvas.height = height;
            }
            updateHorizon();
            regenerateCurves();
            setTimeout(() => {
                resizeCanvas();
            }, 30);
            window.addEventListener('resize', handleResize);
            animationId = requestAnimationFrame(animate);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
        window.addEventListener('beforeunload', () => {
            if (animationId) cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            if (resizeTimer) clearTimeout(resizeTimer);
        });
    })();
</script>
</body>
</html>

`第一章-绪论`
# ⼤数据定义

其⼤⼩超出了常规**数据库⼯具**获取、储存、管理和分析能⼒的**数据集**。

# ⼤数据特征

其核心特点通常被概括为5V模型。
## 大量（Volume）

**指数据体量极其庞大**。

从2013年⾄2020年，⼈类的数据规模将扩⼤50倍，每年产⽣的数据量将增⻓到44万亿GB，相当于美国国家图书馆数据量的数百万倍，且每18个⽉翻⼀番。

## 高速（Velocity）

**指数据生成、流动和处理的速度非常快。**

随着现代感测、互联⽹、计算机技术的发展，数据⽣成、储存、分析、处理的速度远远超出⼈们的想象⼒，这是⼤数据区别于传统数据或⼩数据的显著特征。

## 多样（Variety）

**指数据类型和来源的多样性。**

⼤数据与传统数据相⽐，数据来源⼴、维度多、类型杂，各种机器仪表在⾃动产⽣数据的同时，⼈⾃⾝的⽣活⾏为也在不断创造数据；不仅有企业组织内部的业务数据，还有海量相关的外部数据。
‌
## 价值（Value）

**商业价值高，价值密度较低。**

⼤数据有巨⼤的潜在价值，但同其呈⼏何指数爆发式增⻓相⽐，某⼀对象或模块数据的价值密度较低，这⽆疑给我们开发海量数据增加了难度和成本。

## 真实性（Veracity)

**指数据的质量和可信度。**

数据的准确性、一致性和可靠性是进行有效分析并做出正确决策的基础。不准确或带有偏见的数据会导致错误的结论，因此数据治理和质量控制在大数据应用中至关重要。‌‌‌‌

# 大量信息带来的问题

- 信息**过量**难以消化；
- 信息**真假**难以辨识；
- 信息**安全**难以保证；
- 信息**形式不一致**，难以统一处理
- 信息不处理就成为“信息垃圾”
- 各行业各领域政府、企业等组织也滋生出信息处理、数据处理的需求

## 解决方法

- 提升管理
- 提升服务 
- 提升竞争力

# 什么是数据挖掘？其特点有什么？

数据挖掘是从大量的、有噪声的、不完全的、模糊和随机的数据中，提取出隐含在其中的、人们**事先不知道的**、具有**潜在利用价值**的信息和知识的过程。

特点：
- 数据挖掘是多学科的产物
	- 统计学、数据库技术、可视化、高性能计算、机器学习、人 工智能
- 数据挖掘是多技术的产物
	- 模式识别、算法、应用、信息检索、数据仓库、异常检索
# 数据挖掘的任务

- 分类和预测：找出描述并区分数据类或概念的模型（或函数），以便能够使用模型预 测类标记未知的对象的过程。
- 聚类分析：分析样本间的相似度来自动地将样本聚集成若干类 
- 关联分析：从数据中发现项集之间的**有趣关系**或**依赖关系**
- 异常检测：识别特征显著不同于其他数据的观测值

# 简述分类与聚类的区别。

**分类**：**监督学习**，训练数据中已知类标记，目标是建立模型预测新数据的类别。

**聚类**：**无监督学习**，训练数据中无类标记，目标是将相似的数据对象分组形成簇。

**原则区别**：分类基于已知标签建模；聚类遵循“最大化类内相似性、最小化类间相似性”原则。

# 数据挖掘的应用

## 数据库分析和决策支持

1) 市场分析和管理（针对销售, 顾客关系管理, 购物篮分析, 交叉销售, 市场分割） 
2) 风险分析与管理（预测, 顾客关系, 改进保险, 质量控制, 竞争能力分析） 
3) 欺骗检测与管理 
## 其它应用

1) 文本挖掘 (新闻组, email, 文档资料) 
2) 流数据挖掘(Stream data mining) 
3) Web挖掘. 
4) DNA 数据分析

# 数据挖掘面临的挑战

- **可伸缩性**：数据规模巨大，算法需能处理无法全部放入内存的数据集。

- **高维性**：属性数量成百上千，传统低维方法失效，计算复杂度急剧增加。

- **异种数据和复杂数据**：需处理半结构化文本、图数据、时间序列、空间数据等。

- **数据所有权与分布**：数据可能分布在多个机构，需分布式挖掘并解决通信、安全、结果融合问题。

- **非传统分析**：需自动产生和评估大量假设，而非传统的假设-验证模式。

---
`第二章-数据挖掘的过程`
# 数据挖掘的过程

数据挖掘是一个从**大量数据**中获取**有价值的信息和知识**的过程。

数据挖掘过程从宏观上分为三个主要部分：

- **数据整理**：包括数据选取、预处理、数据集成和数据转换。
    
- **数据挖掘**：运用选定算法从数据集中提取用户感兴趣的知识或模式。
    
- **解释评估**：对发现的模式进行解释和评价，剔除冗余或无关模式，最终将知识以用户能理解的方式呈现。

# 数据挖掘的过程模型

## CRISP-DM 模型包含哪六个阶段？

1. **商业理解**：明确业务目标，转化为数据挖掘主题。

2. **数据理解**：收集数据，检测数据质量，熟悉数据特征。

3. **数据准备**：对数据进行变换、组合、清理，形成建模用的最终数据集。

4. **建模**：选择合适的建模方法，优化参数，找出数据中的规律。

5. **模型评估**：从业务和统计角度评估模型，检查是否遗漏重要问题。

6. **结果发布**：将知识以报告或集成到业务系统中的方式呈现，用于改善运营。

## SEMMA 方法包含哪五个步骤？


1. **Sample（抽样）**：从数据中抽取样本，检验数据质量。

2. **Explore（探索）**：探索数据规律、趋势、相关性，发现数据特征。

3. **Modify（调整）**：调整数据以适应问题需要，进行预处理。

4. **Model（建模）**：选择技术手段进行模型研发和知识发现。

5. **Assess（评估）**：对模型和知识进行综合解释和评价，选出最优模型。

###  简述 5A 模型的核心内容。

**

- **Assess（评价需求）**：正确评价任务需求及数据，充分理解数据并决策。

- **Access（存取数据）**：获取所需数据。

- **Analyze（完备分析）**：采用完善的分析技术和统计方法，检验结果是否正确。

- **Act（模型演示）**：提供专业级的原型演示及图表，便于用户快速决策。

- **Automate（结果展现）**：自动或半自动地展现结果。

# 数据挖掘过程中，“数据准备”阶段通常包括哪些具体工作？

- **数据选取**：根据用户需要从原始数据库中选取相关数据或样本。

- **数据预处理**：检查数据完整性及一致性，消除噪声，填充缺失值。

- **数据集成**：合并来自不同源的数据。

- **数据转换**：通过投影或数据库操作减少数据量，转换为适合挖掘的格式。

---
`第三章-数据准备`

# 数据收集时需要考虑哪些方面的问题？

- **数据源多样化**：数据可能来自政务、企事业、咨询公司、网络信息等不同来源。

- **获得手段**：可通过委托方提供、第三方共享、购买或自行调查等方式获取。

- **经济性**：收集数据的成本需在预算范围内。

- **时效性**：数据需在有效时间内获取和使用。

- **有效性**：收集的数据必须能够满足数据挖掘的目标需求。

# 数据抽样的目的和原则是什么？

目的：缩减数据的量，以降低处理成本和时间。

原则：抽取的数据应有代表性；抽取感兴趣的内容

# 四种抽样方法的优缺点对比

## 简单随机抽样

- 优点：随机度高，操作简单，统计推断理论成熟。

- 缺点：
	- 效率可能较低，抽到的样本分布率可能较差；
	- 可能抽到“差”的样本，不能很好代表总体；
	- 当总体内部差异较大时精度不如分层抽样。

## 分层抽样

- 优点：
	- 适用于层间异质性大、层内同质性强的总体，相同样本量下精度高于简单随机抽样；
	- 能保证各“层”的代表性，避免抽到差样本；
	- 不同层可采用不同抽样框和方法。

- 缺点：
	- 需要高质量的辅助信息用于分层，抽样框创建更复杂、费用更高；
	- 抽样误差估计比简单随机抽样复杂；
	- 分层变量选择不当可能降低效率。

## 系统抽样

- 优点：简便易行，具有统计推断能力。

- 缺点：潜藏了可能存在的周期性。

## 整群抽样

- 优点：
	- 适用于群间差异小、群内差异大的总体；
	- 可根据自然特征（地域等）划分群体，便于组织实施，节省成本和时间；
	- 不需要完整总体名单。

- 缺点：
	- 群内单位往往有趋同性，精度低于简单随机抽样；
	- 若群间差异较大且抽取群数较少，抽样误差较大；
	- 估计效率通常不如分层抽样。

# 数据集成是什么？面临哪些主要难点？

数据集成是把不同来源、格式、特点性质的数据在**逻辑上**或**物理上**有机地集中，从而为组织提供全面的数据共享。

其面临：

- **异构性**：数据源的系统、数据模式、语义等存在差异。

- **分布性**：数据源异地分布，依赖网络传输，需解决传输的准确性、实时性、安全性等问题。

- **自治性**：各数据源可独立改变自身结构和数据，影响集成系统的鲁棒性。

- **完整性**：需要汇聚更全面、更能体现问题本质的数据。

# 简述数据联邦（Data Federation）的优点和缺点。

数据联邦是一种基于数据查询操作，从不同的数据源完成数据汇集，并构成一个虚拟化的数据库的数据集成方法。

- **优点**：
	- 不复制和迁移数据。
	- 开发快，应用人员无需了解复杂的不同数据源系统及其数据结构
	- 实时性强，实时访问数据
	- 适应变化灵活，持增量开发

- **缺点**：
    - 性能较低，数据结果集大时，性能会降低
    - 系统可用性低，依赖多个数据源，任一源离线则联邦数据失效。
    - 服务器负担大，真实数据源服务器的负载会有所增加。
    - 源数据内容，无法加入中间生成的结果。

# 数据仓库的定义

把来自不同尔统数据经过抽取、转换、加载，统一存储在一个集中的仓库中。

# 数据中常见的问题有哪些？

- **残缺数据**：部分关键信息缺失。
- **错误数据**：如数值超出合理范围、格式错误。
- **重复数据**：同一数据被多次存储和抽取。
- **异义数据**：数据定义语义差异，导致含义和解释不同。

# 数据清理的常用方法有哪些？

检测和纠正数据中的任何错误或不一致。

- **一致性检查**：检验数据是否在合理范围内、逻辑是否矛盾。
- **消除重复项**：合并或删除属性值相同的重复记录。
- **无效值和缺失值处理**：可用均值/中位数估算、逻辑推演、整例删除或特殊码标注等方法。
- **错误值检测与解决**：通过统计方法、规则库或外部数据识别并修正错误值。

# 维规约是什么？有什么好处？

维规约：通过删除不相关的属性（或维）减少数据集的复杂度和数据量。

好处：

- 提升数据挖掘算法效果，删除不相关特征并降低噪声。
- 使模型更容易理解和解释。
- 更容易实现可视化，缓解维灾难。

# 选择特征子集的方法有哪些？

降低维度的一个有效的方法就是从整个数据集中选取一个子集来进行处理，而该子集具有原始数据集的特
征，称为**特征子集**。

主要方法包括：

- 消除冗余：存在冗余数据时,不会丢失信息
- 消除不相关数据
- 系统方法：将所有可能的特征子集作为输入,用事先选定的 数据挖掘算法进行处理,对处理结果进行比较评 估,选取结果最好的那个子集作为特征子集。

# 数据变换的目的是什么？

数据变换的目的是：

- 将数据变换成适合于数据挖掘的形式。
- 从另一个角度或域发现数据更显著的特征。
- 提升数据处理算法的效率和效果。


# 属性变换（变量变换）的常用方法有哪些？

- **归一化**：将数据映射到[0,1]区间，便于比较和加权和满足算法需要。
    
- **中心化**：通过变换，使新数据的均值为0。
    
- **标准化（Z-Score）**：使数据均值为0、标准差为1，消除量纲影响。
    
- **小数定标规范化**：移动小数点位置，将数据映射到[-1,1]或[0,1]区间。
    
- **简单函数变换**：如 $x_k$、$ln⁡x$、$e^x$ 等，改变数据分布特性。


# 为什么要对连续数据进行离散化？

- 数据规约和维规约要求。
- 某些算法要求离散属性数据。
- 可产生概念分层结构，在不同抽象层挖掘。
- 消除奇异值带来的影响。

# 简述主成分分析（PCA）的基本原理和主要缺点。

- **原理**：主成分分析（PCA）是一种无监督的线性降维方法。PCA寻找若干个原始特征的线性组合（称为主成分），使得这些主成分能解释原始数据中绝大部分的信息。

- **缺点**：变换后的主成分含义模糊，难以给出符合实际背景的解释，尤其是当因子负荷符号有正有负时，综合评价函数意义不明确。
---
`第四、五章-关联分析`

# 什么是关联分析？

关联分析是在交易数据中查找存在于项目集合之间的频繁模式、关联、相关性或因果结构，即发现不同商品（项）之间的联系。

包括：

- **简单关联关系**：没有共同属性的事物组合会较大概率同时出现，如面包和牛奶。
- **序列关联关系**：事物出现存在时间上的先后顺序，如买手机后大概率买手机壳。
# 支持度-置信度
## 支持度

包含某项集的事务数占总事务数的比例，衡量项集的频繁程度。

## 置信度

置信度揭示了 $X$ 出现时，$Y$是否一定会出现，如果出现则其大概有多大的可能出现。
$$
c(X \rightarrow Y) = \frac{\sigma(X \cup Y)}{\sigma(X)}
$$
## 此框架有什么局限性？

忽略了规则后件项集的支持度。*例如，高置信度规则{茶}→{咖啡}可能因为咖啡总体出现概率更高而实际表示负相关，导致误导。*

# 关联规则

- 关联规则 (Association Rule) 是形如 $X \rightarrow Y$的蕴含表达式，**其中$X$和$Y$是不相交的项集，即有$X \cap Y = \emptyset$**
- 关联规则的强度可以用它的支持度$s$和置信度$c$来度量
- 支持度确定规则可以用于给定数据集的频繁程度，而置信度确定$Y$在包含$X$ 的事务中出现的频繁程度
# 简述Apriori算法的核心原理。

Apriori算法是一种基于Apriori原理的，最有影响的挖掘单维布尔关联规则频繁项集的算法。
该算法能较大程度上降低算法复杂度。

**核心原理**：
- 如果一个项集是频繁的，则它的所有子集也是频繁的。
- 如果一个项集是非频繁的，则它的所有超集也是非频繁的（可用于剪枝）。

# **简述FP-Growth算法的基本步骤。**

FP 树是一种输入数据的压缩表示,逐个读入事务,并 将其映射到FP 树中的一条路径。

- **构建FP树**：
	- 第一次扫描数据集确定频繁项并按支持度降序排序；
	- 第二次扫描构建FP树，每个事务映射为一条路径。
    
- **提取频繁项集**：自底向上遍历FP树，为每个项构建条件树，递归挖掘频繁项集。


# 简述提升度（Lift）的定义及其含义。

对于事件 X 和 Y,提升度表示含有X的条件下,同时含有Y的概率,与Y发生的概率之比。

$$
\text{Lift}(X \rightarrow Y) = \frac{P(Y|X)}{P(Y)} = \frac{\sup(X \cup Y)}{\sup(X) \cdot \sup(Y)}
$$

- Lift=1：X与Y相互独立。
- Lift>1：正相关，规则有效（通常>3才认为有价值）。
- Lift<1：负相关，规则无效。

缺点：一种比较简单的判断指标受零事务的影响较大。

# 简述杠杆率（Leverage）的定义。

$$
Leverage(X \rightarrow Y) = sup(X \cup Y) - sup(X) \cdot sup(Y)
$$

杠杆率越大，X与Y关系越紧密；等于0时相互独立。

# 简述确信度（Conviction）的定义。

$$
\text{Conviction}(X \rightarrow Y) = \frac{1 - \sup(Y)}{1 - \text{conf}(X \rightarrow Y)}
$$

衡量规则预测错误的概率。值为1时独立，越大越关联。

# 兴趣因子（Interest Factor）的定义。

|           |   $Y$    | $\bar{Y}$ |          |
| :-------: | :------: | :-------: | :------: |
|    $X$    | $f_{11}$ | $f_{10}$  | $f_{1+}$ |
| $\bar{X}$ | $f_{01}$ | $f_{00}$  | $f_{0+}$ |
|           | $f_{+1}$ | $f_{+0}$  |   $N$    |

对于二元变量，兴趣因子与提升度等价：

$$
I(X,Y) = \frac{N f_{11}}{f_{1+} f_{+1}}
$$

$$
I(X,Y) = 
\begin{cases} 
=1, & X与Y相互独立; \\
<1, & X与Y是负相关的; \\
>1, & X与Y是正相关的;
\end{cases}
$$

# 相关分析的定义。

对于二元变量，相关度公式：

$$
\phi = \frac{f_{11}f_{00} - f_{01}f_{10}}{\sqrt{f_{1+}f_{+1}f_{0+}f_{+0}}}
$$

$$
\phi(X, Y)
\begin{cases}
=0, & X\text{与}Y\text{相互独立；} \\
\geq0, & X\text{与}Y\text{正相关，}=1\text{则完全正相关；} \\
\leq0, & X\text{与}Y\text{负相关，}=-1\text{则完全负相关；}
\end{cases}
$$

- 适合于分析对称的二元变量
- 当样本大小成比例变化时,它不能够保持不变。


# IS度量的定义。

IS是另一种度量，用于处理非对称二元变量。该度量定义如下：

$$
IS(X,Y) = \sqrt{I(X,Y) \cdot s(X,Y)} = \frac{s(X,Y)}{\sqrt{s(X)s(Y)}} \tag{1}= \frac{p(XY)}{\sqrt{p(X)p(Y)}} = = \frac{N(X,Y)}{\sqrt{N(X) \cdot N(Y)}}
$$

---
`第六章-分类预测`

# 什么是分类？常用的分类方法有哪些？

在给定**数据基础**上构建分类**函数或模型**，该**函数或模型**能够把数据归类为给定的某⼀种类别，**这就是分类的概念**。 
**数据分类过程主要包括两个步骤，即学习和分类。**

常用方法包括：决策树、贝叶斯分类、人工神经网络、随机森林、规则归纳、近邻学习、基于关联规则的分类等。

# 什么是决策树？决策树分类的基本步骤有哪些？

决策树是一种**分层**的决策结构。其基本思想是通过对特征向量进行分层判决，从**根结点**开始，根据特征的取值沿着树的分支逐步向下，最终到达叶结点得到预测结果。

分类步骤：
- **建立模型**：用训练数据生成决策树。
- **测试评估**：用测试数据评估模型准确率，必要时剪枝修正。
- **使用模型**：对未知样本进行分类。

# 什么是信息增益？它有什么缺点？

信息增益定义为：选择特征A后，**数据集不纯性**下降的量，即

$$G(D,A)=H(D)−H(D∣A)$$

其中 $H(D)$ 是数据集的**经验熵**，$H(D∣A)$ 是给定特征 A 后的条件熵。算法计算每个特征的信息增益，选择增益最大的特征作为当前结点的分裂特征。

**缺点**：信息增益倾向于选择**取值数目多**的特征。

# 信息增益率

信息增益倾向于选择取值多的属性，产生归纳偏置。信息增益率用分裂信息对信息增益进行修正：

信息增益率 = 信息增益 / 特征自身的熵（分裂信息）

采用信息增益率可减弱不同类别的样本数量对不纯性度量的影响。

# 如何对连续属性进行划分？

- 将属性值排序。
- 取相邻值的中点作为候选划分点。
- 计算每个候选划分点下的不纯度（如Gini），选择最优划分点。
- 可优化：只考虑属性值或类别发生变化的边界点，减少计算量。

# 简述准确率 (Accuracy)、精确率 (Precision)、召回率 (Recall) 的定义。

|     |          | 预测分类           |                | 合计                  |
| --- | -------- | -------------- | -------------- | ------------------- |
|     |          | Positive       | Negative       |                     |
| 真分类 | Positive | $f_{++}$<br>TP | $f_{+-}$<br>FN | 真正<br>TP+FN         |
|     | Negative | $f_{-+}$<br>FP | $f_{--}$<br>TN | 真负<br>FP+TN         |
| 合计  |          | 预测正<br>TP+FP   | 预测负<br>FN+TN   | 样本总数<br>TP+FP+TN+FN |
- 准确率: $\displaystyle \frac{TP + TN}{TP + FP + TN + FN}$，正确分类的比例。
- 精确率: $\displaystyle \frac{TP}{TP + FP}$，预测为正类中实际为正类的比例。
- 召回率: $\displaystyle \frac{TP}{TP + FN}$，实际正类中被正确预测的比例（同灵敏度、真阳性率）。

# 什么是ROC曲线？AUC值有什么意义？

ROC曲线（受试者工作特征曲线）以**真正率**为纵轴，以**假正率**为横轴，通过改变**分类阈值**绘制出的曲线。

- 真正例率：$TPR = \frac{TP}{TP + FN}$
- 假正例率：$FPR = \frac{FP}{TN + FP}$

AUC是ROC曲线下的面积，取值范围在 $0.5$ 到 $1$ 之间。AUC越接近 $1$，分类器性能越好；$AUC = 0.5$ 表示分类器相当于随机猜测。AUC可以综合评价分类器在不同阈值下的表现，且不受样本不平衡的影响。

# 简述F1值的计算公式及其作用。

F1是精确率和召回率的调和平均数:
$$
F1 = 2 \times \frac{Precision \times Recall}{Precision + Recall}
$$

当Precision和Recall出现矛盾时，F1可综合评估模型性能。

---
`第七章-聚类分析`

# 什么是聚类？聚类与分类有何区别？

聚类是将物理或抽象对象集合划分为由相似对象组成的多个簇的过程。  

区别：
- 分类是有监督学习，训练数据有类标记，目标是预测新样本类别；
- 聚类是无监督学习，训练数据无类标记，通过相似性自动分组。

# 常见的簇类型有常见的簇类型有哪些？

- **明显分离的簇**：任一点到同簇距离小于到不同簇距离。
- **基于原型的簇**：点到簇质心或中心点距离更近。
- **基于图的簇**：对象为节点，边表示联系，簇为连通分支。
- **基于密度的簇**：对象稠密区域被低密度区域环绕。

# 什么是误差平方和（SSE）？在聚类中起什么作用？

$$SSE = \sum_{i=1}^{k} \sum_{x \in C_i} dist(c_i, x)^2$$

SSE衡量聚类质量，值越小表示簇内点越紧密，质心代表性越好。当距离为欧氏距离时，使SSE最小的质心是均值。
# 简述K-Means算法的基本步骤。

1. 选择k个初始质心。
2. 将每个点指派到最近的质心，形成k个簇。
3. 重新计算每个簇的质心（均值）。
4. 重复2-3步直到质心不再变化或达到迭代上限。

# K-Means算法有哪些优缺点？

- **优点**：算法简单，易于理解，对大数据集相对高效。

- **缺点**：
	- 对k值敏感
	- 对初始质心敏感
	- 对离群点和噪声敏感
	- 不能处理非球形簇、不同尺寸和不同密度的簇
	- 计算开销大。

# 层次聚类的定义？

即按照一定的规则，对给定的数据集进行分层次的聚集或分解，直到满足某种事先设定的条件。

按数据分层建立簇，形成一棵以簇为节点的树，称为聚类图

包括：
- **凝聚的（自底向上）**：每个对象初始为一个簇，然后反复合并最近的两个簇，直到满足终止条件。
- **分裂的（自顶向下）**：所有对象初始为一个簇，然后反复分裂成更小的簇，直到满足终止条件。

# 层次聚类中，簇间相似性的常见度量方法有哪些？

- **单链（MIN）**：两个簇最近点间的距离，对噪声敏感。
- **全链（MAX）**：两个簇最远点间的距离，偏好球形簇。
- **组平均**：不同簇所有点对距离的平均值，单链与全链的折中。
- **质心距**：两个簇质心间的距离。
- **Ward法**：合并两个簇导致的SSE增量，偏好球形簇。

# 层次聚类的优缺点是什么？

- **优点**：可产生层次结构（如系统发生树），能产生较高质量聚类。
- **缺点**：计算量和存储量大（需计算邻近度矩阵），对噪声和高维数据敏感。


# DBSCAN算法的定义和步骤

将具有足够密度的区域划分为簇，并在具有噪声点的空间数据中发现任意形状的簇

**基本步骤**：
1. 标记所有点为核心点、边界点或噪声点。
2. 删除噪声点。
3. 在距离Eps内的核心点之间连边，形成连通分量，每个连通分量为一个簇。
4. 将每个边界点指派到与之关联的核心点的簇中。


# 简述DBSCAN算法中的核心点、边界点、噪声点的定义。

- **核心点**：给定半径Eps内包含的点数不少于MinPts（包括自身）。
- **边界点**：落在某核心点的Eps邻域内，但自身邻域内点数少于MinPts。
- **噪声点**：既不是核心点也不是边界点。
# DBSCAN算法有哪些优缺点？

- **优点**：
	- 能发现任意形状的簇（非球形）
	- 对噪声不敏感，能自动识别噪声点
	- 不需要预先指定簇的个数。
- **缺点**：
	- 对密度变化大的数据效果差
	- 高维数据中密度定义困难
	- 时间复杂度较高（最坏O(n²)）。