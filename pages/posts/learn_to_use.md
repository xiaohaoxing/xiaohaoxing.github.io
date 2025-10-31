---
title: 学以致用
date: 2020-04-30 14:22:43
updated: 2020-04-30 14:22:43
tags:
 - leetcode
---

## 刷题经历

&emsp;&emsp;最近一直在刷 Leetcode，刚好遇到一个 [SQL 的题](https://leetcode.com/problems/reformat-department-table/)涉及到没有学习过的知识点。该题描述如下：

> 给定一个数据表 `Department`，数据格式如下：

| id | revenue | month |
|--|----|----|
|1|8000|Jan|
|2|9000|Jan|
|3|10000|Feb|
|1|7000|Feb|
|1|6000|Mar|

> 要求返回的格式是上述数据的按 `id` 和 `month` 进行聚合，但是列同时还是按月进行切分的。也就是说，行方向是根据 id 区分的，列方向是根据 month 区分的，如下表：
<!-- more -->
|id|Jan_Revenue|Feb_Revenue|Mar_Revenue|...|Dec_Revenue|
|-|--|--|--|-|--|
|1|8000|7000|6000|...|null|
|2|9000|null|null|...|null|
|3|null|10000|null|...|null|

&emsp;&emsp;这种一看就知道用常规语法就无法做到，所以当时直接去查了答案，答案也很简单：

``` sql
select
    id,
    SUM(CASE WHEN month='Jan' then revenue else null end) as 'Jan_Revenue',
    SUM(CASE WHEN month='Feb' then revenue else null end) as 'Feb_Revenue',
    SUM(CASE WHEN month='Mar' then revenue else null end) as 'Mar_Revenue',
    SUM(CASE WHEN month='Apr' then revenue else null end) as 'Apr_Revenue',
    SUM(CASE WHEN month='May' then revenue else null end) as 'May_Revenue',
    SUM(CASE WHEN month='Jun' then revenue else null end) as 'Jun_Revenue',
    SUM(CASE WHEN month='Jul' then revenue else null end) as 'Jul_Revenue',
    SUM(CASE WHEN month='Aug' then revenue else null end) as 'Aug_Revenue',
    SUM(CASE WHEN month='Sep' then revenue else null end) as 'Sep_Revenue',
    SUM(CASE WHEN month='Oct' then revenue else null end) as 'Oct_Revenue',
    SUM(CASE WHEN month='Nov' then revenue else null end) as 'Nov_Revenue',
    SUM(CASE WHEN month='Dec' then revenue else null end) as 'Dec_Revenue'
from Department
group by id
order by id;
```
&emsp;&emsp;其中重点部分就是 `SUM(CASE WHEN XX THEN XX else XX END)`，其中的 `WHEN` 和 `THEN` 既可以是字段也可以是函数也可以是简单的值，很简单，语法就能看懂在做什么，不多解释了。

## 做完思考

&emsp;&emsp;由于题目的解法是网上直接搜的答案，当时就在想，SQL 题目的考察点都是偏向没见过的语法，都只能直接查结果，得不到练习思维的效果了，一度想要把 SQL 题过滤掉。最后还是决定留下，每次遇到 SQL 题就直接搜结果学习下，并且多做一道程序题来弥补。把 SQL 的题当做学习。

## 🤟 👉 🎁 🍫

&emsp;&emsp;正如《阿甘正传》里说的那样：”Life is like a box of chocolate, you never konw what you'll gonna get“。我也没想到这种不常用的 SQL 还会有排上用场的时候。
&emsp;&emsp;场景是这样的：现在提供一个接口，实现的是自动生成调拨方案，存在表中的结构是由方案ID、商品ID、发货仓库、收货仓库四个字段唯一确定的一条记录，字段还包括当前商品的名称、当前商品的调拨数量等信息。如下表：

|id|plan_id|goods_id|goods_name|from|to|number|
|--|--|--|---|--|--|--|
|1|31029|A123|小米10 Pro|31024|31028|20|

&emsp;&emsp;上述的一条记录表示的是：创建的自动调拨方案 31029 中有一条调拨记录，需要将 20 只小米 10 Pro手机(ID: A123)从 31024 仓库调拨到 31028 仓库。
&emsp;&emsp;现在需要提供一个界面，供用户查询一个调拨方案的详表，其中每一行代表了一种商品，一列数据代表了一个[发货仓]-[收货仓]的对应关系，如果该商品在这个调拨关系上没有数据则留空。最终效果如下图（来自于系统原型图）：
![智能调拨效果](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/%E6%99%BA%E8%83%BD%E8%B0%83%E6%8B%A8%E6%95%88%E6%9E%9C%E5%9B%BE.png)

&emsp;&emsp;一开始考虑的技术方案是，将表中对应的所有数据项都查询出来，然后通过程序去做数据的聚合，整理出来的思路如下：

    显示调拨方案详情：
    - 查询得到List<Item>     items
    - 所有的 MihomeFrom-MihomeTo pair 做成 HashSet
    - 生成 Headers
    - Sku 过滤成 HashSet sku
    - foreach sku in skus
    - - foreach item in items.filter(sku)
    - - data.add(item.mihomeFrom-item.mihomeTo, item.number)
    导出报表：使用显示详情的接口，并将 header+data 的结果转换成 csv
    - header转换成 ArrayList
    - data 也转换成同大小的 ArrayList，并 search 到对应的值

&emsp;&emsp;后来回忆起做过的做过的 LeetCode 题目，可以看出，上表中的每一行记录对应了原型图中的表格的每一个格点，这个业务场景就完美契合了上面题目的考察点：对原始表中的数据进行特定情况的聚合，生成新的数据列。不同的地方在于，例题中的数据列是给定的12个月，而当前的业务需要根据数据的特点动态生成。这一难点在Mybatis中也比较好解决：Mapper.xml 作为DAL层访问数据库的代理，既可以传入参数，也支持一些简单的逻辑操作指令，比如for循环插入`SUM`函数就可以实现生成动态列的效果。

## 解决方案

### 1. 查询出所需的所有动态列数据

SQL：

``` sql
select mihome_from, mihome_to from plan_test as l where l.plan_id = 1;
```

结果集：

|mihome_from|mihome_to|
|-|-|
|1|10|
|1|12|
|2|10|
|3|14|

&emsp;&emsp;将上述结果用一个数据结构 List<MihomePair\> 保存起来，在下一步中使用。

### 2. 动态构建 SQL

mapper.xml:

``` xml
<select id="selectDetailTable" resultType="java.util.HashMap">
select sku, goods_id,goods_name,
  <foreach collection="mihomePair" index="index" item="pair" separator=",">
  SUM(CASE WHEN mihome_from=#{pair.from} and mihome_to = #{pair_to} then number else null end) as '#{pair.from}-#{pair_to}'
  </foreach>
from plan_test where plan_id = 1 group by sku,goods_id, goods_name
</select>
```

SQL 执行结果：
![智能调拨动态SQL](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/%E6%99%BA%E8%83%BD%E8%B0%83%E6%8B%A8%E5%8A%A8%E6%80%81SQL.png)

### 输出结果

&emsp;&emsp;结果集`HashMap`中的`KeySet`自身可以作为表头，稍转换下即可返回，数据项都符合前端需要的格式，也可以直接返回。

&emsp;&emsp;该结果可以进一步转换成 SKU 作为键的 List，供用户的更新操作方便操作原始数据。也可以将 KeySet 转换为 List，数据列从 Map 转换成数组，方便导出 CSV 格式的文件。

## 项目实践

&emsp;&emsp;在智能调拨项目中将这个技术点应用到实践中，最终实现的效果如下：

** 请求响应 json **
![响应](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/json.png)

** 用户界面 **

![界面](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/%E7%95%8C%E9%9D%A2.png)

## 思考

&emsp;&emsp;这个问题看似简单，但是可以反映出一些有意思的观点：”世界上没有错误的道路，他们最终都走向正确“。不要放弃平时的积累，也许他们会在意想不到的时候给你一个bonus~
