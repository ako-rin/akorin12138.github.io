%   ���ϵͳ�����ĵ�λ��Ծ��Ӧ�͵�λ�弤��Ӧ

clc;clear;close all;

% ϵͳ����
L=22e-3; % ���
C=2000e-12; % ����
R=100; % ����

a=[L*C,R*C,1];  % ϵͳ�����ķ�ĸ
b=1;        % ϵͳ�����ķ���
% t=0:1e-6:2.5e-3;

sys=tf(b,a);

[h0,t0]=impulse(sys);
[h1,t1]=step(sys);

%��ͼ
figure;
plot(t0,h0);
title('��λ�弤��Ӧ');
figure;
plot(t1, h1);
title('��λ��Ծ��Ӧ');
