% ���ɾ�ݲ������ǲ�

T=1; % ����]
Fs=100; % ����Ƶ��
f=1/T; % Ƶ��

dt=0:T/Fs:T*2; % ʱ������

x1=sawtooth(2*pi*f*dt);
x2=sawtooth(2*pi*f*dt,0.5);
plot(dt,x1);
title('��ݲ�');
figure;
plot(dt,x2);
title('���ǲ�');