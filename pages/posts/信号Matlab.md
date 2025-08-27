---
title: 信号的Matlab编程
date: '2025-02-25 00:00:00 +0800'
updated: '2025-07-10 21:24:43 +0800'
categories: 笔记
tags:
  - 笔记
  - 信号与系统
  - 速通
  - matlab
codeHeightLimit: 350
cover: 'https://pic.akorin.icu/封面3.png'
end: true
time_warning: true
---

记录基于Matlab的有关信号的编程

<!-- more -->

## 矩阵运算

- `*`:  普通的矩阵运算，如1xn和mx1的矩阵相乘得到nxm的矩阵
- `.*`: 对矩阵内的每个元素对应相乘
- `:  矩阵求转置

## 绘制图像
### 连续信号

$$
f(t)=5e^{-0.8t}\sin(\pi t),0<t<5
$$

```matlab
a=5;
b=0.8;
t=0:0.01:5;
x=b*exp(-a*t).*sin(pi*t);
figure(1);
plot(t, x);
```
![](https://pic.akorin.icu/20250225210740529.png)

### 离散信号

$$
f(t)=2(0.8)^{k},-5<k<5
$$

```matlab
c=2;
d=0.8;
k=-5:5;
y=c*(0.8).^k;
figure(2);
stem(k, y);
```

![](https://pic.akorin.icu/20250225210818824.png)


```matlab
t=0:0.01:5;
```
取值范围从0到5，且步长取0.01，当省略步长，则默认为1

```matlab
x=b*exp(-a*t).*sin(pi*t);
```
与括号相邻的乘除（*或/）前面都要加点号（.*或./）

:::warning

矩阵和矩阵之间对应的元素之间的运算，在运算符(*、/、^)前也要加点号(.*、./、.^)

:::


### 函数

- `plot(t,x);` 绘制连续曲线图像
- `stem(k,y);` 绘制离散图像
- `ezplot(表达式);` 绘制使字符表达式等于0的隐函数曲线，无需准备数据
- `figure(n);` 简历画布
- `subplot(a,b,c);` 将画布分为a行b列并在c块上绘制

## 利用卷积与变换（拉氏变换、Z变换）求解
### 拉普拉斯变换

计算
$$
f_1(t)=e^{-t}\varepsilon(t),f_2(t)=te^{-\frac{1}{2}t}\varepsilon(t)
$$
的卷积

```matlab
syms t;                     %新建一个符号变量
t=sym('t','positive');      %设置符号变量的属性：字符串t为符号变量且为正
fs1=laplace(exp(-t));       %求函数f1的拉氏变换fs1
fs2=laplace(t*exp(-t));     %求函数f1的拉氏变换fs1
yt=simplify(ilaplace(fs1*fs2)); %求拉式反变换
ezplot(yt);                     %绘制变换后的图像
```
![](https://pic.akorin.icu/20250225211440024.png)


### 离散信号Z变换

求函数
$$
f(k)=\cos(ak)\varepsilon(k)
$$
的Z变换

```matlab
syms k a;
k=sym('k','positive');
f=cos(a*k);
F=ztrans(f)
```
输出：
```matlab
(z*(z - cos(a)))/(z^2 - 2*cos(a)*z + 1)

```
---
求函数

$$
F(z)=\frac{1}{(z+1)^2}
$$

的逆Z变换
```matlab
syms z;
F=1/(1+z)^2;
f=iztrans(F)
```

输出：

```matlab
kroneckerDelta(n, 0) + (-1)^n*(n - 1)
```

### 函数

- `syms`  定义符号变量，即一个自变量，不带入具体数值，是一个字符或字符串，最后的计算结果也不是固定值，而是表达式，
- `laplace(表达式);` 求拉氏变换，输出一个字符串表达式
- `ilaplace(表达式);` 求拉氏反变换，输出一个字符串表达式
- `simplify(表达式);` 将表达式化为最简形式
- `ztrans(表达式);` 求Z变换，返回一个字符串表达式
- `iztrans(表达式);` 求逆Z变换，返回一个字符串表达式

## 求卷积（利用变换求）

$$
f_1(t)=
\begin{cases}
    2,0<t<1 \\
    0,else
\end{cases},
f_2(t)=
\begin{cases}
    t,0<t<2 \\
    0,else
\end{cases}
$$
用MATLAB画出 $f_1(t)*f_2(t)$

```matlab
t1=0:0.001:1;
t2=0:0.001:2;
ft1=2*rectpuls(t1-0.5,1);
ft2=t2;
ft3=0.001*conv(ft1,ft2);
t3=0:0.001:3;
plot(t3,ft3);
title('ft1(t)*ft2(t)')
```
![](https://pic.akorin.icu/20250225214019300.png)

:::warning
matlab用conv函数求卷积时，要在前面乘上采样间隔才正确
:::

求
$$
x_1(k)=\sin(k),0\le k\le 10 \quad x_2(k)=0.8^k,0\le k\le 15
$$
的卷积
```matlab
k1=0:10;k2=0:15;
x1=sin(k1);
x2=0.8.^k2;
y=conv(x1,x2);
k=0:25;
subplot(3, 1, 1);stem(k1,x1);
subplot(3, 1, 2);stem(k2,x2);
subplot(3, 1, 3);stem(k,y);
```
![](https://pic.akorin.icu/20250225215129580.png)

```matlab
x2=0.8.^k2;
x2=0.8^k2;  %[!code error]
```
由于k2是一个矩阵，不能直接用运算符与之做运算，需要在运算符前加一个点号表明将矩阵的每个元素分别做运算

### 函数

- `rectpuls(t-a,1);` 产生方波信号，宽度为1，中心点移到t=a处，幅度默认为1，在函数前乘系数可得不同幅度，t为时间范围
- `square(a*t,duty);` 产生**周期**方波信号，a=1时，周期为 $2\pi$ ，峰值为 $\pm1$ ；duty为占比单位是%，取0-100
- `conv(ft1,ft2);` 求这两个函数的卷积结果

:::warning

Matlab中的卷积函数conv(f1,f2)不区分离散和连续，都按照离散的形式来计算

:::

## 绘制零极点图
### 连续系统

$$
H(s)=\frac{s^2+4s+3}{s^4+3s^3+4s^2+6s+4}
$$

```matlab
b=[1 4 3];          %分子系数矩阵，且为高次向低次
a=[1 3 4 6 4];      %分母系数矩阵
sys=tf(b,a);
pzmap(sys);
sgrid;
zap=roots(a);
```
![](https://pic.akorin.icu/20250225225143483.png)

### 离散系统

$$
H(z)=\frac{z^{-1}+2z^{-2}+z^{-3}}{1-0.5z^{-1}-0.005z^{-2}+0.3z^{-3}}
$$

```matlab
b=[1 2 1];
a=[1 -0.5 -0.005 0.3];
figure(1);
zplane(b,a);
title('零极点分布图');
num=[0 1 2 1];
den=[1 -0.5 -0.005 0.3];
h=impz(num,den);
figure(2);
stem(h,'.');
title('冲激响应图');
[H,w]=freqz(num,den);
figure(3);
plot(w/pi,abs(H));
title('幅频响应');
```

<div class="flex flex-col">

<div class="flex grid-cols-2 justify-center items-center">

![](https://pic.akorin.icu/20250225235445908.png)

![](https://pic.akorin.icu/20250225235457967.png)

![](https://pic.akorin.icu/20250225235507923.png)

</div>

</div>

```matlab
stem(h,'.');
```
h是要绘制的离散数据；'.'表示一个字符串，指定绘制数据点的标记样式

### 函数

- `tf(b,a);` 生成系统函数，b为分子系数向量，a为分母系数向量
- `pzmap(sys);` 绘制连续系统函数sys的零极点图
- `sgrid;` 绘制极坐标网格
- `zap=roots(a);` 求出零极点
- `zplane(b,a);` 绘制离散系统零极点分布图，分子不含常数项
- `h=impz(num,den);` 计算和绘制离散时间系统的单位脉冲响应（冲激响应），分子包含常数项
- `[H,w]=freqz(num,den);` 求频率响应，分子包含常数项，结果有幅值及对应的角频率

## 求响应（已知系统函数）
### 连续函数

已知

$$
H(s)=\frac{1}{s^3+2s^2+3s+1}
$$

画出零极点分布，并求单位冲激响应h(t)和频率冲激响应 $H(j\omega)$，并判断系统是否稳定

```matlab
num=[1];
den=[1 2 3 1];
sys=tf(num,den);
poles=roots(den);

figure(1);
pzmap(sys);
sgrid;
title('Pole and Zero');
t=0:0.02:10;
h=impulse(num,den,t);

figure(2);
plot(t,h);
title('impulse Respone');
[H,w]=freqs(num,den);

figure(3);
plot(w,abs(H));     %横坐标为角频率w，纵坐标为幅度H的绝对值
title('Frequency Spectrum');
```

<div class="flex flex-col">

<div class="flex grid-cols-2 justify-center">

![](https://pic.akorin.icu/20250227152233684.png)

![](https://pic.akorin.icu/20250227152306961.png)

![](https://pic.akorin.icu/20250227152317892.png)

</div>

</div>

```matlab
plot(w,abs(H));     %横坐标为角频率w，纵坐标为幅度H的绝对值
```
必须要有绝对值才是求幅频响应

### 离散函数

$$
H(j\omega)=\frac{1-j\omega}{1+j\omega} \quad f(t)=\sin(t)+\sin(3t)
$$

```matlab
t=0:pi/100:4*pi
b=[-1,1];
a=[1,1];
ft=sin(t)+sin(3*t);
yt=lsim(b,a,ft,t);
subplot(2,1,1);
plot(t,ft);
title('激励');
subplot(2,1,2);
plot(t,yt);
title('响应');
```
![](https://pic.akorin.icu/20250227153908502.png)

### 函数

- `impulse(num,den,t);` 计算和绘制连续时间系统的单位脉冲响应，同时输入也可以最直接接入tf函数定义的传递函数impulse(tf(sys));
- `lsim(b,a,ft,t);` 模拟和绘制线性时不变对任意输入信号响应

## 根据状态方程求解函数响应
### 连续系统

$$
\begin{bmatrix}
  \dot{x}_1(t) \\
  \dot{x}_2(t)
\end{bmatrix}
=
\begin{bmatrix}
  -2 & -2 \\
  1 & 0
\end{bmatrix}
\begin{bmatrix}
  {x}_1(t) \\
  {x}_2(t)
\end{bmatrix}
+\begin{bmatrix}
  10 \\
  0
\end{bmatrix}f(t)

$$

$$

y(t)=\begin{bmatrix}
  1 & 0
\end{bmatrix}
\begin{bmatrix}
  {x}_1(t) \\
  {x}_2(t)
\end{bmatrix}
$$

其中系统输入为：

$$
f(t)=t\varepsilon(t)
$$

初始状态为：

$$
\begin{bmatrix}
  {x}_1(0) \\
  {x}_2(0)
\end{bmatrix}
=
\begin{bmatrix}
  5 \\
  0
\end{bmatrix}
$$


```matlab
%%%% 求零输入响应 %%%%
A=[-2 -2;1 0];
B=[10;0];
C=[1 0];
D=[0];
v0=[5;0];
t=0:0.01:5;
X=[0*ones(size(t))];          %输入
[y,v]=lsim(A,B,C,D,X,t,v0);
subplot(2,1,1);
plot(t,y);
grid;
xlabel('t');
ylabel('y');
title('零输入响应')
%%%% 求零状态响应 %%%%
v0=[0;0];
X=[1*t];                      %输入
[y,v]=lsim(A,B,C,D,X,t,v0);
subplot(2,1,2);
plot(t,y);
grid;
xlabel('t');
ylabel('y');
title('零状态响应')
```
![](https://pic.akorin.icu/20250227160441605.png)

### 离散系统

$$
\begin{bmatrix}
  x_1(k+1) \\
  x_2(k+1)
\end{bmatrix}
=
\begin{bmatrix}
  0 & 1 \\
  -1 & 1.9021
\end{bmatrix}
\begin{bmatrix}
  x_1(k) \\
  x_2(k)
\end{bmatrix}
+
\begin{bmatrix}
  1 \\
  0
\end{bmatrix}
\begin{bmatrix}
  f(k)
\end{bmatrix}

$$
$$


y(k)=
\begin{bmatrix}
  -1 & 1
\end{bmatrix}

\begin{bmatrix}
  x_1(k) \\
  x_2(k)
\end{bmatrix}

\quad

\begin{bmatrix}
  x_1(0) \\
  x_2(0)
\end{bmatrix}
=
\begin{bmatrix}
  -10  \\
  -4
\end{bmatrix}
$$

```matlab
A=[0 1;-1 1.9021];
B=[1;0];
C=[-1 1];
D=[0];
k=0:1:40;
v0=[-10;-4];
X=[1*ones(size(k))];
[y,v]=dlsim(A,B,C,D,X,v0);
stem(k,y);
xlabel('k');
ylabel('y');
title('全响应')
```
![](https://pic.akorin.icu/20250227161354348.png)

## 实现Sa信号的采样和恢复

:::tip Sa信号恢复

$$
f(t)=T_s\frac{\omega_c}{\pi}\sum\limits_{n=-\infty}^{\infty}f(nT_s)Sa[\omega_c(t-nT_s)]
$$

其中 $T_s$ 是采样周期， $\omega_c$ 是低通滤波器的截止频率，一般取信号的最大频率
:::

e.g 信号sa(t)作为被采样信号，信号带宽B=1，即信号的最大角频率为1，采样频率 $\omega_s=2B$ ，此频率下的采样为Nyquist采样，对采样及恢复过程用Matlab进行仿真

```matlab
ws=2;wm=1;
Ts=2*pi/ws;
N=50;
n=-N:N;
nTs=n.*Ts;
fs=pi*sinc(wm*nTs/pi);
t=-6*pi:0.001:6*pi;
%%%% 信号重构 %%%%
f=fs*1/pi*pi*sinc(1/pi*(ones(length(nTs),1)*t-nTs'*ones(1,length(t))));
error=abs(f-pi*sinc(t/pi));
subplot(3,1,1);plot(t,pi*sinc(t/pi));
title('Sa函数原始信号')
subplot(3,1,2);plot(t,f);
title('恢复信号')
subplot(3,1,3);plot(t,error);
title('恢复信号与原信号之间的差值');
```
![](https://pic.akorin.icu/20250308212833536.png)

```matlab
f=fs*1/pi*pi*sinc(1/pi*(ones(length(nTs),1)*t-nTs'*ones(1,length(t))));
```
在这段代码中利用矩阵的性质，实现求和

```matlab
ones(length(nTs),1)*t
```
这段是nx1的矩阵乘上1xm的矩阵得到nxm的矩阵，此时这个矩阵上的点都是t的点，每一列上对应不同的时间点
```matlab
nTs'*ones(1,length(t))
```
nTs的转置再乘上ones函数，将nTs矩阵扩展成nxm，此时上面的矩阵都是nTs的点，每一行对应不同的nTs的时间点

两式相减后，每一列就是在单个时间t的点上t-nTs的集合，前面的fs的点数和nTs相同，fs再和后面得到的sinc的矩阵就能得到每个时间t点对应的sinc(t-nTs)的和

### 函数

- `fs=sinc(nTs/pi);` 即辛格函数，sinc函数与Sa函数的数学表达形式相同，有时会区分归一化sinc函数和非归一化sinc函数，而在matlab中`sinc`是归一化sinc函数
  - 非归一化sinc函数
  $$
  sinc(x)=\frac{\sin(x)}{x}
  $$
  - 归一化sinc函数
  $$
  sinc(x)=\frac{\sin(\pi x)}{\pi x}
  $$

## 对任意信号的采样频谱分析及恢复

$$
f(t)=\sin(2\pi f_0 t)+ \frac{1}{3} \sin(6\pi f_0 t)
$$

求该信号的频谱并在采样信号

$$
Fs>2f_m,F_s=2f_m,Fs<2f_m
$$

的情况下绘制采样波形以及对采样后的信号进行恢复。其中 $f_0=1Hz$，取最高有限带宽频率 $f_m=5f_0$

```matlab
clc;clear;close all;

% 信号常量
f0=1;
fm=5*f0;
Fs1=5*fm;Fs2=2*fm;Fs3=1*fm;
tl=-2;th=2;
t=tl:0.001:th;
nTs1=tl:1/Fs1:th;
nTs2=tl:1/Fs2:th;
nTs3=tl:1/Fs3:th;

% 原始信号和采样信号

f=sin(2*pi*f0*t)+(1/3)*sin(6*pi*f0*t);

fs1=sin(2*pi*f0*nTs1)+1/3.*sin(6*pi*f0*nTs1);
fs2=sin(2*pi*f0*nTs2)+1/3.*sin(6*pi*f0*nTs2);
fs3=sin(2*pi*f0*nTs3)+1/3.*sin(6*pi*f0*nTs3);

figure;
subplot(4,1,1);
plot(t,f);
title('原信号');

subplot(4, 1, 2);
stem(nTs1,fs1,'.');
subplot(4, 1, 3);
stem(nTs2,fs2,'.');
subplot(4, 1, 4);
stem(nTs3,fs3,'.');

% fft求各采样信号的频谱

x1=fftshift(fft(fs1));f1=linspace(-Fs1/2,Fs1/2,length(x1));
x2=fftshift(fft(fs2));f2=linspace(-Fs2/2,Fs2/2,length(x2));
x3=fftshift(fft(fs3));f3=linspace(-Fs3/2,Fs3/2,length(x3));

% 绘图

figure;
subplot(3, 1, 1);
stem(f1,2.*abs(x1)/length(x1),'.');
xlabel('f/Hz');ylabel('幅值');

subplot(3, 1, 2);
stem(f2,2.*abs(x2)/length(x2),'.');
xlabel('f/Hz');ylabel('幅值');

subplot(3, 1, 3);
stem(f3,2.*abs(x3)/length(x3),'.');
xlabel('f/Hz');ylabel('幅值');

% 重建信号并求绘图

F1=fs1*1/Fs1*2*pi*fm/pi*sinc(1/pi*2*pi*fm*(ones(length(nTs1),1)*t-nTs1'*ones(1,length(t))));
figure;
subplot(311);
plot(t, F1,'r',t,f,'b');

F2=fs2*1/Fs2*2*pi*fm/pi*sinc(1/pi*2*pi*fm*(ones(length(nTs2),1)*t-nTs2'*ones(1,length(t))));
subplot(312);
plot(t, F2,'r',t,f,'b');

F3=fs3*1/Fs3*2*pi*fm/pi*sinc(1/pi*2*pi*fm*(ones(length(nTs3),1)*t-nTs3'*ones(1,length(t))));
subplot(313);
plot(t, F3,'r',t,f,'b');
```


<div class="flex flex-col">
<div class="flex grid-cols-2 justify-center items-center">

![](https://pic.akorin.icu/20250310170814974.png)

![](https://pic.akorin.icu/20250310170821224.png)

![](https://pic.akorin.icu/20250310170845805.png)

</div>
</div>

## 求群时延

```matlab
clc;clear;close all;

b=[100*2e-9];
a=[22e-6*2e-9,100*2e-9,1];

[h,w]=freqs(b,a);

%% 普通画图：

% figure;
% subplot(2, 1, 1);
% loglog(w,20*log10(abs(h)));
% ylabel('幅值(dB)')
% xlabel('频率(rad/s)')
% title('幅频响应');
% subplot(2, 1, 2);
% plot(w, 180*angle(h)/pi);
% axis([1e6,1e8,-180,0]);
% ylabel('角度')
% xlabel('频率(rad/s)')
% title('相频响应');

%% 直接利用freqs生成图更美观

figure;
freqs(b,a);

%% 扩展w的个数，使画图更准确
figure;
w=linspace(w(1),w(end),length(w)*1000);
[h1,w1]=freqs(b,a,w);
groupDelay = -gradient(angle(h1),w1)/360;
grid on

%% 生成对x取10为对数的坐标的图
semilogx(w,groupDelay)
ylabel('延迟')
xlabel('频率(rad/s)')
```

### 函数

- `gradient`: 用法：`[FX,FY] = gradient(F,H)` 或 `Fx = gradient(F,H)` 以H对离散点F求导

```matlab
groupDelay = -gradient(angle(h1),w1)/360;
```
满足了群时延的定义，即角度对角频率的负导数即为群时延。群时延是系统三大特征之一（另外两个分别是幅频响应和相频响应），群时延标志着信号中的频率分量通过系统的时间。全通系统的作用就是用来对信号中某些频率分量的延时。
