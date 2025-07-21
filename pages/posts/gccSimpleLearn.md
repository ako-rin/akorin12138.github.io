---
title: C++学习记录
date: 2025-07-10
updated: 2025-07-21
categories: 笔记
tags:
  - 学习
  - 编程
  - C++
cover: 'https://pic.akorin.icu/c++cover.jpg'
codeHeightLimit: 500
toc: true
time_warning: false
end: false
---

## 怎么这么难啊
在C语言的基础上继续学习CPP

<!-- more -->

## C++基础知识

### `extern` 的用法

在预编译的过程中，会自动展开头文件。因此定义在头文件的变量就会被多次定义。  
`extern` 关键字用于声明一个变量或函数，使其可以在其他文件中访问，而不在当前文件中分配内存。  

::: info 总结
头文件只做变量的声明，不能做变量的定义  
头文件声明变量可以采用extern的方式
:::

### 变量作用域
与C不同C++多了几种作用域。作用域决定了变量的生命周期和可见性。

1. 全局作用域：在函数外部声明变量，一般只在需要的时候才使用，便于代码维护
2. 局部作用域：在函数内部、 `if` 语句或 `for` 循环内声明的变量。它们只在声明的代码块内被访问。
3. 命名空间作用域：在命名空间中声明的变量
4. 类作用域：在类内部声明的变量和成员函数。成员变量和成员函数只能通过类的对象访问，而在某些情况（如静态成员）可以直接通过类名访问。
5. 块作用域：是局部作用域的一个特例，在函数中额外用大括号 `{}` 来包围的代码块内声明的变量，这些变量只能在代码块内被访问，即使在函数内但是超出代码块也依旧不能访问。


:::code-group
```C++ [命名空间作用域]
namespace MyNamespace {
  int namespaceVar = 10;
}

int main(){
  int a = MyNamespace::namespaceVar;
}
```
```C++ [类作用域]
class MyClass {
  public:
    int classVar;
}

int main(){
  MyClass obj;
  obj.classVar = 10;
}
```
```C++ [块作用域]
void fun() {
  {
    int a = 1;
  }
  // 下列代码尝试块外访问块内变量会导致编译错误
  // int b = a;
}
```
:::

### 存储空间
C++通过存储的数据类型、生命周期和作用域来划分。

1. 代码区（Code Segment/Text Segment）：存储程序执行代码（机器指令）的内存区域，只读，在执行程序时不会改变。
2. 全局/静态存储区（Global/Static Storage Area）：存储全局变量和静态变量的区域。
3. 栈区（Stack Segment）：存储局部变量、函数参数、返回地址等的内存区域。栈是后进先出的数据结构，存储函数调用和自动变量。
4. 堆区（Heap Segment）：由程序员通过动态分配函数（ `new` 或 `malloc` ）分配的内存区域。堆的内存分配和释放是手动的，由程序员需要负责管理的内存，避免内存泄漏或野指针等问题。
5. 常量区（Constant Area）：存储如字符串常量、 `const` 饰的全局变量的区域，这部分内存也是只读的。在C++中，使用双引号括起来的字符串字面量通常存储在常量区。若 `const` 修饰的全局变量的值在编译时就已确定，则也可能存储在常量区。

:::tip 
`const` 修饰的变量是只读的，编译器处理时一般时直接将 `const` 修饰的变量替换成其初始化的值。默认情况下 `const` 对象被设定为仅在文件内有效，因此当多个文件中出现了同名的 `const` 修饰的变量时，其实相当于在不同的文件中定义了不同的变量。比如filea.c和fileb.c都包含了fileh.h文件，而fileh.h中声明了一个 `const` 修饰的变量var，filea.c和fileb.c中引用该变量其实是不同的，即filea.c中的var与fileb.c中的var地址不相同。
:::

[代码源](https://gitbookcpp.llfc.club/sections/cpp/base/cppbase02.html)
:::code-group
```C++ [示例代码]
#include <iostream>
#include <cstring> // 用于strlen

// 全局变量，存储在全局/静态存储区
int globalVar = 10;

// 静态变量，也存储在全局/静态存储区，但仅在其声明的文件或函数内部可见
static int staticVar = 20;

void func() {
    // 局部变量，存储在栈区
    int localVar = 30;

    // 静态局部变量，虽然声明在函数内部，但存储在全局/静态存储区，且只在第一次调用时初始化
    static int staticLocalVar = 40;

    std::cout << "Inside func:" << std::endl;
    std::cout << "localVar = " << localVar << std::endl;
    std::cout << "staticLocalVar = " << staticLocalVar << std::endl;

    // 尝试通过动态内存分配在堆区分配内存
    int* heapVar = new int(50);

    std::cout << "heapVar = " << *heapVar << std::endl;

    // 释放堆区内存（重要：实际使用中不要忘记释放不再使用的堆内存）
    delete heapVar;
}

int main() {
    // 访问全局变量
    std::cout << "Inside main:" << std::endl;
    std::cout << "globalVar = " << globalVar << std::endl;
    std::cout << "staticVar = " << staticVar << std::endl; // 注意：staticVar在外部不可见（除非在同一个文件中或通过特殊方式）

    // 调用函数，展示栈区和堆区的使用
    func();

    // 字符串常量通常存储在常量区，但直接访问其内存地址并不是标准C++的做法
    // 这里我们仅通过指针来展示其存在
    const char* strConst = "Hello, World!";
    // 注意：不要尝试修改strConst指向的内容，因为它是只读的
    std::cout << "strConst = " << strConst << std::endl;
    // 尝试获取字符串常量的长度（这不会修改常量区的内容）
    std::cout << "Length of strConst = " << strlen(strConst) << std::endl;

    return 0;
}
```
```[输出结果]
Inside main:
globalVar = 10
staticVar = 20
Inside func:
localVar = 30
staticLocalVar = 40
heapVar = 50
```
:::
从下图中可以看出字符串都存储在了常量区。
![alt text](https://pic.akorin.icu/20250712171019110.png)


### 引用

引用可以看作是另一个变量的别名，其用法也较为简单：
```C++
int a = 1;
int &b = a;
```
使用符号 `&` 表示引用，此时变量 `a` 和 `b` 的地址相同。此时修改b的值相当于修改a的值，b就是a的别名。

:::warning 注意
1. 必须初始化。在创建引用时，必须指向一个已存在的对象。
2. 一旦引用绑定后就不能再修改。
3. 不能存在空引用。
:::

#### 左值引用和右值引用
在C++中左值( `lvalue` )和右值( `rvalue` )是表达式的两种基本分类，它们决定了表达式的结果在内存中的位置和状态。  
**左值**通常指具有持久状态的对象，有明确的内存地址，可以被多次赋值。左值引用是C++98就有的特性。  
**右值**是临时、没有持久状态的值（临时对象或即将被销毁的对象），通常没有内存地址，或其内存地址在表达式结束后变得无效。右值引用是C++11新增的特性。

:::code-group
```C++[左值引用]
int a = 10;
int& b = a; // b是a的左值引用
```
```C++[右值引用]
int&& c = 20; // c是整数字面量20的右值引用（但这种情况不常见，通常用于函数参数或返回值）

std::string foo() {
    return std::string("Hello, World!"); // 返回的临时字符串是一个右值
}

std::string &&d = foo(); // d是foo()返回的临时字符串的右值引用
```
:::
右值引用的主要用途是作为函数参数（实现移动语义）和返回值（允许链式调用等）。

### 指针

指针是一种特殊变量。它存储的是另一个变量的地址，而不是该变量本身。通过操作指针可以直接操作内存的数据。  
`nullptr` 为空指针，在C++中 0为 `false` ，非0为 `true`。  
指针存储的是地址，因此指针有两种赋值方式：
1. **直接赋值**，但是这不常用。
2. 利用**取地址符号** `&` 获取变量的地址并将其传给指针。取地址符号 `&` 获取的地址只能传给指针类型的变量，否则会报错。

```C++
int var = 10;
int *ptr = &var;
```
指针本身也是个变量，其存储的是另一个变量的地址，因此计算机也会为指针开辟空间，指针有自己的地址。  
再看下面的代码：
```C++
int var = 10;
int *ptr1 = &var;
int *ptr2 = ptr1;
```
ptr1是指针，存储的是var的地址，ptr2也是指针，获取了ptr1存储的值也就是var的地址，此时ptr2也指向了var。

#### 指针和引用的区别

指针与引用类似，都能够对其它对象进行间接地访问，但是指针又与引用有许多不同。
1. 指针本身就是一个对象，允许对指针赋值和拷贝，在指针地生命周期内可以指向不同的对象，而引用在初始化时就已固定。
2. 指针无须初始化。在指针未初始化时其存储的值是不确定的。

#### 万能指针和指向指针的指针

`void*` 是一种特殊的指针类型，能够存放任意对象的地址。`void*` 指针存放一个地址，但是该地址存放的数据类型是不知道的。  
由于不知道 `void*` 指向的对象的类型，因此不能利用 `void*` 直接去操作指向的对象。

`void*` 主要用来和别的指针进行比较、作为函数的输入或输出，或赋给另一个 `void*` 指针。

除了万能指针还有指向指针的指针，即`**ptr`，指向指针的指针存取的是另一个指针的地址。

#### 指针和数组

指针能够通过自增和自减来控制指针存取的地址，通过这种特性，将指针指向一个数组，并让指针自增自减就能起到指针选取不同数组内的元素。  
当指针指向数组时，一般指向数组的第一个元素。  

```C++
//指针可以进行算术运算，如递增（++）和递减（--），
// 这些操作会改变指针所指向的内存地址。但是，这种操作仅限于指向数组元素的指针。
int arr[5] = {1, 2, 3, 4, 5};
int *ptr_arr = arr;
std::cout << "ptr_arr is : " << ptr_arr << std::endl;
int firstElement = *ptr_arr;
std::cout << "firstElement is " << firstElement << std::endl;
// 递增指针
++ptr_arr; // ptr 现在指向 arr[1]
std::cout << "ptr_arr is : " << ptr_arr << std::endl;
// 访问新位置的值
int secondElement = *ptr_arr; // secondElement 等于 2
std::cout << "secondElement is " << secondElement;
```
上面的代码可以看出指针指向数组时，**数组不用取地址符号**。因为数组名在表达式中会自动转换为**指向其首元素的指针**，即 `arr` 是一个指针并指向数组的第一个元素，也即 `arr` 存取数组第一个元素的地址。在上面的代码中 `arr` 表示数组的首地址，类型为 `int*` 等价于
```C++
arr = &arr[0];
int *ptr_arr = &arr[0];
```

还有指向整个数组的指针：
```C++
int a[5] = {1, 2, 3, 4, 5};
int (*para)[5] = &a;
```
这里的 `para` 不是指针数组，而是**数组指针**，这意味着 `para` 应看作成一个整体，其数据类型为 `int*[5]`。  
因此 `para[1]` 并不是指代数组 `a` 的第二个元素，而是偏移了一个 `int[5]` 的单位后的野指针。 `para` 本身不是数组，而是指向了一整个数组的**指针**。
```C++
std::cout << (*para)[1] << std::endl;
```
`(*para)[1]` 才是指代数组 `a` 的第二个元素，其中 `para` 在物理意义上存取数组 `a` 的首地址，但在C++中是存取整个数组的地址。  

`a` 等价于 `para[0]` ， `a[0]` 等价于 `(*para)[0]`或 `*para` ， `(*para)[1]` 等价于 `para[0][1]` 或 `a[1]`。  

在使用**数组指针**时，`*para[0]` 这种写法不够清晰，且容易引起歧义，因此不能这么写，应写成 `(*para)[0]`。

容易混淆的是`para[0][1]` 前一个 `[]` 表示指针位置（指向的地址），后一个 `[]` 表示数组指针指代数组的元素。

这个在普通的指针上也有类似的情况：
```C++
int a = 1;
int *p = &a;
```
 `p` 等价于 `p[0]`，而 `p[1]` 就是野指针了。

与指针数组对比：
```C++
int *para[5];
```
上面的代码意味着 `para` 数组有5个 `int` 型指针。  
指针数组有n个指针，而数组指针只有一个。

### `const` 关键字

`const` 修饰的变量为常量，必须初始化且在不能修改。通过 `const` 提高代码的安全性和可读性。

指针本身也是变量，因此也能够被`const`修饰。

#### `const` 在声明变量中的位置

`const` 关键字一般放在变量类型之前：
```C++
const int a =10;
```
也可以放在变量类型之后，但比较少见：
```C++
int const a = 10;
```

#### `const`引用

当有 `const` 关键词修饰变量时，其引用也必须是 `const` 修饰的；被引用地变量没有 `const` 修饰时，其引用也可以用 `const` 修饰。  
`const` 修饰的引用变量类型可以与被引用的变量类型不同，在编译过程中会进行隐式地类型转换。  
C++ 允许常量引用绑定到类型不同的右值或临时变量。

```C++
double dval = 3.14;
int &rd = dval;       // [!code error] 错误
const int &rt = dval; // 正确
// 相当于
const int temp = dval;
const int &rt = temp;
```
此时 `rt` 绑定了一个临时对象 `temp`， 对象 `temp` 进行类型转换。临时对象常常被称作**临时量**。

#### 常量指针

指针也能够被 `const` 修饰，类似于常量对象，在初始化后指向的对象就不能被改变。  
要指向常量对象，必须使用常量指针：
```C++
const double PI = 3.14;
double * ptr = &PI;       // [!code error] 错误
const double *cptr0 = &PI; // 正确  普通指针
const double *const cptr1 = &PI; // 正确  常量指针
```
`cptr0` 是指向常量的指针，可以修改指向的对象。  
`cptr1` 是指向常量的**常量指针**，不能修改指向的对象。

```C++
const int a = 10;
const int b = 20;
int c = 30;
const int *ptra = &a;
ptra = &b;  // 正确
const int *const ptrb = &a;
ptrb = &b;  // [!code error] 错误
const int *ptrc = &c;  // 正确
const double *ptrc = &c;  // [!code error] 错误
```
在上面代码中 
```C++
const int *const ptrb = &a;
```
前一个 `const` 称作底层 `const` ，后一个 `const` 称作顶层 `const`。

1. **顶层** `const` 表示任意的对象是常量，这一点对任何数据类型都适用，如算术类型、类、指针等。
2. **底层** `const` 则与指针和引用等复合类型的基本类型部分有关。比较特殊的是，指针类型既可以是顶层 `const` 也可以是底层 `const` ，这一点和其他类型相比区别明显。

```C++
const int *ptrc = &c;
const double *ptrc = &c;// [!code error]
```
C++ **不允许**不同类型的指针直接相互赋值，即使都是常量指针，这点与常量引用不同。  
只有底层 `const` 修饰指针，表示该指针不能修改指向对象的值，但是可以修改指向的对象。

#### `constexpr` 和常量表达式

`constexpr` 是 **C++11**新标准引入的新类型。C++11允许将变量声明为 `constexpr` 类型，让编译器在编译期间就将该类型的值转换成字面量。 `constexpr` 修饰的变量也一定是常量。

`constexpr` 修饰的指针其初始值必须是0或 `nullprt` ，也可以是某个固定地址中的对象（全局对象等）。  

### `auto` 关键词

有时候需要从表达式的返回值赋值给变量，这使得创建的变量要与表达式相同，在工程中要实现这一目标比较不变甚至无法实现，C++11 新标准引入 `auto` 类型说明符来自动推算变量类型。  
但是一条 `auto` 只能声明一种基本数据类型。
```C++
auto a = 0, pi = 3.14;// [!code error]
```
可以在 `auto` 前加上 `const` 来指示推断数据类型为常量。

### `decltype` 关键词

`decltype(function()) x` 通过自动推断函数 `function()` 的返回值类型，并用它来声明变量 `x` ，使 `x` 与 `function()` 的返回值类型一致。

### `for` 循环
c++中 `for` 循环多了“范围循环”的形式：
```C++
for (a : b){}
```
在**C++11**的 `for` 范围循环代码块中，若出现了向量 `vector` ，在背后会自动调用向量的 `begin()/end()` 函数，即可以直接写成：
```C++
std::vector<int> vec = {1 , 2 ,3};
for(auto c : vec){}
```
等价于：
```C++
std::vector<int> vec = {1 , 2 ,3};
for (auto it = vec.begin(); it != vec.end(); ++it) {}
```

### 向量 `vector`

向量 `vector` 是C++标准模板库(STL)中的一种序列容器，能够动态管理可变大小的数组。

定义一个向量：
```C++
std:vector<int> numbers;  //整数向量
std:vector<std:string> words; //字符串向量
```

向量可以直接增删改查：
- `push_back()` ：在向量末尾添加一个元素。
- `pop_back()` ：移除向量末尾的元素。
- `insert()` ：在指定位置插入元素。
- `erase()` ：移除指定位置的元素或范围内的元素。
- `clear()` ：移除所有元素。
- `operator[]` ：通过索引访问元素。
- `at()` ：通过索引访问元素，带边界检查。
- `front()` ：返回指向第一个元素（底层元素）的迭代器。
- `back()` ：返回指向最后一个元素迭代器。
- `size()` ：返回向量中元素的数量。
- `capacity()`：返回向量目前为止分配的存储容量。
- `empty()` ：检查向量是否为空。
- `begin()` : 返回指向向量第一个元素的迭代器，
- `end()` : 指向“最后一个元素之后”的位置（不能解引用）。
- `data()` ： 返回指向第一个元素的指针。
- `find()` ： 在向量中查找所需的元素。
- `reverse()` ： 预留内存。

:::info
虽然向量可以直接像数组一样操作和赋值，但是向量本身并不是直接指向第一个元素的指针，而是一个对象，因此需要使用 `vector.begin()` 或 `vector.data()` 来获取向量第一个元素的迭代器或指针。
```C++
for (auto i = vector; i != vector.end(); i++){} // [!code error]
for (auto i = vector.begin(); i != vector.end(); i++){}
```
:::

#### 二维向量：
```C++
std::vector<std::vector<int>> matrix(3, std::vector<int>(4, 0));
```

#### 向量内存优化

向量会动态地管理内存，自动调整向量的容量以适应新增或删除的元素，频繁地内存分配可能会影响性能。  
1. 使用 `reverse()` 来预留内存，减少内存分配地次数。
2. 使用 `shrink_to_fit()` 释放向量的多余容量，匹配向量大小。

### 迭代器

迭代器( `Interator` ) 是C++标准模板库( `STL` ) 的一个重要概念。迭代器就像一个指针，但是迭代器只能访问容器内的元素，因此比指针更加安全。  

一些具有迭代器的容器（向量等）都会有成员函数 `begin()` 和 `end()` 来返回迭代器。

#### 迭代器的运算

- `*iter` ：返回迭代器所指元素的引用。
- `iter->mem` ： 解引用迭代器所指的元素，等价于 `(*iter).mem`
- `++iter` ： 指向下一个元素
- `--iter` ： 指向上一个元素
- `iter1 == iter2` ： 判断两个迭代器是否相等
- `iter1 != iter2` ： 判断两个迭代器是否不相等

比较类似于指针指向数组。

#### 迭代器失效

由于向量 `vector` 可以动态增长，但是不能再 `for` 循环中向 `vector` 对象添加元素。且任何能够可能改变 `vector` 对象容量的操作（ `push_back` 、 `pop_back` 等）都会使该 `vector` 对象的迭代器失效。
```C++
//注意下面逻辑错误，在for循环中push元素导致迭代器失效,也会导致死循环
for(auto it = numbers.begin(); it != numbers.end(); ++it) {
    numbers.push_back(1);
}
```

#### 指针类似迭代器用法

指针也是迭代器，在C++11中利用 `std::begin()` 可以获取数组第一个元素的指针， `std::end()` 获取数组'最后一个元素之后' 的指针，与迭代器的 `end()` 位置相同。
```C++
int ia[] = {0,1,2,3,4,5,6,7,8,9};
int * beg = std::begin(ia);
int * end = std::end(ia);
for(auto it = beg; it != end; ++it){
    std::cout << *it << " ";
}
```

### C 风格字符串

C风格字符串以空字符作为结束( `/0` )。在字符串的末尾一般会自动加上空字符( `/0` )。
```C++
char *str = "hello world!";
```
或
```C++
char str[] = "hello world!";
```
此时会在 `!` 后面自动加上 `/0` 。  
但是须注意:
```C++
char str[] = {'a', 'b', 'c'};
```
虽然这里的 `str` 也是字符串数组，但是内部没有 `/0` ，这就会导致使用查询字符串长度函数 `strlen` 时，会一致沿着 `str` 在内存的位置直到找到 `/0` 才停下来，这也是C风格字符串的漏洞。

### **类**

类就像一个汽车图纸，而对象就是图纸造出来的汽车。实际上类和结构体差不多，类有的结构体也有，它们唯一的区别只有对成员默认访问权限不同：
- 类：默认是 `private`
- 结构体：默认是 `piblic`

#### 类的定义

类有三种成员，分别是
- 公有成员(public)：可以被所有代码访问。
- 私有成员(private)：只能被类的成员函数和友元访问。
- 受保护成员(protected)：只能被类的成员函数、友元和派生类访问。

:::tip 友元
友元的关键词为 `friend` ，能够让一个函数或者类去访问另一个类的私有成员或受保护成员。友元一般定义在类里，在 `public` `private` `protected` 之外。
:::

#### 构造函数

构造函数是与类名相同的特殊成员函数，**没有返回类型**，在创建对象时自动执行，主要负责对象的初始化。  
一般是**公有成员**，这样外部才能创建该类的对象。若构造函数是私有的，那么只能在类的内部（比如通过静态成员函数）创建对象。  
构造函数的具体实现可以放在类外也可以放在类里。  
成员变量一般以下划线结尾（如： `name_` ），以此区分局部变量。

#### 初始化列表

是一种用于在构造函数中初始化类成员变量的语法，写在构造函数的参数列表和函数体之间，用冒号 `:` 引导。  

某些情况下必须使用初始化列表来初始化变量，比如：
1. `const` 成员。
2. 引用成员。
3. 对象成员没有默认构造函数。
4. 基类构造函数。
5. `explicit`成员对象初始化。

因此用初始化列表能解决 99% 的问题。
```C++
class Student {
private:
    std::string name_;
    int age_;

public:
    Student(const std::string& name, int age)
        : name_(name), age_(age) { // 初始化列表
        // 构造函数体（通常可以为空）
    }
};
```
等价于：
```C++
Student(const std::string& name, int age) {
    name_ = name;
    age_ = age;
}
```
同时构造函数也可以在外部实现：
```C++
    Student :: Student(const std::string& name, int age)
    : name_(name), age_(age) {
    }
```

复杂一点的例子：
```C++
#include <iostream>
#include <string>

class Date {
public:
    int year, month, day;
    Date(int y, int m, int d) : year(y), month(m), day(d) {}
};

class Student {
private:
    const int id_;         // const 成员变量（必须初始化）
    std::string& school_;  // 引用类型成员（必须初始化）
    std::string name_;     // 普通变量（可以在构造函数体赋值，但最好初始化）
    Date birthday_;        // 对象成员（必须调用构造函数初始化）

public:
    // 构造函数使用初始化列表
    Student(int id, std::string& school, const std::string& name, const Date& birthday)
        : id_(id),         // const：必须在初始化列表中初始化
          school_(school), // 引用：也必须在初始化列表中初始化
          name_(name),
          birthday_(birthday) {
        std::cout << "Student constructed.\n";
    }

    void print() {
        std::cout << "ID: " << id_ << ", Name: " << name_
                  << ", School: " << school_
                  << ", Birthday: " << birthday_.year << "-" << birthday_.month << "-" << birthday_.day << "\n";
    }
};
```

:::info
这里构造函数传递 `name` 时，是引用传递，可以使得 `name` 变量直接传递给 `name_` 成员，仅一次拷贝。若只是普通传参，则：
- 传参时会**复制一份字符串**（从实参到形参）。
- 构造函数体内又复制一份字符串（从形参到变量）。
**发生了两次拷贝操作**，性能损耗较大。
:::

#### 拷贝构造函数和移动构造函数
上述的构造函数是**参数化构造函数**，除此之外还有：
- 拷贝构造函数：用一个对象去创建另一个对象时。
  ```C++
  ClassName(const ClassName& other);
  Student s1("Alice", 20);
  Student s2 = s1;  // 触发拷贝构造函数
  ```
- 移动构造函数：使用一个临时对象（右值）初始化另一个对象时（避免不必要的深拷贝）。
  ```C++
  ClassName(ClassName&& other);
  Student s3 = Student("Bob", 21);  // 触发移动构造函数
  ```
  临时对象（右值）优先调用移动构造函数初始化 `s3` ，避免深度拷贝，提高性能。如果类没有定义移动构造函数，则会退而使用拷贝构造，降低效率。  
  理论上移动构造函数和直接赋值性能上差不多，在C++17之后，编译器在开启优化的前提下，会**强制执行拷贝省略**（也称返回值优化 RVO）。  

涉及到移动构造函数，这不得不提C++的**Rule of Five（五法则）**，或  
**Special Member Functions Generation Rules（特殊成员函数生成规则）**：

如果在类中定义了以下五个函数：
1. 拷贝构造函数（Copy Constructor）
2. 拷贝赋值运算符（Copy Assignment）
3. 移动构造函数（Move Constructor）
4. 移动赋值运算符（Move Assignment）
5. 析构函数（Destructor）
则编译器不会自动生成移动构造函数。若需要支持移动语义，除了显式写出移动构造函数，还可以写：
```C++
// 放在public区域才能给外界使用
B(B&& other) = default;
```
或
```C++
B(B&&) = default; // other可以不用显式
B& operator=(B&&) = default; // 一般还要写全移动赋值运算符
```

#### 拷贝赋值运算符和移动赋值运算符
赋值运算符（ `operator=` ）是给已存在的对象赋值，**不是创建新的对象**，与构造函数不同，因此不能用初始化列表。  

这里涉及到**运算符重载**：
:::tip
在C++中， `operator` 关键字用于重载运算符。可以重新定义使用运算符时( `+`, `-`, `=`, `==`, `[]`等)该怎么运行。本节涉及到赋值运算符重载( `operator=` )。
:::

- 拷贝赋值运算符：将一个已有对象的内容拷贝到当前对象。
  ```C++
  T& operator=(const T& other);
  ```
- 移动赋值运算符：把一个右值对象的资源移动到当前对象，避免不必要的拷贝。
  ```C++
  T& operator=(T&& other);
  ```

逐字分解：
- `T&`：返回当前对象本身的引用。
- `operator=`：赋值运算符重载。
- `const T& other`：参数是另一个 `T` 类对象的常量引用。
- `T&& other`：参数是另一个 `T` 类对象的右值引用。

声明赋值运算符时又与声明构造函数不同，由于是对已有的对象进行操作，因此多了一些防止内存泄漏、二次释放以及自我赋值检查的操作。  
示例代码：
```C++
class MyClass {
public:
    MyClass(int val) {
        data = new int(val);
    }
    // 拷贝赋值运算符
    MyClass& operator=(const MyClass& other) {
        if (this == &other) return *this; // 自我赋值检查
        delete data;
        data = new int(*other.data); // 深拷贝
        return *this;
    }
    // 移动赋值运算符
    MyClass& operator=(MyClass&& other) {
        if (this == &other) return *this; // 自我赋值检查
        delete data;
        data = other.data;
        other.data = nullptr; // 避免析构时重复释放
        return *this;
    }
    ~MyClass() {
        delete data;
    }
private:
    int* data;
};
```
在这段代码中，只要是重构赋值运算符的代码中：
1. 先进行自我赋值检查，**防止赋值给自己导致逻辑出错或资源被提前释放**。
2. 释放已有的资源，**防止内存泄漏**。

须注意一点是，移动赋值运算符中，还要让**源对象(other)的资源指针**设为 `nullptr` ，**避免它在析构时发生二次释放的问题**。
:::tip

指向 `nullptr` 的指针可以**安全地重复** `delete` 操作，不会导致程序崩溃或行为未定义。  

`delete` 只是**释放指针所指向的内存**，并没有自动地将指针指向 `nullptr` ，因此有不需要再使用的指针时，进行 `delete` 的操作后，还要手动将指针设为 `nullptr`。  
```C++
int* p = new int(42);
delete p;
p = nullptr;
```

`delete` 或 `delete[]` **只能用于指针**。 `new[]` **创建的指针必须用** `delete[]`，因为在**分配方式上的不同**，使用 `new[]` 时编译器会在内存中“偷偷藏一个额外的数字”来记住数组大小，以便于调用析构函数（如果是对象数组）。  
`delete` **只释放一个对象**，此时可能就会造成内存泄漏或崩溃。  
`new` 和 `delete` 都是针对 **堆内存（手动分配）** 进行操作的，如果对 **栈内存（程序自动分配）** 操作可能会出现未定义行为或崩溃。
```C++
int* p = new int(10);
delete p;
int* arr = new int[5];
delete[] arr;
```
:::

