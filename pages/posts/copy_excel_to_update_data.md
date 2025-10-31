---
title: 如何实现复制Excel内容更新数据
date: 2020-05-15 17:03:42
tags:
 -  Java
 -  技术方案
---

## 背景

&emsp;&emsp;上季度在迭代通用策略的时候，曾经尝试迁移 PHP 版本的策略数据上传功能到 Java 后台，最后结果是配置管理部分的都完成了迁移（技术难度较低），但是相对而言，修改下载下来的 Excel 数据，然后复制内容到文本域里实现上传更新的功能就复杂的多，在上次的迁移中以失败告终，没有顺利迁移过来。

&emsp;&emsp;这个季度需要做的需求”智能调拨“也有类似的技术点：需要实现智能调拨方案的下载数据和修改数据，然后上传覆盖更新，还需要记录更新日志。不一样的业务场景，相似的技术点，不过最大的不同在于：这次的方案全盘由我自己来决策，需要什么字段自己加，需要执行什么操作自己构思；自由发挥的空间很大。因此心中就决心这次一定要把这个功能做好。


**策略更新的信息**

![策略更新表](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/%E7%AD%96%E7%95%A5%E6%9B%B4%E6%96%B0.png)

<!-- more -->


**智能调拨更新的信息**

![智能调拨更新表](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/%E6%99%BA%E8%83%BD%E8%B0%83%E6%8B%A8%E6%9B%B4%E6%96%B0.png)

## 构思

&emsp;&emsp;在回忆上次开发通用策略的经验中和对本次智能调拨方案的拆解的过程中，我将上传数据更新的难点拆分为如下几个点：

### 表格数据的校验

&emsp;&emsp;数据进入后台第一步就是需要对传入的数据进行校验，其实不仅仅是上传更新，所有的接口都应该对入参进行校验，只是该场景下”非结构化数据——String“ 转换成”结构化数据——表格“所需要进行的校验相对更麻烦。我这里对智能调拨方案的数据校验分成2步：

&emsp;&emsp;第一步，表头的验证。验证表格的列数是否和原始数据一致，顺序是否一致。这里从库表中按照指定的排序（一般按照 `id` 排序，策略字段表有 `order` 字段，可以用自定义排序顺序）取出期望的列信息，并存入到 `ArrayList` 这种有序的列表中进行比对。

&emsp;&emsp;第二步，数据行数的验证。智能调拨方案导入需要保证数据行数和原始数据一致，因此这里把原始表中的记录也全数查出按照特定顺序(这里是用的商品 ID 排序)，并和入参逐行对比确认所有的行都是正确的顺序，并且和上一步的表头长度对比，确认每一行都不缺数。通用策略那边不需要保证行数一致，但是需要保证数据列一致，因此这一步也不能省略。

### 数据项更新或新增的判断

&emsp;&emsp;数据项是新增还是更新是根据数据库中是否有记录决定的，智能调拨这里是根据原始数量是否等于0确定的，通用策略是通过索引字段是否一致确定的。两者形式不同，但都需要做更新/新增的判断。智能调拨判断的逻辑如下：

``` java
updates.forEach(update -> {
  if (update.getNumFrom() == 0) {
    // 从无到有要新增记录
    itemService.insertDetailRecord(update, planId);
  } else if (update.getNumTo() == 0) {
    // 从有到无要删除记录
    itemService.deleteDetailRecord(update, planId);
  } else {
    // 否则更新记录
    itemService.updateDetailRecord(update, planId);
  }
});
```

&emsp;&emsp;非常简单的实现了新增/更新判断。

&emsp;&emsp;通用策略的新增/更新判断需要根据索引字段确认，目前索引字段是通过取数据手动拼接实现的，后续计划在表中冗余该字段提高性能，同时也实现了对修改索引而不需要清空数据。这里判断新增/更新的逻辑如下：

``` java
updates.foreach(update -> {
  if(existIndexes.contains(update.getIndex())) {
    strategyDataDoMapper.updateData(update, existIndexes.get(update.getIndex()), strategyId);
  } else {
    strategyDataDoMapper.insertData(update, strategyId);
  }
});
```

&emsp;&emsp;实现新增/更新判断同样也不复杂。

### 维度值的转换

&emsp;&emsp;智能调拨方案的维度转换较为有限，仅仅需要仓库维度，场景也仅限于展示表头的仓库信息和日志的仓库信息，使用到维度转换只有一类：`XmDimensionUtil.getRemote("mihome", mihomeId)`。不过通用策略场景的所有字段都是通过配置实现，因此维度转换的场景更多样，维度转换+数据结构转换交织在一起，造成了上一次通用策略的接口迁移无比痛苦，总是转着转着就忘记当前的这个字段到底是名称还是键，还存在循环转换的潜在风险。
&emsp;&emsp;这次实现智能调拨的过程将这一部分思路整理清楚了，原则也很简单：信息只拓展不覆盖。用通俗的话说就是：**把 key 和 name 都存起来，就不存在迷惑的可能了**。这一句说起来简单，但是维度信息是用户配置，实践起来可能仍有一些坑需要踩。

## 实现

&emsp;&emsp;考虑完所有的坑之后，实现起来就比较顺利了，也比较幸运，用了大约半天（4-6小时）一口气实现了这部分的代码。自我感觉在没有大量注释的情况下可读性还是不错的~这里直接抛出来供大家鞭策指正。

### service 代码

``` java
public String importTransferPlanDetail(Long planId, String data, Long operator) {
  TransferPlanDO plan = transferPlanMapper.selectPlanByPlanId(planId);
  if (plan == null) {
      throw new CommonException(ErrorCodeEnum.TRANSFER_PLAN_NOT_EXIST);
  }
  if (plan.getStatus() != TransferConst.PlanStatus.CREATED) {
      throw new CommonException(ErrorCodeEnum.TRANSFER_PLAN_NOT_EDITABLE);
  }
  TransferPlanDetailBO bo = getTransferPlanDetail(planId);
  StringBuilder err = new StringBuilder();

  try {
      // 验证数据 + 获取数据的更新信息
      List<TransferPlanDetailRecordUpdateBO> updates = getUpdates(data, bo, err);
      if (err.length() > 0) {
    return err.toString();
      }
      // 更新数据库详情数据
      updates.forEach(update -> {
    if (update.getNumFrom() == 0) {
  // 从无到有要新增记录
  itemService.insertDetailRecord(update, planId);
    } else if (update.getNumTo() == 0) {
  // 从有到无要删除记录
  itemService.deleteDetailRecord(update, planId);
    } else {
  // 否则更新记录
  itemService.updateDetailRecord(update, planId);
    }
      });
      // 更新调拨方案更新时间
      transferPlanMapper.updateTime(planId, System.currentTimeMillis() / 1000);
      // 写入日志
      logService.logImport(operator, planId, updates);
  } catch (Exception e) {
      err.append(e.getMessage());
  }
  return err.toString();
    }
```

###  update 函数部分

``` java
private List<TransferPlanDetailRecordUpdateBO> getUpdates(String data, TransferPlanDetailBO bo, StringBuilder err) {
    String[] rows = data.split("[\n]+");
    if (rows.length != bo.getDatas().size() + 1) {
        throw new RuntimeException("数据行数错误！需要" + (bo.getDatas().size() + 1) + "行。");
    }
    String[] headers = rows[0].split("[\t]+");
    String[] dataRows = Arrays.copyOfRange(rows, 1, rows.length);
    PlanDetailHeaderBO[] existHeaders = bo.getHeaders().toArray(new PlanDetailHeaderBO[0]);
    HashMap<String, Object>[] existDataRows = bo.getDatas().toArray(new HashMap[0]);
    if (existHeaders.length != headers.length) {
        throw new RuntimeException("表头列数错误！需要" + existHeaders.length + "列。");
    }
    // 验证表头
    for (int i = 0; i < existDataRows.length; i++) {
        if (!headers[i].equals(existHeaders[i].getTitle())) {
            err.append("表头缺少[" + existHeaders[i].getTitle() + "]\n");
        }
    }
    List<TransferPlanDetailRecordUpdateBO> result = new ArrayList<>();
    // 验证数据
    for (int i = 0; i < existDataRows.length; i++) {
        String[] cells = dataRows[i].split("[\t]+");
        HashMap<String, Object> existRow = existDataRows[i];
        String currentGoodsId = String.valueOf(existRow.get("goods_id"));
        String currentGoodsName = (String) existRow.get("goods_name");
        String currentSku = (String) existRow.get("sku");
        if (cells.length != existRow.size()) {
            throw new RuntimeException("第" + (i + 1) + "行数据列数错误！需要" + existRow.size() + "列。\n");
        }
        boolean goodsId = cells[0].equals(currentGoodsId);
        boolean goodsName = cells[1].equals(currentGoodsName);
        boolean sku = cells[2].equals(currentSku);
        if (!goodsId || !goodsName || !sku) {
            err.append("第" + (i + 1) + "行数据商品信息有误，应为" + currentGoodsName);
        }
        for (int j = 3; j < cells.length; j++) {
            String currentCellInfo = existHeaders[j].getTitle() + "调拨" + currentGoodsName;
            try {
                // 转换数据
                Integer preNum = ((Double) existRow.get(existHeaders[j].getDataIndex())).intValue();
                Integer newNum = Integer.parseInt(cells[j]);
                if (newNum < 0) {
                    err.append(currentCellInfo + "数据有误，请检查。\n");
                    continue;
                }
                if (!preNum.equals(newNum)) {
                    String[] mihomePair = existHeaders[j].getDataIndex().split("-");
                    String[] mihomeNamepair = existHeaders[j].getTitle().split("-");
                    result.add(TransferPlanDetailRecordUpdateBO.builder()
                            .goodsId(currentGoodsId)
                            .goodsName(currentGoodsName)
                            .sku(currentSku)
                            .mihomeFrom(mihomePair[0])
                            .mihomeTo(mihomePair[1])
                            .mihomeFromName(mihomeNamepair[0])
                            .mihomeToName(mihomeNamepair[1])
                            .numFrom(preNum)
                            .numTo(newNum).build());
                }
            } catch (Exception e) {
                err.append(currentCellInfo + "数据有误，请检查。\n");
            }
        }
    }
    return result;
}
```

&emsp;&emsp;`getUpdates`部分的代码一开始其实是准备把验证和读数分开做的~先验证格式正确性，取出入参的子集数据`int[][]`，再进行新建/更新判断，但是做的过程中发现没有必要，已经遍历到具体的数值了，对应的原始数值也正好能读到（已有数据的数据结构是用 HashMap 存储的，用`dataRow.get([headerName])`就可以得到），就直接去生成对应的变更记录列表了。由于违背了一开始的设计思路，所以可能看起来有点乱，如果你有更优雅的实现方式也可以跟我交流下~

## 后续迭代计划

&emsp;&emsp;这里使用了100行不到的代码实现了对上传数据表格更新数据库的具体操作（当然还有前置读取原始数据的步骤），虽然代码不多，但是还是比较锻炼思维能力，我第二次开发才算比较满意的实现了预期的效果，后续计划将对上次未完成的通用策略的数据导入进行开发，进一步提高对这部分技术点的掌握。

 > 平凡的业务中也有不平凡的闪光点~
