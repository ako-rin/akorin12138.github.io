---
title: 数字信号处理Matlab编程
date: 2025-03-03 00:00:00
updated: 2025-03-28 22:54:31
categories: 笔记
tags:
  - 笔记
  - 数字信号处理
  - matlab
cover: 'https://pic.akorin.icu/封面4.png'
end: false
---

记录数字信号处理有关的Matlab代码

<!-- more -->

# 数字信号处理Matlab

---

## 数字滤波器的设计方法

:::warning

有关数字滤波的函数输入都是归一化的频率而不是角频率，有关模拟滤波的函数输入都是角频率

:::

有两种数字滤波器：
- iir   无限长冲激响应滤波器
- fir   有限长冲激响应滤波器

iir 的设计方法：
- 冲激响应不变法
  - 两种模拟滤波器：巴特沃斯滤波器、切比雪夫滤波器
  - 不能设计高通和带阻滤波器
- 双线性变换法

fir 的设计方法：
- 窗函数法
  - 须确保窗长度为奇数，即确保阶数为偶数
- 频率取样法

:::tip 带通滤波器的中心频率计算
带通滤波器下限频率和上限频率的几何平均值
$$
\omega_0=\sqrt{\omega_{p_1}\omega_{p_2}}
$$
:::

:::tip 带通滤波器的上下截止频率计算
近似为阻带截止频率和通带截止频率和的一半
$$
\omega_c=\frac{\omega_s+\omega_p}{2}
$$
:::


### 所需的函数

#### `buttord`

生成对应标准型巴特沃斯的阶数和截止频率

> 语法：
- `[n,Wn] = buttord(Wp,Ws,Rp,Rs)`
- `[n,Wn] = buttord(Wp,Ws,Rp,Rs,'s')`
- `[n,Wn] = buttord(Wp,Ws,Rp,Rs,'z')`

> 参数：
- Wp: 通带截止频率，模式为数字滤波器时，输入需归一化；模式为模拟滤波器时，输入单位是rad/s
- Ws: 阻带截止频率，模式为数字滤波器时，输入需归一化；模式为模拟滤波器时，输入单位是rad/s
- Rp: 通带衰减
- Rs: 阻带衰减
- 's': 设定为模拟类型的滤波器，缺省则默认为数字滤波器
- 'z': 设定为数字类型的滤波器，缺省则默认为数字滤波器

> 返回值：
- n:  返回巴特沃斯的最低阶数
- Wn: 返回截止频率的标量（-3dB位置）


:::warning 归一化
输入范围为0~1，其中1对应 $\pi$ 弧度/采样点，即最大频率或最小采样频率/2（奈奎斯特频率）

归一化频率计算公式：
$$
f_{norm}=\frac{f}{\frac{fs}{2}}=\frac{f}{f_{Nyquist}}
$$
归一化的单位是Hz/样本，直接乘上 $\pi$ 转化成弧度则为：rad/样本，即
$$
\omega = f_{norm} \times \pi
$$
本质上是一个比例，不是物理上确切的单位
:::

:::tip 归一化频率转化为原始频率
对于f 频率来说：
$$
f=f_{norm} \times \frac{fs}{2}
$$
对于 $\omega$ 角频率来说：
$$
\omega = 2\pi f= 2\pi\times f_{norm}\times \frac{f_s}{2} =2\pi \times  \frac{\omega_{norm}}{\pi} \times \frac{f_s}{2}=\omega_{norm} \times f_s
$$
:::

#### `buttap`

> 语法：
- `[z,p,k] = buttap(n)`

> 参数：
- n:  巴特沃斯滤波器阶数

> 返回值：
- z:  模拟滤波器的极点
- p:  模拟滤波器的零点
- k:  模拟滤波器的增益


#### `zp2tf`

将零极点增益参数转化为传递函数的形式

> 语法：
- `[b,a] = zp2tf(z,p,k)`

> 参数：
- z:  模拟滤波器的极点
- p:  模拟滤波器的零点
- k:  模拟滤波器的增益

> 返回值：
- b:  传递函数分子的系数
- a:  传递函数分母的系数

#### `freqs`

求出模拟滤波器的频率响应

> 语法：
- `h = freqs(b,a,w)`
- `[h,wout] = freqs(b,a,n)`
- `freqs(___)`

> 参数：
- b:  传递函数分子的系数
- a:  传递函数分母的系数
- w（可选）:  角频率w处计算复频率响应
- n（可选）:  使用n个频率点计算h并在wout中返回对应角频率，缺省默认是200

> 返回值：
- h:  返回由b和a指定的模拟滤波器在角频率w处计算得到的复频率响应
- wout: 返回使用n个频率点计算h得到的角频率
- freqs(___): 不带返回值参量，直接在窗口中以角频率的函数形式绘制幅频响应曲线和相频响应曲线


#### `freqz`

求出模拟滤波器的频率响应

> 语法：
- `h = freqz(b,a,w)`
- `[h,w] = freqz(b,a,n)`
- `[h,w] = freqz(b,a,n,fs)`
- `[h,w] = freqz(b,a,n,"whole")`
- `[h,w] = freqz(b,a,n,"whole",fs)`
- `freqz(___)`

> 参数：
- b:  传递函数分子的系数
- a:  传递函数分母的系数
- w（可选）:  **归一化**的角频率w处计算复频率响应
- n（可选）:  使用n个频率点计算h并在wout中返回对应角频率，缺省默认是200
- "whole"（可选）: 返回整个单位圆n个采样点的频率响应，即返回(0~2 $\pi$ 的采样点，缺省时返回的是0~ $\pi$ 的采样点)

> 返回值：
- h:  返回由b和a指定的模拟滤波器在角频率w处计算得到的复频率响应
- wout: 返回使用n个频率点计算h得到的角频率
- freqs(___): 不带返回值参量，直接在窗口中以角频率的函数形式绘制幅频响应曲线和相频响应曲线


#### `lp2lp`
标准的巴特沃斯模拟低通滤波器原型转换为具有指定截止频率的模拟低通滤波器。通过zp2tf生成的标准巴特沃斯低通滤波器的截止频率通常是1rad/s，因此需要转换成所需要的

> 语法：
- `[bt,at] = lp2lp(b,a,Wo)`
- `[At,Bt,Ct,Dt] = lp2lp(A,B,C,D,Wo)`

> 参数：
- b: 转换前的传递函数分母的系数
- a: 转换前的传递函数分子的系数
- wo: 新的滤波器截止频率

> 返回值：
- bt: 转换后的新的传递函数分母的系数
- at: 转换后的新的传递函数分子的系数

#### `lp2hp`

转换成特定截止频率的高通滤波器

#### `lp2bp`
转换成特定截止频率的带通滤波器


> 语法：
- `[B1,A1]=lp2bp(num1, den1, Wo, bw)`

> 参数：
- Wo: 带宽的中心频率
  - 一般是几何平均

:::warning
与fir带通数字滤波器相比，lp2bp的Wo传输的值是通带的中心频率，而fir1中的Wn传输的是上下通带的截止频率
:::

#### `lp2bs`

转换成特定截止频率的带阻滤波器

> 语法：
- `[bt,at] = lp2bs(b,a,Wo,Bw)`

> 参数：
- Wo: 阻带的中心频率
  - 一般是几何平均

#### `impinvar`

脉冲响应不变法将模拟滤波器转换为数字滤波器

> 语法：
- `[bz,az] = impinvar(b,a,fs)`

> 参数：
- b: 模拟滤波器传递函数的分母
- a: 模拟滤波器传递函数的分子
- fs: 采样频率

> 返回值：
- bz: 数字滤波器传递函数的分母
- az: 数字滤波器传递函数的分子

#### `bilinear`

双线性变换法将模拟滤波器转换为数字滤波器

> 语法：
- `[zd,pd,kd] = bilinear(z,p,k,fs)`
- `[numd,dend] = bilinear(num,den,fs)`

> 参数：
- z:  模拟滤波器的极点
- p:  模拟滤波器的零点
- k:  模拟滤波器的增益
- fs: 采样频率
- num:  模拟滤波器传递函数分母
- den:  模拟滤波器传递函数分子

> 返回值：
- zd: 数字域的极点
- pd: 数字域的零点
- kd: 数字域的增益
- numd: z域传递函数分母
- dend: z域传递函数分子
#### `cheb1ord`

生成对应的标准型I型切比雪夫滤波器

> 语法：
- `[n,Wn] = cheb1ord(Wp,Ws,Rp,Rs)`
- `[n,Wn] = cheb1ord(Wp,Ws,Rp,Rs,'s')`
- `[n,Wn] = cheb1ord(Wp,Ws,Rp,Rs,'z')`

> 参数：
- Wp: 通带截止频率，模式为数字滤波器时，输入需归一化；模式为模拟滤波器时，输入单位是rad/s
- Ws: 阻带截止频率，模式为数字滤波器时，输入需归一化；模式为模拟滤波器时，输入单位是rad/s
- Rp: 通带衰减
- Rs: 阻带衰减
- 's': 设定为模拟类型的滤波器，缺省则默认为数字滤波器
- 'z': 设定为数字类型的滤波器，缺省则默认为数字滤波器

> 返回值：
- n:  对应切比雪夫滤波器的阶数
- Wn: 对应的截止频率

#### `ceil`

> 语法：
- `Y = ceil(X)`

> 参数：
- X: 元素值，也可以是数组

> 返回值：
- Y: X的四舍五入值，或者数组里的每个元素四舍五入后的值

:::warning
窗的长度=fir滤波器的阶数+1
:::

#### `triang`

三角窗

#### `blackman`

布莱克曼窗

#### `hamming`

海明窗

#### `fir1`

基于窗函数的 FIR 滤波器设计

> 语法：
- `b = fir1(n,Wn)`
- `b = fir1(n,Wn,ftype)`
- `b = fir1(___,window)`

> 参数：
- n:  fir滤波器的阶数。对于**高通**和**带阻**滤波器，fir1 始终使用偶数阶滤波器。此时阶数必须是偶数，因为奇数阶对称 FIR 滤波器在奈奎斯特频率下必须具有零增益。如果为高通或带阻滤波器指定奇数 n，则 fir1 将 n 增加 1。
- Wn: 通带截止频率
- ftype:  滤波器类型，缺省默认为低通滤波器
  - 'high'
  - 'low'
  - 'bandpass'
  - 'stop'
- window: 窗函数类型，缺省默认为汉明窗

#### `mod`

> 语法：
- `b = mod(a,m)`

> 参数：
- a:  被除数
- m:  除数

> 返回值：
- b:  余数

### 数字滤波器设计

:::details 完整代码

:::code-group

<<< @/code/matlab/digitalSignalProcessing/iir_bp.m{matlab}[iir带通设计]
<<< @/code/matlab/digitalSignalProcessing/fir_bs.m{matlab}[fir带阻设计]
<<< @/code/matlab/digitalSignalProcessing/bs.m{matlab}[fir、iir带阻设计]

:::

<div class="flex flex-col">
<div class="flex grid-cols-2 justify-center items-center">

![](https://pic.akorin.icu/20250306165711447.png)

![](https://pic.akorin.icu/20250306165728680.png)

</div>
</div>

<div class="flex flex-col">
<div class="flex grid-cols-2 justify-center items-center">

![](https://pic.akorin.icu/20250306165837959.png)

![](https://pic.akorin.icu/20250306165846804.png)

</div>
</div>

![](https://pic.akorin.icu/20250306165536593.png)

## 生成各种信号的设计方法

:::warning

需要注意每个生成波形的函数的输入都是角频率乘时间即输入都是 $\omega\times t$

:::

### 所需函数

#### `rand`

返回一个在区间 (0,1) 内均匀分布的随机数

> 语法：
- `x=rand(n)`
- `x=rand(a,n)`

> 参数：
- a:  序列矩阵的维度
- n:  序列矩阵长度，当a缺省时生成nxn的随机数矩阵

> 返回值：
- x:  输出的序列

#### `randn`

返回一个从标准正态分布中得到的随机标量，均值为0方差为1

> 语法：
- `x=randn(n)`
- `x=randn(a,n)`

> 参数：
- a:  序列矩阵的维度
- n:  序列矩阵长度，当a缺省时生成nxn的随机数矩阵

> 返回值：
- x:  输出的序列

#### `rectpuls`

生成方波信号

> 语法：
- `y = rectpuls(t0,w)`

> 参数：
- t0: 方波中心点
- w:  宽度

#### `square`

生成周期方波信号

> 语法：
- `x = square(w*t,duty)`

> 参数：
- w*t:  w为方波信号的角速度，对应的周期为 $T=\frac{2\pi}{\omega}$ ，t为时间参数（一维向量）
- duty: 方波信号的周期

> 返回值：
- x:  对应时间参数t的一系列幅值，幅值范围为-1~1

#### `sawtooth`

生成锯齿波信号

> 语法：
- `x = sawtooth(w*t,xmax)`

> 参数：
- xmax: 峰值位置范围0~1，当设置为0.5时，生成标准三角波，缺省时，xmax默认为1

### 生成常用波形

:::details 完整代码

:::code-group

<<< @/code/matlab/digitalSignalProcessing/impulse_t.m{matlab}[阶跃响应]
<<< @/code/matlab/digitalSignalProcessing/square_duty.m{matlab}[方波设计]
<<< @/code/matlab/digitalSignalProcessing/sawtooth_t.m{matlab}[锯齿波/三角波设计]

:::

![](https://pic.akorin.icu/20250306191320790.png)

<div class="flex flex-col">
<div class="flex grid-cols-2 justify-center items-center">

![](https://pic.akorin.icu/20250306191224974.png)

![](https://pic.akorin.icu/20250306191232702.png)

</div>
</div>

<div class="flex flex-col">
<div class="flex grid-cols-2 justify-center items-center">

![](https://pic.akorin.icu/20250306191351382.png)

![](https://pic.akorin.icu/20250306191358180.png)

</div>
</div>




## 求解各种系统函数的阶跃响应、冲激响应
### 所需函数

#### `impulse`

求解连续系统的冲激响应

> 语法：
- `impulse(sys)`
- `impulse(sys,Tfinal)`
- `impulse(sys,t)`
- `y = impulse(sys)`
- `[y,t] = impulse(sys)`

> 参数：
- sys:  tf函数生成的系统，也可以将分母系数b、分子系数a填入其中
- Tfinal: 求解0到Tfinal这段时间内的冲激响应
- t:  求解t这段设定的时间向量内的冲激响应

> 返回值：
- y:  求解冲激响应的结果
- t:  求解的结果对应的时间点
-
#### `dimpulse`

求解离散系统的冲激响应

> 语法：
- `dimpulse(sys)`
- `dimpulse(sys,Tfinal)`
- `dimpulse(sys,t)`
- `y = dimpulse(sys)`

> 参数：
- sys:  tf函数生成的系统，也可以将分母系数b、分子系数a填入其中
- Tfinal: 求解0到Tfinal这段时间内的冲激响应
- t:  求解t这段设定的时间向量内的冲激响应

> 返回值：
- y:  求解冲激响应的结果
- t:  求解的结果对应的时间点

#### `impz`

求解数字滤波器系统的冲激响应

#### `step`

求解连续时间系统阶跃响应

> 语法：
- `step(sys)`
- `step(sys,Tfinal)`
- `step(sys,t)`
- `y = step(sys,t)`
- `[y,t] = step(sys)`

> 参数：
- sys:  tf函数生成的系统，也可以将分母系数b、分子系数a填入其中
- Tfinal: 求解0到Tfinal这段时间内的阶跃响应
- t:  求解t这段设定的时间向量内的阶跃响应

> 返回值：
- y:  求解阶跃响应的结果
- t:  求解的结果对应的时间点

#### `dstep`

求解离散时间系统的阶跃响应

> 语法：
- `[Y,X] = dstep(b,a)`
- `[Y,X] = dstep(b,a,t)`

#### `lsim`

求解连续时间系统的全响应

> 语法：
- `y = step(sys,t)`
- `y = step(b,a,t)`
- `[y,t] = step(sys)`
- `[y,t] = step(b,a)`

> 参数：
- sys:  tf的连续系统
- t:    时间范围
- b:    系统函数的分子
- a:    系统函数的分母

#### `dlsim`

求解离散时间系统的全响应

> 语法：
- `[Y,X] = dlsim(b,a,x)`
- `Y = dlsim(b,a,x)`


### 求出冲激响应和阶跃响应以及全响应
（连续系统）求该系统的冲激响应、阶跃响应以及输入为方波的全响应
$$
H(s)=\frac{1}{LCs^2+RCs+1}
$$

（离散系统）已知一个IIR数字低通滤波器的系统函数为

$$
H(z)=\frac{0.1321+0.3963z^{-1}+0.3963z^{-2}+0.1321z^{-3}}{1-0.34319z^{-1}+0.60439z^{-2}-0.20407^{-3}}
$$


:::details 完整代码
:::code-group

<<< @/code/matlab/digitalSignalProcessing/impulse_step.m{matlab}[连续系统]
<<< @/code/matlab/digitalSignalProcessing/impz_dlsim.m{matlab}[离散系统]



:::

<div class="flex flex-col">
<div class="flex grid-cols-2 justify-center items-center">

![](https://pic.akorin.icu/20250306191115726.png)

![](https://pic.akorin.icu/20250306191125325.png)

![](https://pic.akorin.icu/20250307154416448.png)

</div>
</div>

![](https://pic.akorin.icu/20250307160823893.png)

## 转换系统函数的类型
### 所需函数

#### `tf2sos`

将直接型滤波器转化成级联型

> 语法：
- `[sos,g] = tf2sos(b,a)`

> 参数：
- b:  传递函数的分母
- a:  传递函数的分子

> 返回值：
- sos:  级联型的传递函数形式
- g:  增益


#### `residue`

连续域的分式展开（部分分式分解）

> 语法：
- `[r,p,k] = residue(b,a)`

> 参数：
- b:  传递函数分母
- a:  传递函数分子

> 返回值
- r:  新的并联型传递函数的一系列分子
- p:  传递函数的一系列极点
- k:  传递函数的冲激项

#### `residuez`

z域的部分分式展开（部分分式分解）

> 语法：
- `[r,p,k] = residuez(b,a)`

> 参数：
- b:  传递函数分母
- a:  传递函数分子

> 返回值
- r:  新的并联型传递函数的一系列分子
- p:  传递函数的一系列极点
- k:  传递函数的冲激项

### 将直接型系统函数转换成级联型和并联型

$$
H(s)=\frac{s^4-2s^3+30s^2+14s+5}{5s^4+4s^3+4s^2-2s-1}
$$

<<< @/code/matlab/digitalSignalProcessing/res_sos.m{matlab}[转换]


<div class="flex flex-col">
<div class="flex grid-cols-2 justify-center items-center">

![](https://pic.akorin.icu/20250307193448574.png)

![](https://pic.akorin.icu/20250307193512079.png)

</div>
</div>

根据上图的两个结果可得：
$$
H(s)=0.2\frac{s^2-2.4647s+30.9839}{s^2-0.1964s-0.1714} \cdot \frac{s^2+0.4647s+0.1614}{s^2+0.9964s+1.1671}
$$

$$
H(s)=\frac{s+1.0378+1.9180j}{s+0.4982-0.9586j}+\frac{s+1.0378-1.9180j}{j+0.4982+0.9586j}+
$$
$$
\frac{s-2.4360}{s-0.5237}+\frac{s+0.9240}{s+0.3272}+0.2
$$
## 求解频谱
### 傅里叶变换和反变换

在matlab中求某变量的积分，可以用到矩阵乘法

有一非周期方波信号x(t)的脉冲宽度为1ms，信号持续时间为2ms，在0~2ms区间外信号为0。试求其含有20次谐波的信号的频谱特性。求其逆变换并与原时间信号的波形进行比较。

:::details 完整代码

<<< @/code/matlab/digitalSignalProcessing/fuliye.m{matlab}[傅里叶变化]

:::

![](https://pic.akorin.icu/20250307182242524.png)

```matlab
f=-20/2e-3:40/2e-3/N:20/2e-3;   % 20次谐波的频谱范围
```
这里是计算出20次谐波的频谱范围，取N次谐波内的频谱公式为：
$-N\times\frac{1}{T}$ ~ $N\times\frac{1}{T}$

其中T为信号的有效时间范围

```matlab
X=x*exp(-j*t'*w)*dt;            % 傅里叶变换
```
```matlab
y=1/pi*X*exp(j*w'*t)*dw;        % 逆傅里叶变换
```
这两步都实现了积分
```matlab
t'*w
```
这个操作是将t进行转置后与w矩阵相乘，最后得到(n+1)x(n+1)的矩阵，（n+1是因为首尾的点都算进去没有减掉）。这个矩阵可以看作是每个频域点上对应的所有时间对应值的集合，前面的x是1x(n+1)的矩阵，相乘之后得到的结果就是每个频域点上所有时间对应值之和，相当于计算了积分（matlab是离散点计算本质还是求和）

通过这个原理可以解决所有含有积分符号的公式


### 计算两个序列的互相关

互相关函数:
$$
r_{xy}(m)=\sum\limits^\infty_{n=-\infty}x(n)y(n-m)
$$

在matlab中可以先把两个序列分别用fft函数求其频谱，在频域下前一个序列的共轭与另一个序列相乘，得到的结果再ifft后循环移位可得到它们的结果

:::details 完整代码

<<< @/code/matlab/digitalSignalProcessing/fft_rr.m{matlab}[求两个不同序列的互相关]

:::

![](https://pic.akorin.icu/20250327212742259.png)
