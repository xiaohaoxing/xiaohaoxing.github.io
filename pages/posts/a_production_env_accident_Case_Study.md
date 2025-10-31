---
layout: post
title: 一次线上事故 Case Study
date: 2024-08-13 11:48:32
---

# 背景

半夜 12 点，接到同事电话，刚上线的产品有用户反馈买的东西在列表里没有，反馈过来了，需要立即跟进，于是就开始排查相关问题。

<!-- more -->

# 排查步骤

首先第一步是找到原始的 log，同事已经进行了这一步，找到了对应的 logid，并查到了日志。日志显示，支付回调成功了但是资产的状态没有发生变化，怀疑是用订单去找资产的过程中出了问题。

紧接着，我们去用相关的订单 ID，资产 ID，购买记录 ID 等等数据去找数据库里的数据，发现除了订单因为超时被关闭之外，其他的都仍然是待支付的状态，因此可以断定问题是出在了订单回调后调用业务方法的地方。并且这里使用了 try catch，忽略了中途抛出的异常，导致日志也没有任何线索。

继续看 sql 日志，很快就发现在查找资产的地方 ID 传入的是错误的，继续排查发现是底层的 repository 层没有处理 source_id 导致的。

SQL 类似如下格式：

``` SQL
select * from record where status not in (1,2) and deleted_time is null limit 1;
```

可以看出，没有指定的 ID 查询条件，导致查询到错误的记录。

做出如下的修改即可：

``` php diff
// service.php
public function getRecordBySource($sourceId)
{
    $this->repository->findOne(['source_id' => $sourceId]);
}

//repository.php
public function findOne($params)
{
    $query = Record::query();
    if(isset($params['record_id'])) {
        $query->where('record_id', $params['record_id'])
    }
+   // 需要这部分代码
+   if(isset($params['source_id'])) {
+       $query->where('source_id', $params['source_id'])
+   }
    ...
    return $query->first();
}
```

看起来是一个低级错误导致的问题，但是解决后仍然无法正常购买和展示，并且报出了找不到记录的错误。再次查看 SQL，发现了奇怪的条件： `where status not in (1,2)`。

再次查看拼接查询条件的方法，发现了问题所在：

``` php
public function findOne($params)
{
        $query = Record::query();
    if(isset($params['record_id'])) {
        $query->where('record_id', $params['record_id'])
    }

    if(isset($params['source_id'])) {
        $query->where('source_id', $params['source_id'])
    }

    // 问题就出在这
    if(isset($params['status'])) {
        $query->whereIn('status', $params['status'] == ValidStatus::valid?Status::VALID_GROUP:Status::INVALID_GROUP);
    } else {
        $query->whereNotIn('status', [Status::WAIT_PAY, Status::PAY_CANCEL]);
    }
    return $query->first();
}

```

项目中一般通过在 repository 层 if 条件来追加字段的条件，但是这里存在了 else，导致在没有提供 status 过滤条件的时候会将待支付和取消支付状态的记录筛除。本意是在列表查询时提供“全部”、“有效”、“失效”这几种状态的筛选过滤，但是在订单支付成功的回调中，就需要查询状态为“待支付”的特定记录并更新，从而导致查找不到记录，更新失败。


# 解决方案

1. repository 层增加上 source_id 的查询条件。

2. 将 status 的转换逻辑移除，移动到上层 service 和 controller 层中进行有效/失效到真实状态的转换，确保底层的逻辑场景无关。

3. 发布上线并再次手动回调支付成功，恢复业务数据。

# 总结经验

虽然并不是一个很严重的问题，但是可以总结出经验：业务代码中的分层逻辑需要保证底层的模块和业务尽可能解耦，设计成通用的方法。

目前正在进行的资产的相关业务重构也需要遵循这样的原则，保证底层模块的代码纯粹性。
