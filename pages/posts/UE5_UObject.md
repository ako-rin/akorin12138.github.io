---
layout: post
title: UE5 UObject
date: 2026-03-25 21:00:34
updated: 2026-03-29 01:14:38
categories: UE5
tags:
  - UE5
  - 笔记
  - 生命周期
cover: 'https://pic.yurin.cc/7bc3fda721e28bb30b3ffc44a1664919.webp'
time_warning: false
end: false
---

# 前言

`UObeject` 算是 UE5 的万物起源了，几乎所有的东西都是由 `UObject` 派生的。

- 提供元数据
- 反射生成
- GC垃圾回收
- 序列化
- 编辑器可见

[UE5 源码参考](https://github.com/EpicGames/UnrealEngine)

<!-- more -->

## 