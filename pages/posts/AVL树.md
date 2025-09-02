---
layout: post
title: AVL树
date: 2025-09-01 14:48:41
cover: 'https://pic.akorin.icu/20250901162043571.webp'
categories: 算法
tags:
  - 算法
  - 二叉树
  - 编程
  - C++
codeHeightLimit: 500
toc: true
time_warning: false
end: false 
---

# AVL树

AVL树是一种自平衡二叉查找树（BST），由Adelson-Velsky和Landis提出，在任意一个节点上，左子树和右子树的高度差不超过1，从而保证整棵树的高度始终维持在 O(log n) 级别。

相比普通二叉查找树，AVL树在最坏情况下也能高效完成查找、插入和删除操作，但由于需要频繁旋转，它在插入/删除频繁的场景下性能可能不如红黑树。

<!-- mmore -->

## AVL的平衡旋转

左旋转和右旋转指该节点旋转到其孩子的左孩子或右孩子。

AVL树为了维护节点平衡引入的四种节点旋转操作：

1. **右旋转操作：** 左孩子的左子树太高了，需要右旋。
    ![](https://pic.akorin.icu/20250902180720750.webp)
    ```mermaid 
    flowchart LR
      subgraph Before_LL[LL 失衡 (右旋前)]
        A((A))
        B((B)):::hl
        C((C))
        A --> B
        A --> T3[T3]
        B --> C
        B --> T2[T2]
        C --> T0[T0]
        C --> T1[T1]
      end
      subgraph After_LL[右旋后]
        B2((B))
        C2((C))
        A2((A))
        B2 --> C2
        B2 --> A2
        C2 --> T0_[T0]
        C2 --> T1_[T1]
        A2 --> T2_[T2]
        A2 --> T3_[T3]
      end
    classDef hl fill:#ffe2c6,stroke:#f90,stroke-width:2px;
    ```
2. **左旋转操作：** 右孩子的右子树太高了，需要左旋。
    ![](https://pic.akorin.icu/20250902180739356.webp)
3. **左平衡操作：** 左孩子的右子树太高了，需要先左旋板成第一种情况，然后再右旋。
    ![](https://pic.akorin.icu/20250902202744510.webp)
4. **右平衡操作：** 右孩子的左子树太高了，需要先右旋扳成第二种情况，然后再左旋。
    ![](https://pic.akorin.icu/20250902202817931.webp)

:::code-group
```C++ [旋转平衡]
// 右旋转操作
// 以node为轴做右旋转操作，把新的根节点返回
Node* rightRotate(Node* node) {
    // 节点旋转
    Node* child = node->left_;
    node->left_ = child->right_;
    child->right_ = node;
    // 更新高度，因为child的高度依赖node（child变成node的根节点）
    // 先更新node再更新child
    node->height_ =
        max(getHeight(node->left_), getHeight(node->right_)) + 1;
    child->height_ =
        max(getHeight(child->left_), getHeight(node->right_)) + 1;
    return child;
}
// 左旋转操作
// 以node为轴做左旋转操作，把新的根节点返回
Node* leftRotate(Node* node) {
    // 节点旋转
    Node* child = node->right_;
    node->right_ = child->left_;
    child->right_ = node;
    // 更新高度，因为child的高度依赖node（child变成node的根节点）
    // 先更新node再更新child
    node->height_ =
        max(getHeight(node->left_), getHeight(node->right_)) + 1;
    child->height_ =
        max(getHeight(child->left_), getHeight(node->right_)) + 1;
    return child;
}

// 左平衡操作
Node* leftBalance(Node* node) {
    node->left_ = leftRotate(node->left_);
    return rightRotate(node);
}
// 右平衡操作
Node* rightBalance(Node* node) {
    node->right_ = leftRotate(node->right_);
    return leftRotate(node);
}

```
```C++ [AVL节点定义]
struct Node {
    Node(T data) :
        data_(data),
        left_(nullptr),
        right_(nullptr),
        height_(0) {}
    T data_;
    Node* left_;
    Node* right_;
    int height_;   // 节点高度
};
```
:::