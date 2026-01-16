---
layout: post
title: UE5 生命周期
date: 2026-01-16 02:35:34
updated: 2026-01-17 02:40:42
tags:
  - UE5
  - 笔记
  - 生命周期
cover: 'https://pic.yurin.cc/7bc3fda721e28bb30b3ffc44a1664919.webp'
time_warning: false
end: false
---

# 前言

理清 UE5 从开始初始化到完全加载游戏，引擎所处理的逻辑，但不深究源码，只概括一个框架。

- 引擎会初始化什么？
- 大致的启动流程是什么？
- 引擎每个层级是怎么样的？
- 反射系统是什么？

[UE5 源码参考](https://github.com/EpicGames/UnrealEngine)

<!-- more -->
