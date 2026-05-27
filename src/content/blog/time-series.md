---
title: 时间序列-简答
description: 时间序列简答题汇总
pubDate: 2026-05-23T10:30
image: https://origin.picgo.net/2026/05/23/E_gYQTRWQA0kIXPf97d8591a0abd2cf.jpg
draft: false
tags:
  - 时间序列
categories:
  - 期末复习
badge: ''
---
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>红色窟窿 · 深邃内影 | 01序列血雨</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        canvas {
            display: block;
            width: 100%;
            height: auto;
            background: transparent;
            box-shadow: none;
        }
    </style>
</head>
<body>
    <canvas id="redVoidCanvas" width="800" height="600" style="width:100%; height:auto; aspect-ratio:800/600; background: transparent;"></canvas>
    <script>
        (function() {
            const canvas = document.getElementById('redVoidCanvas');
            let ctx = canvas.getContext('2d');
            // 窟窿几何参数 (横向拉长: 长 > 宽)
            let width, height;
            let centerX, centerY;
            let baseRadiusX = 230;    // 横向半径（长）
            let baseRadiusY = 155;    // 纵向半径（短）
            let noiseAmp = 28;
            const VERTEX_COUNT = 44;   // 边缘细节
            // 粒子系统（移动端优化）
            let PARTICLE_COUNT = 85;
            const SPEED_MIN = 100;
            const SPEED_MAX = 190;
            const FONT_MIN = 14;
            const FONT_MAX = 22;
            if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                PARTICLE_COUNT = 65;
            }
            let currentPolygonPoints = [];
            let particles = [];
            let globalTime = 0;
            let lastFrame = 0;
            let animationId = null;
            function randomRange(min, max) {
                return min + Math.random() * (max - min);
            }
            // 生成横向拉长的不规则多边形（椭圆基底 + 扰动）
            function generateEllipseHole(cx, cy, radX, radY, timeSeed, pointsCount = VERTEX_COUNT) {
                const points = [];
                const step = (Math.PI * 2) / pointsCount;
                const t = timeSeed * 0.0022;
                for (let i = 0; i < pointsCount; i++) {
                    const angle = i * step;
                    let rFactor = 1.0;
                    rFactor += Math.sin(angle * 4.3 + t) * 0.13;
                    rFactor += Math.sin(angle * 9.7 + t * 1.4) * 0.09;
                    rFactor += Math.cos(angle * 2.5 - t * 0.9) * 0.1;
                    rFactor += Math.sin(angle * 12 + t * 2.2) * 0.06;
                    rFactor += Math.cos(angle * 1.8 + t * 0.7) * 0.07;
                    const cosA = Math.cos(angle);
                    const sinA = Math.sin(angle);
                    const invR2 = (cosA * cosA) / (radX * radX) + (sinA * sinA) / (radY * radY);
                    let ellipseR = 1 / Math.sqrt(invR2);
                    let finalR = ellipseR * rFactor;
                    const dynamicNoise = noiseAmp * (0.7 + Math.sin(t * 0.6) * 0.25);
                    finalR += Math.sin(angle * 7 + t * 1.2) * dynamicNoise * 0.5;
                    finalR += Math.cos(angle * 13 - t) * (dynamicNoise * 0.4);
                    finalR = Math.max(ellipseR * 0.68, Math.min(ellipseR * 1.28, finalR));
                    const px = cx + finalR * cosA;
                    const py = cy + finalR * sinA;
                    points.push({ x: px, y: py });
                }
                return points;
            }
            function polygonToPath(points) {
                if (!points || points.length < 3) return null;
                const path = new Path2D();
                path.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) path.lineTo(points[i].x, points[i].y);
                path.closePath();
                return path;
            }
            function isPointInPolygon(px, py, points) {
                if (!points || points.length < 3) return false;
                let inside = false;
                for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
                    const xi = points[i].x, yi = points[i].y;
                    const xj = points[j].x, yj = points[j].y;
                    const intersect = ((yi > py) != (yj > py)) &&
                        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
                    if (intersect) inside = !inside;
                }
                return inside;
            }
            function getPolygonBBox(points) {
                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                for (let p of points) {
                    minX = Math.min(minX, p.x);
                    maxX = Math.max(maxX, p.x);
                    minY = Math.min(minY, p.y);
                    maxY = Math.max(maxY, p.y);
                }
                return { minX, maxX, minY, maxY };
            }
            function randomPointInPolygonUniform(points) {
                if (!points || points.length === 0) return { x: centerX, y: centerY };
                const bbox = getPolygonBBox(points);
                for (let attempt = 0; attempt < 70; attempt++) {
                    const randX = randomRange(bbox.minX, bbox.maxX);
                    const randY = randomRange(bbox.minY, bbox.maxY);
                    if (isPointInPolygon(randX, randY, points)) return { x: randX, y: randY };
                }
                return { x: points[0].x, y: points[0].y };
            }
            function randomTopPointInPolygon(points) {
                if (!points || points.length === 0) return { x: centerX, y: centerY };
                const bbox = getPolygonBBox(points);
                const topBound = bbox.minY;
                const midY = bbox.minY + (bbox.maxY - bbox.minY) * 0.45;
                for (let attempt = 0; attempt < 50; attempt++) {
                    const randX = randomRange(bbox.minX, bbox.maxX);
                    const randY = randomRange(topBound, midY);
                    if (isPointInPolygon(randX, randY, points)) return { x: randX, y: randY };
                }
                return randomPointInPolygonUniform(points);
            }
            // 粒子：01字符 + 垂直序列残影
            class RedRainParticle {
                constructor(x, y, speed, char, fontSize) {
                    this.x = x;
                    this.y = y;
                    this.speed = speed;
                    this.char = char;
                    this.fontSize = fontSize;
                    this.opacity = randomRange(0.8, 1.0);
                    this.driftX = randomRange(-0.15, 0.15);
                }
                update(deltaSeconds) {
                    this.y += this.speed * deltaSeconds;
                    this.x += this.driftX * 0.45 * deltaSeconds;
                }
                draw(ctx) {
                    ctx.save();
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    const speedFactor = Math.min(1.0, (this.speed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN));
                    let ghostCount = Math.floor(3 + speedFactor * 4);
                    ghostCount = Math.min(ghostCount, 6);
                    const stepY = 5 + speedFactor * 7;
                    // 向上残影序列（历史轨迹）
                    for (let i = 1; i <= ghostCount; i++) {
                        const ghostY = this.y - i * stepY;
                        if (ghostY < -40) continue;
                        const ghostOpacity = this.opacity * (1 - i / (ghostCount + 1)) * 0.55;
                        const ghostSize = this.fontSize * (1 - i * 0.09);
                        if (ghostSize < 8) continue;
                        ctx.shadowBlur = i === 1 ? 7 : 3;
                        ctx.shadowColor = "#ff2060";
                        ctx.fillStyle = `rgba(255, 55, 95, ${ghostOpacity})`;
                        ctx.font = `${Math.floor(ghostSize)}px "Courier New", monospace`;
                        ctx.fillText(this.char, this.x, ghostY);
                        ctx.fillStyle = `rgba(255, 85, 125, ${ghostOpacity * 0.4})`;
                        ctx.fillText(this.char, this.x, ghostY - 1.5);
                    }
                    // 主字符
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = "#ff3060";
                    ctx.fillStyle = `rgba(255, 45, 85, ${this.opacity})`;
                    ctx.font = `${this.fontSize}px "Courier New", monospace`;
                    ctx.fillText(this.char, this.x, this.y);
                    // 主字符下方微残影
                    ctx.shadowBlur = 5;
                    ctx.fillStyle = `rgba(255, 35, 75, 0.28)`;
                    ctx.fillText(this.char, this.x, this.y + 2.5);
                    ctx.restore();
                }
            }
            function initParticles(polygonPoints) {
                const newParticles = [];
                for (let i = 0; i < PARTICLE_COUNT; i++) {
                    const pos = randomPointInPolygonUniform(polygonPoints);
                    const speed = randomRange(SPEED_MIN, SPEED_MAX);
                    const charVal = Math.random() > 0.5 ? '0' : '1';
                    const fontSizeVal = Math.floor(randomRange(FONT_MIN, FONT_MAX));
                    newParticles.push(new RedRainParticle(pos.x, pos.y, speed, charVal, fontSizeVal));
                }
                return newParticles;
            }
            function resetOutOfBoundsParticles(particlesArr, polygonPoints, canvasH, canvasW) {
                if (!polygonPoints || polygonPoints.length === 0) return;
                for (let i = 0; i < particlesArr.length; i++) {
                    const p = particlesArr[i];
                    let needReset = false;
                    if (p.y > canvasH + 70 || p.y < -70) needReset = true;
                    else if (p.x < -90 || p.x > canvasW + 90) needReset = true;
                    else if (!isPointInPolygon(p.x, p.y, polygonPoints)) needReset = true;
                    if (needReset) {
                        const newPos = randomTopPointInPolygon(polygonPoints);
                        p.x = newPos.x;
                        p.y = newPos.y;
                        p.speed = randomRange(SPEED_MIN, SPEED_MAX);
                        p.char = Math.random() > 0.5 ? '0' : '1';
                        p.fontSize = Math.floor(randomRange(FONT_MIN, FONT_MAX));
                        p.opacity = randomRange(0.8, 1.0);
                        p.driftX = randomRange(-0.15, 0.15);
                    }
                }
            }
            function updateParticles(particlesArr, deltaSeconds) {
                const safeDelta = Math.min(deltaSeconds, 0.033);
                for (let p of particlesArr) p.update(safeDelta);
            }
            // ========== 关键修改：增强内阴影、凹陷感，不再是纯黑 ==========
            function renderVoidInside(ctx, particlesArr, polygonPoints, w, h) {
                if (!polygonPoints.length) return;
                ctx.save();
                const clipPath = polygonToPath(polygonPoints);
                if (!clipPath) { ctx.restore(); return; }
                ctx.clip(clipPath, 'evenodd');
                // 1. 基础底色：深红黑渐变（中心稍亮，边缘极暗，模拟凹陷）
                const grad = ctx.createRadialGradient(centerX, centerY, 15, centerX, centerY, Math.max(baseRadiusX, baseRadiusY) * 0.9);
                grad.addColorStop(0, '#2a050b');      // 中心微红黑
                grad.addColorStop(0.5, '#0a0002');
                grad.addColorStop(1, '#000000');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, w, h);
                // 2. 内阴影层：沿着多边形内侧多层描边，制造厚度感
                ctx.save();
                ctx.shadowBlur = 0;
                // 第一层：宽而黑的暗影 (向内晕染)
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
                    for (let j = 1; j < polygonPoints.length; j++) ctx.lineTo(polygonPoints[j].x, polygonPoints[j].y);
                    ctx.closePath();
                    const lineWidth = 14 - i * 3;
                    const alpha = 0.65 - i * 0.12;
                    ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
                    ctx.lineWidth = lineWidth;
                    ctx.stroke();
                }
                // 第二层：暗红色内边缘 (像烧焦的裂痕)
                ctx.beginPath();
                ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
                for (let j = 1; j < polygonPoints.length; j++) ctx.lineTo(polygonPoints[j].x, polygonPoints[j].y);
                ctx.closePath();
                ctx.strokeStyle = `rgba(80, 15, 25, 0.8)`;
                ctx.lineWidth = 8;
                ctx.stroke();
                ctx.strokeStyle = `rgba(140, 25, 45, 0.55)`;
                ctx.lineWidth = 4;
                ctx.stroke();
                // 3. 增加向内延伸的暗色辐射渐变（模拟凹陷的纵深）
                const innerShadowGrad = ctx.createLinearGradient(centerX - baseRadiusX * 0.6, centerY, centerX + baseRadiusX * 0.6, centerY);
                innerShadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
                innerShadowGrad.addColorStop(0.4, 'rgba(0,0,0,0.3)');
                innerShadowGrad.addColorStop(0.8, 'rgba(40,5,10,0.6)');
                innerShadowGrad.addColorStop(1, 'rgba(0,0,0,0.9)');
                ctx.fillStyle = innerShadowGrad;
                ctx.fillRect(0, 0, w, h);
                // 4. 边缘高光（微弱的红光，模拟破碎边缘的反光）
                ctx.beginPath();
                ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
                for (let j = 1; j < polygonPoints.length; j++) ctx.lineTo(polygonPoints[j].x, polygonPoints[j].y);
                ctx.closePath();
                ctx.strokeStyle = `rgba(255, 60, 100, 0.35)`;
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.restore();
                // 稀疏红色噪点 (性能优化)
                ctx.fillStyle = "rgba(255, 45, 80, 0.045)";
                for (let i = 0; i < 35; i++) {
                    if (Math.random() > 0.97) ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1);
                }
                // 绘制01粒子
                for (let p of particlesArr) p.draw(ctx);
                ctx.restore();
            }
            // 外边缘红光 + 放射性裂纹 (由近及远透明)
            function drawRedEdgeAndCracks(ctx, points, time) {
                if (!points || points.length < 3) return;
                ctx.save();
                // 外轮廓红光
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
                ctx.closePath();
                ctx.strokeStyle = `rgba(255, 55, 100, 1)`;
                ctx.lineWidth = 2.8;
                ctx.shadowBlur = 14;
                ctx.shadowColor = "#ff3060";
                ctx.stroke();
                ctx.strokeStyle = `rgba(255, 115, 145, 0.85)`;
                ctx.lineWidth = 1.7;
                ctx.shadowBlur = 7;
                ctx.stroke();
                // 裂纹
                ctx.shadowBlur = 0;
                const crackCount = 58;
                const now = time * 0.002;
                for (let i = 0; i < crackCount; i++) {
                    const idx = Math.floor(Math.random() * points.length);
                    const start = points[idx];
                    if (!start) continue;
                    const dx = start.x - centerX;
                    const dy = start.y - centerY;
                    const len = Math.hypot(dx, dy);
                    if (len < 0.1) continue;
                    const dirX = dx / len;
                    const dirY = dy / len;
                    const angleOffset = (Math.sin(now * 1.3 + idx) * 0.9 + Math.cos(now * 0.7 + idx * 1.2) * 0.7) * 1.1;
                    const randAngle = angleOffset + (Math.sin(i * 0.7) * 0.5);
                    const rotDirX = dirX * Math.cos(randAngle) - dirY * Math.sin(randAngle);
                    const rotDirY = dirX * Math.sin(randAngle) + dirY * Math.cos(randAngle);
                    let crackLen = randomRange(14, 52);
                    crackLen += Math.sin(now * 2.5 + idx) * 6;
                    crackLen = Math.max(12, crackLen);
                    const segments = 3;
                    for (let seg = 1; seg <= segments; seg++) {
                        const tSeg = seg / segments;
                        const endX = start.x + rotDirX * crackLen * tSeg;
                        const endY = start.y + rotDirY * crackLen * tSeg;
                        const alpha = (1 - tSeg * 0.85) * 0.9;
                        ctx.beginPath();
                        ctx.moveTo(start.x + rotDirX * crackLen * (seg-1)/segments, 
                                    start.y + rotDirY * crackLen * (seg-1)/segments);
                        ctx.lineTo(endX, endY);
                        ctx.strokeStyle = `rgba(255, 65, 110, ${alpha * 0.85})`;
                        ctx.lineWidth = 1.2 + (1 - tSeg) * 1.3;
                        ctx.stroke();
                    }
                    if (Math.random() > 0.65) {
                        const subLen = crackLen * 0.5;
                        const subAngle = randAngle + (Math.random() - 0.5) * 1.2;
                        const subDirX = dirX * Math.cos(subAngle) - dirY * Math.sin(subAngle);
                        const subDirY = dirX * Math.sin(subAngle) + dirY * Math.cos(subAngle);
                        ctx.beginPath();
                        ctx.moveTo(start.x + rotDirX * crackLen * 0.3, start.y + rotDirY * crackLen * 0.3);
                        ctx.lineTo(start.x + subDirX * subLen, start.y + subDirY * subLen);
                        ctx.strokeStyle = `rgba(255, 85, 125, 0.55)`;
                        ctx.lineWidth = 0.9;
                        ctx.stroke();
                    }
                }
                // 向内短裂纹
                for (let i = 0; i < points.length; i++) {
                    const p = points[i];
                    const next = points[(i+1) % points.length];
                    const midX = (p.x + next.x) / 2;
                    const midY = (p.y + next.y) / 2;
                    const inwardX = midX - centerX;
                    const inwardY = midY - centerY;
                    const inwardLen = Math.hypot(inwardX, inwardY);
                    if (inwardLen < 1) continue;
                    const normInX = inwardX / inwardLen;
                    const normInY = inwardY / inwardLen;
                    const inLen = randomRange(10, 24);
                    ctx.beginPath();
                    ctx.moveTo(midX, midY);
                    ctx.lineTo(midX - normInX * inLen * 0.6, midY - normInY * inLen * 0.6);
                    ctx.strokeStyle = `rgba(255, 70, 115, 0.75)`;
                    ctx.lineWidth = 1.1;
                    ctx.stroke();
                }
                ctx.restore();
            }
            // 自适应尺寸，保持横向拉长
            function resizeAndSetup() {
                const rect = canvas.getBoundingClientRect();
                width = rect.width;
                height = rect.height;
                canvas.width = width;
                canvas.height = height;
                centerX = width / 2;
                centerY = height / 2;
                const minSide = Math.min(width, height);
                baseRadiusX = Math.min(minSide * 0.55, 280);
                baseRadiusY = Math.min(minSide * 0.38, 180);
                if (baseRadiusX < baseRadiusY) {
                    [baseRadiusX, baseRadiusY] = [baseRadiusY, baseRadiusX];
                }
                noiseAmp = Math.min(32, baseRadiusX * 0.18);
                const initPoly = generateEllipseHole(centerX, centerY, baseRadiusX, baseRadiusY, 0, VERTEX_COUNT);
                currentPolygonPoints = initPoly;
                particles = initParticles(currentPolygonPoints);
            }
            function animate(nowMs) {
                if (!ctx) return;
                let deltaTimeSec = 0.016;
                if (lastFrame !== 0) deltaTimeSec = Math.min(0.033, (nowMs - lastFrame) / 1000);
                if (deltaTimeSec <= 0) deltaTimeSec = 0.016;
                lastFrame = nowMs;
                globalTime = nowMs;
                const shapeTime = globalTime * 0.0022;
                currentPolygonPoints = generateEllipseHole(centerX, centerY, baseRadiusX, baseRadiusY, shapeTime, VERTEX_COUNT);
                updateParticles(particles, deltaTimeSec);
                resetOutOfBoundsParticles(particles, currentPolygonPoints, height, width);
                ctx.clearRect(0, 0, width, height);
                renderVoidInside(ctx, particles, currentPolygonPoints, width, height);
                drawRedEdgeAndCracks(ctx, currentPolygonPoints, globalTime);
                animationId = requestAnimationFrame(animate);
            }
            window.addEventListener('resize', () => {
                resizeAndSetup();
            });
            function start() {
                resizeAndSetup();
                lastFrame = performance.now();
                animationId = requestAnimationFrame(animate);
            }
            start();
        })();
    </script>
</body>
</html>


# 第一章 时间序列分析概述

## 什么是时间序列？

时间序列是在**连续或等间隔**的时间点上获得的一组观测数据。
## 频域分析方法和时域分析方法的区别。

- **频域分析方法（Spectral Analysis）**：频域分析方法关注时间序列中不同**频率成分**的相对重要性。其理论基础是傅里叶分析。

- **时域分析方法（Time-Domain Analysis）**：时域分析方法主要是从序列**自相关**的角度揭示时间序列的发展规律。从统计性质随时间是否保持不变的角度，可以划分为**平稳时间**序列和**非平稳时间**序列。

## 时间序列分析的目标。 

- **描述历史行为**：刻画序列随时间演化的特征与变化规律。
- **理解生成机制**：分析时间序列变化背后的内在机理及影响因素。
- **预测与决策支持**：对未来走势进行预测，为政策与管理决策提供依据。
- **监测与评估**：检验政策或干预措施是否产生预期效果。

---
# 第二章 平稳时间序列简介

## 严平稳和弱平稳的定义及区别。

- **严平稳（Strictly Stationary）**：所有统计性质均不随时间的推移而改变的时间序列。

- **弱平稳（Weakly Stationary）**：又称宽平稳。要求序列满足：
	- ①均值为常数；
	- ②方差存在且为常数；
	- ③任意两项之间的自协方差仅与**时间间隔** $k$ 相关，而与所处的时间 $t$ 无关 。

- **区别**：严平稳能推出弱平稳，而弱平稳不能反推严平稳。严平稳条件极苛刻，研究难度大；弱平稳条件相对宽松。在实际应用中，通常所说的平稳性是指弱平稳 。

## 自协方差函数和自相关函数的定义。

- **自协方差函数（Autocovariance Function, ACVF）**：定义为 $\gamma_k = E[(X_t - \mu)(X_{t-k} - \mu)]$，描述了序列在滞后 $k$ 阶下的相关强度 。

- **自相关函数（Autocorrelation Function, ACF）**：定义为滞后 $k$ 阶的自协方差与方差的比值，即 $\rho_k = \frac{\gamma_k}{\gamma_0}$ 。

## 平稳时间序列的统计性质。

- **常数均值**：$E(X_t) = \mu$。

- **常数方差**：$Var(X_t) = \gamma_0$。

- **自协方差与自相关系数只依赖于滞后阶数 $k$**：$\gamma(t, t-k) = \gamma_k$，$\rho(t, t-k) = \rho_k$ 。

## 平稳时间序列的意义。 

其统计特性不随时间变化，从而可以利用同一序列不同时间的观测值，对总体的未知参数进行估计。

## 在平稳性检验中，时序图检验和自相关图检验的基本原理是什么？

- **时序图检验**：平稳时间序列具有常数均值和常数方差，因此其时序图通常表现为围绕某一固定水平上下波动，且波动幅度相对稳定。

- **自相关图检验**：平稳时间序列通常只具有短期相关性，即其自相关函数会随着滞后阶数的增加而较快地衰减至零。

## 白噪声序列的定义。

若时间序列 $\{ \varepsilon_t, t \in T \}$ 满足  

(1) $\quad E(\varepsilon_t) = 0, \quad \forall t \in T$,

(2) $\quad \gamma(t, s) = \begin{cases} \sigma^2, & t =s, \\ 0, & t \neq s, \end{cases} \quad \forall t, s \in T,$

则称 $\{ \varepsilon_t \}$ 为白噪声序列，记作 $\varepsilon_t \sim \text{WN}(0, \sigma^2)$。

## 白噪声序列的意义。 

在时间序列建模中，白噪声通常作为误差项的理想形式出现。

（1）从模型设定的角度看，如果误差项不是白噪声，则表明模型尚未充分刻画观测数据中的规律，误差项中仍可能包含尚未被模型解释的信息。

（2）从统计推断角度看，白噪声性质为基于观测数据的估计与检验奠定了重要基础。具体而言，误差项的白噪声特性是参数估计具有一致性和渐近正态性的关键条件。

## 白噪声检验的基本原理。

其基本原理是：如果序列是纯随机的，那么其所有的自相关系数 $\rho_k$（除 $\rho_0$ 外）都应接近于 0。通过卡方分布的统计量 Q，检验在给定的显著性水平下，序列前 $m$ 阶自相关系数是否显著不为 0 。Q越大越拒绝原假设。

## 在白噪声检验中，如何选取滞后阶数 m？ 

**覆盖可能的相关结构**：
多数平稳序列的自相关主要集中在低阶滞后，因此m应至少覆盖短期自相关，以保证对潜在自相关结构的检验能力。

**避免高阶噪声干扰**：
当m过大时，高阶滞后自相关往往由噪声主导，可能掩盖低阶显著相关性，从而降低对短期相关性的检验效果。

**逐步检验与综合判断**：
在实际操作中，可从小到大选择多个m值（如5,10，15，...），综合判断序列是否为白噪声。

---
# 第三章 平稳时间序列模型

## AR 模型的定义
自回归模型（Autoregressive model）记作 $AR(p)$，其形式为：
$$
X_t = \phi_0 + \phi_1 X_{t-1} + \phi_2 X_{t-2} + \cdots + \phi_p X_{t-p} + \varepsilon_t, \quad \phi_p \neq 0
$$
其中 $\{\varepsilon_t\}$ 为白噪声序列。若 $\{X_t\}$ 平稳且均值为 $\mu$，则可中心化为：
$$
Y_t = \phi_1 Y_{t-1} + \phi_2 Y_{t-2} + \cdots + \phi_p Y_{t-p} + \varepsilon_t
$$
其中 $Y_t = X_t - \mu$。

## 延迟算子的性质

延迟算子 $B$ 满足：
- $B X_t = X_{t-1}$
- $B^2 X_t = X_{t-2}$
- 一般地，$B^k X_t = X_{t-k}$
- 差分运算：
  - 一阶差分：$\nabla X_t = (1 - B) X_t$
  - $p$ 阶差分：$\nabla^p X_t = (1 - B)^p X_t$
  - $k$ 步差分：$\nabla_k X_t = (1 - B^k) X_t$
- 若 $|a| < 1$ 且 $\{X_t\}$ 平稳，则 $\frac{1}{1 - aB} X_t = \sum_{j=0}^{\infty} a^j X_{t-j}$

## 如何判别 AR 模型的平稳性？

- **原则**：若 $AR(p)$ 模型特征方程 $\lambda^p - \phi_1 \lambda^{p-1} - \cdots - \phi_p = 0$ 的根均在单位圆内（即 $|\lambda_j| < 1$），则模型平稳。等价地，特征多项式 $\phi(z) = 1 - \phi_1 z - \cdots - \phi_p z^p$ 的根均在单位圆外。

- **低阶判别**：
  - $AR(1)$：$|\phi_1| < 1$
  - $AR(2)$：$\phi_2 \pm \phi_1 < 1$ 且 $|\phi_2| < 1$

## MA 模型的定义

移动平均模型（Moving average model）记作 $MA(q)$，其形式为：
$$
X_t = \mu + \varepsilon_t - \theta_1 \varepsilon_{t-1} - \theta_2 \varepsilon_{t-2} - \cdots - \theta_q \varepsilon_{t-q}, \quad \theta_q \neq 0
$$
其中 $\{\varepsilon_t\}$ 为白噪声。中心化后（$\mu=0$）可写成：
$$
X_t = \theta(B) \varepsilon_t, \quad \theta(B) = 1 - \theta_1 B - \theta_2 B^2 - \cdots - \theta_q B^q
$$

## MA 模型可逆性的定义

若一个 $MA$ 模型能够表示为 $AR(\infty)$ 形式，则称该模型为可逆 $MA$ 模型。即：
$$
MA(q): X_t = \theta(B) \varepsilon_t \quad \Rightarrow \quad AR(\infty): \frac{1}{\theta(B)} X_t = \varepsilon_t
$$
可逆性保证了模型参数可由自相关函数唯一确定。

## 如何判别 MA 模型的可逆性？

可逆性条件与 $AR$ 模型的平稳性条件对称：
- **特征根判别**：移动平均特征方程 $\lambda^q - \theta_1 \lambda^{q-1} - \cdots - \theta_q = 0$ 的根均在单位圆内（或特征多项式 $\theta(z)=0$ 的根在单位圆外）。
- **低阶可逆域**：
  - $MA(1)$：$|\theta_1| < 1$
  - $MA(2)$：$|\theta_2| < 1$ 且 $\theta_2 \pm \theta_1 < 1$

## ARMA 模型的定义

自回归移动平均模型（Autoregressive moving average model）记作 $ARMA(p,q)$，其形式为：
$$
X_t = \phi_0 + \phi_1 X_{t-1} + \cdots + \phi_p X_{t-p} + \varepsilon_t - \theta_1 \varepsilon_{t-1} - \cdots - \theta_q \varepsilon_{t-q}, \quad \phi_p \neq 0,\; \theta_q \neq 0
$$
中心化后（$\phi_0=0$）可写成：
$$
\phi(B) X_t = \theta(B) \varepsilon_t
$$
其中 $\phi(B)=1-\phi_1 B-\cdots-\phi_p B^p$，$\theta(B)=1-\theta_1 B-\cdots-\theta_q B^q$。

## 如何判别 ARMA 模型的平稳性和可逆性？

- **平稳性**：仅由自回归部分决定，即 $\phi(B)=0$ 的根均在单位圆外（或特征方程根在单位圆内）。
- **可逆性**：仅由移动平均部分决定，即 $\theta(B)=0$ 的根均在单位圆外（或特征方程根在单位圆内）。

## AR 模型、MA 模型和 ARMA 模型的 ACF 和 PACF 性质

| 模型类型 | 自相关函数（ACF） | 偏自相关函数（PACF） |
|----------|------------------|----------------------|
| $AR(p)$    | 拖尾（指数衰减） | $p$ 阶截尾            |
| $MA(q)$    | $q$ 阶截尾         | 拖尾                |
| $ARMA(p,q)$| 拖尾             | 拖尾                |

- **拖尾**：以指数阶收敛到 $0$，具有短期相关性。
- **截尾**：超过某阶后恒为 $0$。

---

# 第四章 平稳时间序列分析

## Box-Jenkins 法的建模步骤

根据Box-Jenkins方法，建模分为以下三步：
1. **模型识别**：通过平稳性检验（时序图、自相关图、单位根检验）判断序列是否平稳；利用ACF、PACF、AIC、BIC等选择模型阶数。
2. **参数估计**：利用样本数据估计模型参数，常用方法包括矩估计、最小二乘估计、极大似然估计。
3. **诊断性检验**：对残差进行白噪声检验、正态性检验，必要时通过过度拟合检验模型充分性。
4. **预测**：利用通过检验的模型进行预测分析。预测标准：均方误差最小

## 单位根检验的理论基础

单位根检验的理论基础是：在ARMA$(p,q)$模型中，序列平稳的条件是自回归特征方程的根均在单位圆内（等价地，自回归特征多项式的根均在单位圆外）。若存在单位根（即特征根为1），则序列非平稳。DF检验和ADF检验通过检验自回归系数是否等于1来判断是否存在单位根。

## ADF 检验的过程

ADF检验基于以下三种回归模型：
- 模型1（无漂移项）：$\nabla X_t = \rho X_{t-1} - \beta_1 \nabla X_{t-1} - \cdots - \beta_{p-1} \nabla X_{t-p+1} + \varepsilon_t$
- 模型2（带漂移项）：$\nabla X_t = \alpha + \rho X_{t-1} - \beta_1 \nabla X_{t-1} - \cdots - \beta_{p-1} \nabla X_{t-p+1} + \varepsilon_t$
- 模型3（带时间趋势）：$\nabla X_t = \alpha + \beta t + \rho X_{t-1} - \beta_1 \nabla X_{t-1} - \cdots - \beta_{p-1} \nabla X_{t-p+1} + \varepsilon_t$

检验步骤：
1. 根据序列特征选择模型（有明显趋势选模型3，有非零均值无趋势选模型2，均值近零选模型1）。
2. 选择滞后阶数（如AIC、BIC）。
3. 检验原假设 $H_0: \rho = 0$（单位根）。若拒绝，则序列平稳；否则非平稳。
4. 若无法拒绝，可进行联合假设检验（如 $\alpha=0,\rho=0$ 等）以判断是否为带漂移或趋势的单位根过程。
实际操作中常按模型3→模型2→模型1的顺序依次检验，避免模型误设。

## 什么是 AIC？

AIC 的全称是**赤池信息准则**（Akaike Information Criterion）。 它由日本统计学家赤池弘次提出。

AIC 的原理是基于信息论，用来衡量模型拟合数据时丢失的信息量。

它的计算公式由两部分组成：第一部分是两倍的模型未知参数个数，用来惩罚模型的复杂度；第二部分是负的两倍极大似然函数值，用来衡量模型的拟合精度。 

$$AIC = -2L(\hat{\theta}) + 2k$$

在选择模型时，**AIC 的值越小，说明模型越好**。这意味着该模型用较少的参数达到了较好的拟合效果。

## 什么是 BIC？

BIC 的全称是**贝叶斯信息准则**（Bayesian Information Criterion）。 它是在贝叶斯理论框架下推导出来的。

与 AIC 类似，BIC 也是通过引入惩罚项来限制参数数量，从而防止过度拟合。 

它的计算公式同样包含参数个数的惩罚项和似然函数项，不同的是，**BIC 的惩罚项不仅考虑了参数个数，还引入了样本容量的对数值**。 
$$BIC = -2L(\hat{\theta}) + \log(n)k$$

在选择模型时，**BIC 的值同样是越小越好**。

## 过差分的定义及缺点

**定义**：过差分是指在序列平稳化过程中，差分阶数超过了消除单位根所需的最低次数。

**缺点**：
- 损失信息（样本量减少）。
- 给序列带来不必要的相关性，使建模过程复杂化。
- 例如，随机游走的一阶差分已是白噪声，若再取二阶差分则变为MA(1)模型，模型复杂度增加。

## 如何选择 AR 模型、MA 模型以及 ARMA 模型的阶数？

- **利用ACF和PACF**：
  - $AR(p)$：PACF在$p$阶后截尾（$\hat{\phi}_{kk}$在$k>p$时落在$\pm 1.96/\sqrt{n}$内），ACF拖尾。
  - $MA(q)$：ACF在$q$阶后截尾（$\hat{\rho}_k$在$k>q$时落在$\pm 1.96/\sqrt{n}$内），PACF拖尾。
  - $ARMA(p,q)$：ACF和PACF均拖尾。
- **利用信息准则**：AIC $= -2L(\hat{\theta}) + 2k$，BIC $= -2L(\hat{\theta}) + \log(n)k$。选择AIC或BIC最小的模型。AIC侧重预测，BIC侧重识别真实模型。

## AR 模型、MA 模型和 ARMA 模型所适用的估计方法
| 模型类型 | 适用的估计方法 |
|----------|----------------|
| $AR(p)$ | 矩估计（Yule-Walker估计）、条件最小二乘、条件极大似然、精确极大似然、无条件最小二乘 |
| $MA(q)$ | 矩估计（效率较低，不建议）、条件最小二乘、条件极大似然、精确极大似然、无条件最小二乘 |
| $ARMA(p,q)$ | 矩估计（效率较低，不建议）、条件最小二乘、条件极大似然、精确极大似然、无条件最小二乘 |

在大样本下，最小二乘估计（条件或无条件）与极大似然估计（条件或精确）渐近等价。

## 在 Box-Jenkins 法的诊断性检验中，残差分析包含哪些内容？

残差分析主要包括：
1. **残差时序图**：标准化残差应围绕零水平线波动，波动幅度稳定。
2. **白噪声检验**：
   - 观察ACF图：样本自相关函数应落在$\pm 1.96/\sqrt{n}$内。
   - Box-Pierce检验：$Q = n\sum_{k=1}^{m}\hat{\rho}_k^2 \sim \chi^2_m$。
   - Ljung-Box检验（小样本修正）：$LB = n(n+2)\sum_{k=1}^{m}\frac{\hat{\rho}_k^2}{n-k} \sim \chi^2_m$。
1. **残差正态性**：通过Q-Q图判断，若样本分位数与标准正态分位数大致呈线性关系，则近似正态。

## 在 Box-Jenkins 法的诊断性检验中，过度拟合应遵循哪些原则？

过度拟合是指在一个已拟合的模型基础上，拟合一个更一般的嵌套模型（如AR(2)→AR(3)）以检验原模型的充分性。应遵循以下原则：
1. 在拟合更复杂模型之前，先对原始模型进行充分诊断。
2. 通常不建议同时增加AR和MA部分的阶数。
3. 模型扩展应依据残差分析结果进行。例如，若MA(1)残差的ACF在2阶截尾而PACF拖尾，应优先考虑MA(2)，而非ARMA(1,1)。
4. 结合AIC、BIC等信息准则对备选模型进行综合评估与筛选。

---
# 第五章 非平稳时间序列分析

## 非平稳时间序列中趋势的主要类型及其对应的平稳化建模方法

- **确定性趋势**：序列趋势表现为关于时间的确定性函数，如 $X_t = \alpha + \beta t + Y_t$（$Y_t$为零均值平稳序列）。
	- **建模方法**：先通过回归分析、时间序列分解或指数平滑法去除确定性趋势，再对残差构建ARMA模型。

- **随机趋势**（隐含于差分变换中）：如随机游走。
	- **建模方法**：通过差分变换（$\nabla X_t = X_t - X_{t-1}$）实现平稳化。

## 在无季节效应的非平稳序列分析中，平稳化的常用手段有哪些，它们分别适用于哪些情形？

- **差分变换**：适用于消除趋势（尤其是随机趋势），使序列平稳。
- **对数变换**：适用于序列存在异方差性（波动随序列值增大而增大）且序列值均为正的情形。对数变换可稳定方差，若变换后仍有趋势，则需进一步差分。
## ARIMA 模型的定义

- **ARIMA(p,d,q)模型**：经过 $d$ 阶差分后，序列成为平稳的ARMA(p,q)模型。其性质为：特征方程有 $p+d$ 个特征根，其中 $p$ 个在单位圆内，$d$ 个在单位圆上。
- 特殊情形：$d=0$ 时为ARMA(p,q)；$p=0$ 时为IMA(d,q)；$q=0$ 时为ARI(p,d)。
- 常用表达式：$\phi(B)\nabla^d X_t = \theta(B)\varepsilon_t$，其中 $\nabla^d = (1-B)^d$。

## 非平稳时间序列中季节成分的主要类型及其对应的平稳化建模方法

- **确定性季节成分**：季节成分表现为关于时间的确定性周期函数，如 $X_t = \mu_t + Y_t$，$\mu_t = \mu_{t-s}$。**建模方法**：先通过回归分析、时间序列分解或指数平滑法去除确定性季节成分，再对残差构建ARMA模型。
- **随机季节成分**：季节成分源于随机冲击在季节尺度上的持续性累积，如 $S_t = S_{t-s} + e_t$。**建模方法**：通过季节差分 $\nabla_s X_t = X_t - X_{t-s}$ 实现平稳化。

## 在有季节效应的非平稳时间序列分析中，平稳化的常用手段有哪些，它们分别适用于哪些情形？

- **去除确定性季节成分**（回归、分解等）：适用于确定性季节模式。
- **季节差分**（$\nabla_s$）：适用于随机季节成分（季节随机游走）。
- **一阶差分与季节差分的结合**（$\nabla \nabla_s$）：当同时存在随机趋势和随机季节成分时使用。
- **对数变换**：适用于序列存在异方差或呈现指数型/快速增长趋势的情形。

## 乘法季节 ARMA 模型的定义

- **乘法季节$ARMA(p,q)×(P,Q)_s$ 模型**定义为：
 $$\phi(B)\Phi(B)X_t = \theta(B)\Theta(B)\varepsilon_t$$
  其中：
  - $\phi(B)=1-\phi_1 B-\cdots-\phi_p B^p$，$\theta(B)=1-\theta_1 B-\cdots-\theta_q B^q$（非季节部分）；
  - $\Phi(B)=1-\Phi_1 B^s-\cdots-\Phi_P B^{Ps}$，$\Theta(B)=1-\Theta_1 B^s-\cdots-\Theta_Q B^{Qs}$（季节部分）。
- 该模型可看作ARMA$(p+Ps,\, q+Qs)$的特例。

## 乘法季节 ARIMA 模型的定义

- **乘法季节 $ARIMA(p,d,q)×(P,D,Q)_s$ 模型**定义为：

  $$\phi(B)\Phi(B)\nabla^d \nabla_s^D X_t = \theta(B)\Theta(B)\varepsilon_t$$

其中：
  - $\nabla^d = (1-B)^d$ 为 $d$ 阶差分，$\nabla_s^D = (1-B^s)^D$ 为 $D$ 阶季节差分；
  - $\nabla^d \nabla_s^D X_t$ 为经过差分和季节差分后的平稳序列，该序列服从$SARMA(p,q)×(P,Q)_s$ 模型。