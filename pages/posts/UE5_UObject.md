---
layout: post
title: UE5 UObject
date: 2026-03-25 21:00:34
updated: 2026-03-31 01:41:49
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

万物继承自 `UObject` 是虚幻引擎内存管理（GC）、序列化和反射体系的基石。所有 `U` `A` 开头的类都继承自它，从而接入了引擎的底层生态。构成反射系统的一个个 “**模块**” （`UField`、`UStruct`、`UClass` 等） 都是 `UObject` 的子类，形成了一个庞大的继承树。

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

### 类的诞生流程

1. 编译期扫描（UHT）
   UHT (Unreal Header Tool) 并不在内存中创建对象，而是扫描 `.h` 文件中的宏定义 (`UCLASS`、`UFUNCTION` 等)
2. 生成反射数据
   扫描后，UHT 自动生成对应的 `.gen.cpp` 文件，文件中包含了类中每个成员 **偏移量、参数大小** 等数据。  
    - 在 `UFUNCTION` 宏标记的成员上，UHT 将其成员（包括输入及返回值）构造成一个结构体（Z开头），并将偏移量存入到结构体内部的 `FuncParams` 中。`FuncParams` 传给 `ConstructUFunction`，最终构建出一个 `UFunction` 对象。
    ```cpp
    // ********** Begin Function ShowSniperScopeWidget Property Definitions ****************************
    void Z_Construct_UFunction_ABlasterCharacter_ShowSniperScopeWidget_Statics::NewProp_bShowScope_SetBit(void* Obj)
    {
        ((BlasterCharacter_eventShowSniperScopeWidget_Parms*)Obj)->bShowScope = 1;
    }
    const UECodeGen_Private::FBoolPropertyParams Z_Construct_UFunction_ABlasterCharacter_ShowSniperScopeWidget_Statics::NewProp_bShowScope = { "bShowScope", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(BlasterCharacter_eventShowSniperScopeWidget_Parms), &Z_Construct_UFunction_ABlasterCharacter_ShowSniperScopeWidget_Statics::NewProp_bShowScope_SetBit, METADATA_PARAMS(0, nullptr) };
    const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_ABlasterCharacter_ShowSniperScopeWidget_Statics::PropPointers[] = {
        (const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_ABlasterCharacter_ShowSniperScopeWidget_Statics::NewProp_bShowScope,
    };
    static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_ABlasterCharacter_ShowSniperScopeWidget_Statics::PropPointers) < 2048);
    // ********** End Function ShowSniperScopeWidget Property Definitions ******************************
    const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_ABlasterCharacter_ShowSniperScopeWidget_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_ABlasterCharacter, nullptr, "ShowSniperScopeWidget", 	Z_Construct_UFunction_ABlasterCharacter_ShowSniperScopeWidget_Statics::PropPointers, 
        UE_ARRAY_COUNT(Z_Construct_UFunction_ABlasterCharacter_ShowSniperScopeWidget_Statics::PropPointers), 
    sizeof(BlasterCharacter_eventShowSniperScopeWidget_Parms),
    RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x08020800, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_ABlasterCharacter_ShowSniperScopeWidget_Statics::Function_MetaDataParams), Z_Construct_UFunction_ABlasterCharacter_ShowSniperScopeWidget_Statics::Function_MetaDataParams)},  };
    static_assert(sizeof(BlasterCharacter_eventShowSniperScopeWidget_Parms) < MAX_uint16);
    UFunction* Z_Construct_UFunction_ABlasterCharacter_ShowSniperScopeWidget()
    {
        static UFunction* ReturnFunction = nullptr;
        if (!ReturnFunction)
        {
            UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_ABlasterCharacter_ShowSniperScopeWidget_Statics::FuncParams);  // FuncParams 为前面构造的参数结构体，里面包含了参数、大小、偏移量等信息
        }
        return ReturnFunction;
    }
    ```

    此外，UHT 还会为纯蓝图实现的函数通过 `ProcessEvent` 接口来让C++访问。顺带一提，RPC 拦截器拦截到需网络同步的函数时，也会通过这种方式来找反射表中的函数进行调用。
    ```cpp
    struct BlasterCharacter_eventShowSniperScopeWidget_Parms
    {
        bool bShowScope;
    };
    void ABlasterCharacter::ShowSniperScopeWidget(bool bShowScope)
    {
        BlasterCharacter_eventShowSniperScopeWidget_Parms Parms;
        Parms.bShowScope=bShowScope ? true : false;
        UFunction* Func = FindFunctionChecked(NAME_ABlasterCharacter_ShowSniperScopeWidget);
        ProcessEvent(Func,&Parms);
    }
    ```
    - 对于 `UCLASS` 和 `USTRUCT`，UHT 不会为它们生成额外的包装结构体。因为它们的内存布局（占用字节、成员顺序）在 C++ 编译时就已固定。UHT 仅利用 STRUCT_OFFSET 宏，提取并记录每个 UPROPERTY 相对于对象首地址的内存偏移量。运行时引擎直接依靠这些偏移量进行内存寻址。
3. 当引擎启动时，开始执行这些 `.gen.cpp` 代码。实例化 `UFucntion`、`UClass` 等反射对象，将它们串联成树（建立继承链和属性链表）。在这个过程中，构建类本身的构造函数包装器也会被记录下来。当 `UClass` 实例完全被创建出来后，引擎再通过 `UClass` 中记录的信息实例化 **类本身这个实体** （即创建 CDO 对象）。

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

```mermaid
graph TD
    subgraph Phase1 [第一阶段: 引擎启动期 - UObject底层注册]
        A[OS 加载模块 DLL] --> B[C++ 静态初始化: 压入待注册队列]
        B --> C[触发委托: ProcessNewlyLoadedUObjects]
        C --> D[构造 UClass: 图纸解析与依赖链接]
        D --> E[注册收尾与批量构造 CDO]
        E --> F[底层实例化: CreateDefaultObject]
        F --> G[内存分配与数据拷贝: 从父类 Memcpy]
        G --> H[执行 C++ 默认无参构造函数]
    end

    H --> I{AActor 进入世界的方式}

    subgraph Phase2 [第二阶段: 运行期流转 以AActor为例]
        %% 磁盘加载分支 (靠左排布，为底部的复用绿线留出通道)
        I -->|关卡/磁盘加载| L[从磁盘读取 Actor 数据]
        L --> M[PostLoad: 加载后处理]
        M --> N[InitializeActorsForPlay: 运行前初始化]
        N --> S0[RouteActorInitialize: 组件路由总管]
        S0 --> S_L[PreInitializeComponents]
        S_L --> T_L[InitializeComponents]
        T_L --> U_L[PostInitializeComponents]
        U_L --> V_L((BeginPlay))

        %% 常规生成分支 (居中)
        I -->|常规动态生成| J[SpawnActor]
        J --> O[PostSpawnInitialize]
        O --> O1[PostActorCreated: C++ 专属早期回调]
        O1 --> O2[ExecuteConstruction: 跨界调用]
        O2 --> P[OnConstruction: 执行蓝图构造脚本]
        P --> P1[PostActorConstruction]
        P1 --> S_S[PreInitializeComponents]
        S_S --> T_S[InitializeComponents]
        T_S --> U_S[PostInitializeComponents]
        U_S --> V1[OnActorSpawned: 生成完毕事件]
        V1 --> V_S((BeginPlay))

        %% 延迟生成分支 (靠右)
        I -->|延迟动态生成| K[SpawnActorDeferred]
        K --> Q1[PostSpawnInitialize]
        Q1 --> Q2[PostActorCreated: 此时内存已分配]
        Q2 -.->|挂起流程: 开放暴露变量赋值| R[手动调用 FinishSpawningActor]
        R --> O2

        %% 殊途同归
        V_L --> W[游戏正常运行: Actor 执行 Tick]
        V_S --> W
    end

    W --> X{触发销毁或休眠条件}

    subgraph Phase3 [第三阶段: 毁灭 休眠与回收 - GC机制]
        X -->|调用 Destroy 或关卡退出| Y[EndPlay: 退出游戏逻辑]
        Y --> Z[UninitializeComponents: 组件休眠与反注册]

        %% 完美从左侧包抄的流加载复用连线
        Z -.->|大世界流加载: 唤醒并复用内存| S0

        Z --> AA[从 ULevel 的 Actor 数组中剔除]
        AA --> AB[标记为垃圾: Actor Marked RF_PendingKill]

        AB -.->|等待下一次 GC 扫描周期| AC[BeginDestroy: 异步释放原生资源]
        AC --> AD[IsReadyForFinishDestroy: 引擎轮询确认]
        AD --> AE((FinishDestroy: 彻底析构交还内存池))
    end

    %% --- 语义化教学配色 ---
    %% 灰色系：底层无感情的初始化
    classDef phase1 fill:#f8f9fa,stroke:#adb5bd,stroke-width:2px;
    %% 浅蓝系：平稳的磁盘读取
    classDef loadBranch fill:#e3f2fd,stroke:#64b5f6,stroke-width:2px;
    %% 浅绿系：生机勃勃的动态生成
    classDef spawnBranch fill:#e8f5e9,stroke:#81c784,stroke-width:2px;
    %% 橙色系：需要注意的挂起操作
    classDef deferBranch fill:#fff3e0,stroke:#ffb74d,stroke-width:2px;
    %% 红色系：危险的销毁流程
    classDef destroyPhase fill:#ffebee,stroke:#e57373,stroke-width:2px;

    %% 🌟 面试必考里程碑高亮 (亮黄色加粗框) 🌟
    classDef milestone fill:#fff9c4,stroke:#fbc02d,stroke-width:3px,color:#000;

    %% 应用 Class
    class A,B,C,D,E,F,G,H phase1;
    class L,M,N,S0,S_L,T_L,U_L loadBranch;
    class O,O1,O2,P,P1,S_S,T_S,U_S,V1 spawnBranch;
    class Q1,Q2 deferBranch;
    class Y,Z,AA,AB,AC,AD,AE destroyPhase;

    %% 高亮关键节点
    class I,J,K,R,V_L,V_S,W milestone;
```

## 反射系统

## GC

## 序列化

