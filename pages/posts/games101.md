---
layout: post
title: Games101 课程笔记
date: 2026-03-05 10:58:11
updated: 2026-03-05 17:37:30
categories: 笔记
tags:
  - 笔记
  - Games101
  - 图形学
cover: 'https://pic.yurin.cc/fced42a948348a3e5f04f78309f013cc.webp'
codeHeightLimit: 500
toc: true
time_warning: false
end: false
---

## 前言

Games101 课程是计算机图形学的入门基础，从 Games101 了解图形学背后的底层逻辑与数学原理，而不局限于任何特定的图形 API（如 OpenGL 或 DirectX）。

在这里主要记录更偏向图形学的知识，基础内容不会全部记录。

Lefture01 主要是简介，在这里跳过。

<!-- more -->

## Lecture02 线性代数基础

### 向量的点乘

向量点乘可以判断两个向量 $a$ 和 $b$ **前与后** 的关系：
- 若 $a \cdot b < 0$ ：则两向量反向
- 若 $a \cdot b > 0$ ：则两向量同向

![alt text](https://pic.yurin.cc/6a86b3297571e37462f2a7030b1f8eee.webp)

### 向量的叉乘

向量叉乘可以以判断两个向量 $a$ 和 $b$ **左与右** 的关系，根据右手螺旋定则：
- 若 $a \times b \rightarrow z > 0$ ：则说明向量 &b& 在向量 &a& 的左侧。
- 若 $a \times b \rightarrow z < 0$ ：则说明向量 &b& 在向量 &a& 的右侧。

![alt text](https://pic.yurin.cc/c5722a2bfc666a3c7d288c377b7a4f7c.webp)

#### 如何判断一个点在三角形内部？

三角形三条边分别设为向量，相邻向量两两叉乘，判断三次叉乘的结果是否都是同一方向向量。要么这个点在三条边的左边要么就在三条边的右边。

![alt text](https://pic.yurin.cc/879d7c81630f5dc3f446ffe44a652581.webp)

### 矩阵乘积
略
### 矩阵向量
略

## Lecture03 Transform 变换

### 2D 变换的齐坐标形式

- **缩放**：
  $\mathbf{S}(s_x, s_y) = \begin{pmatrix} s_x & 0 & 0 \\ 0 & s_y & 0 \\ 0 & 0 & 1 \end{pmatrix}$

- **旋转**：
  $\mathbf{R}(\alpha) = \begin{pmatrix} \cos \alpha & -\sin \alpha & 0 \\ \sin \alpha & \cos \alpha & 0 \\ 0 & 0 & 1 \end{pmatrix}$

- **平移**：
  $\mathbf{T}(t_x, t_y) = \begin{pmatrix} 1 & 0 & t_x \\ 0 & 1 & t_y \\ 0 & 0 & 1 \end{pmatrix}$

## Lefture04 Transform 进阶

### 3D 变换

3D 变换相当于 2D 变换的扩维，由 $3\times3$ 矩阵变为 $4\times4$ 矩阵（多补充一个 z 轴）。

缩放、旋转和平移与 2D 形式比较接近，但是旋转一般是直接拆成绕3个轴旋转（raw、yaw、pitch）

- **缩放**：
  $\mathbf{S}(s_x, s_y, s_z) = \begin{pmatrix} s_x & 0 & 0 & 0 \\ 0 & s_y & 0 & 0 \\ 0 & 0 & s_z & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$

- **平移**：
  $\mathbf{T}(t_x, t_y, t_z) = \begin{pmatrix} 1 & 0 & 0 & t_x \\ 0 & 1 & 0 & t_y \\ 0 & 0 & 1 & t_z \\ 0 & 0 & 0 & 1 \end{pmatrix}$

- **旋转**：
  
  绕 X 轴旋转：
  $\mathbf{R}_x(\alpha) = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & \cos\alpha & -\sin\alpha & 0 \\ 0 & \sin\alpha & \cos\alpha & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$

  绕 Y 轴旋转:
  $\mathbf{R}_y(\alpha) = \begin{pmatrix} \cos\alpha & 0 & \sin\alpha & 0 \\ 0 & 1 & 0 & 0 \\ -\sin\alpha & 0 & \cos\alpha & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$

  绕 Z 轴旋转：
  $\mathbf{R}_z(\alpha) = \begin{pmatrix} \cos\alpha & -\sin\alpha & 0 & 0 \\ \sin\alpha & \cos\alpha & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$

  最终可得一般性旋转：

  $\mathbf{R}_{xyz}(\alpha,\beta,\gamma)=\mathbf{R}_x(\beta)\mathbf{R}_y(\alpha)\mathbf{R}_z(\gamma)$


  在绕 Y 轴旋转时可以发现有所不同，右上角的 $sin\alpha$ 为负，左下角的 $sin\alpha$ 为正。这是因为 **循环对称。** 

  :::tip 循环对称

  在三维坐标系中，X、Y、Z 三个轴遵循一个无限循环的顺序：$X \to Y \to Z \to X \to Y \dots$。
  
  遵循这个顺序进行叉乘（Cross Product），结果即为第三个轴，因此就有：

  $$X \times Y = Z$$ 
  $$Y \times Z = X$$ 
  $$Z \times X = -Y$$ 

  :::

### 罗德里格斯旋转公式

当需要某个向量绕着三维空间中的某个任意的轴（不是 X/Y/Z）旋转，就要用到罗德里格斯旋转公式。

#### 公式

$$\mathbf{v}' = \cos\alpha \mathbf{v} + (1 - \cos\alpha)(\mathbf{n} \cdot \mathbf{v})\mathbf{n} + \sin\alpha (\mathbf{n} \times \mathbf{v})$$

其中： 
- $\mathbf{v}$ 为空间中的一个向量
- $\mathbf{n}$为 一个通过原点的 **单位向量**
- $\alpha$ 为旋转角度


**对应的矩阵形式：**
$$\mathbf{R}(\mathbf{n}, \alpha) = \cos(\alpha)\mathbf{I} + (1 - \cos(\alpha))\mathbf{n}\mathbf{n}^T + \sin(\alpha)\underbrace{\begin{pmatrix} 0 & -n_z & n_y \\ n_z & 0 & -n_x \\ -n_y & n_x & 0 \end{pmatrix}}_{\mathbf{N}}$$

其中：
- $\mathbf{I}$ 为 $3 \times 3$ 的**单位矩阵** (Identity Matrix)。
- $\mathbf{n}$为 一个通过原点的 **单位向量**
- $\alpha$ 为绕轴旋转角度
- $\mathbf{n}\mathbf{n}^T$ 为向量 $\mathbf{n}$ 与其转置相乘得到的外积矩阵
- $\mathbf{N}$ 为旋转轴向量 $\mathbf{n} = (n_x, n_y, n_z)^T$ 对应的**叉乘矩阵**（反对称矩阵）
- 
#### 公式拆解

- **正交分解原向量**
  将 $\mathbf{v}$ 分解为平行于 $\mathbf{n}$ 的分量 $\mathbf{v}_{\parallel}$ 和垂直于 $\mathbf{n}$ 的分量 $\mathbf{v}_{\perp}$。
    - 平行分量（$\mathbf{v}$ 在 $\mathbf{n}$ 上的投影）：$\mathbf{v}_{\parallel} = (\mathbf{n} \cdot \mathbf{v})\mathbf{n}$
    - 垂直分量：$\mathbf{v}_{\perp} = \mathbf{v} - \mathbf{v}_{\parallel} = \mathbf{v} - (\mathbf{n} \cdot \mathbf{v})\mathbf{n}$

- **处理平行分量（保持不变）**
  因为 $\mathbf{v}_{\parallel}$ 就在旋转轴 $\mathbf{n}$ 上，所以绕该轴旋转任何角度都不会改变它的大小和方向。
  - 旋转后：$\mathbf{v}'_{\parallel} = \mathbf{v}_{\parallel} = (\mathbf{n} \cdot \mathbf{v})\mathbf{n}$
- **处理垂直分量（二维旋转）**
  $\mathbf{v}_{\perp}$ 的旋转发生在一个垂直于 $\mathbf{n}$ 的二维平面内。在这个平面内，$\mathbf{v}_{\perp}$ 和 $\mathbf{n} \times \mathbf{v}_{\perp}$（即 $\mathbf{n} \times \mathbf{v}$）构成了一组正交基底。我们将 $\mathbf{v}_{\perp}$ 旋转 $\alpha$ 角度，就相当于在这两个基向量上进行投影。
    - 旋转后：$\mathbf{v}'_{\perp} = \cos\alpha \mathbf{v}_{\perp} + \sin\alpha (\mathbf{n} \times \mathbf{v})$
- **组装最终结果**
  将旋转后的平行分量和垂直分量相加：$\mathbf{v}' = \mathbf{v}'_{\parallel} + \mathbf{v}'_{\perp}$
    代入展开式：
    $$\mathbf{v}' = (\mathbf{n} \cdot \mathbf{v})\mathbf{n} + \cos\alpha (\mathbf{v} - (\mathbf{n} \cdot \mathbf{v})\mathbf{n}) + \sin\alpha (\mathbf{n} \times \mathbf{v})$$
    合并同类项，提取出带有 $(\mathbf{n} \cdot \mathbf{v})\mathbf{n}$ 的部分，即可得到最终公式：
    $$\mathbf{v}' = \cos\alpha \mathbf{v} + (1 - \cos\alpha)(\mathbf{n} \cdot \mathbf{v})\mathbf{n} + \sin\alpha (\mathbf{n} \times \mathbf{v})$$

### 四元数

为了解决欧拉角旋转时会面临的 **万向节死锁问题**

:::danger 万向锁
欧拉角按照固定的顺序（如 X-Y-Z）进行旋转。当其中一个轴旋转了特定的角度（通常是 90 度）时，另外两个旋转轴会重合，导致系统丢失一个自由度。在表现上，就是物体的旋转会突然发生非预期的翻转。

由于欧拉角是设定了三个轴的变换顺序，内部的轴无法带动外部的轴旋转，因此当 Y 轴旋转 90 度时，X 轴和 Z 轴会重合，此时增大 X 轴旋转也仅仅是在原来的 X 轴上旋转，从直观意义上来看是按照 Z 轴旋转的，这就导致了一个自由度的丧失。

  参考视频：[无伤理解欧拉角中的“万向死锁”现象](https://www.bilibili.com/video/BV1Nr4y1j7kn/?share_source=copy_web&vd_source=25a9a10c6f978860f97af02e1668351a)
:::

#### 数学表示

四元数可以看作是复数在三维空间的扩维。它由一个实部和三个虚部组成：
$$q = w + xi + yj + zk$$

在图形学中，我们通常把它写成一个标量和一个三维向量的组合形式：
$$q = (w, \mathbf{v}) \quad \text{或} \quad q = (w, x, y, z)$$

#### 四元数与轴角的结合

若要让物体绕着**单位向量轴 $\mathbf{n} = (n_x, n_y, n_z)$** 旋转 **$\alpha$ 角度**，对应的四元数可以直接写为：

$$q = \left( \cos\frac{\alpha}{2}, \mathbf{n}\sin\frac{\alpha}{2} \right)$$

展开即为：
$$q = \left( \cos\frac{\alpha}{2}, n_x\sin\frac{\alpha}{2}, n_y\sin\frac{\alpha}{2}, n_z\sin\frac{\alpha}{2} \right)$$


#### 四元数的优势：
1.  **完美解决万向节死锁：** 四元数直接绕空间中的单根轴进行一次性旋转，不存在轴重合丢失自由度的问题。
2.  **平滑插值 (SLERP)：**  四元数可以在四维球面上进行**球面线性插值 (Spherical Linear Interpolation, SLERP)**。这是游戏引擎中实现平滑相机跟随、角色朝向平滑旋转、动画蒙太奇过渡的核心算法。
3.  **计算高效与易于存储：** 相比于存储和计算 $3 \times 3$ （9个浮点数）的旋转矩阵，四元数只需要 4 个浮点数。在多人游戏的网络同步（Replication）中，传递四元数能大幅节省带宽。

:::warning 注意
- 四元数乘法**不满足交换律**（$q_1 q_2 \neq q_2 q_1$），这与矩阵乘法代表旋转先后顺序的物理意义是一致的。
- 用于表示旋转的四元数必须是**单位四元数**（模长为 1，即 $w^2 + x^2 + y^2 + z^2 = 1$）。在代码中对四元数进行连续累加计算后，通常需要进行 Normalize 归一化操作，以防止浮点数精度误差累积导致物体发生形变。
:::

### 相机获取一张照片

1.  **M - 模型变换 (Model Transformation):** 
    - **目的：** 将物体从自身的局部坐标系 (Local Space) 放置到世界坐标系 (World Space) 中。
    - **操作：** 缩放 (Scale)、旋转 (Rotation)、平移 (Translation)。
2.  **V - 视图/相机变换 (View Transformation):**
    - **目的：** 将世界坐标系下的所有物体，转换到以相机为原点、看向 $-Z$ 轴的相机坐标系 (Camera Space) 中。（右手坐标系，拇指向右，食指向上，中指向内）
    
    :::tip 左手系和右手系
    - 在 Games101（遵循 OpenGL 标准，右手系，Y朝上）里： 相机的正前方向是 -Z。
    - 在 Unreal Engine（左手系，Z朝上）里： 世界和本地坐标的正前方向（Forward Vector）默认是 +X。
    :::

    - **操作：** 相对运动的平移与旋转 ($M_{view} = R_{view} T_{view}$)。
3.  **P - 投影变换 (Projection Transformation):**
    - **目的：** 将 3D 的相机空间压缩到一个标准的 $2 \times 2 \times 2$ 的正则观察体 (Canonical View Volume) 中，即 $X, Y, Z$ 的范围都被规范化到 $[-1, 1]$ 之间。这个过程为后续的 2D 屏幕光栅化做准备。


### View / Camera Transformation 视图变换

变换的最终目的，就是把三维空间的物体变换成 2D 图像（将三维物体拍下来）。

视图变换，就是**将世界坐标系下的所有物体，转换到以相机为中心的坐标系（Camera Space）中。**

在 3D 空间中确立一个相机需要三个核心参数：
1. **相机位置 (Position/Eye):** $\vec{e}$ (一个三维坐标点)
2. **观察方向 (Look-at/Gaze direction):** $\hat{g}$ (一个单位向量，一般是 $-Z$ 轴)
3. **向上方向 (Up direction):** $\hat{t}$ (一个单位向量，且必须与 $\hat{g}$ 垂直)

#### 视图变换矩阵 $M_{view}$

将相机移动到标准状态需要两步：先平移到原点，再旋转对齐坐标轴。所以完整的视图变换矩阵为：
$$M_{view} = R_{view} T_{view}$$

##### 第一步：平移矩阵 $T_{view}$

把相机的坐标 $(x_e, y_e, z_e)$ 平移到原点 $(0, 0, 0)$，直接写出平移矩阵：
$$T_{view} = \begin{pmatrix} 1 & 0 & 0 & -x_e \\ 0 & 1 & 0 & -y_e \\ 0 & 0 & 1 & -z_e \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

##### 第二步：旋转矩阵 $R_{view}$ 

我们要找的 $R_{view}$ 是将相机的三个轴旋转到标准轴（$X, Y, -Z$）。但是直接写这个矩阵非常困难。

**但是，反过来写却极其容易。**

考虑它的逆过程：把标准坐标系的 $X, Y, Z$ 轴，旋转到相机的三个轴向（$\hat{g} \times \hat{t}$, $\hat{t}$, $-\hat{g}$）。只需要把相机的这三个方向向量按**列**排布，就能得到逆旋转矩阵 $R_{view}^{-1}$：

$$R_{view}^{-1} = \begin{pmatrix} x_{\hat{g} \times \hat{t}} & x_{\hat{t}} & x_{-\hat{g}} & 0 \\ y_{\hat{g} \times \hat{t}} & y_{\hat{t}} & y_{-\hat{g}} & 0 \\ z_{\hat{g} \times \hat{t}} & z_{\hat{t}} & z_{-\hat{g}} & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

其中 $x$，$y$，$z$ 是相机三个局部轴向向量在世界空间中的 $X$，$Y$，$Z$ 分量。

现在进行验证，将世界的右向轴乘上该变换就能得到相机的右向轴：
$$R_{view}^{-1} \cdot \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix} = \begin{pmatrix} x_{\hat{g}\times\hat{t}} & x_{\hat{t}} & x_{-\hat{g}} \\ y_{\hat{g}\times\hat{t}} & y_{\hat{t}} & y_{-\hat{g}} \\ z_{\hat{g}\times\hat{t}} & z_{\hat{t}} & z_{-\hat{g}} \end{pmatrix} \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix} = \begin{pmatrix} x_{\hat{g}\times\hat{t}} \\ y_{\hat{g}\times\hat{t}} \\ z_{\hat{g}\times\hat{t}} \end{pmatrix} = \hat{g} \times \hat{t}$$

然后再对 $R_{view}^{-1}$ 进行逆变换，即可得到任意向量旋转到轴的变换矩阵 $R_{view}$ 。

从视图变换可知：
$$M_{view} = R_{view} T_{view}$$

即视图变换就是 **相机旋转变换 $\times$ 平移变换**。

### 投影

经过了模型变换（Model）和视图变换（View），所有的物体都已经来到了以相机为原点、看向 −Z 轴的相机坐标系中。
投影变换（Projection）的任务，是将相机视野内的 3D 空间，规范化到一个正则观察体 (Canonical View Volume) 中。

:::tip 正则观察体
它是一个中心在原点，且 $X,Y,Z$ 三个坐标轴的范围都被严格限制在 $[−1,1]$ 之间的一个 $2×2×2$ 的标准立方体。
无论原先的空间有多大，经过投影矩阵变换后，只要落在这个标准立方体内的顶点，最终就会被渲染到屏幕上；超出这个范围的，就会被裁剪掉（Clipping）。

投影变换分为两大类：正交投影与透视投影。
:::

![alt text](https://pic.yurin.cc/a9420f0d258dfeaa94e8bce3b7234bb6.webp)

如图可以看出正交投影和透视投影的区别。

#### 正交投影

平行线在投影后依然保持平行，没有“近大远小”的现象。

常用于工程制图、3D 建模软件的正交视图、以及游戏中的小地图或 2D UI 渲染。


##### 数学推导

定义相机能看到的空间（长方体 Bounding Box）范围：左右 $[l, r]$，下上 $[b, t]$，远近 $[f, n]$。

> (注：相机看向 $-Z$ 轴，所以近平面坐标值大于远平面，即 $n > f$)

将该长方体映射到 $[-1, 1]^3$ 的标准立方体，分为两步：
1. **平移 (Translation)：** 将长方体中心 $(\frac{r+l}{2}, \frac{t+b}{2}, \frac{n+f}{2})$ 平移到原点 $(0,0,0)$。
2. **缩放 (Scale)：** 将长、宽、高分别缩放到长度为 **2**。

最终的正交投影矩阵 $M_{ortho}$ 等于缩放矩阵乘以平移矩阵：
$$M_{ortho} = \begin{pmatrix} \frac{2}{r-l} & 0 & 0 & 0 \\ 0 & \frac{2}{t-b} & 0 & 0 \\ 0 & 0 & \frac{2}{n-f} & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix} \begin{pmatrix} 1 & 0 & 0 & -\frac{r+l}{2} \\ 0 & 1 & 0 & -\frac{t+b}{2} \\ 0 & 0 & 1 & -\frac{n+f}{2} \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

$$M_{ortho} = \begin{pmatrix} \frac{2}{r-l} & 0 & 0 & -\frac{r+l}{r-l} \\ 0 & \frac{2}{t-b} & 0 & -\frac{t+b}{t-b} \\ 0 & 0 & \frac{2}{n-f} & -\frac{n+f}{n-f} \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

#### 透视投影

透视投影符合人眼真实视觉，**有“近大远小”的现象**。相机的可视范围是一个平顶金字塔形的**视锥体 (Frustum)**。

![alt text](https://pic.yurin.cc/ba4b308d741c42904cb01032c1287b8e.webp)

##### 数学推导

1. **挤压 ( $M_{persp \to ortho}$ )：** 将 **视锥体** 的远平面压缩，使其变成一个标准的 **正交长方体** 。
2. **正交 ( $M_{ortho}$ )：** 对挤压后的长方体，直接套用上文的正交投影矩阵。

即：
$$M_{persp} = M_{ortho} M_{persp \to ortho}$$

要找一个矩阵，把视锥体里的点 $(x, y, z)$ 挤压成新点 $(x', y', z')$。

**步骤一：通过相似三角形求 X 和 Y**
从侧面看视锥体，根据相似三角形定理，近平面上的点和任意 $z$ 处的点满足比例关系：
$$y' = \frac{n}{z} y \quad \text{同理} \quad x' = \frac{n}{z} x$$

![alt text](https://pic.yurin.cc/36b9a55a3f48c3019067383f567a1502.webp)

> 其中 $z'$ 为未知量， $z'$ 的变换是非线性变换，从相似三角形得不到 $z'$ 的值。
> ![alt text](https://pic.yurin.cc/cb491c824a07a3c5cb1b1174bc6f8d45.webp)

在齐次坐标下，点 $(x, y, z, 1)$ 经过挤压后，坐标变为 $(\frac{nx}{z}, \frac{ny}{z}, \text{未知}, 1)$。
为了消去分母 $z$，我们将齐次坐标全体乘以 $z$，得到等价的坐标：
$$(nx, ny, \text{未知}, z)$$

由此，我们可以反推出挤压矩阵的大部分内容（第三行暂且未知，设为 $A, B, C, D$）：
$$M_{persp \to ortho} = \begin{pmatrix} n & 0 & 0 & 0 \\ 0 & n & 0 & 0 \\ A & B & C & D \\ 0 & 0 & 1 & 0 \end{pmatrix}$$

**步骤二：利用特殊平面求 Z（第三行的值）**
挤压变换有两个极其重要的性质：
1. **近平面上的任何点，挤压前后坐标不变。**
2. **远平面上的中心点，挤压前后 $Z$ 值不变。**

**利用性质 1：** 将近平面上的点 $(x, y, n, 1)$ 代入矩阵相乘，结果必须是 $(nx, ny, n^2, n)$。
提取第三行的点乘：
$$Ax + By + Cn + D = n^2$$
因为近平面上 $x, y$ 可以是任意值，等式恒成立的唯一条件是 $A = 0$ 且 $B = 0$。
所以得到方程①：$Cn + D = n^2$

**利用性质 2：** 将远平面中心点 $(0, 0, f, 1)$ 代入矩阵相乘，结果的第三项必须是 $f^2$。
提取第三行的点乘：
$$C(0) + D(0) + Cf + D = f^2$$
所以得到方程②：$Cf + D = f^2$

**解方程组：**
联立方程①和②：
$$\begin{cases} Cn + D = n^2 \\ Cf + D = f^2 \end{cases}$$
解得：$C = n + f$， $D = -nf$

**最终结论：**
将 $A, B, C, D$ 填回矩阵，得到完整且优美的挤压矩阵：
$$M_{persp \to ortho} = \begin{pmatrix} n & 0 & 0 & 0 \\ 0 & n & 0 & 0 \\ 0 & 0 & n+f & -nf \\ 0 & 0 & 1 & 0 \end{pmatrix}$$

最后，完整的透视投影矩阵即为：
$$M_{persp} = M_{ortho} M_{persp \to ortho}$$


在真实的 3D 世界里，刚好站在视锥体“正中间”的物体，经过矩阵挤压后，它在新的正交长方体里的位置，会远远偏向背后的“远平面”。

##### 压缩例子：

假设相机的参数如下（忽略正负号，仅看绝对距离）：
- **近平面 (n)** = 10 米
- **远平面 (f)** = 100 米

我们在真实的 3D 空间中取三个关键点，代入公式观察它们挤压后的新深度：

1. **点 A（贴在近平面）：** 真实深度 $z = 10$
   $$Z' = (10+100) - \frac{1000}{10} = 110 - 100 = \textbf{10}$$
   *(结论：近平面上的点，挤压前后深度不变)*

2. **点 C（贴在远平面）：** 真实深度 $z = 100$
   $$Z' = (10+100) - \frac{1000}{100} = 110 - 10 = \textbf{100}$$
   *(结论：远平面上的点，挤压前后深度不变)*

3. **点 B（站在绝对正中间）：** 真实深度 $z = 55$ （10 和 100 的中点）
   $$Z' = (10+100) - \frac{1000}{55} = 110 - 18.18 \approx \textbf{91.82}$$

从计算结果可以得知，压缩后的深度 $z$  更靠近远端。