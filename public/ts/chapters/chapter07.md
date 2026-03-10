# 第7章：类与面向对象（理解即可，Vue中按需使用）

## 学习目标

- [ ] 掌握类的基本语法（constructor、属性、方法）
- [ ] 理解访问修饰符（public / private / protected）
- [ ] 掌握继承（extends）和接口实现（implements）
- [ ] 理解抽象类（abstract）
- [ ] 知道前端何时使用类

---

## 7.1 类的基本语法

### 类比

```text
类像"工厂蓝图"，实例像"产品"：

  ┌─────────────────┐
  │  蓝图（class）    │
  │                 │
  │  属性：颜色、尺寸  │
  │  方法：启动、停止  │
  └────────┬────────┘
           │ new
     ┌─────┴─────┐
     ▼           ▼
  产品A        产品B
  (实例1)      (实例2)
  红色/大号    蓝色/小号
```

### 基本写法

```ts
class User {
  // 属性声明
  name: string
  age: number

  // 构造函数
  constructor(name: string, age: number) {
    this.name = name
    this.age = age
  }

  // 方法
  greet(): string {
    return `你好，我是 ${this.name}，今年 ${this.age} 岁`
  }
}

const user = new User('Tom', 18)
console.log(user.greet())  // "你好，我是 Tom，今年 18 岁"
```

### 简写语法（参数属性）

```ts
// 在 constructor 参数前加修饰符，自动声明并赋值属性
class User {
  constructor(
    public name: string,
    public age: number
  ) {}
  // 等价于上面的完整写法，省了很多代码
}
```

---

## 7.2 访问修饰符

```text
┌──────────────┬──────────┬──────────┬──────────┐
│   修饰符      │ 类内部    │ 子类     │ 外部     │
├──────────────┼──────────┼──────────┼──────────┤
│ public       │ ✅       │ ✅       │ ✅       │
│ protected    │ ✅       │ ✅       │ ❌       │
│ private      │ ✅       │ ❌       │ ❌       │
│ readonly     │ 只读（构造函数中可赋值一次）      │
└──────────────┴──────────┴──────────┴──────────┘
```

```ts
class BankAccount {
  public owner: string           // 谁都能访问
  protected balance: number      // 只有自己和子类能访问
  private pin: string            // 只有自己能访问
  readonly accountId: string     // 只读，创建后不能改

  constructor(owner: string, balance: number, pin: string) {
    this.owner = owner
    this.balance = balance
    this.pin = pin
    this.accountId = `ACC-${Date.now()}`
  }

  // public 方法：外部可调用
  public getBalance(): number {
    return this.balance
  }

  // private 方法：只有内部能调用
  private verifyPin(input: string): boolean {
    return input === this.pin
  }

  public withdraw(amount: number, pin: string): boolean {
    if (!this.verifyPin(pin)) return false
    if (amount > this.balance) return false
    this.balance -= amount
    return true
  }
}

const account = new BankAccount('Tom', 10000, '1234')
account.owner          // ✅ public
// account.balance     // ❌ protected
// account.pin         // ❌ private
// account.accountId = 'xxx'  // ❌ readonly
```

---

## 7.3 继承（extends）

```ts
class Animal {
  constructor(public name: string) {}

  move(distance: number): string {
    return `${this.name} 移动了 ${distance} 米`
  }
}

class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name)  // 调用父类构造函数
  }

  // 重写父类方法
  move(distance: number): string {
    return `🐕 ${super.move(distance)}（品种：${this.breed}）`
  }

  // 子类独有方法
  bark(): string {
    return `${this.name}: 汪汪！`
  }
}

const dog = new Dog('旺财', '柴犬')
console.log(dog.move(10))  // "🐕 旺财 移动了 10 米（品种：柴犬）"
console.log(dog.bark())    // "旺财: 汪汪！"
```

### 继承关系图

```text
      Animal
      ├── name
      └── move()
          │
    ┌─────┴─────┐
    ▼           ▼
   Dog         Cat
   ├── breed   ├── indoor
   ├── move()  └── purr()
   └── bark()

  Dog 和 Cat 继承了 Animal 的 name 和 move()
  各自可以重写 move() 或添加新方法
```

---

## 7.4 抽象类（abstract）

抽象类不能直接实例化，只能被继承。用于定义"模板"。

```ts
abstract class Shape {
  abstract area(): number      // 抽象方法：子类必须实现
  abstract perimeter(): number // 抽象方法

  // 普通方法：子类可以直接用
  describe(): string {
    return `面积: ${this.area().toFixed(2)}, 周长: ${this.perimeter().toFixed(2)}`
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super()
  }

  area(): number {
    return Math.PI * this.radius ** 2
  }

  perimeter(): number {
    return 2 * Math.PI * this.radius
  }
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super()
  }

  area(): number {
    return this.width * this.height
  }

  perimeter(): number {
    return 2 * (this.width + this.height)
  }
}

// const shape = new Shape()  // ❌ 不能实例化抽象类
const circle = new Circle(5)
console.log(circle.describe())  // "面积: 78.54, 周长: 31.42"
```

---

## 7.5 接口实现（implements）

`implements` 让类"承诺"实现某个接口的所有成员。

```ts
interface Logger {
  log(message: string): void
  error(message: string): void
}

interface Disposable {
  dispose(): void
}

// 一个类可以实现多个接口
class ConsoleLogger implements Logger, Disposable {
  constructor(private prefix: string) {}

  log(message: string): void {
    console.log(`[${this.prefix}] ${message}`)
  }

  error(message: string): void {
    console.error(`[${this.prefix}] ERROR: ${message}`)
  }

  dispose(): void {
    console.log(`[${this.prefix}] Logger 已销毁`)
  }
}

// 用接口类型引用实例（面向接口编程）
const logger: Logger = new ConsoleLogger('App')
logger.log('启动成功')
```

### 类比

```text
interface 像"合同"，implements 像"签合同"：

  合同（Logger）规定：
    - 必须有 log 方法
    - 必须有 error 方法

  签合同（implements Logger）：
    - 类承诺实现所有方法
    - 少实现一个 → 编译报错
    - 可以额外添加更多方法
```

---

## 7.6 静态成员（static）

```ts
class MathUtils {
  // 静态属性：属于类本身，不属于实例
  static PI = 3.14159

  // 静态方法：通过类名调用，不需要 new
  static circleArea(radius: number): number {
    return MathUtils.PI * radius ** 2
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
  }
}

// 直接通过类名调用
console.log(MathUtils.PI)              // 3.14159
console.log(MathUtils.circleArea(5))   // 78.54
console.log(MathUtils.clamp(15, 0, 10)) // 10

// 不需要 new MathUtils()
```

---

## 7.7 前端何时使用类

```text
┌──────────────────────────────────────────────────────┐
│  Vue3 业务代码：优先用函数式（Composition API）         │
│  - ref / reactive / computed / watch                 │
│  - 自定义 Hook（useXxx）                              │
│  - 不需要类                                          │
│                                                      │
│  适合用类的场景：                                      │
│  1. SDK / 客户端封装（如 HttpClient、WebSocket）       │
│  2. 数据模型层（如 ORM 实体）                          │
│  3. 状态机（复杂状态流转）                              │
│  4. 设计模式实现（单例、策略、观察者等）                 │
│  5. 第三方库要求（如 TypeORM、NestJS）                 │
└──────────────────────────────────────────────────────┘
```

### 实际场景：HTTP 客户端

```ts
class HttpClient {
  constructor(
    private baseURL: string,
    private headers: Record<string, string> = {}
  ) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseURL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...this.headers },
      body: body ? JSON.stringify(body) : undefined
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path)
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body)
  }
}

// 使用
const api = new HttpClient('https://api.example.com', {
  Authorization: 'Bearer token'
})

interface User { id: number; name: string }
const users = await api.get<User[]>('/users')
```

---

## 7.8 教学 Demo

```ts
// ============================================
// 第7章 Demo：类与面向对象综合练习
// ============================================

// ---------- 1. 事件发射器（观察者模式） ----------
interface EventHandler {
  (...args: any[]): void
}

class EventEmitter {
  private events = new Map<string, Set<EventHandler>>()

  on(event: string, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(handler)
  }

  off(event: string, handler: EventHandler): void {
    this.events.get(event)?.delete(handler)
  }

  emit(event: string, ...args: any[]): void {
    this.events.get(event)?.forEach(handler => handler(...args))
  }
}

// ---------- 2. 单例模式 ----------
class AppConfig {
  private static instance: AppConfig

  private constructor(
    public readonly apiUrl: string,
    public readonly debug: boolean
  ) {}

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig('https://api.example.com', false)
    }
    return AppConfig.instance
  }
}

const config1 = AppConfig.getInstance()
const config2 = AppConfig.getInstance()
console.log(config1 === config2)  // true（同一个实例）

// ---------- 3. 策略模式 ----------
interface SortStrategy<T> {
  sort(data: T[]): T[]
}

class AscSort implements SortStrategy<number> {
  sort(data: number[]): number[] {
    return [...data].sort((a, b) => a - b)
  }
}

class DescSort implements SortStrategy<number> {
  sort(data: number[]): number[] {
    return [...data].sort((a, b) => b - a)
  }
}

class Sorter<T> {
  constructor(private strategy: SortStrategy<T>) {}

  setStrategy(strategy: SortStrategy<T>) {
    this.strategy = strategy
  }

  execute(data: T[]): T[] {
    return this.strategy.sort(data)
  }
}

const sorter = new Sorter(new AscSort())
console.log(sorter.execute([3, 1, 4, 1, 5]))  // [1, 1, 3, 4, 5]

sorter.setStrategy(new DescSort())
console.log(sorter.execute([3, 1, 4, 1, 5]))  // [5, 4, 3, 1, 1]
```

---

## 7.9 面试问题与答案

### Q1: public、private、protected 有什么区别？

**答**：
- `public`：默认修饰符，类内部、子类、外部都能访问
- `protected`：类内部和子类能访问，外部不能
- `private`：只有类内部能访问，子类和外部都不能

注意：TS 的 private 是编译期检查，运行时（JS）并不真正私有。ES2022 的 `#` 私有字段才是运行时私有。

### Q2: abstract class 和 interface 有什么区别？

**答**：
- `interface`：纯类型声明，编译后不存在，不能有实现代码
- `abstract class`：可以有实现代码（普通方法），也可以有抽象方法（子类必须实现），编译后生成 JS 代码

选择：只需要类型约束 → interface；需要共享实现代码 → abstract class。

### Q3: implements 和 extends 有什么区别？

**答**：
- `extends`：类继承类，获得父类的属性和方法实现（单继承）
- `implements`：类实现接口，承诺提供接口定义的所有成员（可多实现）

`extends` 是"继承实现"，`implements` 是"承诺契约"。

### Q4: 什么是参数属性（Parameter Properties）？

**答**：在构造函数参数前加访问修饰符（public/private/protected/readonly），TS 会自动声明同名属性并赋值：
```ts
class User {
  constructor(public name: string, private age: number) {}
}
// 等价于手动声明 name 和 age 属性并在构造函数中赋值
```

### Q5: 前端开发中什么时候该用类，什么时候该用函数？

**答**：
- 用函数：Vue3 Composition API、React Hooks、工具函数、简单逻辑
- 用类：需要封装状态+行为的复杂对象（HTTP 客户端、WebSocket 管理器）、设计模式实现、需要继承体系的场景、后端框架（NestJS）

Vue3 生态中，90% 的业务代码用函数式就够了，类主要用在基础设施层。

---

## 7.10 知识点总结

```text
┌──────────────────────────────────────────────────────────┐
│                  第7章 知识点总结                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  类基础：                                                 │
│    - constructor + 属性 + 方法                            │
│    - 参数属性简写：constructor(public name: string)        │
│                                                          │
│  访问修饰符：                                             │
│    - public（默认）/ protected / private / readonly       │
│                                                          │
│  继承与实现：                                             │
│    - extends：继承类（单继承）                             │
│    - implements：实现接口（可多实现）                      │
│    - abstract：抽象类/方法（不能实例化，子类必须实现）      │
│                                                          │
│  静态成员：static 属性/方法，属于类本身                    │
│                                                          │
│  前端使用场景：                                           │
│    - SDK 封装、设计模式、数据模型                          │
│    - Vue3 业务代码优先用函数式                             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

> 上一章：[第6章：高级类型工具](./chapter06.md)
> 下一章：[第8章：模块与声明文件](./chapter08.md)
