---
layout: post
title: 虚函数
date: 2026-03-28 22:10:50
updated: 2026-03-30 00:49:23
categories: C++
tags:
  - 虚函数
  - 虚函数表
  - 虚函数指针
  - 八股
cover: 'https://pic.yurin.cc/a8e43ffb9510d450bebbfdf438bece3e.webp'
time_warning: false
end: false
---

# 前言

虚函数是 C++ 实现多态的核心机制，理解虚函数的底层实现对于深入掌握 C++ 的面向对象特性非常重要。

<!-- more -->

## 虚函数表（vtable）

虚函数表是在 **编译时** 由编译器为每个包含了虚函数的类生成一张表格，表格内容存放的是类中每个虚函数的地址。

### 虚表存放的位置

虚函数表存放的位置在 **内存的只读数据段(.rodata)** 即 **静态存储区** 中。

### 虚表的结构

虚函数表