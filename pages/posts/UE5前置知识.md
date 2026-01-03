---
layout: post
title: UE5前置知识
date: 2026-01-02 14:16:54
updated: 2026-01-02 14:16:54
tags: 
  - UE5
  - 笔记
cover: 'https://pic.yurin.cc/20251231_034148.webp'
time_warning: false
end: false
---

# UE5前置知识

在使用 UE5 之前需要学习的一些前置知识。

<!-- more -->

## 光照系统

UE5 的光照组件可以分为： **自然环境组** 和 **人工光源组**
- **自然环境组：**
  - **Directional Light（定向光）**：模拟太阳光/月光，照亮整个场景，到达场景的所有光线都是 **平行** 的。
  - **Sky Light（天空光）**：模拟天空的漫反射光，补充阴影部分的光照。
  - **Atmospheric Fog（大气雾）**：模拟大气散射效果，增强远处物体的层次感。
  - **Sky Atmosphere（天空大气）**：用于创建逼真的天空和大气效果。
  - **Volumetric Clouds（体积云）**：用于创建逼真的云层效果。
- **人工光源组：**
  - **Point Light（点光源）**：从一个点向各个方向发射光线，类似灯泡。
  - **Spot Light（聚光灯）**：从一个点向一个方向发射光线，类似手电筒。
  - **Rect Light（矩形光源）**：从一个矩形区域发射光线，适合模拟窗户或荧光灯。

## 字面量转换

在 UE5 编程中需要使用宏 [`TEXT()`](https://dev.epicgames.com/documentation/en-us/unreal-engine/epic-cplusplus-coding-standard-for-unreal-engine#generalstyleissues) 来将字符串字面量转换为 UE5 的 **Unicode** 字符串类型 `FString` 或 `FName`，以此避免不必要的编码转换。

## UE5 的核心继承树

> 继承时不要忘记把父类的函数也调用一下，因为本质上 **只是扩展父类的功能**。

下面的四种类型是 UE5 中最常用的四个核心类，每个类都有许多不同的派生类：
- **UObject**: 所有 UE5 对象的基类，提供了 **内存管理** 、 **垃圾回收** 等功能。 （不能放置）
- **AActor**: 继承自 UObject，是游戏世界中的实体对象，可以放置在关卡中。
- **APawn**: 继承自 AActor，是可以被“控制”的物体（比如载具、非人型生物）。
- **ACharacter**: 继承自 APawn，专门用于表示具有行走、跳跃等动作的角色，内置了角色运动组件。

## UE5 的包含体系

UE5 的包含体系也就是 UE5 管理资源的方式，主要是外部类及内部类的关系：
- **Package**: UE5 中的所有资源文件，可以理解成一个文件夹，包含了多个资源对象。
- **World**: 中间层，包含关卡（Level）和子关卡（Sublevel）。
- **Level**: 关卡，包含了场景中的所有 Actor 及 Actor 的组件。
  ![alt text](https://pic.yurin.cc/fe3c73ccaea50a772def4043a1c9263c.webp)

```mermaid
graph TD
    A[UPackage 硬盘上的文件 .umap] -->|包含| B(UWorld 游戏世界/关卡)
    B -->|包含| C(Level 关卡)
    C -->|持有| D{AActor 列表}
    D --> E[Actor: 玩家角色]
    D --> F[Actor: 墙壁]
    D --> G[Actor: 这里的灯光]
```

## UE5 反射体系

在 UE5 引擎中，如果一个对象参与垃圾回收，系统就会追踪有多少变量在引用它。如果没有变量引用它，那这个对象就自动删掉了。如果在普通的 C++ 中，垃圾回收是自己实现的，如果自己忘记了就会造成**内存泄漏**。

UE5 引擎的类声明顶部有个 `UCLASS()` 宏，用于所有继承自 `UObject` 的类，这样每个类就能参与反射系统，参与了垃圾回收。

同理，要让变量和函数也参与到反射系统中，就得分别用 `UPROPERTY()` 和 `UFUNCTION()` 宏来声明。
- `UPROPERTY()`：用于声明类中的变量，使其能够被引擎识别和管理。
- `UFUNCTION()`：用于声明类中的函数，使其能够被引擎识别和调用。

```C++
UCLASS()
class AMyActor : public AActor
{
    GENERATED_BODY()
    
    UPROPERTY()
    UStaticMesh SwordMesh; // 参与反射系统的变量

    UFUNCTION()
    void Attack(); // 参与反射系统的函数
};
```
通过这些宏，才能够将这些变量和函数暴露给蓝图。

另外，使用反射系统的类一般都要包含头文件： `className.generated.h`

宏也可以传参数进去来改变宏的一些行为，从而改变变量和函数是如何暴露给蓝图的。

## 根组件

根组件（Root Component）是每个 Actor 的基础组件，所有其他组件都是附加在根组件上的。根组件定义了 Actor 在世界中的位置、旋转和缩放。

创建的 C++ Actor 类默认没有根组件，通过蓝图继承的 C++ Actor 类会自动创建一个 `DefaultSceneRoot` 作为根组件。

有根组件才能够**拖动 Actor、旋转 Actor 和缩放 Actor**。

## FString 的运算符重载

[`FString`](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Core/FString#operators) 类重载了一些运算符，使得字符串操作更加方便：
- `+` 运算符：用于连接两个 `FString` 对象，返回一个新的 `FString` 对象。
- `==` 运算符：用于比较两个 `FString` 对象是否相等，返回一个布尔值。
- `!=` 运算符：用于比较两个 `FString` 对象是否不相等，返回一个布尔值。
- `*` 运算符：返回一个字符数组，也就是 C 风格的字符串。

```C++
FString Str1 = TEXT("Hello, ");
FString Str2 = TEXT("World!");
FString Str3 = Str1 + Str2; // Str3 现在是 "Hello, World!"
FString Name = TEXT("UE5");
FString::Printf(TEXT("ItemName: %s"), *Name);
```

## GEngine

`GEngine` 是一个全局指针，管理引擎的核心功能。通过 `GEngine`，可以访问引擎的各种子系统，例如渲染、音频、输入等。

为了防止崩溃，在使用 `GEngine` 之前，最好先检查它是否为 `nullptr`。

```C++
if (GEngine)
{
    GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::Red, TEXT("Hello, UE5!"));
}
```
如果指向空 (nullptr)： 则说明引擎还没有启动或已被销毁。

## 几个 DEBUG 可视化

在虚幻引擎中，使用 `DrawDebugHelpers.h` 提供的函数可以在场景中绘制可视化的调试图形，用于辅助判断逻辑（如射线检测、范围判定、向量方向等）。

```C++
DrawDebugXXXX(GetWorld(), .......);
```

- `DrawDebugLine`：绘制一条线段。可以表示物体的行进方向或射线。
- `DrawDebugBox`：绘制一个立方体。可以表示物体的边界框或碰撞体积。
- `DrawDebugCylinder`：绘制一个圆柱体。可以表示物体的范围或路径。
- `DrawDebugSphere`：绘制一个球体。可以绘制隐藏的物体位置或范围。
- `DrawDebugPoint`：绘制一个点。可以表示特定位置，或者射线的箭头，通常用于标记射线检测的击中点，它在屏幕上显示为一个正方形的小块。

| 参数名 | 类型 | 说明 | 推荐值 |
| :--- | :--- | :--- | :--- |
| **bPersistentLines** | `bool` | 是否永久保留。如果为 true，画出来的东西永远不消失（除非手动 Flush）。 | `false` |
| **LifeTime** | `float` | 存活时间（秒）。如果是 -1，则只显示一帧（用于 Tick 中实时刷新）。 | `2.0f` (调试时) / `-1.f` (Tick中) |
| **Segments** | `int32` | (仅球体) 面数/段数。决定球体有多圆。 | `12` 或 `24` |
| **Thickness** | `float` | (仅线/球) 线条的厚度。 | `1.0f` |
| **DepthPriority** | `uint8` | 深度优先级。决定是否被物体遮挡。0 表示会被墙挡住，1 表示透视显示。 | `0` |

## 几种向量
在 UE5 中，常用的向量类型有以下几种：
- `FVector`：三维向量，表示空间中的位置或方向，包含 X、Y、Z 三个分量。
- `FVector2D`：二维向量，表示平面上的位置或方向，包含 X、Y 两个分量。
- `FVector4`：四维向量，通常用于表示齐次坐标或颜色，包含 X、Y、Z、W 四个分量。
- `FRotator`：表示旋转，包含俯仰角（Pitch）、偏航角（Yaw）、滚转角（Roll）三个分量。
- `FQuat`：四元数，用于表示旋转，避免万向锁问题。
  ::: danger 万向锁
  万向锁（Gimbal Lock）是指在使用欧拉角表示旋转时，某些旋转组合会导致一个自由度的丧失，从而无法表示某些旋转状态。四元数通过使用四个分量来表示旋转，避免了这种问题。

  欧拉角变换是**从初始坐标系开始，依次绕固定的轴旋转指定的角度**。

  由于欧拉角是设定了三个轴的变换顺序，内部的轴无法带动外部的轴旋转，因此当 Y 轴旋转 90 度时，X 轴和 Z 轴会重合，此时增大 X 轴旋转也仅仅是在原来的 X 轴上旋转，从直观意义上来看是按照 Z 轴旋转的，这就导致了一个自由度的丧失。

  参考视频：[无伤理解欧拉角中的“万向死锁”现象](https://www.bilibili.com/video/BV1Nr4y1j7kn/?share_source=copy_web&vd_source=25a9a10c6f978860f97af02e1668351a)
  :::
