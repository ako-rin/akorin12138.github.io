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
updated: '2025-09-03 02:52:02'
---

# AVL树

AVL树是一种自平衡二叉查找树（BST），由Adelson-Velsky和Landis提出，在任意一个节点上，左子树和右子树的高度差不超过1，从而保证整棵树的高度始终维持在 O(log n) 级别。

相比普通二叉查找树，AVL树在最坏情况下也能高效完成查找、插入和删除操作，但由于需要频繁旋转，它在插入/删除频繁的场景下性能可能不如红黑树。

<!-- more -->

## AVL的平衡旋转

左旋转和右旋转指该节点旋转到其孩子的左孩子或右孩子。

AVL树为了维护节点平衡引入的四种节点旋转操作：

1. **右旋转操作：** 左孩子的左子树太高了，需要右旋。
    ![](https://pic.akorin.icu/20250902180720750.webp)
    ``` 
    LL（左左）失衡：对 A 右旋
      Before:             After (RightRotate A):
              A                    B
            /   \                /   \
          B     T3     ==>     C      A
          / \                 / \    / \
        C   T2               T0 T1  T2 T3
      /  \
    T0    T1
    ```
2. **左旋转操作：** 右孩子的右子树太高了，需要左旋。
    ![](https://pic.akorin.icu/20250902180739356.webp)
    ```
    RR（右右）失衡：对 A 左旋
      Before:             After (LeftRotate A):
            A                      B
          /   \                  /   \
        T0    B       ==>      A      C
            /   \             / \    / \
          T1     C           T0 T1  T2 T3
                / \
              T2  T3
    ```
3. **左平衡操作：** 左孩子的右子树太高了，需要先左旋板成第一种情况，然后再右旋。
    ![](https://pic.akorin.icu/20250902202744510.webp)
    ```
    LR（左右）失衡：先左旋 B，再右旋 A
      Before:            中间（左旋 B）：       After:
          A                    A                 C
        /   \                /   \             /   \
       B    T4   ==>        C    T4   ==>     B     A
      / \                  / \               / \   / \
    T0   C                B  T2            T0  T1 T2  T4
        /  \             / \
      T1    T2         T0   T1

    ```
4. **右平衡操作：** 右孩子的左子树太高了，需要先右旋扳成第二种情况，然后再左旋。
    ![](https://pic.akorin.icu/20250902202817931.webp)
    ```
    RL（右左）失衡：先右旋 B，再左旋 A
      Before:            中间（右旋 B）：      After:
        A                   A                    C
      /   \               /   \                /   \
    T0     B      ==>   T0     C     ==>     A      B
          /  \                /  \           / \   / \
        C    T4             T1    B        T0  T1 T2  T4
        / \                      / \
      T1 T2                    T2  T4
    ```

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

## AVL的插入

1. 在普通的BST树的插入的回溯上，插入平衡旋转的代码。
2. 回溯后比较左右孩子的高度。
3. 若左右孩子高度差大于1，说明此时不平衡，需要旋转平衡操作。
4. 此时分类属于哪种不平衡的情况（LL、LR、RL、RR）。
5. 插入过后更新每一层的高度。

```C++ 
// 插入
void insert(const T& val) {
    root_ = insert(root_, val);
}
Node* insert(Node* node, const T& val) {
    // 到达要插入位置
    if (!node) {
        return new Node(val);
    }
    if (val < node->data_) {
        // 递归时执行的代码
        node->left_ = insert(node->left_, val);
        // 回溯时执行的代码
        // 在插完后判断是否失衡，插左边肯定左边更高一点
        if (getHeight(node->left_) - getHeight(node->right_) >
            1) {
            // 左孩子的左子树太高 LL
            if (getHeight(node->left_->left_) >=
                getHeight(node->left_->right_)) {
                // 不在这里返回节点，而是在后面更新完高度再返回
                node = rightRotate(node);
            } else {
              // LR
                node = leftBalance(node);
            }
        }
    } else if (val > node->data_) {
        // 递归时执行的代码
        node->right_ = insert(node->right_, val);
        // 回溯时执行的代码
        // 在插完后判断是否失衡，插右边肯定右边更高一点
        if (getHeight(node->right_) - getHeight(node->left_) >
            1) {
            // 右孩子的右子树太高 RR
            if (getHeight(node->right_->right_) >=
                getHeight(node->right_->left_)) {
                node = leftRotate(node);
            } else {
              // RL
                node = rightBalance(node);
            }
        }
    } else {
        // 相同则直接回溯，不插重复值
        return node;
    }
    // 插入了新的节点，更新当前节点的高度
    node->height_ =
        max(getHeight(node->left_), getHeight(node->right_)) + 1;
    return node;
}
```

## AVL的删除

### AVL 的删除步骤总结

删除与插入最大的不同：插入只可能在回溯路径上的某个节点触发至多一次（或少量）失衡修复；删除会让路径高度下降，可能在多层连续触发再平衡。因此删除阶段的“回溯 + 多次检测”尤为关键。

步骤（结合你的 `remove` 实现）：

1. 常规 BST 定位  
   递归向左或向右查找目标值 `val`，直到找到要删除的节点或遇到空指针返回。

2. 处理删除的三种结构情况  
   - 叶子节点（无孩子）：直接删除，返回 `nullptr`。  
   - 仅有一个孩子：用其非空孩子替换当前节点，删除当前节点。  
   - 有两个孩子：  
      **“谁高删谁”** 策略：  
       a. 若左子树高度 > 右子树高度：找前驱（左子树最右节点），用其值覆盖当前节点，再递归删除前驱节点。  
       b. 否则：找后继（右子树最左节点），用其值覆盖当前节点，再递归删除后继节点。  
     这样做的目标是尽量保持整体高度不增，从而减少潜在旋转次数。

3. 回溯阶段更新高度  
   递归返回时，对沿途节点重新计算：  
   `height = max(height(left), height(right)) + 1`  
   （注意：如果你在旋转函数内部已经更新了局部高度，旋转完再统一更新当前返回节点也无妨，保持一致即可。）

4. 删除后检测是否失衡  
   使用：`bf = height(left) - height(right)`  
   - `bf > 1` 左侧过高  
   - `bf < -1` 右侧过高

5. 分类具体失衡类型  
   删除后产生的失衡方向与插入判断逻辑对称，但判别“单旋 / 双旋”依赖子孩子的“靠外”与“靠内”子树高度：  
   - 左侧失衡 (`bf > 1`):  
     - 若 `height(left.left) >= height(left.right)` → **LL 型**：单右旋  
     - 否则 → **LR 型**：先对 `left` 左旋，再对当前节点右旋  
   - 右侧失衡 (`bf < -1`):  
     - 若 `height(right.right) >= height(right.left)` → **RR 型**：单左旋  
     - 否则 → **RL 型**：先对 `right` 右旋，再对当前节点左旋

6. 旋转平衡  
   执行所需的（单/双）旋转操作，获得新的子树根节点。旋转内部需正确维护被移动节点与新根节点的高度。

7. 返回新的子树根  
   每一层完成（更新高度 + 可能的旋转）后返回当前子树根节点供上层继续使用。

```C++ 
// 删除
Node* remove(Node* node, const T& val) {
    if (!node)
        return nullptr;
    if (val < node->data_) {
        node->left_ = remove(node->left_, val);
        // 左子树删除节点后可能造成右子树太高
        if (getHeight(node->right_) - getHeight(node->left_) > 1) {
            if (getHeight(node->right_->right_) >
                getHeight(node->right_->left_)) {
                // RR
                node = leftRotate(node);
            } else {
                // RL
                node = rightBalance(node);
            }
        }
    } else if (val > node->data_) {
        node->right_ = remove(node->right_, val);
        // 右子树删除节点后可能造成左子树太高
        if (getHeight(node->left_) - getHeight(node->right_) > 1) {
            if (getHeight(node->left_->left_) >
                getHeight(node->left_->right_)) {
                // LL
                node = rightRotate(node);
            } else {
                // LR
                node = leftBalance(node);
            }
        }
    } else {
        // 到达要删除的节点
        // 先处理情况3
        if (node->right_ && node->left_) {
            // 为避免删除前驱/后继造成节点失衡，谁高删谁
            if (getHeight(node->left_) > getHeight(node->right_)) {
                // 删前驱
                Node* cur = node->left_;
                while (cur->right_) {
                    cur = cur->right_;
                }
                node->data_ = cur->data_;
                node->left_ = remove(node->left_, cur->data_);
            } else {
                // 删后继
                Node* cur = node->right_;
                while (cur->left_) {
                    cur = cur->left_;
                }
                node->data_ = cur->data_;
                node->right_ = remove(node->right_, cur->data_);
            }
        } else {
            // 情况1 / 2
            Node* child = node->left_ ? node->left_ : node->right_;
            delete node;
            return child;
        }
    }
    // 回溯后更新节点高度，只有寻找的这条路径会更新高度
    // 只有删除有效时才减小高度
    node->height_ =
        node ? max(getHeight(node->left_), getHeight(node->right_)) + 1
              : node->height_;

    return node;
}
```

:::warning
无论是删除节点还是增加节点，最后更新高度都是依靠其孩子的高度来更新， **删除时不要想当然的** `- 1` ：

```C++ 
node->height_ =
     max(getHeight(node->left_), getHeight(node->right_)) - 1 // [!code error]
     max(getHeight(node->left_), getHeight(node->right_)) + 1 // 这才是更新高度
```

:::
