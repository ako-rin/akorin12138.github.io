---
layout: post
title: UE5 逐步理解碰撞与委托机制
date: 2026-01-16 02:21:12
updated: 2026-01-19 00:24:05
categories: UE5
tags:
  - UE5
  - 笔记
  - 碰撞
cover: 'https://pic.yurin.cc/a8e43ffb9510d450bebbfdf438bece3e.webp'
time_warning: false
end: false
---

# 前言

在学习 UE5 过程中，还不了解碰撞机理，通过阅读官方文档及源码来逐步理清碰撞产生和委托的机制。

- 了解什么是碰撞通道
- 了解什么是物体对象类型
- 中间组件 `UPrimitiveComponent` 的作用

[UE5 源码参考](https://github.com/EpicGames/UnrealEngine)

<!-- more -->