---
layout: post
title: UE5 网络同步
date: 2026-03-28 22:12:44
updated: 2026-04-02 15:17:26
categories: UE5
tags:
  - UE5
  - 网络同步
  - Client-Server 网络模型
cover: 'https://pic.yurin.cc/9832b3781a054f8e69c53e400791a9fc.webp'
time_warning: false
end: false
---

# 前言

从 UE5.1 开始，UE5 引擎引入了一个叫 `Iris` 的全新网络同步系统，通过桥接的方式兼容原来的 `Replicated` 系统。

复制的最小单位为 `AActor` ， **`UObject` 是没有复制能力的。**

## 前置知识

学习 UE5 网络同步前至少需要了解以下关于计算机网络的知识：
