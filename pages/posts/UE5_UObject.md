---
layout: post
title: UE5 UObject
date: 2026-03-25 21:00:34
updated: 2026-03-30 00:49:23
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

## UObject 继承树

首先是总览：

```mermaid
classDiagram
    direction BT
    %% 采用 Bottom-To-Top (从下向上) 排版，最符合 C++ 认爹的视觉直觉

    %% --- 第一层：宏观包 ---
    class UPackage {
        +UMetaData* MetaData
    }
    UPackage --|> UObject

    %% --- 第二层：反射基类 ---
    class UField {
        +UField* Next
    }
    UField --|> UObject

    %% --- 第三层：具体反射类型 ---
    class UEnum {
        +TArray~FNameData~ Names
    }
    UEnum --|> UField

    class UStruct {
        +UStruct* SuperStruct
        +UField* Children
        +FProperty* PropertyLink
    }
    UStruct --|> UField

    %% --- 第四层：终极图纸实体 ---
    class UClass {
        +UObject* ClassDefaultObject
        +TMap~FName, UFunction*~ FuncMap
    }
    UClass --|> UStruct

    class UScriptStruct {
        +ICppStructOps* CppStructOps
    }
    UScriptStruct --|> UStruct

    class UFunction {
        +FNativeFuncPtr Func
        +EFunctionFlags FunctionFlags
    }
    UFunction --|> UStruct

    %% --- 样式与注释 ---
    note for UObject "万物起源"
    note for UStruct "具备『嵌套』能力的复合元数据"
    note for UClass "带有虚表、受 GC 保护的类的说明书"
    
```

```mermaid
graph TD
    %% 定义样式
    classDef instance fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#fff
    classDef meta fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff
    classDef property fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fff

    subgraph InstanceWorld [游戏运行时的内存实例世界]
        Obj_Level[关卡实例: ULevel]:::instance
        Obj_Player[玩家实例: ABlasterCharacter]:::instance
    end

    subgraph MetaWorld [引擎底层的反射图纸世界]
        Meta_ParentClass[父类图纸: ACharacter 的 UClass]:::meta
        Meta_Class[当前类图纸: ABlasterCharacter 的 UClass]:::meta
        
        Prop_Health[属性链表头: Health FProperty]:::property
        Prop_Shield[链表第二项: Shield FProperty]:::property
    end

    %% ================= 核心 4 指针连线 =================
    
    %% 1. Outer (我归谁管)
    Obj_Player -->|"Outer指针<br/>(决定生存周期)"| Obj_Level
    
    %% 2. ClassPrivate (我是谁)
    Obj_Player -->|"ClassPrivate指针<br/>(寻找自身定义)"| Meta_Class
    
    %% 3. SuperStruct (祖先是谁)
    Meta_Class -->|"SuperStruct指针<br/>(向上查找继承链)"| Meta_ParentClass
    
    %% 4. Children (肚子里有什么)
    Meta_Class -->|"Children指针<br/>(获取类成员)"| Prop_Health

    %% 顺带展示一下链表是怎么工作的
    Prop_Health -.->|"Next指针"| Prop_Shield
```

## UObject 生命周期

## 反射系统

## GC

## 序列化

