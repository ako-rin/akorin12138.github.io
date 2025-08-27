---
layout: post
title: 大数据topk问题
date: '2025-08-26 11:02:37 +0800'
categories: 算法
tags:
  - 算法
  - 大数据
  - 编程
  - C++
cover: 'https://pic.akorin.icu/20250826110602265.webp'
codeHeightLimit: 500
toc: true
time_warning: true
end: true
updated: '2025-08-27 00:20:34 +0800'
---

# 大数据topk

大数据topk问题就是 **求大量数据的前k个最大/最小的数据**。

有两种方法解决：
- 大小根堆
- 快排分割

<!-- more -->

## 大小根堆求解

1. 前k个最大数：利用 **大根堆**，不断 **淘汰堆顶元素** ，放入小值。
2. 前k个最小数：利用 **小根堆** ，不断 **淘汰堆顶元素** ，放入大值。

这种淘汰堆顶元素的算法，其时间复杂度仅为 **O(n)** ，如果是直接构建小根堆、大根堆取前k个元素，那样消耗的复杂度就是 **O(nlogn)** 了。

大小根堆可以直接使用stl的 `priority_queue` 优先级队列来构建。
- 利用优先级队列，先把前k个元素构建成一个大根堆/小根堆。
- 遍历后面的数据与堆顶元素比较。

:::code-group topk问题
```C++ [大根堆求前k个最小值]
vector<int> vec;
// 生成1000个10000以内的随机数
srand(time(NULL));
for (int i = 0; i < 1000; ++i) {
    vec.push_back(rand % 10000);
}

// 也可以直接写成 priority_queue<int> maxheap;
// 使用的容器默认是 vector，比较函数默认是 less
priority_queue<int, vector<int>, less<int>> maxheap;

// 求前5个最小数
int k = 5;

// 前k个元素构建一个大根堆
for (int i = 0; i < k; ++i) {
    maxheap.push(vec[i]);
}

// 遍历剩余元素，若堆顶大于当前数据就先出堆顶，再放进来
for (int i = k; i < vec.size(); ++i) {
    if (maxheap.top() > vec[i]) {
        maxheap.pop();
        maxheap.push(vec[i]);
    }
}

// 打印剩余元素
while(!maxheap.empty()) {
    cout << maxheap.top() << " ";
    maxheap.pop();
}
cout << endl;
```

```C++ [小根堆求前k个最大值]
vector<int> vec;
// 生成1000个10000以内的随机数
srand(time(NULL));
for (int i = 0; i < 1000; ++i) {
    vec.push_back(rand % 10000);
}

priority_queue<int, vector<int>, greater<int>> maxheap;

// 求前5个最大数
int k = 5;

// 前k个元素构建一个小根堆
for (int i = 0; i < k; ++i) {
    maxheap.push(vec[i]);
}

// 遍历剩余元素，若堆顶小于当前数据就先出堆顶，再放进来
for (int i = k; i < vec.size(); ++i) {
    if (maxheap.top() < vec[i]) {
        maxheap.pop();
        maxheap.push(vec[i]);
    }
}

// 打印剩余元素
while(!maxheap.empty()) {
    cout << maxheap.top() << " ";
    maxheap.pop();
}
cout << endl;
```
:::

还有一种问题是 **topk问题** 和 **查重** 结合起来，**查找重复次数前k个的数** 。既然有查重，就不可避免使用哈希表 `unordered_map`

```C++
vector<int> vec;
// 生成1000个10000以内的随机数
srand(time(NULL));
for (int i = 0; i < 1000; ++i) {
    vec.push_back(rand % 10000);
}

// 键值都是 int 类型
unordered_map<int, int> map;

// 对应元素的值加1
for (key : vec) {
    ++map[vec[key]];
}

// 前k个重复次数最小的数，构建小根堆
// 构建大根堆/小根堆时，要比较哈希表的值，
// 但是要放入的是哈希表的键
// 因此要同时放入 键-值 对
// 因此使用 pair
// 使用 pair 类型就要定制 priority_queue
priority_queue<
    pair<int,int>,
    vector<pair<int,int>>,
    function<bool(pair<int,int>&, pair<int, int>&)>
> minheap([](pair<int,int>& a, pair<int,int>& b) -> bool {
    return a.second > b.second;
});
int k = 5;
auto it = map.begin();  // map迭代器返回的是 pair 类型
for (int i = 0; i < k; ++i, ++it) {
    minheap.push(*it);
}
for (; it != map.end(); ++it) {
    if (minheap.top().second() < it->second) {
        minheap.pop();
        minheap.push(*it);
    }
}
while (!minheap.empty()){
    cout << minheap.top().first() << " ";
    minheap.pop();
}
cout << endl;
```

:::info lambda表达式
`[capture list] (parameter list) -> return type { function body }`
:::

## 快排分割求解

分割到前 `k` 个数组取出来即可：因为 **基准数前面的数都小于它，基准数后面的数都大于它。** 因此找出前 `k` 个最大/最小数，就只需要找到位置是 `k-1` 的基准数的位置（基准数也是前 `k` 个数），并返回前 `k` 个数的子数组。

操作的平均时间复杂度也是O(n)。
- 获取分割后的位置 `pos` ，与 `k-1` 进行比较。
- 若 `pos` > `k-1` ，说明在左边数列中找。
- 若 `pos` < `k-1` ，说明在右边数列中找。

```C++
// 分割一次
int Partation(int arr[], int begin, int end) {
    int val = arr[begin];
    int left = begin;
    int right = end;
    while (left < right) {
        // while中要判断左右指针的位置，防止右指针越过左指针
        // 使得右边数组越多val位置遍历到左边数组去了
        while (left < right && arr[right]> val) {
            --right;
        }
        if (left < right) {
            arr[left] = arr[right];
            ++left;
        } else {
            break;
        }
        while (left < right && arr[left] < val) {
            ++left;
        }
        if (left < right) {
            arr[right] = arr[left];
            --right;
        } else {
            break;
        }
    }
    arr[left] = val;
    return left;
}

void SelectTopk(int arr[], int begin, int end, int k) {

    int pos = Partation(arr, begin, end);
    if (pos == k - 1) {
        return;
    } else if (pos > k - 1)
        SelectTopk(arr, begin, pos - 1, k);
    else
        SelectTopk(arr, pos + 1, end, k);
}
```

要注意快排分割中左右指针循环条件，**不要让左右指针越界** 。
