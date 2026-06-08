---
title: 多元统计分析-第六章计算解
description: 再详解下学期就多一门课了
pubDate: 2026-06-07T17:57
image: https://origin.picgo.net/2026/06/07/downloadc52ca9d78020d987.jpg
draft: false
tags:
  - 多元统计分析
categories:
  - 期末复习
badge: ''
---
# 主成分分析的定义。

主成分分析是一种将多个变量 $(X_1, X_2, ..., X_p)$转化为少数几个综合变量（主成分），并尽可能保留原始变量大部分信息的数据降维方法。其基本思想是通过线性组合构造主成分，使其方差最大

# 主成分方差贡献率、主成分载荷、主成分得分的定义。

- **主成分方差贡献率**：指第$i$个主成分的方差特征值$\lambda_i$与所有特征值之和的比值，公式为$\frac{\lambda_i}{\lambda_1+\lambda_2+\dots+\lambda_p}$。
- **主成分载荷**：指原始变量和主成分之间的相关系数。
- **主成分得分**：在实际应用中，为使主成分纯粹反映各原始变量的波动差异，主成分通常基于中心化后的数据计算，得到的数值即称为主成分得分。其公式为 $\tilde{Y}_i = e_i'(X - \mu)$。

# 主成分得分的几何含义。

主成分得分的几何含义是将原始数据（中心化）投影到特征向量上。

# 如何解释主成分?

主成分的解释通常依据主成分系数绝对值的相对大小来判断。此外，主成分载荷（即原始变量和主成分的相关系数）也一般用于辅助解释主成分。

# 如何选择主成分的个数?

选择主成分个数通常有以下几种方法和准则：

- **样本主成分的累计方差贡献率**：通常认为80%~90%的累计方差贡献率可解释原始变量绝大多数的信息。

- **碎石图**（**特征值折线图**）：寻找曲线由陡降转为平缓的拐点，并保留拐点之前的主成分作为主要成分。

- **Kaiser**-**Harris准则**：在标准化情形下，判别准则为特征值 $\hat{\lambda}_i^* > 1$。

- **平行分析**：随机生成 $n$ 组与原始数据矩阵相同维度的数据矩阵，保留那些实际数据特征值大于随机数据平均特征值的主成分。

- 先验经验和理论知识。

# 正交因子模型的基本假设。

正交因子模型形式为 $X = LF + \epsilon, EX = 0$。其基本假设包括：
1. $EF = 0, Cov(F,F) = I$。
2. $E\epsilon = 0, Cov(\epsilon,\epsilon) = \Psi$为对角矩阵。
3. $F$与$\epsilon$独立。

# 在正交因子模型中，因子载荷具有哪些性质？

1. 因子载荷是原始变量和公共因子的协方差，即$L = \Sigma_{XF}$；在标准化情形下，因子载荷则是两者的相关系数，即 $L = \rho_{XF}$。
2. 因子载荷不唯一。初始载荷矩阵 $L$乘以一个正交矩阵$T$后，可以得到新的因子载荷矩阵（即$L^*$）。

# 正交因子模型的协方差结构及相关概念。

正交因子模型的协方差结构为 $Cov(X,X) \equiv \Sigma = LL' + \Psi$。相关概念包括：
- 共同度（Communality）：记为 $h_i^2$，等于 $(L_i)'L_i$（即 $L$矩阵中第$i$行元素的平方和）。
- 特殊度（Uniqueness）：记为$\psi_i$。
- 变量 $X_i$ 的方差可以分解为：$Var(X_i) = h_i^2 + \psi_i$。
- 公共因子 $F_j$的方差贡献：等于$(L_{(j)})'L_{(j)}$（即 $L$矩阵中第$j$列元素的平方和）。

# 正交旋转如何影响共同度？

正交旋转不改变共同度。通过公式推导可知，旋转后的共同度$(L_i^*)'L_i^*$等于旋转前的共同度$(L_i)'L_i = h_i^2$。

# 在方差最大化标准下，正交旋转如何影响因子载荷？

在方差最大化准则下，正交旋转的目标是最大化各个公共因子标准化载荷平方的方差总和（$\max_T(V_1 + V_2 + \cdots + V_m)$）。这样会使得因子载荷呈现出明显的“两极分化”特征（即方差较大），从而让公共因子的含义更容易被理解和解释。

# 例题

已知 $\boldsymbol{\Sigma}$是随机向量$\boldsymbol{X} = \begin{bmatrix} X_1 & X_2 & \cdots & X_p \end{bmatrix}$ 的协方差矩阵，$\lambda_1 \geq \lambda_2 \geq \cdots \geq \lambda_p$为 $\boldsymbol{\Sigma}$ 的特征值，$\boldsymbol{e}_1, \boldsymbol{e}_2, \cdots, \boldsymbol{e}_p$ 为对应的单位正交特征向量。证明：$Y_i = \boldsymbol{e}_i' \boldsymbol{X}$ 为 $\boldsymbol{X}$ 的第 $i$ 主成分，$i = 1,2,\dots,p$。

## 主成分

这里有一些前置条件：

### 主成分的定义：

随机变量$X_1, X_2, \cdots, X_p$的线性组合：
$$
\begin{align*}
Y_1 &= \mathbf{a}_1' \mathbf{X} = a_{11}X_1 + a_{12}X_2 + \cdots + a_{1p}X_p \\
Y_2 &= \mathbf{a}_2' \mathbf{X} = a_{21}X_1 + a_{22}X_2 + \cdots + a_{2p}X_p \\
&\vdots \qquad \qquad \vdots \\
Y_p &= \mathbf{a}_p' \mathbf{X} = a_{p1}X_1 + a_{p2}X_2 + \cdots + a_{pp}X_p
\end{align*}
$$

$$Var(Y_i) = \mathbf{a}_i'\Sigma \mathbf{a}_i, \quad Cov(Y_i, Y_k) = \mathbf{a}_i'\Sigma \mathbf{a}_k, \quad i, k = 1,2,\cdots,p$$

### 主成分的要求:

主成分是不相关的线性组合，使方差 $Var(Y_i) = \boldsymbol{a}_i'\boldsymbol{\Sigma}\boldsymbol{a}_i$ 尽可能大。

- 第一主成分=线性组合$\boldsymbol{a}_1'\boldsymbol{X}$当 $\boldsymbol{a}_1'\boldsymbol{a}_1 = 1$ 时，使得$Var(\boldsymbol{a}_1'\boldsymbol{X})$最大。

- 第二主成分=线性组合$\boldsymbol{a}_2'\boldsymbol{X}$当$\boldsymbol{a}_2'\boldsymbol{a}_2 = 1$，$Cov(\boldsymbol{a}_1'\boldsymbol{X}, \boldsymbol{a}_2'\boldsymbol{X}) = 0$时，使得$Var(\boldsymbol{a}_2'\boldsymbol{X})$最大。

- 第i个主成分=线性组合$\boldsymbol{a}_i'\boldsymbol{X}$当 $\boldsymbol{a}_i'\boldsymbol{a}_i = 1$，$Cov(\boldsymbol{a}_k'\boldsymbol{X}, \boldsymbol{a}_i'\boldsymbol{X}) = 0\ (k < i)$时，使得$Var(\boldsymbol{a}_i'\boldsymbol{X})$ 最大。

---

- $\boldsymbol{a}_i'\boldsymbol{a}_i = 1$ 这是为了统一量纲，在同一个规则下找最大值，比如我说我绩点4.5，但是满绩是100，他说他绩点3.5，满绩 4，这样就不好比了。
- $Cov(\boldsymbol{a}_k'\boldsymbol{X}, \boldsymbol{a}_i'\boldsymbol{X}) = 0\ (k < i)$ 是为了让每个主成分都无关，才能最大化利用方差信息。

## 证明

### 第一主成分

这里 $\boldsymbol{a}_i'\boldsymbol{a}_i = 1$，而且要求 $Var(Y_i) = \boldsymbol{a}_i'\boldsymbol{\Sigma}\boldsymbol{a}_i$ 的最大值。

等价于求解：$\max_{\boldsymbol{a}} \frac{\boldsymbol{a}' \Sigma \boldsymbol{a}}{\boldsymbol{a}' \boldsymbol{a}}$ (除以1等于没除)

我们对 X 的 协方差矩阵 进行分解：
$$
\boldsymbol{\Sigma} = \mathbf{P}\boldsymbol{\Lambda}\mathbf{P}' =
\begin{bmatrix}
\mathbf{e}_1 & \mathbf{e}_2 & \cdots & \mathbf{e}_p
\end{bmatrix}
\begin{bmatrix}
\lambda_1 & & & \\
& \lambda_2 & & \\
& & \ddots & \\
& & & \lambda_p
\end{bmatrix}
\begin{bmatrix}
\mathbf{e}_1' \\
\mathbf{e}_2' \\
\vdots \\
\mathbf{e}_p'
\end{bmatrix}
= \sum_{i=1}^p \lambda_i \mathbf{e}_i \mathbf{e}_i'
$$
-  P 是$\mathbf{e}_1, \mathbf{e}_2, \cdots, \mathbf{e}_p$ 为对应的单位特征向量，且两两正交构成的正交向量，所以$P$是正交矩阵，满足$P^{-1}=P'$。
- $\boldsymbol{\Lambda}$ 由$\lambda_1 \geq \lambda_2 \geq \cdots \geq \lambda_p$为$\boldsymbol{\Sigma}$ 的特征值构成

令 $\mathbf{a} = \mathbf{P}\mathbf{b}$，所以 $\mathbf{b}=P'a$，把 $\boldsymbol{\Sigma}$ 换掉：
$$
\frac{\mathbf{a}'\Sigma \mathbf{a}}{\mathbf{a}'\mathbf{a}}
= \frac{\mathbf{a}'\mathbf{P}\Lambda \mathbf{P}'\mathbf{a}}{\mathbf{a}'\mathbf{P}\mathbf{P}'\mathbf{a}}
= \frac{\mathbf{b}'\Lambda \mathbf{b}}{\mathbf{b}'\mathbf{b}}
$$

---
在这里
$$
\boldsymbol{\Lambda b} = 
\begin{bmatrix}
\lambda_1 & 0 & \dots & 0 \\
0 & \lambda_2 & \dots & 0 \\
\vdots & \vdots & \ddots & \vdots \\
0 & 0 & \dots & \lambda_p
\end{bmatrix}
\begin{bmatrix}
b_1 \\ b_2 \\ \vdots \\ b_p
\end{bmatrix}
=
\begin{bmatrix}
\lambda_1 b_1 \\ \lambda_2 b_2 \\ \vdots \\ \lambda_p b_p
\end{bmatrix}
$$
因此
$$
\boldsymbol{b}'(\boldsymbol{\Lambda b}) = 
\begin{bmatrix} b_1 & b_2 & \dots & b_p \end{bmatrix}
\begin{bmatrix}
\lambda_1 b_1 \\ \lambda_2 b_2 \\ \vdots \\ \lambda_p b_p
\end{bmatrix}
= \sum_{i=1}^p b_i (\lambda_i b_i) = \sum_{i=1}^p \lambda_i b_i^2
$$
所以$\boldsymbol{b}'\boldsymbol{\Lambda b} = \sum_{i=1}^p \lambda_i b_i^2$。所以可以继续连等：

$$
\frac{\mathbf{a}'\Sigma \mathbf{a}}{\mathbf{a}'\mathbf{a}} = \frac{\sum_{i=1}^p \lambda_i b_i^2}{\sum_{i=1}^p b_i^2}
\leq \lambda_1
$$

在主成分分析里面，特征值是按大小排列的，所以 $\lambda_1$ 是最大的，所以小于等于是成立的。

那什么时候是取“等号”呢？那肯定是 $b_1= 1$，其他是 0 的时候呗。
此时 $b = (1, 0, \dots, 0)'$，代入求 a
$$
\mathbf{a}_1 = \mathbf{P}\mathbf{b} = \mathbf{e}_1
$$

继而可得$Y_1 = \mathbf{e}_1'\mathbf{X}$，$\mathrm{Var}(Y_1) = \lambda_1$。

## 其他主成分

第二主成分还是求解这个问题：
$$
\max_{a} \frac{a' \Sigma a}{a' a}
$$

但此时多了一些条件：
$$
a'a = 1,\ \mathrm{Cov}(a'\boldsymbol{X}, e_1'\boldsymbol{X}) = a'\Sigma e_1 = 0
$$
除了第一项，还要求第二与第一主成分的协方差为0

这些$\lambda_1 \geq \lambda_2 \geq \cdots \geq \lambda_p$为 $\boldsymbol{\Sigma}$ 的特征值，利用特征向量的等是关系：
$$
\Sigma e_1 = \lambda_1 e_1
$$
这是线代的内容，特征值和特征向量的关系。

于是等式扩大：
$$
\mathrm{Cov}(a' X, e_1' X) =  a'  \Sigma e_1= \lambda_1 a' e_1  =a' e_1= 0.
$$

$$
a = Pb = a = b_1 e_1 + b_2 e_2 + \dots + b_p e_p
$$
$$
a' e_1  = \boldsymbol{e}_1' \boldsymbol{a} = b_1 \boldsymbol{e}_1' \boldsymbol{e}_1 + \sum_{i=2}^{p} b_i \boldsymbol{e}_1' \boldsymbol{e}_i = b_1 \cdot 1 + 0 = b_1
$$
因此$\boldsymbol{a}'\boldsymbol{e}_1 = 0$等价于 $b_1 = 0$。

我们推出了第二主成分 协方差 为0 等价于 $b_1 = 0$
所以回到之前的式子，没有 $\lambda_1$ 了,从 i = 2 开始：
$$
\frac{\mathbf{a}' \Sigma \mathbf{a}}{\mathbf{a}' \mathbf{a}}
= \frac{\mathbf{a}' \mathbf{P} \Lambda \mathbf{P}' \mathbf{a}}{\mathbf{a}' \mathbf{P} \mathbf{P}' \mathbf{a}}
= \frac{\mathbf{b}' \Lambda \mathbf{b}}{\mathbf{b}' \mathbf{b}}
= \frac{\sum_{i=2}^{p} \lambda_i b_i^2}{\sum_{i=2}^{p} b_i^2}
\leq \lambda_2 \implies \mathbf{a}_2 = \mathbf{P} \mathbf{b} = \mathbf{e}_2
$$
继而可得 $Y_2 = \boldsymbol{e}_2'\boldsymbol{X},\ \mathrm{Var}(Y_2) = \lambda_2$。

类似的，可以证明，$Y_i = \boldsymbol{e}_i'\boldsymbol{X},\ \mathrm{Var}(Y_i) = \lambda_i,\ i = 3,4,\dots,p$。

---
# 例题

在正交因子模型中，为了便于解释，因子载荷 $\boldsymbol{L}$往往需要进行正交旋转，即
$$
\boldsymbol{X} = \boldsymbol{LF} + \boldsymbol{\varepsilon} = (\boldsymbol{LT})(\boldsymbol{T}'\boldsymbol{F}) + \boldsymbol{\varepsilon} = \boldsymbol{L}^* \boldsymbol{F}^* + \boldsymbol{\varepsilon}
$$
其中，$\boldsymbol{T}$ 为正交矩阵。证明：

## （1）$E\boldsymbol{F}^* = \boldsymbol{0}$，$\text{Cov}(\boldsymbol{F}^*, \boldsymbol{F}^*) = \boldsymbol{I}$；

### 前提

因子分析的基本模型 $\boldsymbol{X} = \boldsymbol{L}\boldsymbol{F} + \boldsymbol{\varepsilon}$中，因子载荷、公共因子和特殊因子都是未知的，无法直接进行分析。
$$
\begin{bmatrix}
X_1 \\
X_2 \\
\vdots \\
X_p
\end{bmatrix}
=
\underbrace{
\begin{bmatrix}
\ell_{11} & \ell_{12} & \dots & \ell_{1m} \\
\ell_{21} & \ell_{22} & \dots & \ell_{2m} \\
\vdots & \vdots & \ddots & \vdots \\
\ell_{p1} & \ell_{p2} & \dots & \ell_{pm}
\end{bmatrix}
}_{\text{因子载荷}}
\underbrace{
\begin{bmatrix}
F_1 \\
F_2 \\
\vdots \\
F_m
\end{bmatrix}
}_{\text{公共因子}}
+
\underbrace{
\begin{bmatrix}
\varepsilon_1 \\
\varepsilon_2 \\
\vdots \\
\varepsilon_p
\end{bmatrix}
}_{\text{特殊因子}}
$$

一种常见且便于估计的形式是正交因子模型：
$$
\boldsymbol{X} = \boldsymbol{L}\boldsymbol{F} + \boldsymbol{\varepsilon},\quad E\boldsymbol{X} = \boldsymbol{0}
$$
其基本假设为，假设知道了这题才能做：
1. $E(\boldsymbol{F}) = \boldsymbol{0},\ \mathrm{Cov}(\boldsymbol{F},\boldsymbol{F}) = \boldsymbol{I}$
2. 2.$E\boldsymbol{\varepsilon} = \boldsymbol{0},\ \mathrm{Cov}(\boldsymbol{\varepsilon},\boldsymbol{\varepsilon}) = \boldsymbol{\Psi}$为对角矩阵
3. $\boldsymbol{F}$与$\boldsymbol{\varepsilon}$ 独立

令 **$\boldsymbol{T}$为正交矩阵**，则有
$$
\boldsymbol{X} = \boldsymbol{L}(\boldsymbol{T}\boldsymbol{T}')\boldsymbol{F} + \varepsilon = (\boldsymbol{L}\boldsymbol{T})(\boldsymbol{T}'\boldsymbol{F}) + \varepsilon = \boldsymbol{L}^*\boldsymbol{F}^* + \varepsilon
$$
这里就是说：$\boldsymbol{F}^* = \boldsymbol{T}'\boldsymbol{F}$

### 证明：

#### 期望：
$$
E(\boldsymbol{F}^*) = E(\boldsymbol{T}'\boldsymbol{F}) = \boldsymbol{T}' E(\boldsymbol{F}) = \boldsymbol{T}'\boldsymbol{0} = \boldsymbol{0}
$$
#### 协方差矩阵：
$$
\text{Cov}(\boldsymbol{F}^*,\boldsymbol{F}^*) = \text{Cov}(\boldsymbol{T}'\boldsymbol{F},\boldsymbol{T}'\boldsymbol{F}) = \boldsymbol{T}'\text{Cov}(\boldsymbol{F})\boldsymbol{T} = \boldsymbol{T}'\boldsymbol{I}\boldsymbol{T} = \boldsymbol{T}'\boldsymbol{T} = \boldsymbol{I}
$$
得证。
## （2）正交旋转不改变共同度。

### 共同度

第 $i$个变量的共同度 $h_i^2$ 定义为载荷矩阵第$i$行元素的平方和，即
$$
h_i^2 = \sum_{j=1}^m l_{ij}^2 = l'_{i} l_{i}
$$
### 正交旋转

$l_{i}$ 是 $L$ 的第 $i$ 行（行向量）
 
旋转后，$L^* = LT$，其第 $i$ 行为$l^*_{(i)} = l_{(i)}T$。


### 证明

$$
h_i^{*2} = (l_{i} T) (l_{i} T)' = l_{i} T T' l'_{i} = l_{i} I l'_{i} = l_{i} l'_{i} = h_i^2
$$